import { useState } from 'react';
import { useEventState } from '../lib/store';
import { Search, Upload, Download, Trash2, RotateCcw, Users, Lock } from 'lucide-react';
import { audioManager } from '../lib/audio';
import clsx from 'clsx';

export default function Students() {
  const { state, updateState } = useEventState();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredStudents = state.students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.chestNo.includes(search);
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });


  return (
    <div className="h-full bg-[#0a0a0a] text-white flex flex-col p-8 overflow-hidden font-sans relative">
      {/* Background Cinematic Glows */}
      <div className="absolute top-0 right-1/4 w-1/3 h-96 bg-blue-500/5 blur-[120px] pointer-events-none rounded-full"></div>

      <header className="mb-8 flex justify-between items-end relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" /> Student Roster
          </h1>
          <p className="text-white/40 text-sm font-medium tracking-wider uppercase">Manage participants and their assignments</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 transition-all rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-white/20 hover:shadow-lg">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 transition-all rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-white/20 hover:shadow-lg">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all rounded-full text-xs font-bold uppercase tracking-widest border border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Trash2 className="w-4 h-4" /> Bulk Delete
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex gap-4 mb-6 relative z-10 glass-panel p-4 rounded-2xl">
        <div className="relative w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search chest number or name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-white focus:outline-none focus:border-blue-400/50 transition-all shadow-inner"
          />
        </div>
        <div className="relative group">
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm font-bold uppercase tracking-wider text-white focus:outline-none focus:border-blue-400/50 transition-all appearance-none shadow-inner"
          >
            <option value="All" className="bg-[#1a1a1a] text-white">All Categories</option>
            {state.categories.map(cat => (
              <option key={cat} value={cat} className="bg-[#1a1a1a] text-white">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col relative z-10 border border-white/5">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#121212] sticky top-0 z-20 border-b border-white/10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Photo</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Chest No</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Team</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-white/40 text-sm font-medium uppercase tracking-widest">No students found</td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const team = student.selectedBy ? state.teams.find(t => t.id === student.selectedBy) : null;
                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-3">
                        <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-sm" />
                      </td>
                      <td className="px-6 py-3 font-mono text-event-gold font-bold text-sm tracking-wider">{student.chestNo}</td>
                      <td className="px-6 py-3 font-bold text-white group-hover:text-blue-400 transition-colors">{student.name}</td>
                      <td className="px-6 py-3 text-white/60 text-xs font-semibold uppercase tracking-widest">{student.category}</td>
                      <td className="px-6 py-3 text-white/60 text-xs font-semibold uppercase tracking-widest">{student.class}</td>
                      <td className="px-6 py-3">
                        {team ? (
                          <span className={clsx("px-3 py-1 rounded text-[10px] uppercase tracking-widest font-bold bg-white/10 border shadow-sm", team.text, `border-${team.color.replace('bg-', '')}`)}>
                            {team.name}
                          </span>
                        ) : (
                          <span className="text-white/20">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {student.status === 'selected' ? (
                          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-white/5 text-white/40 border border-white/10 flex items-center w-max gap-2">
                            <Lock className="w-3 h-3" /> Selected
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                            Available
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-white/10 text-xs font-bold uppercase tracking-widest text-white/40 bg-[#121212]">
          Showing <span className="text-white">{filteredStudents.length}</span> of <span className="text-white">{state.students.length}</span> students
        </div>
      </div>
    </div>
  );
}
