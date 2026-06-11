"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.error("Échec de l'enregistrement du Service Worker :", err);
        });
      });
    }
  }, []);

  return null;
}
