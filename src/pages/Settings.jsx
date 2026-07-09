import { useState } from 'react';
import { Settings2, AlertTriangle, RotateCcw, Volume2 } from 'lucide-react';
import { useEventState } from '../lib/store';
import { audioManager } from '../lib/audio';

export default function Settings() {
  const { state, updateState } = useEventState();
  const [resetConfirmText, setResetConfirmText] = useState('');

  const handleVolumeChange = (key, value) => {
    updateState({ [key]: parseInt(value, 10) });
  };

  const toggleMute = () => {
    updateState({ audioMuted: !state.audioMuted });
  };

  const testAudio = (soundId, category) => {
    audioManager.play(soundId, category);
  };

  return (
    <div className="h-full bg-[#0a0a0a] text-white p-8 overflow-y-auto custom-scrollbar relative font-sans">
      {/* Background Cinematic Glows */}
      <div className="absolute top-0 right-1/4 w-1/3 h-96 bg-event-gold/5 blur-[120px] pointer-events-none rounded-full"></div>

      <header className="mb-10 relative z-10">
        <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-event-gold" /> System Configuration
        </h1>
        <p className="text-white/40 text-sm font-medium tracking-wider uppercase">Configure application behavior and broadcast settings</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl relative z-10">
        
        {/* General Settings */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <span className="w-2 h-8 bg-event-gold rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"></span>
              General
            </h2>
          </div>
          
          <div className="flex flex-col gap-6 glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl">
            <div>
              <label className="block text-xs font-bold text-white/40 mb-3 uppercase tracking-widest">Event Name</label>
              <input type="text" defaultValue="Busthan Art Fest" className="w-full bg-[#121212] border border-white/10 rounded-xl px-5 py-4 text-white font-bold uppercase tracking-widest focus:outline-none focus:border-event-gold/50 transition-all shadow-inner" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-white/40 mb-3 uppercase tracking-widest">Default Timer Duration (Seconds)</label>
              <input type="number" defaultValue="24" className="w-full bg-[#121212] border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-xl focus:outline-none focus:border-event-gold/50 transition-all shadow-inner" />
            </div>
            
            <div className="flex items-center justify-end mt-4 pt-6 border-t border-white/5">
              <button className="px-8 py-3 bg-event-gold/10 text-event-gold hover:bg-event-gold/20 transition-all rounded-full text-xs font-bold uppercase tracking-widest border border-event-gold/20 hover:border-event-gold/40 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                Save Changes
              </button>
            </div>
          </div>
        </section>

        {/* Audio Settings */}
        <section className="lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
              Audio Mixer
            </h2>
            <button 
              onClick={() => testAudio('selection-success', 'celebration')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 transition-all rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-400 border border-blue-500/20 hover:border-blue-500/40 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]"
            >
              <Volume2 className="w-4 h-4" /> Test Sound
            </button>
          </div>
          
          <div className="flex flex-col gap-8 glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl">
            
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div>
                <div className="font-bold text-white uppercase tracking-widest text-sm mb-1">Mute All Sounds</div>
                <div className="text-xs text-white/30 font-bold uppercase tracking-widest">Disable every audio cue across the event</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={state.audioMuted || false} onChange={toggleMute} />
                <div className="w-14 h-7 bg-[#121212] border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/50 after:border-white/20 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500/50 peer-checked:border-red-500/50 peer-checked:shadow-[0_0_15px_rgba(239,68,68,0.3)]"></div>
              </label>
            </div>

            <div className="grid gap-6">
              {[
                { label: 'Master Volume', key: 'audioMasterVolume', value: state.audioMasterVolume, color: 'text-event-gold', accent: 'accent-event-gold' },
                { label: 'UI Effects', key: 'audioEffectsVolume', value: state.audioEffectsVolume, color: 'text-blue-400', accent: 'accent-blue-500' },
                { label: 'Countdown Timer', key: 'audioCountdownVolume', value: state.audioCountdownVolume, color: 'text-purple-400', accent: 'accent-purple-500' },
                { label: 'Celebration', key: 'audioCelebrationVolume', value: state.audioCelebrationVolume, color: 'text-green-400', accent: 'accent-green-500' }
              ].map((slider) => (
                <div key={slider.key} className="bg-[#121212] p-4 rounded-xl border border-white/5 shadow-inner">
                  <div className="flex justify-between mb-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    <span>{slider.label}</span>
                    <span className={slider.color}>{slider.value}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={slider.value} 
                    onChange={(e) => handleVolumeChange(slider.key, e.target.value)} 
                    className={`w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer ${slider.accent} hover:h-2 transition-all`} 
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="lg:col-span-2 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
              <span className="w-2 h-8 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
              Danger Zone
            </h2>
          </div>
          
          <div className="flex flex-col gap-4 bg-red-500/5 p-8 rounded-3xl border border-red-500/20 backdrop-blur-md shadow-2xl">
            {[
              { title: 'Reset Assignment', desc: 'Clear assignments for all students in the current category', btnText: 'Reset Assignment', icon: RotateCcw },
              { title: 'Reset Current Category', desc: 'Clear all selections for the active category', btnText: 'Reset Category' },
              { title: 'Reset Team Assignments', desc: 'Unassign all students from all teams', btnText: 'Reset Teams' }
            ].map((action, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-[#0a0a0a]/50 rounded-2xl border border-red-500/10 hover:border-red-500/30 transition-all group">
                <div>
                  <div className="font-bold text-white uppercase tracking-widest text-sm mb-1">{action.title}</div>
                  <div className="text-xs font-bold text-white/30 uppercase tracking-wider">{action.desc}</div>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-500/20 hover:border-red-500/40 whitespace-nowrap group-hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  {action.icon && <action.icon className="w-3 h-3" />} {action.btnText}
                </button>
              </div>
            ))}

            <div className="flex items-center justify-between p-6 bg-[#0a0a0a] rounded-2xl border border-red-500/30 mt-4 relative overflow-hidden group hover:border-red-500/50 transition-all">
              <div className="absolute inset-0 bg-red-500/5 pattern-diagonal-lines opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"></div>
              <div className="relative z-10 flex-1">
                <div className="font-bold text-red-500 uppercase tracking-widest text-sm mb-1">Factory Reset Event</div>
                <div className="text-xs font-bold text-red-400/50 uppercase tracking-wider">Delete all data, teams, students, and categories</div>
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Type DELETE" 
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  className="bg-[#121212] border border-red-500/30 rounded-xl px-4 py-2.5 text-xs text-white font-bold uppercase tracking-widest focus:outline-none focus:border-red-500 transition-all w-36 placeholder:text-red-500/30"
                />
                <button 
                  disabled={resetConfirmText !== 'DELETE'}
                  className="px-8 py-3 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all rounded-full text-xs font-bold uppercase tracking-widest border border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600/20 disabled:hover:text-red-500 disabled:hover:shadow-none"
                >
                  DELETE EVERYTHING
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
