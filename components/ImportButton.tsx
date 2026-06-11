"use client";

import { useRef, useState } from "react";
import type { FitFile } from "@/types/fit";
import { validateFit } from "@/lib/validateFit";

interface Props {
  onLoad: (fit: FitFile) => void;
}

export default function ImportButton({ onLoad }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = validateFit(json);

      if (!result.valid || !result.fit) {
        setError(result.error ?? "Fichier .fit invalide.");
        return;
      }

      onLoad(result.fit);
    } catch {
      setError("Le fichier n'est pas un JSON valide.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept=".fit,.json,application/json"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="px-8 py-4 rounded-2xl bg-neutral-900 border-2 border-neutral-700
                   text-neutral-100 font-bold uppercase tracking-wider text-lg
                   hover:border-lime-400 hover:text-lime-400 active:scale-95
                   transition-all duration-150"
      >
        Charger un programme (.fit)
      </button>
      {error && (
        <p className="text-orange-500 text-sm font-semibold text-center max-w-md">
          {error}
        </p>
      )}
    </div>
  );
}
