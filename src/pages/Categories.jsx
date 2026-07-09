import { useEventState } from '../lib/store';
import { Plus, Edit2, Trash2, LayoutList } from 'lucide-react';

export default function Categories() {
  const { state } = useEventState();

  return (
    <div className="h-full bg-[#0a0a0a] text-white flex flex-col p-8 overflow-y-auto custom-scrollbar relative font-sans">
      {/* Background Cinematic Glows */}
      <div className="absolute top-0 right-1/4 w-1/3 h-96 bg-blue-500/5 blur-[120px] pointer-events-none rounded-full"></div>

      <header className="mb-10 flex justify-between items-end relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-3">
            <LayoutList className="w-8 h-8 text-blue-400" /> Categories
          </h1>
          <p className="text-white/40 text-sm font-medium tracking-wider uppercase">Manage student age groups and categories</p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-event-gold/10 text-event-gold hover:bg-event-gold/20 transition-all rounded-full font-bold uppercase tracking-widest border border-event-gold/20 hover:border-event-gold/40 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] text-sm">
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </header>

      <div className="flex flex-col gap-4 max-w-4xl relative z-10">
        {state.categories.map((cat, index) => {
          const catStudents = state.students.filter(s => s.category === cat);
          const total = catStudents.length;
          const selected = catStudents.filter(s => s.status === 'selected').length;
          const remaining = total - selected;

          return (
            <div key={cat} className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-white/30 group-hover:text-blue-400 group-hover:border-blue-400/30 group-hover:bg-blue-400/10 transition-all shadow-inner">
                  <LayoutList className="w-6 h-6 drop-shadow-md" />
                </div>
                <div className="w-48">
                  <h2 className="text-xl font-bold text-white tracking-wider">{cat}</h2>
                  <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Order: {index + 1}</div>
                </div>
                
                <div className="flex gap-12 flex-1 items-center bg-[#121212] py-4 px-8 rounded-2xl border border-white/5 shadow-inner">
                  <div>
                    <div className="text-2xl font-bold">{total}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Total</div>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div>
                    <div className="text-2xl font-bold text-event-gold">{selected}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-event-gold/60 mt-1">Selected</div>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{remaining}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-green-400/60 mt-1">Remaining</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity ml-6">
                <button className="p-3.5 bg-[#121212] hover:bg-white/10 transition-colors rounded-xl border border-white/5 hover:border-white/20" title="Edit">
                  <Edit2 className="w-4 h-4 text-white/60" />
                </button>
                <button className="p-3.5 bg-red-500/10 hover:bg-red-500/20 transition-colors rounded-xl border border-red-500/20 hover:border-red-500/40" title="Delete">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
