// Sound effects using Web Audio API
let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine") {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (required after user interaction)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

export function playCorrectSound() {
  // Pleasant rising chord
  playTone(523.25, 0.15); // C5
  setTimeout(() => playTone(659.25, 0.15), 50); // E5
  setTimeout(() => playTone(783.99, 0.2), 100); // G5
}

export function playWrongSound() {
  // Descending buzz
  playTone(200, 0.25, "sawtooth");
}

export function playComboSound(combo: number) {
  // Higher pitch for higher combo
  const baseFreq = 400 + combo * 50;
  playTone(baseFreq, 0.1);
  setTimeout(() => playTone(baseFreq * 1.5, 0.15), 50);
}

export function playLevelUpSound() {
  // Celebratory arpeggio
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2), i * 100);
  });
}

// Haptic feedback
export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function vibrateCorrect() {
  vibrate(50);
}

export function vibrateWrong() {
  vibrate([100, 50, 100]);
}

export function vibrateCombo() {
  vibrate([30, 30, 30]);
}
