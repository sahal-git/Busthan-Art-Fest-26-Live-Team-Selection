import { useState } from 'react';
import { useEventState } from '../lib/store';
import { Filter, Download, History } from 'lucide-react';
import clsx from 'clsx';

export default function ActivityLog() {
  const { state } = useEventState();
  const [teamFilter, setTeamFilter] = useState('All');

  const filteredLogs = state.latestSelections.filter(log => 
    teamFilter === 'All' || log.teamId === teamFilter
  );

  return (
    <div className="h-full bg-[#0a0a0a] text-white flex flex-col p-8 overflow-hidden font-sans relative">
      {/* Background Cinematic Glows */}
      <div className="absolute top-0 right-1/4 w-1/3 h-96 bg-green-500/5 blur-[120px] pointer-events-none rounded-full"></div>

      <header className="mb-8 flex justify-between items-end relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-3">
            <History className="w-8 h-8 text-green-400" /> Activity Log
          </h1>
          <p className="text-white/40 text-sm font-medium tracking-wider uppercase">Track all team selections and event actions</p>
        </div>
        
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 transition-all rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-white/20 hover:shadow-lg">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </header>

      <div className="flex gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3 bg-[#121212] border border-white/10 rounded-xl px-4 py-3 shadow-inner">
          <Filter className="w-4 h-4 text-white/40" />
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Filter by Team:</span>
          <select 
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            className="bg-transparent border-none text-xs font-bold uppercase tracking-wider text-white focus:outline-none outline-none ml-2 appearance-none"
          >
            <option value="All" className="bg-[#121212] text-white">All Teams</option>
            {state.teams.map(t => (
              <option key={t.id} value={t.id} className="bg-[#121212] text-white">{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col relative z-10 border border-white/5">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#121212] sticky top-0 z-20 border-b border-white/10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Team</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-white/40 text-sm font-medium uppercase tracking-widest">No activity recorded yet</td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const team = state.teams.find(t => t.id === log.teamId);
                  const time = new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  
                  return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-white/40">{time}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                          Selection Made
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold tracking-wider text-white group-hover:text-green-400 transition-colors">{log.studentName}</td>
                      <td className="px-6 py-4">
                        {team ? (
                          <span className={clsx("px-3 py-1 rounded text-[10px] uppercase tracking-widest font-bold bg-white/10 border shadow-sm", team.text, `border-${team.color.replace('bg-', '')}`)}>
                            {team.name}
                          </span>
                        ) : (
                          <span className="text-white/20">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-xs font-bold uppercase tracking-widest">{state.currentCategory}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
