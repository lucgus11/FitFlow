export type DifficultyLevel = "débutant" | "intermédiaire" | "avancé";

export interface FitMetadata {
  name: string;
  description: string;
  totalDuration: number; // seconds
  level: DifficultyLevel;
  author: string;
  version?: string;
  createdAt?: string;
}

export interface FitExercise {
  name: string;
  duration: number; // effort in seconds
  rest: number; // rest in seconds
  cycles: number; // number of repetitions
  instructions?: string;
}

export interface FitBlock {
  blockName: string;
  exercises: FitExercise[];
}

export interface FitFile {
  metadata: FitMetadata;
  blocks: FitBlock[];
}

export type StepPhase = "work" | "rest";

export interface TimelineStep {
  blockIndex: number;
  blockName: string;
  exerciseIndex: number;
  exerciseName: string;
  nextExerciseName: string | null;
  cycle: number;
  totalCycles: number;
  phase: StepPhase;
  duration: number;
}

export type WorkerOutMessage =
  | {
      type: "tick";
      remaining: number;
      step: TimelineStep;
      stepIndex: number;
      totalSteps: number;
      elapsedTotal: number;
      totalDuration: number;
    }
  | { type: "beep"; kind: "short" | "long" | "start" | "end" }
  | { type: "done" }
  | { type: "status"; running: boolean };

export type WorkerInMessage =
  | { type: "load"; payload: TimelineStep[] }
  | { type: "start" }
  | { type: "pause" }
  | { type: "skip" }
  | { type: "back" }
  | { type: "reset" };
