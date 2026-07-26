const STORAGE_KEY = "pathoro.latestScoutRequest.v1";

/** Saved right after a successful "Request scout" so route-planning can
 * surface that request's AI-found candidates without re-requesting. */
export type LatestScoutRequest = {
  id: string;
  token: string;
  resultUrl: string;
  city: string;
  state: string;
  routeId: string;
  pathGoal: string;
};

export function saveLatestScoutRequest(request: LatestScoutRequest) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(request));
}

export function loadLatestScoutRequest(): LatestScoutRequest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LatestScoutRequest;
  } catch {
    return null;
  }
}
