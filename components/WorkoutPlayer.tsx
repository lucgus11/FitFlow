// components/WorkoutPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { FitFile } from "@/types/fit";
import { buildTimeline } from "@/lib/buildTimeline";
import { playBeep } from "@/lib/sounds";

interface Props {
  fit: FitFile;
}

export default function WorkoutPlayer({ fit }: Props) {
  const workerRef = useRef<Worker | null>(null);
  const [running, setRunning] = useState(false);
  const [tickData, setTickData] = useState<any>(null);

  useEffect(() => {
    const worker = new Worker(new URL("../workers/timer.worker.ts", import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type } = e.data;
      if (type === "tick") setTickData(e.data);
      if (type === "beep") playBeep(e.data.kind);
      if (type === "done") setRunning(false);
    };

    const timeline = buildTimeline(fit);
    worker.postMessage({ type: "load", payload: timeline });

    return () => worker.terminate();
  }, [fit]);

  const toggle = () => {
    workerRef.current?.postMessage({ type: running ? "pause" : "start" });
    setRunning(!running);
  };

  const skip = () => workerRef.current?.postMessage({ type: "skip" });

  if (!tickData) return <div className="text-white p-8">Chargement...</div>;

  const { remaining, step, stepIndex, totalSteps } = tickData;
  const isWork = step.phase === "work";

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-between
        text-white transition-colors duration-300 px-6 py-10
        ${isWork ? "bg-black" : "bg-neutral-950"}`}
    >
      {/* Phase indicator */}
      <div
        className={`text-sm font-bold tracking-[0.3em] uppercase
          ${isWork ? "text-lime-400" : "text-orange-500"}`}
      >
        {isWork ? "EFFORT" : "REPOS"}
      </div>

      {/* Exercise name */}
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight">
          {step.exerciseName}
        </h1>
        <p className="text-neutral-500 mt-2 text-lg">
          Cycle {step.cycle}/{step.totalCycles}
        </p>
      </div>

      {/* Timer */}
      <div
        className={`text-[8rem] md:text-[12rem] font-black leading-none tabular-nums
          ${isWork ? "text-lime-400" : "text-orange-500"}`}
        style={{ textShadow: "0 0 40px currentColor" }}
      >
        {remaining}
      </div>

      {/* Next exercise */}
      <div className="text-neutral-400 text-lg">
        {step.nextExerciseName ? (
          <>Suivant : <span className="text-white font-semibold">{step.nextExerciseName}</span></>
        ) : (
          <span className="text-lime-400 font-semibold">Dernière étape !</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ${isWork ? "bg-lime-400" : "bg-orange-500"}`}
          style={{ width: `${(stepIndex / totalSteps) * 100}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={toggle}
          className={`flex-1 py-4 rounded-2xl font-bold text-xl uppercase
            ${running ? "bg-orange-500 text-black" : "bg-lime-400 text-black"}`}
        >
          {running ? "Pause" : "Démarrer"}
        </button>
        <button
          onClick={skip}
          className="flex-1 py-4 rounded-2xl font-bold text-xl uppercase
            bg-neutral-800 border border-neutral-700 text-white"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
