import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

const INITIAL_STATE = {
  currentCategory: 'Senior',
  currentTeam: null,
  accessEnabled: false,
  timerTimeRemaining: 30,
  timerIsRunning: false,
  defaultTimerDuration: parseInt(localStorage.getItem('defaultTimerDuration')) || 30,
  students: [],
  teams: [],
  categories: [],
  latestSelections: [],
  audioMasterVolume: 80,
  audioEffectsVolume: 100,
  audioCountdownVolume: 60,
  audioCelebrationVolume: 100,
  audioMuted: false,
  isLoaded: false
};

let globalState = { ...INITIAL_STATE };
const listeners = new Set();

const notifyListeners = () => {
  // Sync Audio Settings
  import('./audio.js').then(({ audioManager }) => {
    audioManager.updateSettings(globalState);
  }).catch(() => {});

  listeners.forEach(l => l(globalState));
};

let initialized = false;

export const useEventState = () => {
  const [state, setState] = useState(globalState);

  useEffect(() => {
    listeners.add(setState);

    if (!initialized) {
      initialized = true;
      loadInitialData();
      setupSubscriptions();
    }

    return () => listeners.delete(setState);
  }, []);

  const loadInitialData = async () => {
    try {
      const [
        { data: eventState },
        { data: teams },
        { data: categories },
        { data: students },
        { data: latestSelections }
      ] = await Promise.all([
        supabase.from('event_state').select('*').eq('id', 1).single(),
        supabase.from('teams').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('students').select('*'),
        supabase.from('latest_selections').select('*').order('time', { ascending: false }).limit(5)
      ]);

      globalState = {
        ...globalState,
        ...eventState,
        teams: teams || [],
        categories: categories ? categories.map(c => c.name) : [],
        students: students || [],
        latestSelections: latestSelections || [],
        isLoaded: true
      };
      notifyListeners();
    } catch (err) {
      console.error("Error loading data from Supabase:", err);
    }
  };

  const setupSubscriptions = () => {
    supabase.channel('public:event_state')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'event_state' }, payload => {
        globalState = { ...globalState, ...payload.new };
        notifyListeners();
      })
      .subscribe();

    supabase.channel('public:students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, async () => {
        // Simple way: refetch all students, or we can patch the specific student
        const { data } = await supabase.from('students').select('*');
        if (data) {
          globalState = { ...globalState, students: data };
          notifyListeners();
        }
      })
      .subscribe();

    supabase.channel('public:latest_selections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'latest_selections' }, async () => {
        const { data } = await supabase.from('latest_selections').select('*').order('time', { ascending: false }).limit(5);
        if (data) {
          globalState = { ...globalState, latestSelections: data };
          notifyListeners();
        }
      })
      .subscribe();
      
    supabase.channel('public:teams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, async () => {
        const { data } = await supabase.from('teams').select('*');
        if (data) {
          globalState = { ...globalState, teams: data };
          notifyListeners();
        }
      })
      .subscribe();
  };

  const updateState = useCallback(async (updates) => {
    // Optimistic update locally
    globalState = { ...globalState, ...updates };
    notifyListeners();

    if (updates.defaultTimerDuration !== undefined) {
      localStorage.setItem('defaultTimerDuration', updates.defaultTimerDuration);
    }

    // Find which keys belong to event_state vs others
    // For now we assume all `updates` are event_state fields unless explicitly handled
    const eventStateFields = [
      'currentCategory', 'currentTeam', 'accessEnabled', 'timerTimeRemaining',
      'timerIsRunning', 'audioMasterVolume', 'audioEffectsVolume',
      'audioCountdownVolume', 'audioCelebrationVolume', 'audioMuted'
    ];

    const eventUpdates = {};
    Object.keys(updates).forEach(key => {
      if (eventStateFields.includes(key)) {
        eventUpdates[key] = updates[key];
      }
    });

    if (Object.keys(eventUpdates).length > 0) {
      await supabase.from('event_state').update(eventUpdates).eq('id', 1);
    }
  }, []);

  const selectStudent = useCallback(async (studentId, teamId) => {
    const student = globalState.students.find(s => s.id === studentId);
    if (!student) return;

    // Optimistic update
    const updatedStudents = globalState.students.map(s => 
      s.id === studentId ? { ...s, status: 'selected', selectedBy: teamId } : s
    );

    const newSelection = {
      id: Date.now(),
      studentName: student.name,
      teamId,
      time: new Date().toISOString()
    };

    globalState = {
      ...globalState,
      students: updatedStudents,
      latestSelections: [newSelection, ...globalState.latestSelections].slice(0, 5),
      currentTeam: null,
      accessEnabled: false,
      timerIsRunning: false
    };
    notifyListeners();

    // Update Supabase
    await Promise.all([
      supabase.from('students').update({ status: 'selected', selectedBy: teamId }).eq('id', studentId),
      supabase.from('latest_selections').insert([newSelection]),
      supabase.from('event_state').update({
        currentTeam: null,
        accessEnabled: false,
        timerIsRunning: false
      }).eq('id', 1)
    ]);
  }, []);

  const manualAssignStudent = useCallback(async (studentId, teamId) => {
    const student = globalState.students.find(s => s.id === studentId);
    if (!student) return;

    // Optimistic update
    const updatedStudents = globalState.students.map(s => 
      s.id === studentId ? { ...s, status: 'selected', selectedBy: teamId } : s
    );

    const newSelection = {
      id: Date.now(),
      studentName: student.name,
      teamId,
      time: new Date().toISOString()
    };

    globalState = {
      ...globalState,
      students: updatedStudents,
      latestSelections: [newSelection, ...globalState.latestSelections].slice(0, 5)
    };
    notifyListeners();

    // Update Supabase
    await Promise.all([
      supabase.from('students').update({ status: 'selected', selectedBy: teamId }).eq('id', studentId),
      supabase.from('latest_selections').insert([newSelection])
    ]);
  }, []);

  const decrementTimer = useCallback(async () => {
    const now = Date.now();
    const lastDecStr = localStorage.getItem('_lastDecrementTime');
    const lastDec = lastDecStr ? parseInt(lastDecStr, 10) : 0;
    
    if (now - lastDec < 800) return;

    if (globalState.timerIsRunning && globalState.timerTimeRemaining > 0) {
      localStorage.setItem('_lastDecrementTime', now.toString());
      const newTime = globalState.timerTimeRemaining - 1;
      
      // Optimistic
      globalState = { ...globalState, timerTimeRemaining: newTime };
      notifyListeners();

      await supabase.from('event_state').update({ timerTimeRemaining: newTime }).eq('id', 1);
    }
  }, []);

  const toggleTimer = useCallback(async () => {
    const newState = !globalState.timerIsRunning;
    
    // Optimistic
    globalState = { ...globalState, timerIsRunning: newState };
    notifyListeners();

    await supabase.from('event_state').update({ timerIsRunning: newState }).eq('id', 1);
  }, []);

  const regenerateLoginCode = useCallback(async (teamId) => {
    const newCode = Math.random().toString(36).substring(2, 8);
    
    // Optimistic
    const updatedTeams = globalState.teams.map(t => 
      t.id === teamId ? { ...t, loginCode: newCode } : t
    );
    globalState = { ...globalState, teams: updatedTeams };
    notifyListeners();

    await supabase.from('teams').update({ loginCode: newCode }).eq('id', teamId);
  }, []);

  const updateStudent = useCallback(async (studentId, updates) => {
    // Optimistic update
    const updatedStudents = globalState.students.map(s => 
      s.id === studentId ? { ...s, ...updates } : s
    );
    globalState = { ...globalState, students: updatedStudents };
    notifyListeners();
    
    // Update Supabase
    await supabase.from('students').update(updates).eq('id', studentId);
  }, []);

  const unassignStudent = useCallback(async (studentId) => {
    const student = globalState.students.find(s => s.id === studentId);
    if (!student) return;

    // Optimistic update
    const updatedStudents = globalState.students.map(s => 
      s.id === studentId ? { ...s, status: 'available', selectedBy: null, team: null } : s
    );

    // Remove from latest selections if present
    const updatedLatestSelections = globalState.latestSelections.filter(sel => sel.studentName !== student.name);

    globalState = {
      ...globalState,
      students: updatedStudents,
      latestSelections: updatedLatestSelections
    };
    notifyListeners();

    // Update Supabase
    await Promise.all([
      supabase.from('students').update({ status: 'available', selectedBy: null, team: null }).eq('id', studentId),
      supabase.from('latest_selections').delete().eq('studentName', student.name)
    ]);
  }, []);

  const resetCategorySelections = useCallback(async (category) => {
    const updatedStudents = globalState.students.map(s => 
      s.category === category && s.status === 'selected' 
        ? { ...s, status: 'available', selectedBy: null, team: null } 
        : s
    );
    
    globalState = {
      ...globalState,
      students: updatedStudents,
      latestSelections: [],
      currentTeam: null,
      accessEnabled: false,
      timerIsRunning: false
    };
    notifyListeners();
    
    await Promise.all([
      supabase.from('students').update({ status: 'available', selectedBy: null, team: null }).eq('category', category),
      supabase.from('latest_selections').delete().neq('id', 0), // Delete all latest selections
      supabase.from('event_state').update({ currentTeam: null, accessEnabled: false, timerIsRunning: false }).eq('id', 1)
    ]);
  }, []);

  const resetAllAssignments = useCallback(async () => {
    const updatedStudents = globalState.students.map(s => 
      s.status === 'selected' 
        ? { ...s, status: 'available', selectedBy: null, team: null } 
        : s
    );
    
    globalState = {
      ...globalState,
      students: updatedStudents,
      latestSelections: [],
      currentTeam: null,
      accessEnabled: false,
      timerIsRunning: false
    };
    notifyListeners();
    
    await Promise.all([
      supabase.from('students').update({ status: 'available', selectedBy: null, team: null }).neq('status', 'available'),
      supabase.from('latest_selections').delete().neq('id', 0),
      supabase.from('event_state').update({ currentTeam: null, accessEnabled: false, timerIsRunning: false }).eq('id', 1)
    ]);
  }, []);

  const undoLastSelection = useCallback(async () => {
    if (globalState.latestSelections.length === 0) return;
    
    const lastSelection = globalState.latestSelections[0];
    const student = globalState.students.find(s => s.name === lastSelection.studentName);
    
    if (student) {
      // Optimistic update
      const updatedStudents = globalState.students.map(s => 
        s.id === student.id ? { ...s, status: 'available', selectedBy: null } : s
      );
      
      const updatedLatestSelections = globalState.latestSelections.slice(1);
      
      globalState = {
        ...globalState,
        students: updatedStudents,
        latestSelections: updatedLatestSelections
      };
      notifyListeners();
      
      // Update Supabase
      await Promise.all([
        supabase.from('students').update({ status: 'available', selectedBy: null }).eq('id', student.id),
        supabase.from('latest_selections').delete().eq('id', lastSelection.id)
      ]);
    }
  }, []);

  const deleteStudent = useCallback(async (studentId) => {
    // Optimistic update
    const updatedStudents = globalState.students.filter(s => s.id !== studentId);
    globalState = { ...globalState, students: updatedStudents };
    notifyListeners();
    
    // Delete from Supabase
    await supabase.from('students').delete().eq('id', studentId);
  }, []);

  return { state, updateState, selectStudent, manualAssignStudent, decrementTimer, toggleTimer, regenerateLoginCode, updateStudent, deleteStudent, resetCategorySelections, resetAllAssignments, unassignStudent, undoLastSelection };
};
