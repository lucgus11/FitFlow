// lib/sounds.ts

let audioCtx: AudioContext | null = null;

export function playBeep(kind: "short" | "long") {
  if (typeof window === "undefined") return;
  if (!audioCtx) audioCtx = new AudioContext();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = kind === "long" ? 880 : 660;
  gain.gain.value = 0.3;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + (kind === "long" ? 0.4 : 0.12));
}
