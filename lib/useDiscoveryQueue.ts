"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearDiscoveryQueue,
  deleteDiscoveryEntry,
  loadDiscoveryQueue,
  saveDiscoveryEntry,
} from "@/lib/discoveryQueue";
import type { DiscoveryEntry } from "@/lib/discoveryQueue";

const EMPTY_QUEUE: DiscoveryEntry[] = [];
const listeners = new Set<() => void>();
let cachedQueue: DiscoveryEntry[] | null = null;

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): DiscoveryEntry[] {
  if (cachedQueue === null) {
    cachedQueue = loadDiscoveryQueue();
  }
  return cachedQueue;
}

function getServerSnapshot(): DiscoveryEntry[] {
  return EMPTY_QUEUE;
}

export function useDiscoveryQueue() {
  const entries = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const save = useCallback((entry: DiscoveryEntry) => {
    cachedQueue = saveDiscoveryEntry(entry);
    listeners.forEach((listener) => listener());
  }, []);

  const remove = useCallback((id: string) => {
    cachedQueue = deleteDiscoveryEntry(id);
    listeners.forEach((listener) => listener());
  }, []);

  const clear = useCallback(() => {
    cachedQueue = clearDiscoveryQueue();
    listeners.forEach((listener) => listener());
  }, []);

  return { entries, save, remove, clear } as const;
}
