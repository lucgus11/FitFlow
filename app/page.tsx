"use client";

import { useMemo, useState } from "react";
import type { FitFile } from "@/types/fit";
import ImportButton from "@/components/ImportButton";
import WorkoutSummary from "@/components/WorkoutSummary";
import WorkoutPlayer from "@/components/WorkoutPlayer";
import { buildTimeline, getTotalDuration, formatTime } from "@/lib/buildTimeline";
import { validateFit } from "@/lib/validateFit";

type Screen = "home" | "summary" | "playing";

const SAMPLES = [
  { label: "Full Body HIIT (20 min)", file: "/samples/full-body-hiit.fit.json" },
  { label: "Jambes & Cardio (20 min)", file: "/samples/jambes-cardio.fit.json" },
];

export default function Home() {
  const [fit, setFit] = useState<FitFile | null>(null);
  const [screen, setScreen] = useState<Screen>("home");
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  const timeline = useMemo(() => (fit ? buildTimeline(fit) : []), [fit]);
  const totalDuration = useMemo(() => getTotalDuration(timeline), [timeline]);

  const handleLoad = (loaded: FitFile) => {
    setFit(loaded);
    setScreen("summary");
  };

  const handleLoadSample = async (file: string) => {
    setSampleError(null);
    setLoadingSample(file);
    try {
      const res = await fetch(file);
      const json = await res.json();
      const result = validateFit(json);
      if (!result.valid || !result.fit) {
        setSampleError(result.error ?? "Programme exemple invalide.");
        return;
      }
      handleLoad(result.fit);
    } catch {
      setSampleError("Impossible de charger le programme exemple.");
    } finally {
      setLoadingSample(null);
    }
  };

  if (screen === "playing" && fit) {
    return (
      <WorkoutPlayer
        timeline={timeline}
        totalDuration={totalDuration}
        workoutName={fit.metadata.name}
        onExit={() => setScreen("summary")}
      />
    );
  }

  if (screen === "summary" && fit) {
    return (
      <WorkoutSummary
        fit={fit}
        timeline={timeline}
        totalDuration={totalDuration}
        onStart={() => setScreen("playing")}
        onBack={() => {
          setFit(null);
          setScreen("home");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-12 gap-10">
      <div className="text-center">
        <h1
          className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter text-lime-400"
          style={{ textShadow: "0 0 40px rgba(163,230,53,0.5)" }}
        >
          FitFlow
        </h1>
        <p className="text-neutral-400 mt-3 max-w-md mx-auto">
          Charge un fichier <span className="text-white font-semibold">.fit</span> et lance ta séance.
          Fonctionne hors-ligne, écran toujours allumé pendant l&apos;effort.
        </p>
      </div>

      <ImportButton onLoad={handleLoad} />

      <div className="w-full max-w-md">
        <p className="text-neutral-500 text-xs font-bold uppercase tracking-[0.3em] text-center mb-4">
          Ou essaye un exemple
        </p>
        <div className="flex flex-col gap-3">
          {SAMPLES.map((sample) => (
            <button
              key={sample.file}
              onClick={() => handleLoadSample(sample.file)}
              disabled={loadingSample !== null}
              className="w-full px-6 py-4 rounded-2xl bg-neutral-900 border border-neutral-800
                         text-left font-semibold hover:border-lime-400 hover:text-lime-400
                         transition-colors disabled:opacity-50"
            >
              {loadingSample === sample.file ? "Chargement…" : sample.label}
            </button>
          ))}
        </div>
        {sampleError && (
          <p className="text-orange-500 text-sm font-semibold text-center mt-3">{sampleError}</p>
        )}
      </div>

      <p className="text-neutral-700 text-xs text-center max-w-sm">
        Astuce : crée tes propres séances avec un assistant IA configuré pour générer des fichiers .fit
        au format JSON, puis importe-les ici.
      </p>

      {fit && (
        <p className="text-neutral-600 text-xs">
          Durée calculée : {formatTime(totalDuration)}
        </p>
      )}
    </div>
  );
}
