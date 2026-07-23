"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  defaultDirectionAnswers,
  loadDirectionAnswers,
  saveDirectionAnswers,
  type DirectionAnswers,
} from "@/lib/direction";

const listeners = new Set<() => void>();
let cachedAnswers: DirectionAnswers | null = null;

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): DirectionAnswers {
  if (cachedAnswers === null) {
    cachedAnswers = loadDirectionAnswers();
  }
  return cachedAnswers;
}

function getServerSnapshot(): DirectionAnswers {
  return defaultDirectionAnswers;
}

export function useDirectionAnswers() {
  const answers = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setAnswers = useCallback((next: DirectionAnswers) => {
    cachedAnswers = next;
    saveDirectionAnswers(next);
    listeners.forEach((listener) => listener());
  }, []);

  return { answers, setAnswers } as const;
}
