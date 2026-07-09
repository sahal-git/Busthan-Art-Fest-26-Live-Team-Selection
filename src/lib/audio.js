// AudioManager.js
// Handles preloading, mixing, and playing of all broadcast event sounds.

const SOUND_URLS = {
  'team-activated': 'https://actions.google.com/sounds/v1/science_fiction/stargate_whoosh.ogg',
  'countdown-start': 'https://actions.google.com/sounds/v1/ui/button_click.ogg',
  'countdown-pulse': 'https://actions.google.com/sounds/v1/foley/heartbeat.ogg',
  'selection-success': 'https://actions.google.com/sounds/v1/crowds/crowd_cheer.ogg',
  'team-reveal': 'https://actions.google.com/sounds/v1/weapons/deep_impact.ogg',
  'selection-complete': 'https://actions.google.com/sounds/v1/ui/bell_ding.ogg',
  'undo-selection': 'https://actions.google.com/sounds/v1/water/water_slosh.ogg',
  'manual-assignment': 'https://actions.google.com/sounds/v1/ui/piano_note.ogg',
  'timer-expired': 'https://actions.google.com/sounds/v1/alarms/buzzer_alarm.ogg',
  'category-change': 'https://actions.google.com/sounds/v1/science_fiction/sweep_down.ogg',
  'error': 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
  'reconnect': 'https://actions.google.com/sounds/v1/ui/positive_alert.ogg',
  'disconnect': 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg'
};

class AudioManager {
  constructor() {
    this.sounds = {};
    this.volumes = {
      master: 1.0,
      effects: 1.0,
      countdown: 1.0,
      celebration: 1.0
    };
    this.isMuted = false;
    this.activeLoops = {};
  }

  // Preload all sounds
  preload() {
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.sounds[key] = audio;
    });
  }

  // Update volume settings from store
  updateSettings(settings) {
    this.volumes = {
      master: settings.audioMasterVolume / 100,
      effects: settings.audioEffectsVolume / 100,
      countdown: settings.audioCountdownVolume / 100,
      celebration: settings.audioCelebrationVolume / 100
    };
    this.isMuted = settings.audioMuted;

    // Update active loops dynamically
    Object.values(this.activeLoops).forEach(audio => {
      audio.volume = this.getCalculatedVolume(audio.datasetCategory || 'effects');
    });
  }

  getCalculatedVolume(category) {
    if (this.isMuted) return 0;
    const catVol = this.volumes[category] !== undefined ? this.volumes[category] : 1.0;
    return this.volumes.master * catVol;
  }

  play(soundId, category = 'effects', loop = false) {
    if (this.isMuted) return;

    const sound = this.sounds[soundId];
    if (!sound) {
      console.warn(`Sound ${soundId} not found.`);
      return;
    }

    if (loop && this.activeLoops[soundId]) {
      return; // Already looping
    }

    const audioClone = sound.cloneNode();
    audioClone.volume = this.getCalculatedVolume(category);
    audioClone.datasetCategory = category;
    
    if (loop) {
      audioClone.loop = true;
      this.activeLoops[soundId] = audioClone;
    }

    audioClone.play().catch(e => console.warn("Audio playback failed (usually requires user interaction first):", e));
    return audioClone;
  }

  stop(soundId) {
    if (this.activeLoops[soundId]) {
      this.activeLoops[soundId].pause();
      this.activeLoops[soundId].currentTime = 0;
      delete this.activeLoops[soundId];
    }
  }

  stopAll() {
    Object.keys(this.activeLoops).forEach(key => this.stop(key));
  }
}

export const audioManager = new AudioManager();
// Initialize loading immediately
audioManager.preload();
