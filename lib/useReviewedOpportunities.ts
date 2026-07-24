"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearReviewedOpportunities,
  loadReviewedOpportunities,
  saveReviewedOpportunity,
} from "@/lib/reviewedOpportunities";
import type { Opportunity } from "@/lib/opportunitySchema";

const EMPTY_REVIEWED: Opportunity[] = [];
const listeners = new Set<() => void>();
let cachedReviewed: Opportunity[] | null = null;

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Opportunity[] {
  if (cachedReviewed === null) {
    cachedReviewed = loadReviewedOpportunities();
  }
  return cachedReviewed;
}

function getServerSnapshot(): Opportunity[] {
  return EMPTY_REVIEWED;
}

export function useReviewedOpportunities() {
  const reviewed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const approve = useCallback((opportunity: Opportunity) => {
    cachedReviewed = saveReviewedOpportunity(opportunity);
    listeners.forEach((listener) => listener());
  }, []);

  const clear = useCallback(() => {
    cachedReviewed = clearReviewedOpportunities();
    listeners.forEach((listener) => listener());
  }, []);

  return { reviewed, approve, clear } as const;
}
