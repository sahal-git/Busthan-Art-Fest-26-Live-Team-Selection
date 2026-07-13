import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useEventState } from '../lib/store';
import { Search, Play, Pause, RotateCcw, XCircle, Settings, LayoutList, Clock, Shield, Lock, Activity, UserPlus, CheckCircle2, ChevronDown, Repeat } from 'lucide-react';
import clsx from 'clsx';
import { audioManager } from '../lib/audio';

export default function AdminDashboard() {
  const { state, updateState, decrementTimer, toggleTimer, selectStudent, manualAssignStudent, unassignStudent } = useEventState();
  const [search, setSearch] = useState('');
  const [showManualAssign, setShowManualAssign] = useState(false);
  const [manualTeamId, setManualTeamId] = useState('');
  const [manualStudentId, setManualStudentId] = useState('');
  const [autoCycleEnabled, setAutoCycleEnabled] = useState(() => {
    return localStorage.getItem('autoCycleEnabled') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('autoCycleEnabled', autoCycleEnabled);
  }, [autoCycleEnabled]);

  const prevLatestSelectionsRef = useRef(state.latestSelections);

  useEffect(() => {
    // If auto-cycle is disabled, just track the latest selections
    if (!autoCycleEnabled) {
      prevLatestSelectionsRef.current = state.latestSelections;
      return;
    }

    if (state.latestSelections.length > 0 && prevLatestSelectionsRef.current.length > 0) {
      const latestId = state.latestSelections[0].id;
      const prevLatestId = prevLatestSelectionsRef.current[0]?.id;
      
      if (latestId !== prevLatestId) {
        // A new selection occurred!
        const teamId = state.latestSelections[0].teamId;
        const currentTeamIndex = state.teams.findIndex(t => t.id === teamId);
        
        if (currentTeamIndex !== -1 && state.teams.length > 0) {
          const N = state.teams.length;
          
          let turnCount = parseInt(localStorage.getItem('turnCount') || '0');
          
          turnCount += 1;
          
          let nextTeamIndex;
          if (N === 3) {
            const patterns = [
              [0, 2, 1], // ACB
              [2, 1, 0], // CBA
              [1, 0, 2]  // BAC
            ];
            let roundIndex = parseInt(localStorage.getItem('cycleRoundIndex') || '0');
            
            if (turnCount >= 3) {
              roundIndex = (roundIndex + 1) % 3;
              turnCount = 0;
              localStorage.setItem('cycleRoundIndex', roundIndex.toString());
            }
            nextTeamIndex = patterns[roundIndex][turnCount];
          } else {
            let cycleStartIndex = parseInt(localStorage.getItem('cycleStartIndex') || '0');
            if (turnCount >= N) {
              // Round finished
              cycleStartIndex = (cycleStartIndex + 1) % N;
              nextTeamIndex = cycleStartIndex;
              turnCount = 0;
              localStorage.setItem('cycleStartIndex', cycleStartIndex.toString());
            } else {
              nextTeamIndex = (currentTeamIndex + 1) % N;
            }
          }
          
          localStorage.setItem('turnCount', turnCount.toString());
          
          const nextTeam = state.teams[nextTeamIndex];
          
          // Wait a brief moment before cycling to ensure smooth UI transition
          setTimeout(() => {
            updateState({
              currentTeam: nextTeam.id,
              accessEnabled: true,
              timerIsRunning: true,
              timerTimeRemaining: state.defaultTimerDuration
            });
          }, 500);
        }
      }
    }
    prevLatestSelectionsRef.current = state.latestSelections;
  }, [state.latestSelections, autoCycleEnabled, state.teams, updateState, state.defaultTimerDuration]);

  // Timer Interval
  useEffect(() => {
    const interval = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [decrementTimer]);

  // Spacebar Toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && !showManualAssign) {
        e.preventDefault();
        toggleTimer();
      }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTimer, showManualAssign]);

  const filteredStudents = state.students.filter(s => 
    s.category === state.currentCategory &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.chestNo.includes(search))
  );

  const activeTeamObj = state.currentTeam ? state.teams.find(t => t.id === state.currentTeam) : null;

  const formatTimeAgo = (isoString) => {
    const diff = new Date() - new Date(isoString);
    if (diff < 10000) return 'Just Now';
    if (diff < 60000) return `${Math.floor(diff/1000)} sec ago`;
    return `${Math.floor(diff/60000)} min ago`;
  };

  const handleUndo = () => {
    if (state.latestSelections.length === 0) return;
    if (confirm("Are you sure you want to undo the very last selection globally?")) {
      audioManager.play('undo-selection', 'effects');
      const lastSelection = state.latestSelections[0];
      const studentObj = state.students.find(s => s.name === lastSelection.studentName);
      if (studentObj) {
        const updatedStudents = state.students.map(s => 
          s.id === studentObj.id ? { ...s, status: 'available', selectedBy: null, team: null } : s
        );
        updateState({ 
          students: updatedStudents,
          latestSelections: state.latestSelections.slice(1)
        });
      }
    }
  };

  const executeManualAssign = () => {
    if (!manualTeamId || !manualStudentId) return;
    audioManager.play('manual-assignment', 'effects');
    
    manualAssignStudent(manualStudentId, manualTeamId);
    
    setShowManualAssign(false);
    setManualStudentId('');
    setManualTeamId('');
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-white overflow-hidden font-sans">
      
      {/* Header - F1 Race Control Style */}
      <header className="h-14 border-b border-white/5 bg-[#0f0f0f] flex items-center justify-between px-8 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold text-event-gold tracking-widest uppercase flex items-center gap-2">
            <Activity className="w-5 h-5" /> Live Control
          </h1>
          <div className="h-4 w-[1px] bg-white/20"></div>
          <div className="text-sm uppercase tracking-widest font-semibold text-white/70">
            {state.currentCategory}
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* Active Turn Indicator */}
          {state.currentTeam ? (
            <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
              <span className="text-xs uppercase tracking-widest text-white/50">Current Turn</span>
              <span className={clsx("font-bold uppercase tracking-wider text-sm", activeTeamObj?.text)}>
                {activeTeamObj?.name}
              </span>
            </div>
          ) : (
            <div className="text-xs uppercase tracking-widest text-white/30 italic">
              Waiting for next team...
            </div>
          )}

          {/* Master Clock */}
          <div className="flex items-center gap-4 bg-black/40 px-5 py-1.5 rounded-md border border-white/10">
            <Clock className="w-4 h-4 text-white/50" />
            <span className="font-mono text-xl font-bold tracking-wider">
              00:{String(state.timerTimeRemaining).padStart(2, '0')}
            </span>
          </div>

          {/* Live Status */}
          <div className="flex items-center gap-2">
            {state.accessEnabled ? (
              <span className="px-3 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold tracking-widest flex items-center gap-2 uppercase shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> LIVE
              </span>
            ) : (
              <span className="px-3 py-1 rounded bg-white/5 text-white/40 border border-white/10 text-xs font-bold tracking-widest uppercase">
                OFFLINE
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel: Categories & Teams */}
        <aside className="w-80 border-r border-white/5 bg-[#121212] flex flex-col p-6 gap-8 overflow-y-auto z-10 custom-scrollbar shadow-xl">
          
          {/* Category Chips */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <LayoutList className="w-4 h-4" /> Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {state.categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => {
                    audioManager.play('category-change', 'effects');
                    updateState({ currentCategory: cat, currentTeam: null, accessEnabled: false, timerIsRunning: false, timerTimeRemaining: state.defaultTimerDuration });
                  }}
                  className={clsx(
                    "px-4 py-2 text-xs font-bold tracking-wider rounded-full transition-all border",
                    state.currentCategory === cat 
                      ? "bg-event-gold text-charcoal border-event-gold shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Active Team Control */}
          <div className="flex-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Team Control
            </h2>
            <div className="flex flex-col gap-3">
              {state.teams.map(team => {
                const isActive = state.currentTeam === team.id;
                const assignedCount = state.students.filter(s => s.selectedBy === team.id).length;
                return (
                  <button 
                    key={team.id}
                    onClick={() => {
                      if (!isActive) {
                        const idx = state.teams.findIndex(t => t.id === team.id);
                        if (idx !== -1) {
                          localStorage.setItem('cycleStartIndex', idx.toString());
                          localStorage.setItem('turnCount', '0');
                          localStorage.setItem('cycleRoundIndex', '0');
                        }
                        updateState({ currentTeam: team.id, accessEnabled: true, timerTimeRemaining: state.defaultTimerDuration, timerIsRunning: true });
                      }
                    }}
                    className={clsx(
                      "p-5 rounded-2xl transition-all border text-left relative overflow-hidden group",
                      isActive 
                        ? `glass-panel border-${team.color.replace('bg-', '')} animate-pulse-border`
                        : "border-white/5 bg-black/40 hover:bg-white/5"
                    )}
                    style={isActive ? { '--team-rgb': '255,255,255' } : {}} // Map real rgb var if Tailwind allows, fallback to white pulse
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={clsx("w-3 h-3 rounded-full", team.color, isActive && "animate-ping")} />
                          <div className={clsx("font-bold text-lg tracking-wider", isActive ? 'text-white' : team.text)}>
                            {team.name}
                          </div>
                        </div>
                        <div className={clsx("text-xs font-medium uppercase tracking-widest", isActive ? 'text-green-400' : 'text-white/40')}>
                          {isActive ? 'Access Enabled' : 'Waiting'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">{assignedCount}</div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40">Students</div>
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute top-0 right-0 bg-white/10 px-3 py-1 rounded-bl-lg text-[9px] uppercase tracking-widest font-bold backdrop-blur-md">
                        Current Turn
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center Panel: Student Browser */}
        <section className="flex-1 flex flex-col bg-[#0a0a0a] relative z-0">
          <div className="p-6 pb-4 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-20 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">
              Student Roster <span className="text-white/30 ml-2">({filteredStudents.length})</span>
            </h2>
            <div className="relative w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-event-gold transition-colors" />
              <input 
                id="search-input"
                type="text" 
                placeholder="Search by name or chest no..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 pl-11 pr-16 text-sm font-medium text-white focus:outline-none focus:border-event-gold/50 focus:bg-[#222] transition-all shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <kbd className="bg-white/10 px-2 py-1 rounded text-[10px] font-mono text-white/40 border border-white/5">Ctrl</kbd>
                <span className="text-white/30 text-xs">+</span>
                <kbd className="bg-white/10 px-2 py-1 rounded text-[10px] font-mono text-white/40 border border-white/5">K</kbd>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar pb-32">
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {filteredStudents.map(student => {
                const isSelected = student.status === 'selected';
                const team = isSelected ? state.teams.find(t => t.id === student.selectedBy) : null;
                
                return (
                  <div key={student.id} className={clsx(
                    "relative rounded-2xl p-5 border transition-all duration-300 flex flex-col items-center text-center",
                    isSelected 
                      ? "bg-[#111] border-white/5" 
                      : "bg-[#161616] border-white/10 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-white/20 hover:bg-[#1a1a1a]"
                  )}>
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-2xl z-10 flex flex-col items-center justify-center border border-white/5">
                        <Lock className="w-8 h-8 text-white/30 mb-3" />
                        <div className={clsx("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border shadow-lg bg-white/10", team?.text, `border-${team?.color?.replace('bg-', '')}`)}>
                          {team?.name}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Unassign ${student.name} from ${team?.name}?`)) {
                              unassignStudent(student.id);
                            }
                          }}
                          className="mt-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                          Unassign
                        </button>
                      </div>
                    )}
                    
                    <div className="relative mb-4">
                      <img src={student.photo} alt={student.name} className="w-20 h-20 rounded-full object-cover border-2 border-white/10 shadow-lg" />
                      {!isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#161616] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                      )}
                    </div>
                    
                    <div className="w-full">
                      <div className="font-bold text-xl text-event-gold mb-1">{student.chestNo}</div>
                      <div className="font-semibold text-white leading-tight truncate px-2">{student.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Panel: Live Summary & Activity */}
        <aside className="w-80 border-l border-white/5 bg-[#121212] flex flex-col overflow-hidden z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.2)]">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Live Summary
            </h2>
            <div className="glass-panel p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                <span className="text-white/50 text-xs uppercase tracking-widest font-bold">Category</span>
                <span className="font-bold text-sm tracking-wide">{state.currentCategory}</span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                <span className="text-white/50 text-xs uppercase tracking-widest font-bold">Access</span>
                {state.accessEnabled ? (
                  <span className="text-green-400 font-bold text-sm tracking-wide flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> ENABLED
                  </span>
                ) : (
                  <span className="text-white/30 font-bold text-sm tracking-wide">DISABLED</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-xs uppercase tracking-widest font-bold">Remaining</span>
                <span className="font-bold text-sm tracking-wide">{state.students.filter(s => s.category === state.currentCategory && s.status === 'available').length} Available</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Latest Activity
            </h2>
            <div className="relative pl-4 border-l border-white/10 space-y-6">
              {state.latestSelections.length === 0 ? (
                <div className="text-white/30 text-sm italic py-4">No activity logged.</div>
              ) : (
                state.latestSelections.map((sel, idx) => {
                  const team = state.teams.find(t => t.id === sel.teamId);
                  return (
                    <div key={idx} className="relative">
                      <div className={clsx("absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#121212]", team?.color)} />
                      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 shadow-sm hover:border-white/10 transition-colors">
                        <div className="font-semibold text-sm mb-1">{sel.studentName}</div>
                        <div className="flex items-center justify-between">
                          <div className={clsx("text-xs font-bold uppercase tracking-widest flex items-center gap-1", team?.text)}>
                            <CheckCircle2 className="w-3 h-3" /> Assigned to {team?.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-[10px] uppercase tracking-widest text-white/30">
                              {formatTimeAgo(sel.time)}
                            </div>
                            <button
                              onClick={() => {
                                const studentObj = state.students.find(s => s.name === sel.studentName);
                                if (studentObj && confirm(`Unassign ${sel.studentName}?`)) {
                                  unassignStudent(studentObj.id);
                                }
                              }}
                              className="text-white/30 hover:text-red-400 p-1"
                              title="Unassign"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* Floating Action Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="glass-action-bar rounded-full p-2 flex items-center gap-2">
            <button 
              onClick={toggleTimer}
              className={clsx(
                "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all",
                state.timerIsRunning 
                  ? "bg-white/10 hover:bg-white/20 text-white" 
                  : "bg-event-gold text-charcoal hover:bg-white hover:scale-105 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
              )}
            >
              {state.timerIsRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
            </button>
            
            <div className="w-[1px] h-8 bg-white/10 mx-2"></div>
            
            <button 
              onClick={handleUndo}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-transparent hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" /> Undo
            </button>
            
            <button 
              onClick={() => setShowManualAssign(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-transparent hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white"
            >
              <UserPlus className="w-4 h-4" /> Manual Assign
            </button>
            
            <div className="w-[1px] h-8 bg-white/10 mx-2"></div>

            <button 
              onClick={() => setAutoCycleEnabled(!autoCycleEnabled)}
              className={clsx(
                "flex items-center gap-2 px-5 py-3 rounded-full transition-colors text-xs font-bold uppercase tracking-wider",
                autoCycleEnabled
                  ? "bg-event-gold/20 text-event-gold border border-event-gold/50"
                  : "bg-transparent hover:bg-white/10 text-white/70 hover:text-white"
              )}
            >
              <Repeat className="w-4 h-4" /> {autoCycleEnabled ? "Auto-Cycle: ON" : "Auto-Cycle: OFF"}
            </button>

            <button 
              onClick={() => updateState({ accessEnabled: false, currentTeam: null })}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-transparent hover:bg-red-500/20 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-wider text-white/70"
            >
              <XCircle className="w-4 h-4" /> Disable Access
            </button>
            
            <Link 
              to="/admin/settings"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-white/10 transition-colors text-white/70 hover:text-white ml-2"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Empty State Overlay if no team active */}
        {!state.currentTeam && state.students.length > 0 && (
          <div className="absolute inset-0 z-[5] bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <div className="bg-[#121212] border border-white/10 px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center">
              <Shield className="w-12 h-12 text-white/20 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Active Team</h3>
              <p className="text-white/50 text-sm">Select a team from the left panel to begin the next selection.</p>
            </div>
          </div>
        )}

        {/* Manual Assign Modal */}
        {showManualAssign && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Manual Assignment</h2>
                <p className="text-white/50 text-sm">Force assign a student to a team without scanning.</p>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Select Team</label>
                  <select 
                    value={manualTeamId} 
                    onChange={e => setManualTeamId(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-event-gold appearance-none"
                  >
                    <option value="">-- Choose Team --</option>
                    {state.teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Select Student (Available)</label>
                  <select 
                    value={manualStudentId} 
                    onChange={e => setManualStudentId(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-event-gold appearance-none"
                  >
                    <option value="">-- Choose Student --</option>
                    {filteredStudents.filter(s => s.status !== 'selected').map(s => (
                      <option key={s.id} value={s.id}>{s.chestNo} - {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setShowManualAssign(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeManualAssign}
                  disabled={!manualTeamId || !manualStudentId}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-event-gold text-charcoal hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] disabled:shadow-none"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
