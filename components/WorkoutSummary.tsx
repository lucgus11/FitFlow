"use client";

import type { FitFile, TimelineStep } from "@/types/fit";
import { formatTime } from "@/lib/buildTimeline";

interface Props {
  fit: FitFile;
  timeline: TimelineStep[];
  totalDuration: number;
  onStart: () => void;
  onBack: () => void;
}

export default function WorkoutSummary({ fit, timeline, totalDuration, onStart, onBack }: Props) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8 max-w-2xl mx-auto w-full">
      <button
        onClick={onBack}
        className="self-start text-neutral-400 hover:text-lime-400 font-semibold mb-6 transition-colors"
      >
        ← Retour
      </button>

      <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-2">
        {fit.metadata.name}
      </h1>
      <p className="text-neutral-400 mb-4">{fit.metadata.description}</p>

      <div className="flex flex-wrap gap-3 mb-8">
        <span className="px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-sm font-bold uppercase tracking-wide text-lime-400">
          {fit.metadata.level}
        </span>
        <span className="px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-sm font-bold uppercase tracking-wide text-orange-400">
          {formatTime(totalDuration)}
        </span>
        <span className="px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-sm font-bold uppercase tracking-wide text-neutral-300">
          {fit.metadata.author}
        </span>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pb-8">
        {fit.blocks.map((block, bi) => (
          <div key={bi}>
            <h2 className="text-lime-400 font-bold uppercase tracking-widest text-sm mb-3">
              {block.blockName}
            </h2>
            <div className="space-y-2">
              {block.exercises.map((exo, ei) => (
                <div
                  key={ei}
                  className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3"
                >
                  <span className="font-semibold">{exo.name}</span>
                  <span className="text-neutral-400 text-sm tabular-nums">
                    {exo.duration > 0 ? `${exo.duration}s effort` : ""}
                    {exo.duration > 0 && exo.rest > 0 ? " · " : ""}
                    {exo.rest > 0 ? `${exo.rest}s repos` : ""}
                    {" · "}x{exo.cycles}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-black via-black to-transparent">
        <button
          onClick={onStart}
          disabled={timeline.length === 0}
          className="w-full py-5 rounded-2xl bg-lime-400 text-black font-extrabold text-xl uppercase tracking-wider
                     active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ boxShadow: "0 0 30px rgba(163,230,53,0.4)" }}
        >
          Démarrer la séance
        </button>
      </div>
    </div>
  );
}
