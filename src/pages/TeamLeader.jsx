import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEventState } from '../lib/store';
import { Search, Loader2, ShieldAlert, Lock, Check, X } from 'lucide-react';
import clsx from 'clsx';

export default function TeamLeaderPortal() {
  const { teamId } = useParams();
  const [searchParams] = useSearchParams();
  const { state, selectStudent } = useEventState();
  
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [submissionState, setSubmissionState] = useState('idle'); // 'idle' | 'selecting' | 'success'
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const searchInputRef = useRef(null);

  const team = state.teams.find(t => t.id === teamId);
  const code = searchParams.get('code');

  // Auto-focus search on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  if (!team) return <div className="text-white p-6 bg-[#0a0a0a] h-[100dvh]">Invalid Team URL</div>;

  if (team.loginCode !== code) {
    return (
      <div className="h-[100dvh] bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold tracking-widest uppercase mb-2">Access Denied</h1>
        <p className="text-white/40 max-w-[250px] leading-relaxed text-sm font-bold uppercase tracking-wider">
          Invalid or expired login code. Please scan the QR code again from the admin panel.
        </p>
      </div>
    );
  }

  const isActive = state.currentTeam === teamId && state.accessEnabled;

  // Filter students: show all in category, prioritize exact match
  const categoryStudents = state.students.filter(s => s.category === state.currentCategory);
  
  const filteredStudents = categoryStudents.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || s.chestNo.includes(search)
  );

  // Exact match logic
  useEffect(() => {
    if (search.trim() !== '') {
      const exactMatch = filteredStudents.find(s => s.chestNo === search.trim());
      if (exactMatch && exactMatch.status === 'available') {
        setSelectedStudentId(exactMatch.id);
      }
    }
  }, [search, filteredStudents]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isActive || submissionState !== 'idle') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev + 1 >= filteredStudents.length ? 0 : prev + 1;
          const student = filteredStudents[next];
          if (student?.status === 'available') setSelectedStudentId(student.id);
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev - 1 < 0 ? filteredStudents.length - 1 : prev - 1;
          const student = filteredStudents[next];
          if (student?.status === 'available') setSelectedStudentId(student.id);
          return next;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedStudentId) {
          handleSelect();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, filteredStudents, isActive, selectedStudentId, submissionState]);


  const selectedStudent = selectedStudentId ? state.students.find(s => s.id === selectedStudentId) : null;

  const handleSelect = () => {
    if (submissionState !== 'idle' || !selectedStudentId) return;
    
    setSubmissionState('selecting');
    
    setTimeout(() => {
      selectStudent(selectedStudentId, teamId);
      setSubmissionState('success');
      
      setTimeout(() => {
        setSubmissionState('idle');
        setSelectedStudentId(null);
        setSearch('');
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 2000);
      
    }, 800); // simulate network delay
  };

  if (!isActive && submissionState !== 'success') {
    return (
      <div className="h-[100dvh] bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
        <div className={`w-32 h-32 rounded-full ${team.color} opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[100px] animate-pulse`}></div>
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className={`w-12 h-12 animate-spin ${team.text} mb-8`} />
          <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Team Assigned</div>
          <h1 className={`text-4xl font-bold tracking-widest uppercase mb-4 ${team.text}`}>{team.name}</h1>
          <div className="text-event-gold text-xs font-bold uppercase tracking-widest border border-event-gold/30 px-4 py-1.5 rounded-full bg-event-gold/10 mb-8">{state.currentCategory}</div>
          <p className="text-white/40 max-w-[250px] leading-relaxed text-sm font-bold uppercase tracking-wider">
            Waiting for your turn. Please wait until the admin enables your team's selection.
          </p>
        </div>
      </div>
    );
  }

  if (submissionState === 'success') {
    return (
      <div className="h-[100dvh] bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
        <div className="w-full h-full absolute inset-0 bg-green-500/10 animate-in fade-in duration-500"></div>
        <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-white mb-4 drop-shadow-md">Selection Successful</h1>
          <p className="text-white/50 text-sm font-bold uppercase tracking-widest">Waiting for the next turn...</p>
        </div>
      </div>
    );
  }

  const isTimeCritical = state.timerTimeRemaining < 10;

  return (
    <div className="h-[100dvh] bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background Cinematic Glows */}
      <div className={`absolute top-0 right-0 w-full h-[50vh] ${team.color.replace('bg-', 'bg-')}/5 blur-[150px] pointer-events-none rounded-full`}></div>

      {/* Hero Header */}
      <div className="pt-10 pb-6 px-6 relative z-10 flex flex-col items-center text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4 font-bold">Busthan Art Fest</div>
        <div className="w-full h-px bg-white/10 mb-6"></div>
        
        <h1 className={clsx("text-4xl font-black tracking-widest uppercase mb-4", team.text)}>
          {team.name}
        </h1>
        
        <div className={clsx(
          "text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-widest border shadow-[0_0_20px_currentColor] mb-6 transition-colors",
          team.color.replace('bg-', 'bg-').replace('500', '500/20'),
          team.text,
          `border-${team.color.replace('bg-', '')}/50`
        )}>
          Your Turn
        </div>
        
        <div className={clsx(
          "font-mono text-7xl font-light tracking-wider drop-shadow-[0_0_15px_currentColor] transition-colors",
          isTimeCritical ? 'text-red-500 animate-pulse' : team.text
        )}>
          00:{String(state.timerTimeRemaining).padStart(2, '0')}
        </div>
        
        <div className="w-full h-px bg-white/10 mt-8"></div>
      </div>

      {/* Search */}
      <div className="px-6 pb-4 sticky top-0 z-20">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/30 group-focus-within:text-white transition-colors" />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search chest number or name..." 
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setSelectedStudentId(null);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white font-medium text-lg focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner placeholder:text-white/20 backdrop-blur-md"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-40 custom-scrollbar relative z-10">
        <div className="flex flex-col gap-3">
          {filteredStudents.length === 0 ? (
            <div className="text-center text-white/30 mt-12 text-xs font-bold uppercase tracking-widest">
              No students found<br/>
              <span className="text-white/20 mt-2 block">Try another chest number or name</span>
            </div>
          ) : (
            filteredStudents.map((student, index) => {
              const isSelected = selectedStudentId === student.id;
              const isAvailable = student.status === 'available';
              const assignedTeam = student.selectedBy ? state.teams.find(t => t.id === student.selectedBy) : null;
              
              return (
                <button
                  key={student.id}
                  onClick={() => isAvailable && setSelectedStudentId(student.id)}
                  disabled={!isAvailable}
                  className={clsx(
                    "p-4 rounded-[20px] transition-all duration-300 text-left flex items-center gap-5 w-full",
                    isSelected
                      ? `bg-${team.color.replace('bg-', '')}/10 border border-${team.color.replace('bg-', '')}/50 shadow-[0_0_30px_rgba(var(--${team.color.replace('bg-', '')}-rgb),0.15)] scale-[1.02] z-10`
                      : isAvailable 
                        ? "bg-[#121212] border border-transparent hover:bg-white/5" 
                        : "bg-transparent border border-white/5 opacity-50 grayscale cursor-not-allowed"
                  )}
                >
                  <div className="relative">
                    <img src={student.photo} alt={student.name} className="w-14 h-14 rounded-full object-cover shadow-inner" />
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white/70" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg tracking-wide truncate text-white">{student.name}</div>
                    <div className="text-white/40 mt-0.5 flex gap-3 text-[10px] font-bold uppercase tracking-widest">
                      <span>Chest: <span className={clsx("ml-1", isSelected ? team.text : "text-white/70")}>{student.chestNo}</span></span>
                      <span>Class {student.class}</span>
                    </div>
                  </div>
                  
                  {!isAvailable && assignedTeam && (
                    <div className={clsx("text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest bg-white/10 border", assignedTeam.text, `border-${assignedTeam.color.replace('bg-', '')}/30`)}>
                      {assignedTeam.name}
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Floating Confirmation Panel */}
      {selectedStudent && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300 p-4 pb-8">
          <div className="bg-[#121212]/80 backdrop-blur-2xl rounded-[32px] p-6 flex flex-col gap-6 border border-white/10 shadow-[0_-10px_50px_rgba(0,0,0,0.8)] relative">
            <button 
              onClick={() => {
                setSelectedStudentId(null);
                setSearch('');
              }}
              disabled={submissionState !== 'idle'}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-4 font-bold">Confirm Selection</div>
              
              <div className="flex flex-col items-center gap-3">
                <img src={selectedStudent.photo} alt={selectedStudent.name} className={clsx("w-20 h-20 rounded-full object-cover shadow-[0_0_20px_currentColor]", team.text)} />
                <div>
                  <div className="font-bold text-2xl tracking-wider mb-1 text-white">{selectedStudent.name}</div>
                  <div className={clsx("text-[10px] font-bold uppercase tracking-widest", team.text)}>Chest No. {selectedStudent.chestNo}</div>
                </div>
              </div>
            </div>
            
            <div className="w-full h-px bg-white/10"></div>
            
            <button
              onClick={handleSelect}
              disabled={submissionState !== 'idle'}
              className={clsx(
                "w-full h-[60px] rounded-2xl font-bold text-sm tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-3",
                submissionState !== 'idle'
                  ? "bg-white/10 text-white/50 border border-white/5 scale-95" 
                  : `${team.color} text-white shadow-[0_0_20px_currentColor] active:scale-95`
              )}
            >
              {submissionState === 'selecting' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Selecting...
                </>
              ) : submissionState === 'success' ? (
                <>
                  <Check className="w-5 h-5" />
                  Selected
                </>
              ) : (
                'Confirm Selection'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
