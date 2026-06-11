import type { FitFile } from "@/types/fit";

const LEVELS = ["débutant", "intermédiaire", "avancé"];

export function validateFit(data: unknown): { valid: boolean; error?: string; fit?: FitFile } {
  if (typeof data !== "object" || data === null) {
    return { valid: false, error: "Le fichier ne contient pas un objet JSON valide." };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.metadata !== "object" || obj.metadata === null) {
    return { valid: false, error: "Le champ 'metadata' est manquant ou invalide." };
  }

  const meta = obj.metadata as Record<string, unknown>;

  if (typeof meta.name !== "string" || meta.name.trim() === "") {
    return { valid: false, error: "metadata.name doit être une chaîne non vide." };
  }
  if (typeof meta.description !== "string") {
    return { valid: false, error: "metadata.description doit être une chaîne." };
  }
  if (typeof meta.totalDuration !== "number" || meta.totalDuration <= 0) {
    return { valid: false, error: "metadata.totalDuration doit être un nombre positif (secondes)." };
  }
  if (typeof meta.level !== "string" || !LEVELS.includes(meta.level)) {
    return { valid: false, error: `metadata.level doit être l'une des valeurs : ${LEVELS.join(", ")}.` };
  }
  if (typeof meta.author !== "string") {
    return { valid: false, error: "metadata.author doit être une chaîne." };
  }

  if (!Array.isArray(obj.blocks) || obj.blocks.length === 0) {
    return { valid: false, error: "Le champ 'blocks' doit être un tableau non vide." };
  }

  for (let bi = 0; bi < obj.blocks.length; bi++) {
    const block = obj.blocks[bi] as Record<string, unknown>;
    if (typeof block.blockName !== "string" || block.blockName.trim() === "") {
      return { valid: false, error: `blocks[${bi}].blockName est invalide.` };
    }
    if (!Array.isArray(block.exercises) || block.exercises.length === 0) {
      return { valid: false, error: `blocks[${bi}].exercises doit être un tableau non vide.` };
    }
    for (let ei = 0; ei < block.exercises.length; ei++) {
      const exo = block.exercises[ei] as Record<string, unknown>;
      if (typeof exo.name !== "string" || exo.name.trim() === "") {
        return { valid: false, error: `blocks[${bi}].exercises[${ei}].name est invalide.` };
      }
      if (typeof exo.duration !== "number" || exo.duration < 0) {
        return { valid: false, error: `blocks[${bi}].exercises[${ei}].duration doit être un nombre >= 0.` };
      }
      if (typeof exo.rest !== "number" || exo.rest < 0) {
        return { valid: false, error: `blocks[${bi}].exercises[${ei}].rest doit être un nombre >= 0.` };
      }
      if (typeof exo.cycles !== "number" || exo.cycles < 1 || !Number.isInteger(exo.cycles)) {
        return { valid: false, error: `blocks[${bi}].exercises[${ei}].cycles doit être un entier >= 1.` };
      }
      if (exo.duration === 0 && exo.rest === 0) {
        return { valid: false, error: `blocks[${bi}].exercises[${ei}] : duration et rest ne peuvent pas être tous les deux à 0.` };
      }
    }
  }

  return { valid: true, fit: obj as unknown as FitFile };
}
