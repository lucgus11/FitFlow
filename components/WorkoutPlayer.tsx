"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { TimelineStep, WorkerOutMessage } from "@/types/fit";
import { playBeep, unlockAudio } from "@/lib/sounds";
import { formatTime } from "@/lib/buildTimeline";

interface Props {
  timeline: TimelineStep[];
  totalDuration: number;
  workoutName: string;
  onExit: () => void;
}

interface TickState {
  remaining: number;
  step: TimelineStep;
  stepIndex: number;
  totalSteps: number;
  elapsedTotal: number;
}

export default function WorkoutPlayer({ timeline, totalDuration, workoutName, onExit }: Props) {
  const workerRef = useRef<Worker | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [running, setRunning] = useState(false);
  const [tickData, setTickData] = useState<TickState | null>(null);
  const [done, setDone] = useState(false);

  // Setup worker
  useEffect(() => {
    const worker = new Worker(new URL("../workers/timer.worker.ts", import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
      const data = e.data;
      switch (data.type) {
        case "tick":
          setTickData({
            remaining: data.remaining,
            step: data.step,
            stepIndex: data.stepIndex,
            totalSteps: data.totalSteps,
            elapsedTotal: data.elapsedTotal,
          });
          break;
        case "beep":
          playBeep(data.kind);
          break;
        case "done":
          setRunning(false);
          setDone(true);
          break;
        case "status":
          setRunning(data.running);
          break;
      }
    };

    worker.postMessage({ type: "load", payload: timeline });

    return () => {
      worker.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wake Lock management
  const requestWakeLock = useCallback(async () => {
    try {
      if (navigator.wakeLock) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch {
      // Wake lock not available or denied — non-blocking
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && running) {
        void requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [running, requestWakeLock]);

  useEffect(() => {
    return () => releaseWakeLock();
  }, [releaseWakeLock]);

  const toggle = () => {
    unlockAudio();
    if (!running) {
      void requestWakeLock();
    } else {
      releaseWakeLock();
    }
    workerRef.current?.postMessage({ type: running ? "pause" : "start" });
  };

  const skip = () => {
    unlockAudio();
    workerRef.current?.postMessage({ type: "skip" });
  };

  const back = () => {
    unlockAudio();
    workerRef.current?.postMessage({ type: "back" });
  };

  const reset = () => {
    setDone(false);
    workerRef.current?.postMessage({ type: "reset" });
  };

  if (done) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="text-6xl">🏁</div>
        <h1 className="text-4xl font-extrabold uppercase tracking-tight text-lime-400">
          Séance terminée !
        </h1>
        <p className="text-neutral-400">{workoutName}</p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="px-8 py-4 rounded-2xl bg-neutral-800 border border-neutral-700 font-bold uppercase tracking-wide"
          >
            Recommencer
          </button>
          <button
            onClick={onExit}
            className="px-8 py-4 rounded-2xl bg-lime-400 text-black font-extrabold uppercase tracking-wide"
          >
            Terminer
          </button>
        </div>
      </div>
    );
  }

  if (!tickData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-neutral-500 font-semibold">Chargement du programme…</p>
      </div>
    );
  }

  const { remaining, step, stepIndex, totalSteps, elapsedTotal } = tickData;
  const isWork = step.phase === "work";
  const progressPct = totalDuration > 0 ? Math.min(100, (elapsedTotal / totalDuration) * 100) : 0;

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-between
        text-white transition-colors duration-300 px-6 py-8 select-none
        ${isWork ? "bg-black" : "bg-neutral-950"}`}
      style={{
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
      }}
    >
      {/* Top bar */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <button
          onClick={onExit}
          className="text-neutral-500 hover:text-white font-semibold text-sm uppercase tracking-wide transition-colors"
        >
          ✕ Quitter
        </button>
        <div className="text-neutral-500 text-sm font-bold tabular-nums">
          {stepIndex + 1} / {totalSteps}
        </div>
      </div>

      {/* Phase indicator */}
      <div
        className={`text-base md:text-lg font-extrabold tracking-[0.4em] uppercase mt-4
          ${isWork ? "text-lime-400" : "text-orange-500"}`}
      >
        {isWork ? "Effort" : "Repos"}
      </div>

      {/* Block name */}
      <div className="text-neutral-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">
        {step.blockName}
      </div>

      {/* Exercise name */}
      <div className="text-center mt-2">
        <h1 className="text-3xl md:text-6xl font-extrabold uppercase tracking-tight leading-tight">
          {isWork ? step.exerciseName : "Récupération"}
        </h1>
        <p className="text-neutral-500 mt-3 text-lg font-semibold">
          Cycle {step.cycle} / {step.totalCycles}
        </p>
        {!isWork && (
          <p className="text-neutral-300 mt-1 text-base">
            Préparez-vous : <span className="font-bold text-white">{step.nextExerciseName ?? step.exerciseName}</span>
          </p>
        )}
      </div>

      {/* Timer */}
      <div
        className={`text-[6rem] leading-none md:text-[14rem] font-black tabular-nums my-4
          ${isWork ? "text-lime-400" : "text-orange-500"}`}
        style={{ textShadow: isWork ? "0 0 50px rgba(163,230,53,0.6)" : "0 0 50px rgba(249,115,22,0.6)" }}
      >
        {remaining}
      </div>

      {/* Next exercise */}
      <div className="text-neutral-400 text-base md:text-lg text-center min-h-[1.75rem]">
        {step.nextExerciseName ? (
          <>
            Suivant : <span className="text-white font-bold">{step.nextExerciseName}</span>
          </>
        ) : (
          <span className="text-lime-400 font-bold">Dernière étape !</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl flex flex-col gap-2 mt-6">
        <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${isWork ? "bg-lime-400" : "bg-orange-500"}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-500 font-semibold tabular-nums">
          <span>{formatTime(elapsedTotal)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 w-full max-w-2xl mt-6">
        <button
          onClick={back}
          disabled={stepIndex === 0}
          className="px-5 py-5 rounded-2xl font-bold text-xl bg-neutral-900 border border-neutral-700 text-white
                     active:scale-95 transition-transform disabled:opacity-30"
          aria-label="Étape précédente"
        >
          ⏮
        </button>
        <button
          onClick={toggle}
          className={`flex-1 py-5 rounded-2xl font-extrabold text-xl uppercase tracking-wider active:scale-[0.98] transition-transform
            ${running ? "bg-orange-500 text-black" : "bg-lime-400 text-black"}`}
          style={{
            boxShadow: running
              ? "0 0 30px rgba(249,115,22,0.4)"
              : "0 0 30px rgba(163,230,53,0.4)",
          }}
        >
          {running ? "Pause" : "Reprendre"}
        </button>
        <button
          onClick={skip}
          className="px-5 py-5 rounded-2xl font-bold text-xl bg-neutral-900 border border-neutral-700 text-white
                     active:scale-95 transition-transform"
          aria-label="Étape suivante"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
