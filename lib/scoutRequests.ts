/**
 * A public "scout this path" request — alpha-safe, local-only. This does
 * not trigger Tavily or any AI search; it just records that a user wanted
 * more than what Pathoro currently has for their route/city, so an admin
 * can prioritize it manually later. No accounts, no server persistence.
 */
export type ScoutRequest = {
  id: string;
  routeId: string;
  pathGoal: string;
  city: string;
  createdAt: string;
};

const STORAGE_KEY = "pathoro.scoutRequests.v1";

export function loadScoutRequests(): ScoutRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScoutRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScoutRequest(request: ScoutRequest): ScoutRequest[] {
  const current = loadScoutRequests();
  const next = [...current, request];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function createScoutRequestId(): string {
  return `scout-req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
