import { useState, useMemo, useEffect } from 'react';
import { useEventState } from '../lib/store';
import clsx from 'clsx';
import { ANIMATION_VARIANTS } from '../lib/animations';
import confetti from 'canvas-confetti';

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
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

const TeamShowcaseColumn = ({ team, students }) => {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [activeVariant, setActiveVariant] = useState(ANIMATION_VARIANTS[0]);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (students.length <= 1) return;
    
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % students.length);
      setActiveVariant(ANIMATION_VARIANTS[Math.floor(Math.random() * ANIMATION_VARIANTS.length)]);
      setKey(prev => prev + 1);

      // Confetti effect
      setTimeout(() => {
        var duration = 1500;
        var end = Date.now() + duration;

        (function frame() {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FFD700', '#ffffff']
          });
          confetti({
            particleCount: 3,
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
    }, 3000);

    return () => clearInterval(interval);
  }, [students.length]);

  useEffect(() => {
    setFeaturedIndex(0);
    setKey(prev => prev + 1);
  }, [students]);

  const featuredStudent = students[featuredIndex];

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-3xl backdrop-blur-sm border border-white/5 overflow-hidden animate-in fade-in duration-700">
      {/* Team Header */}
      <div className={clsx(
        "w-full py-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl shrink-0",
        `bg-${team.color.replace('bg-', '')}/20 border-b-2 border-${team.color.replace('bg-', '')}`
      )}>
        <div className={clsx("absolute inset-0 blur-3xl opacity-30", team.color)}></div>
        <h2 className={clsx("text-5xl font-black tracking-widest uppercase relative z-10", team.text)}>
          {team.name}
        </h2>
        <div className="text-white/60 mt-1 font-teko text-3xl tracking-wider relative z-10">
          {students.length} Members
        </div>
      </div>

      {/* Featured Animation Area */}
      <div className="h-96 relative flex items-center justify-center border-b border-white/10 shrink-0 overflow-hidden bg-black/20">
        {featuredStudent ? (
          <div key={key} className="relative z-10 flex flex-col items-center w-full px-6">
            <div className={clsx("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] blur-[100px] rounded-full opacity-30 animate-pulse", team.color)}></div>
            
            <img 
              src={featuredStudent.photo} 
              alt={featuredStudent.name} 
              className={clsx(
                "w-48 h-48 rounded-full object-cover border-[6px] shadow-[0_0_50px_rgba(255,255,255,0.2)] mb-4", 
                `border-${team.color.replace('bg-', '')}`,
                activeVariant.photo
              )} 
            />
            
            <div className="text-center flex flex-col items-center w-full">
              <div className={clsx("text-xl text-white/50 uppercase tracking-[0.5em] mb-2 font-light", activeVariant.selectedText)}>
                Spotlight
              </div>
              
              <h1 className={clsx("text-4xl font-black mb-1 tracking-wide leading-tight truncate w-full", activeVariant.nameText)}>
                {featuredStudent.name}
              </h1>
              
              <div className={clsx("text-3xl font-teko text-white/70", activeVariant.chestNoText)}>
                Chest No. <span className="text-event-gold font-bold">{featuredStudent.chestNo}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-white/30 text-xl tracking-widest uppercase animate-pulse">Waiting for members...</div>
        )}
      </div>

      {/* Compact List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 relative">
        {/* Shadow for scroll indicating */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10"></div>
        
        {students.map((student, idx) => (
          <div 
            key={student.id} 
            className={clsx(
              "flex items-center gap-4 bg-white/5 rounded-xl p-2 pr-4 border border-white/5 transition-all",
              idx === featuredIndex ? `bg-${team.color.replace('bg-', '')}/10 border-${team.color.replace('bg-', '')}/30 shadow-md grayscale-0 opacity-100` : "opacity-40 grayscale hover:opacity-70 hover:grayscale-[50%]"
            )}
          >
            <img 
              src={student.photo} 
              alt={student.name} 
              className={clsx(
                "w-12 h-12 rounded-full object-cover border-2",
                idx === featuredIndex ? `border-${team.color.replace('bg-', '')}` : "border-white/20"
              )} 
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate leading-tight text-white">{student.name}</div>
              <div className="text-white/50 text-xs mt-0.5 truncate uppercase tracking-wider">{student.category}</div>
            </div>
            <div className="text-event-gold font-teko text-2xl font-bold leading-none">
              {student.chestNo}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ShowcaseDisplay() {
  const { state } = useEventState();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // We want to ensure 'All' is always available, and categories are dynamic
  const categories = ['All', ...state.categories];

  // Also default to first available category if it wasn't 'All' initially, but let's stick to 'All'
  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [state.categories, selectedCategory]);

  const displayedStudents = useMemo(() => {
    let filtered = state.students.filter(s => s.status === 'selected');
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    return filtered;
  }, [state.students, selectedCategory]);

  return (
    <div className="w-screen h-screen bg-charcoal text-white overflow-hidden relative font-display flex flex-col">
      
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 bg-charcoal z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-50"></div>
        <ParticleBackground />
      </div>

      <div className="relative z-10 flex flex-col w-full h-full p-6 pb-8">
        
        {/* Header and Toggle */}
        <div className="flex flex-col items-center mb-6 shrink-0">
          <div className="flex items-center gap-8 w-full justify-between px-8 mb-4">
            <h1 className="text-4xl font-black tracking-[0.2em] uppercase text-event-gold drop-shadow-lg">
              Team Showcase
            </h1>
            
            {/* Category Toggle */}
            <div className="flex flex-wrap justify-center gap-2 bg-black/40 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={clsx(
                    "px-6 py-2 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 text-sm",
                    selectedCategory === cat 
                      ? "bg-event-gold text-charcoal shadow-[0_0_15px_rgba(255,215,0,0.4)]" 
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Team Columns Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1920px] mx-auto min-h-0">
          {state.teams.map((team) => (
            <TeamShowcaseColumn 
              key={team.id} 
              team={team} 
              students={displayedStudents.filter(s => s.selectedBy === team.id)} 
            />
          ))}
        </div>

      </div>
    </div>
  );
}
