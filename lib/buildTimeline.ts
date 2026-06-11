import type { FitFile, TimelineStep } from "@/types/fit";

export function buildTimeline(fit: FitFile): TimelineStep[] {
  const timeline: TimelineStep[] = [];

  // Flatten the order of (blockIndex, exerciseIndex) pairs to compute "next exercise" easily
  const flatExercises: { blockIndex: number; blockName: string; exerciseIndex: number; name: string }[] = [];
  fit.blocks.forEach((block, blockIndex) => {
    block.exercises.forEach((exo, exerciseIndex) => {
      flatExercises.push({ blockIndex, blockName: block.blockName, exerciseIndex, name: exo.name });
    });
  });

  let flatPos = 0;

  fit.blocks.forEach((block, blockIndex) => {
    block.exercises.forEach((exo, exerciseIndex) => {
      const next = flatExercises[flatPos + 1]?.name ?? null;
      flatPos++;

      for (let c = 1; c <= exo.cycles; c++) {
        if (exo.duration > 0) {
          timeline.push({
            blockIndex,
            blockName: block.blockName,
            exerciseIndex,
            exerciseName: exo.name,
            nextExerciseName: next,
            cycle: c,
            totalCycles: exo.cycles,
            phase: "work",
            duration: exo.duration,
          });
        }

        // No rest after the very last cycle of the very last exercise
        const isLastCycle = c === exo.cycles;
        const isLastExercise = flatPos === flatExercises.length;
        if (exo.rest > 0 && !(isLastCycle && isLastExercise)) {
          timeline.push({
            blockIndex,
            blockName: block.blockName,
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

export function getTotalDuration(timeline: TimelineStep[]): number {
  return timeline.reduce((acc, step) => acc + step.duration, 0);
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
