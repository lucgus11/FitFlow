// lib/buildTimeline.ts
import type { FitFile } from "@/types/fit";

export function buildTimeline(fit: FitFile) {
  const timeline: any[] = [];

  fit.blocks.forEach((block, blockIndex) => {
    block.exercises.forEach((exo, exerciseIndex) => {
      const next = block.exercises[exerciseIndex + 1]?.name
        ?? fit.blocks[blockIndex + 1]?.exercises[0]?.name
        ?? null;

      for (let c = 1; c <= exo.cycles; c++) {
        timeline.push({
          blockIndex,
          exerciseIndex,
          exerciseName: exo.name,
          nextExerciseName: next,
          cycle: c,
          totalCycles: exo.cycles,
          phase: "work",
          duration: exo.duration,
        });

        if (exo.rest > 0) {
          timeline.push({
            blockIndex,
            exerciseIndex,
            exerciseName: exo.name,
            nextExerciseName: next,
            cycle: c,
            totalCycles: exo.cycles,
            phase: "rest",
            duration: exo.rest,
          });
        }
      }
    });
  });

  return timeline;
}
