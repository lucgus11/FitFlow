// workers/timer.worker.ts

type Phase = "idle" | "work" | "rest" | "transition" | "done";

interface Step {
  blockIndex: number;
  exerciseIndex: number;
  exerciseName: string;
  nextExerciseName: string | null;
  cycle: number;
  totalCycles: number;
  phase: "work" | "rest";
  duration: number;
}

let timeline: Step[] = [];
let currentStepIndex = 0;
let phaseStartTime = 0;
let remaining = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;
let running = false;

function tick() {
  if (!running || currentStepIndex >= timeline.length) return;

  const elapsed = (Date.now() - phaseStartTime) / 1000;
  const step = timeline[currentStepIndex];
  remaining = Math.max(0, step.duration - elapsed);

  postMessage({
    type: "tick",
    remaining: Math.ceil(remaining),
    step,
    stepIndex: currentStepIndex,
    totalSteps: timeline.length,
  });

  // Bips sonores : 3-2-1 avant la fin de la phase
  if (Math.ceil(remaining) <= 3 && Math.ceil(remaining) > 0) {
    postMessage({ type: "beep", kind: "short" });
  }

  if (remaining <= 0) {
    currentStepIndex++;

    if (currentStepIndex >= timeline.length) {
      running = false;
      if (intervalId) clearInterval(intervalId);
      postMessage({ type: "done" });
      return;
    }

    postMessage({ type: "beep", kind: "long" });
    phaseStartTime = Date.now();
  }
}

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case "load":
      timeline = payload as Step[];
      currentStepIndex = 0;
      remaining = timeline[0]?.duration ?? 0;
      postMessage({
        type: "tick",
        remaining: Math.ceil(remaining),
        step: timeline[0],
        stepIndex: 0,
        totalSteps: timeline.length,
      });
      break;

    case "start":
      if (running) break;
      running = true;
      phaseStartTime = Date.now() - (timeline[currentStepIndex].duration - remaining) * 1000;
      intervalId = setInterval(tick, 200); // résolution interne fine
      break;

    case "pause":
      running = false;
      if (intervalId) clearInterval(intervalId);
      break;

    case "skip":
      currentStepIndex++;
      if (currentStepIndex >= timeline.length) {
        running = false;
        if (intervalId) clearInterval(intervalId);
        postMessage({ type: "done" });
        break;
      }
      phaseStartTime = Date.now();
      remaining = timeline[currentStepIndex].duration;
      postMessage({ type: "beep", kind: "long" });
      break;

    case "reset":
      running = false;
      if (intervalId) clearInterval(intervalId);
      currentStepIndex = 0;
      remaining = timeline[0]?.duration ?? 0;
      break;
  }
};

export {};
