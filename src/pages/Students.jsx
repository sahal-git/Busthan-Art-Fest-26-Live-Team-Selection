import { useState } from 'react';
import { useEventState } from '../lib/store';
import { Search, Upload, Download, Trash2, Edit2, X, RotateCcw, Users, Lock, MoreHorizontal } from 'lucide-react';
import { audioManager } from '../lib/audio';
import clsx from 'clsx';
import { exportAllToExcelCategories, exportTeamToExcel, exportTeamToPDF } from '../lib/exportUtils';

export default function Students() {
  const { state, updateState, updateStudent, deleteStudent } = useEventState();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingStudent, setEditingStudent] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTeamId, setExportTeamId] = useState('');

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
          <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 transition-all rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-white/20 hover:shadow-lg">
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
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
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
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingStudent({ ...student })} className="p-2 hover:bg-blue-500/20 hover:text-blue-400 text-white/40 transition-all rounded-lg" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if(confirm('Are you sure you want to delete this student?')) deleteStudent(student.id); }} className="p-2 hover:bg-red-500/20 hover:text-red-400 text-white/40 transition-all rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl relative">
            <button onClick={() => setEditingStudent(null)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-6 flex items-center gap-3">
              <Edit2 className="w-5 h-5 text-event-gold" /> Edit Student
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Name</label>
                <input 
                  type="text" 
                  value={editingStudent.name} 
                  onChange={e => setEditingStudent({...editingStudent, name: e.target.value})}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-event-gold transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Chest No</label>
                <input 
                  type="text" 
                  value={editingStudent.chestNo} 
                  onChange={e => setEditingStudent({...editingStudent, chestNo: e.target.value})}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-event-gold focus:outline-none focus:border-event-gold transition-all"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Category</label>
                  <select 
                    value={editingStudent.category} 
                    onChange={e => setEditingStudent({...editingStudent, category: e.target.value})}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-event-gold transition-all appearance-none"
                  >
                    {state.categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Class</label>
                  <input 
                    type="text" 
                    value={editingStudent.class} 
                    onChange={e => setEditingStudent({...editingStudent, class: e.target.value})}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-event-gold transition-all"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button onClick={() => setEditingStudent(null)} className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={() => {
                  updateStudent(editingStudent.id, { 
                    name: editingStudent.name, 
                    chestNo: editingStudent.chestNo, 
                    category: editingStudent.category, 
                    class: editingStudent.class 
                  });
                  setEditingStudent(null);
                }} className="px-5 py-2.5 bg-event-gold text-charcoal hover:bg-white transition-all rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,215,0,0.3)]">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl relative">
            <button onClick={() => setShowExportModal(false)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-6 flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-400" /> Export Data
            </h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">All Students</h3>
                <p className="text-xs text-white/60 mb-4">Export all students into an Excel file with category-based sheets.</p>
                <button 
                  onClick={() => exportAllToExcelCategories(state.students, state.teams)}
                  className="w-full flex justify-center items-center gap-2 px-5 py-2.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all rounded-xl text-xs font-bold uppercase tracking-widest border border-blue-500/20"
                >
                  <Download className="w-4 h-4" /> Download All (Excel)
                </button>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Team Export</h3>
                <p className="text-xs text-white/60 mb-4">Export students for a specific team in PDF or Excel format.</p>
                
                <div className="mb-4">
                  <select 
                    value={exportTeamId}
                    onChange={e => setExportTeamId(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-white focus:outline-none focus:border-blue-400/50 transition-all appearance-none shadow-inner"
                  >
                    <option value="" disabled>Select a Team</option>
                    {state.teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button 
                    disabled={!exportTeamId}
                    onClick={() => {
                      const team = state.teams.find(t => t.id === exportTeamId);
                      if(team) exportTeamToPDF(state.students, team);
                    }}
                    className="flex-1 flex justify-center items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl text-xs font-bold uppercase tracking-widest border border-red-500/20"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </button>
                  <button 
                    disabled={!exportTeamId}
                    onClick={() => {
                      const team = state.teams.find(t => t.id === exportTeamId);
                      if(team) exportTeamToExcel(state.students, team);
                    }}
                    className="flex-1 flex justify-center items-center gap-2 px-5 py-2.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl text-xs font-bold uppercase tracking-widest border border-green-500/20"
                  >
                    <Download className="w-4 h-4" /> Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
