import { useState, useEffect, useCallback } from 'react';
import studentData from '../data/students.json';

// Using BroadcastChannel for local cross-tab real-time sync
const channel = new BroadcastChannel('busthan-event-state');

const INITIAL_STATE = {
  currentCategory: 'Senior',
  currentTeam: null,
  accessEnabled: false,
  timerTimeRemaining: 24, // in seconds
  timerIsRunning: false,
  students: studentData.students,
  teams: [
    { id: 'team-a', name: 'TEAM A', color: 'bg-team-a', text: 'text-team-a', loginCode: 'ax7b9q' },
    { id: 'team-b', name: 'TEAM B', color: 'bg-team-b', text: 'text-team-b', loginCode: 'm4r2p1' },
    { id: 'team-c', name: 'TEAM C', color: 'bg-team-c', text: 'text-team-c', loginCode: 'z8v5k3' },
  ],
  categories: studentData.categories,
  latestSelections: [],
  audioMasterVolume: 80,
  audioEffectsVolume: 100,
  audioCountdownVolume: 60,
  audioCelebrationVolume: 100,
  audioMuted: false
};

let globalState = { ...INITIAL_STATE };
const listeners = new Set();

const broadcast = (newState) => {
  globalState = { ...newState };
  
  // Sync Audio Settings
  import('./audio.js').then(({ audioManager }) => {
    audioManager.updateSettings(globalState);
  }).catch(() => {});

  listeners.forEach(l => l(globalState));
  channel.postMessage(globalState);
};

channel.onmessage = (event) => {
  globalState = { ...event.data };
  
  // Sync Audio Settings
  import('./audio.js').then(({ audioManager }) => {
    audioManager.updateSettings(globalState);
  }).catch(() => {});

  listeners.forEach(l => l(globalState));
};

export const useEventState = () => {
  const [state, setState] = useState(globalState);

  useEffect(() => {
    listeners.add(setState);
    return () => listeners.delete(setState);
  }, []);

  const updateState = useCallback((updates) => {
    broadcast({ ...globalState, ...updates });
  }, []);

  const selectStudent = useCallback((studentId, teamId) => {
    const student = globalState.students.find(s => s.id === studentId);
    if (!student) return;

    const updatedStudents = globalState.students.map(s => 
      s.id === studentId ? { ...s, status: 'selected', selectedBy: teamId } : s
    );

    const newSelection = {
      id: Date.now(),
      studentName: student.name,
      teamId,
      time: new Date().toISOString()
    };

    broadcast({
      ...globalState,
      students: updatedStudents,
      latestSelections: [newSelection, ...globalState.latestSelections].slice(0, 5),
      currentTeam: null, // Clear active team after selection
      accessEnabled: false, // Lock access
      timerIsRunning: false // Stop timer on selection
    });
  }, []);

  const decrementTimer = useCallback(() => {
    if (globalState.timerIsRunning && globalState.timerTimeRemaining > 0) {
      broadcast({
        ...globalState,
        timerTimeRemaining: globalState.timerTimeRemaining - 1
      });
    }
  }, []);

  const toggleTimer = useCallback(() => {
    broadcast({
      ...globalState,
      timerIsRunning: !globalState.timerIsRunning
    });
  }, []);

  const regenerateLoginCode = useCallback((teamId) => {
    const updatedTeams = globalState.teams.map(t => 
      t.id === teamId 
        ? { ...t, loginCode: Math.random().toString(36).substring(2, 8) } 
        : t
    );
    broadcast({ ...globalState, teams: updatedTeams });
  }, []);

  return { state, updateState, selectStudent, decrementTimer, toggleTimer, regenerateLoginCode };
};
