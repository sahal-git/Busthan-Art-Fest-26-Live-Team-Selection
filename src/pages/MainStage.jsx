import { useState, useEffect, useRef } from 'react';
import { useEventState } from '../lib/store';
import clsx from 'clsx';
import confetti from 'canvas-confetti';
import { audioManager } from '../lib/audio';

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 10 + 10}s`
          }}
        />
      ))}
    </div>
  );
};

export default function MainStageDisplay() {
  const { state } = useEventState();
  const [animatingStudent, setAnimatingStudent] = useState(null);
  const [animatingTeam, setAnimatingTeam] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  const prevTeamRef = useRef(null);
  const prevTimerRef = useRef(state.timerTimeRemaining);

  const enableAudio = () => {
    // Play a silent sound to unlock AudioContext/autoplay policies
    const silence = new Audio('data:audio/mp3;base64,//OQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
    silence.play().then(() => {
      setAudioEnabled(true);
    }).catch(e => {
      console.warn("Failed to unlock audio:", e);
      setAudioEnabled(true); // Still hide the overlay and hope for the best
    });
  };

  // Hook for Team Activated and Timer Expired
  useEffect(() => {
    if (!audioEnabled) return;
    
    if (state.currentTeam && !prevTeamRef.current) {
      audioManager.play('team-activated', 'effects');
    }
    
    // Timer Music Logic
    if (state.timerIsRunning && state.timerTimeRemaining > 0) {
      const startTime = Math.max(0, state.defaultTimerDuration - state.timerTimeRemaining);
      audioManager.play('timer-music', 'countdown', false, startTime);
    } else {
      audioManager.stop('timer-music');
    }

    // Timer expired
    if (state.timerTimeRemaining === 0 && prevTimerRef.current > 0) {
      audioManager.play('timer-expired', 'effects');
    }

    prevTeamRef.current = state.currentTeam;
    prevTimerRef.current = state.timerTimeRemaining;
  }, [state.currentTeam, state.timerTimeRemaining, state.timerIsRunning, audioEnabled]);

  // Hook for Access Enabled (Countdown Start)
  const prevAccessRef = useRef(false);
  useEffect(() => {
    if (!audioEnabled) return;
    if (state.accessEnabled && !prevAccessRef.current) {
      audioManager.play('countdown-start', 'effects');
    }
    prevAccessRef.current = state.accessEnabled;
  }, [state.accessEnabled, audioEnabled]);

  // Hook for Category Change
  const prevCatRef = useRef(state.currentCategory);
  useEffect(() => {
    if (!audioEnabled) return;
    if (state.currentCategory !== prevCatRef.current) {
      audioManager.play('category-change', 'effects');
    }
    prevCatRef.current = state.currentCategory;
  }, [state.currentCategory, audioEnabled]);

  // Detect new selection for animation
  useEffect(() => {
    if (state.latestSelections.length > 0) {
      const latest = state.latestSelections[0];
      const timeDiff = new Date() - new Date(latest.time);
      if (timeDiff < 5000 && !animatingStudent) {
        triggerAnimation(latest);
      }
    }
  }, [state.latestSelections]);

  const triggerAnimation = (selection) => {
    const student = state.students.find(s => s.name === selection.studentName);
    const team = state.teams.find(t => t.id === selection.teamId);
    
    setAnimatingStudent(student);
    setAnimatingTeam(team);
    setShowFlash(true);

    if (audioEnabled) {
      // Stop countdown if it's playing
      audioManager.stop('timer-music');

      // Play Success celebration immediately
      audioManager.play('selection-success', 'celebration');

      // Play Team Reveal after a slight delay matching the slide-in animation (800ms)
      setTimeout(() => {
        audioManager.play('team-reveal', 'celebration');
      }, 800);
    }

    setTimeout(() => setShowFlash(false), 200); // Quick flash

    // Confetti effect
    var duration = 4000;
    var end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Clear animation after 4.5 seconds and play completion chime
    setTimeout(() => {
      setAnimatingStudent(null);
      setAnimatingTeam(null);
      audioManager.play('selection-complete', 'effects');
    }, 4500);
  };

  const filteredStudents = state.students.filter(s => s.category === state.currentCategory);
  const currentTeam = state.currentTeam ? state.teams.find(t => t.id === state.currentTeam) : null;
  const totalSelected = filteredStudents.filter(s => s.status === 'selected').length;

  return (
    <div className="w-screen h-screen bg-charcoal text-white overflow-hidden relative font-display">
      
      {!audioEnabled && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold text-white mb-6 tracking-widest uppercase">Broadcast Audio Offline</h2>
          <p className="text-white/60 mb-8 max-w-md text-center text-lg">Your browser requires interaction to enable the live broadcast audio engine.</p>
          <button 
            onClick={enableAudio}
            className="px-8 py-4 bg-event-gold text-charcoal font-bold rounded-xl text-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,215,0,0.4)]"
          >
            Enable Audio & Join Broadcast
          </button>
        </div>
      )}

      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 bg-charcoal z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-50"></div>
        {currentTeam && (
          <div className={clsx("absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] to-transparent opacity-20 transition-all duration-1000", `from-${currentTeam.color.replace('bg-', '')}`)}></div>
        )}
        <ParticleBackground />
      </div>

      {/* Main Content */}
      <div className={clsx("w-full h-full flex flex-col transition-opacity duration-700 relative z-10", animatingStudent ? "opacity-0" : "opacity-100")}>
        
        {/* Top Header - Broadcast Banner */}
        <header className="h-24 flex items-center justify-between px-12 border-b border-white/10 bg-black/50 backdrop-blur-md">
          <div className="flex items-center gap-8">
            <h1 className="text-3xl font-bold tracking-widest uppercase">Busthan Art Fest</h1>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-xl tracking-[0.2em] uppercase text-white/70">{state.currentCategory}</div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              <span className="text-xs tracking-widest text-white/50 uppercase">Students Selected</span>
              <span className="font-teko text-2xl leading-none font-bold text-event-gold">{totalSelected} <span className="text-white/30">/ {filteredStudents.length}</span></span>
            </div>
            <div className="px-4 py-1 rounded bg-red-600 text-white font-bold uppercase tracking-widest text-sm animate-pulse flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <span className="w-2 h-2 rounded-full bg-white"></span> LIVE
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {currentTeam ? (
            <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
              <div className="text-3xl text-event-gold uppercase tracking-[0.4em] mb-4 font-medium">Now Selecting</div>
              
              <div className="relative">
                {/* Glow behind team name */}
                <div className={clsx("absolute inset-0 blur-3xl opacity-30", currentTeam.color)}></div>
                <div className={clsx("text-8xl font-black tracking-widest mb-4 relative z-10 text-shadow-glow", currentTeam.text)}>
                  {currentTeam.name}
                </div>
              </div>
              
              <div className={clsx(
                "text-[15rem] leading-none font-teko font-medium tracking-widest transition-colors duration-300 drop-shadow-2xl", 
                state.timerTimeRemaining <= 10 ? "text-red-500 animate-pulse text-shadow-glow" : currentTeam.text
              )}>
                00:{String(state.timerTimeRemaining).padStart(2, '0')}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-50 animate-breathe">
              <div className="text-6xl font-light tracking-[0.3em] uppercase">Waiting for next team...</div>
            </div>
          )}
        </div>

        {/* Bottom Marquee Carousel */}
        <div className="h-72 border-t border-white/10 bg-black/60 backdrop-blur-xl relative flex flex-col justify-center overflow-hidden shrink-0">
          <div className="flex animate-marquee-scroll w-max pt-2">
            {[...filteredStudents, ...filteredStudents].map((student, i) => {
              const isSelected = student.status === 'selected';
              const team = isSelected ? state.teams.find(t => t.id === student.selectedBy) : null;
              
              return (
                <div key={`${student.id}-${i}`} className={clsx(
                  "w-64 mx-3 rounded-2xl p-5 flex flex-col items-center shrink-0 transition-all duration-500",
                  isSelected ? "bg-white/5 border border-white/5 opacity-40 grayscale" : "bg-charcoal border-2 border-event-gold/30 shadow-[0_0_20px_rgba(255,215,0,0.1)]"
                )}>
                  {isSelected && team && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60 backdrop-blur-[1px] rounded-2xl">
                      <div className={clsx("px-4 py-2 rounded font-bold border-2 rotate-[-10deg] uppercase tracking-widest text-2xl shadow-xl", `border-${team.color.replace('bg-', '')} ${team.text} bg-black`)}>
                        {team.name}
                      </div>
                    </div>
                  )}
                  <img src={student.photo} alt={student.name} className="w-28 h-28 rounded-full object-cover border-2 border-white/20 mb-4 shadow-lg" />
                  <div className="font-bold text-2xl text-center leading-tight truncate w-full px-2 mb-1 tracking-wide">{student.name}</div>
                  <div className="text-event-gold font-teko text-4xl leading-none">No. {student.chestNo}</div>
                  <div className="text-white/40 text-sm mt-1 uppercase tracking-widest">Class {student.class || '-'}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Student Animation */}
      {animatingStudent && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          {/* White Flash */}
          {showFlash && <div className="absolute inset-0 bg-white z-[60] animate-in fade-out duration-200"></div>}
          
          <div className="absolute inset-0 bg-black/95 backdrop-blur-lg animate-in fade-in duration-500"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Cinematic Background Glow */}
            <div className={clsx("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[150px] rounded-full opacity-40 animate-pulse", animatingTeam?.color)}></div>
            
            <img 
              src={animatingStudent.photo} 
              alt={animatingStudent.name} 
              className={clsx(
                "w-80 h-80 rounded-full object-cover border-[12px] shadow-[0_0_100px_rgba(255,255,255,0.3)] mb-8", 
                `border-${animatingTeam?.color.replace('bg-', '')}`,
                "animate-in zoom-in-[2] duration-[800ms] ease-out fill-mode-both"
              )} 
            />
            
            <div className="text-center flex flex-col items-center">
              <div className="text-3xl text-white uppercase tracking-[1em] mb-4 font-light animate-in slide-in-from-bottom-10 duration-700 delay-[400ms] fill-mode-both">
                Selected
              </div>
              
              <h1 className="text-[6rem] font-black mb-2 tracking-wide leading-none animate-in slide-in-from-bottom-10 duration-700 delay-[500ms] fill-mode-both text-shadow-glow">
                {animatingStudent.name}
              </h1>
              
              <div className="text-5xl font-teko text-white/70 mb-12 animate-in slide-in-from-bottom-10 duration-700 delay-[600ms] fill-mode-both">
                Chest No. <span className="text-event-gold font-bold">{animatingStudent.chestNo}</span>
              </div>
              
              <div className={clsx(
                "inline-block px-16 py-4 rounded-xl text-6xl font-black uppercase tracking-widest shadow-2xl", 
                `border-4 border-${animatingTeam?.color.replace('bg-', '')} ${animatingTeam?.text} bg-${animatingTeam?.color.replace('bg-', '')}/20`,
                "animate-in slide-in-from-bottom-16 fade-in duration-700 delay-[800ms] fill-mode-both"
              )}>
                {animatingTeam?.name}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
