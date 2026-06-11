// components/ImportButton.tsx
"use client";

import { useRef } from "react";
import type { FitFile } from "@/types/fit";

interface Props {
  onLoad: (fit: FitFile) => void;
}

export default function ImportButton({ onLoad }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text) as FitFile;

      if (!json.metadata || !Array.isArray(json.blocks)) {
        throw new Error("Format .fit invalide");
      }

      onLoad(json);
    } catch (err) {
      alert("Erreur de chargement du fichier .fit : " + (err as Error).message);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".fit,application/json"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="px-6 py-3 rounded-xl bg-neutral-800 border border-neutral-700
                   text-neutral-100 font-semibold tracking-wide
                   hover:border-lime-400 hover:text-lime-400 transition-colors"
      >
        Charger un programme (.fit)
      </button>
    </>
  );
}
