import { useState, useEffect } from 'react';
import { useEventState } from '../lib/store';
import clsx from 'clsx';
import confetti from 'canvas-confetti';
import { ANIMATION_VARIANTS } from '../lib/animations';

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

export default function ShowcaseDisplay() {
  const { state } = useEventState();
  const [animatingStudent, setAnimatingStudent] = useState(null);
  const [animatingTeam, setAnimatingTeam] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [activeVariant, setActiveVariant] = useState(ANIMATION_VARIANTS[0]);

  useEffect(() => {
    // Filter out only selected students
    const selectedStudents = state.students.filter(s => s.status === 'selected');
    
    if (selectedStudents.length === 0) return;

    let timeoutId;
    let isRunning = true;

    const triggerShowcase = () => {
      if (!isRunning) return;
      if (selectedStudents.length === 0) return;
      
      const randomStudent = selectedStudents[Math.floor(Math.random() * selectedStudents.length)];
      const team = state.teams.find(t => t.id === randomStudent.selectedBy);
      
      setAnimatingStudent(randomStudent);
      setAnimatingTeam(team);
      setShowFlash(true);
      setActiveVariant(ANIMATION_VARIANTS[Math.floor(Math.random() * ANIMATION_VARIANTS.length)]);

      setTimeout(() => {
        if (!isRunning) return;
        setShowFlash(false);
      }, 200);

      // Confetti effect
      setTimeout(() => {
        if (!isRunning) return;
        var duration = 4000;
        var end = Date.now() + duration;

        (function frame() {
          if (!isRunning) return;
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
      }, 800);

      // Keep it up for 6 seconds, then clear and wait before next
      setTimeout(() => {
        if (!isRunning) return;
        setAnimatingStudent(null);
        setAnimatingTeam(null);
        
        // Wait 1 second before showing the next one
        timeoutId = setTimeout(triggerShowcase, 1000);
      }, 6000);
    };

    // Start loop
    triggerShowcase();

    return () => {
      isRunning = false;
      clearTimeout(timeoutId);
    };
  }, [state.students, state.teams]);

  return (
    <div className="w-screen h-screen bg-charcoal text-white overflow-hidden relative font-display">
      
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 bg-charcoal z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-50"></div>
        <ParticleBackground />
      </div>

      {/* Main Content - Empty/Wait state just in case */}
      <div className={clsx("w-full h-full flex flex-col transition-opacity duration-700 relative z-10", animatingStudent ? "opacity-0" : "opacity-100")}>
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
           <div className="flex flex-col items-center opacity-50 animate-breathe">
              <div className="text-6xl font-light tracking-[0.3em] uppercase text-center text-event-gold mb-6">Showcase</div>
              <div className="text-2xl font-light tracking-[0.2em] uppercase text-center text-white/50">Highlighting the brilliant talents!</div>
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
                activeVariant.photo
              )} 
            />
            
            <div className="text-center flex flex-col items-center">
              <div className={clsx("text-3xl text-white uppercase tracking-[1em] mb-4 font-light", activeVariant.selectedText)}>
                Selected
              </div>
              
              <h1 className={clsx("text-[6rem] font-black mb-2 tracking-wide leading-none", activeVariant.nameText)}>
                {animatingStudent.name}
              </h1>
              
              <div className={clsx("text-5xl font-teko text-white/70 mb-12", activeVariant.chestNoText)}>
                Chest No. <span className="text-event-gold font-bold">{animatingStudent.chestNo}</span>
              </div>
              
              <div className={clsx(
                "inline-block px-16 py-4 rounded-xl text-6xl font-black uppercase tracking-widest shadow-2xl", 
                `border-4 border-${animatingTeam?.color.replace('bg-', '')} ${animatingTeam?.text} bg-${animatingTeam?.color.replace('bg-', '')}/20`,
                activeVariant.teamBadge
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
