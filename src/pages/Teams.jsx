import { useState } from 'react';
import { useEventState } from '../lib/store';
import { Plus, Edit2, Trash2, QrCode, PowerOff, X, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import clsx from 'clsx';

export default function Teams() {
  const { state, regenerateLoginCode } = useEventState();
  const [selectedTeamQr, setSelectedTeamQr] = useState(null);

  const qrTeam = selectedTeamQr ? state.teams.find(t => t.id === selectedTeamQr) : null;
  const qrUrl = qrTeam ? `${window.location.protocol}//${window.location.host}/leader/${qrTeam.id}?code=${qrTeam.loginCode}` : '';

  return (
    <div className="h-full bg-[#0a0a0a] text-white flex flex-col p-8 overflow-y-auto custom-scrollbar relative font-sans">
      {/* Background Cinematic Glows */}
      <div className="absolute top-0 right-0 w-1/3 h-96 bg-purple-500/5 blur-[120px] pointer-events-none rounded-full"></div>

      <header className="mb-10 flex justify-between items-end relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" /> Teams
          </h1>
          <p className="text-white/40 text-sm font-medium tracking-wider uppercase">Manage competing teams and their access</p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-event-gold/10 text-event-gold hover:bg-event-gold/20 transition-all rounded-full font-bold uppercase tracking-widest border border-event-gold/20 hover:border-event-gold/40 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] text-sm">
          <Plus className="w-5 h-5" /> Create Team
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {state.teams.map(team => {
          const studentsSelected = state.students.filter(s => s.selectedBy === team.id).length;
          
          return (
            <div key={team.id} className={clsx("glass-panel rounded-3xl p-6 border-t-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group", `border-t-${team.color.replace('bg-', '')}`)}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className={clsx("text-2xl font-bold tracking-wider", team.text)}>{team.name}</h2>
                  <div className="text-white/40 text-[10px] mt-1 font-bold uppercase tracking-widest flex items-center gap-2">
                    Status: <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Active</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full ${team.color} shadow-[0_0_15px_currentColor] group-hover:scale-110 transition-transform`} />
              </div>

              <div className="bg-[#121212] rounded-2xl p-5 mb-6 border border-white/5 shadow-inner">
                <div className="text-4xl font-bold mb-1">{studentsSelected}</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Students Selected</div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setSelectedTeamQr(team.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 transition-all rounded-xl font-bold text-sm tracking-wider uppercase border border-white/10 hover:border-white/20"
                >
                  <QrCode className="w-4 h-4" /> Generate QR Login
                </button>
                <div className="grid grid-cols-3 gap-3">
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-[#121212] hover:bg-white/10 transition-all rounded-xl text-sm border border-white/5 hover:border-white/20" title="Edit">
                    <Edit2 className="w-4 h-4 text-white/60" />
                  </button>
                  <button 
                    onClick={() => regenerateLoginCode(team.id)}
                    className="flex items-center justify-center gap-2 py-2.5 bg-[#121212] hover:bg-orange-500/20 transition-all rounded-xl text-sm border border-white/5 hover:border-orange-500/30" 
                    title="Regenerate Login Code"
                  >
                    <PowerOff className="w-4 h-4 text-orange-400" />
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 transition-all rounded-xl text-sm border border-red-500/20 hover:border-red-500/40" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code Modal */}
      {selectedTeamQr && qrTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
          <div className="bg-[#121212] p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center max-w-sm w-full relative">
            <button 
              onClick={() => setSelectedTeamQr(null)}
              className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h2 className={clsx("text-2xl font-bold mb-2 tracking-widest uppercase", qrTeam.text)}>{qrTeam.name}</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-8 text-center leading-relaxed">Scan this code to log in directly to the Team Leader portal.</p>
            
            <div className="bg-white p-4 rounded-2xl mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <QRCodeSVG value={qrUrl} size={200} />
            </div>
            
            <a 
              href={qrUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-white/40 text-xs font-mono hover:text-event-gold transition-colors text-center bg-[#1a1a1a] px-4 py-2 rounded-lg border border-white/5 w-full truncate"
            >
              {qrUrl}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
