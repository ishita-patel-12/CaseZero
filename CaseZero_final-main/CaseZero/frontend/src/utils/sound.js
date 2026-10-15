// Lightweight Web Audio API procedural sound effects
// Muted by default, user-controlled, zero external asset dependencies

let audioCtx = null;
let isSoundEnabled = localStorage.getItem('cz_audio_enabled') === 'true';

function getContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isAudioEnabled() {
  return isSoundEnabled;
}

export function toggleAudio(enable) {
  isSoundEnabled = typeof enable === 'boolean' ? enable : !isSoundEnabled;
  localStorage.setItem('cz_audio_enabled', String(isSoundEnabled));
  if (isSoundEnabled) {
    getContext();
    playChirp(440, 0.05);
  }
  return isSoundEnabled;
}

function playChirp(freq = 400, duration = 0.05, type = 'sine') {
  if (!isSoundEnabled) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio failures safely
  }
}

const sounds = {
  click: () => playChirp(600, 0.03, 'triangle'),
  dossierOpen: () => playChirp(350, 0.08, 'sine'),
  evidenceFound: () => {
    if (!isSoundEnabled) return;
    playChirp(520, 0.06, 'sine');
    setTimeout(() => playChirp(680, 0.08, 'sine'), 60);
  },
  clueUnlocked: () => {
    if (!isSoundEnabled) return;
    playChirp(440, 0.08, 'triangle');
    setTimeout(() => playChirp(554, 0.08, 'triangle'), 80);
    setTimeout(() => playChirp(659, 0.12, 'triangle'), 160);
  },
  stamp: () => playChirp(180, 0.09, 'sawtooth'),
  puzzleSuccess: () => {
    if (!isSoundEnabled) return;
    playChirp(400, 0.07, 'sine');
    setTimeout(() => playChirp(600, 0.07, 'sine'), 90);
    setTimeout(() => playChirp(800, 0.14, 'sine'), 180);
  },
  puzzleWrong: () => playChirp(200, 0.12, 'sawtooth')
};

export const playSound = Object.assign(
  (name) => {
    if (sounds[name]) sounds[name]();
    else sounds.click();
  },
  sounds
);
