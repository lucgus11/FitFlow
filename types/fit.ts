// types/fit.ts

export type DifficultyLevel = "débutant" | "intermédiaire" | "avancé";

export interface FitMetadata {
  name: string;            // ex: "Full Body HIIT"
  description: string;
  totalDuration: number;   // durée totale estimée, en secondes
  level: DifficultyLevel;
  author: string;
  version?: string;        // ex: "1.0"
  createdAt?: string;       // ISO date
}

export interface FitExercise {
  name: string;            // ex: "Burpees"
  duration: number;        // temps d'effort, en secondes
  rest: number;            // temps de repos après l'exercice, en secondes
  cycles: number;          // nombre de répétitions de l'exercice/circuit
  instructions?: string;   // consigne courte optionnelle
}

export interface FitBlock {
  blockName: string;       // ex: "Échauffement", "Corps de séance", "Récupération"
  exercises: FitExercise[];
}

export interface FitFile {
  metadata: FitMetadata;
  blocks: FitBlock[];
}
