import { useEventState } from '../lib/store';
import { Users, LayoutList, Shield, Play, UserPlus, Settings2, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { state } = useEventState();

  const totalStudents = state.students.length;
  const totalAssigned = state.students.filter(s => s.status === 'selected').length;
  const totalRemaining = totalStudents - totalAssigned;

  const statCards = [
    { title: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Categories', value: state.categories.length, icon: LayoutList, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Teams', value: state.teams.length, icon: Shield, color: 'text-event-gold', bg: 'bg-event-gold/10' },
    { title: 'Assigned', value: totalAssigned, icon: Users, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Remaining', value: totalRemaining, icon: Users, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  return (
    <div className="h-full bg-[#0a0a0a] text-white overflow-y-auto p-8 custom-scrollbar relative">
      {/* Background Cinematic Glows */}
      <div className="absolute top-0 left-1/4 w-1/2 h-96 bg-event-gold/5 blur-[120px] pointer-events-none rounded-full"></div>
      
      <header className="mb-10 relative z-10">
        <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-3">
          <LayoutList className="w-8 h-8 text-event-gold" /> System Overview
        </h1>
        <p className="text-white/40 text-sm font-medium tracking-wider uppercase">Event telemetry and quick actions</p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12 relative z-10">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col gap-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border-t border-white/10 group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-inner`}>
              <stat.icon className="w-6 h-6 drop-shadow-md" />
            </div>
            <div>
              <div className="text-4xl font-bold mb-1 tracking-tight text-white drop-shadow-sm">{stat.value}</div>
              <div className="text-xs font-bold text-white/40 uppercase tracking-widest">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="relative z-10">
        <h2 className="text-sm font-bold mb-6 uppercase tracking-widest text-white/40">Launchpad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/admin/live" className="group glass-panel p-6 rounded-2xl hover:border-event-gold/50 transition-all flex flex-col items-start gap-6 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,215,0,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-event-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-14 h-14 rounded-full bg-event-gold/10 text-event-gold flex items-center justify-center group-hover:scale-110 transition-transform border border-event-gold/20 relative z-10 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
              <Play className="w-6 h-6 fill-event-gold" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold uppercase tracking-wider text-white">Live Control</h3>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-medium">Open Production Room</p>
            </div>
          </Link>

          <Link to="/admin/students" className="group glass-panel p-6 rounded-2xl hover:border-blue-400/50 transition-all flex flex-col items-start gap-6 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(96,165,250,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-14 h-14 rounded-full bg-blue-400/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-400/20 relative z-10">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold uppercase tracking-wider text-white">Roster</h3>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-medium">Manage Students</p>
            </div>
          </Link>

          <Link to="/admin/teams" className="group glass-panel p-6 rounded-2xl hover:border-purple-400/50 transition-all flex flex-col items-start gap-6 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(192,132,252,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-14 h-14 rounded-full bg-purple-400/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-400/20 relative z-10">
              <Shield className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold uppercase tracking-wider text-white">Teams</h3>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-medium">Edit & Connect</p>
            </div>
          </Link>
          
          <Link to="/admin/settings" className="group glass-panel p-6 rounded-2xl hover:border-white/30 transition-all flex flex-col items-start gap-6 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,255,255,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-14 h-14 rounded-full bg-white/5 text-white/60 flex items-center justify-center group-hover:scale-110 group-hover:text-white transition-all border border-white/10 relative z-10">
              <Settings2 className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold uppercase tracking-wider text-white">System Settings</h3>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-medium">Configure Audio & Rules</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
