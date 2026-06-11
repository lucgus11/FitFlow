let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Unlock the AudioContext on first user interaction (required by mobile browsers).
 */
export function unlockAudio() {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
}

export function playBeep(kind: "short" | "long" | "start" | "end") {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  const configs: Record<string, { freq: number; duration: number; gain: number }> = {
    short: { freq: 880, duration: 0.1, gain: 0.25 },
    long: { freq: 1320, duration: 0.35, gain: 0.3 },
    start: { freq: 660, duration: 0.15, gain: 0.25 },
    end: { freq: 440, duration: 0.6, gain: 0.3 },
  };

  const cfg = configs[kind] ?? configs.short;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = cfg.freq;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(cfg.gain, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + cfg.duration + 0.05);
}
