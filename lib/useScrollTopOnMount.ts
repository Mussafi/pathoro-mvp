"use client";

import { useLayoutEffect } from "react";

/**
 * Forces the page to the very top on mount, before the browser ever
 * paints — see "Fix opportunity page scroll landing". `app/globals.css`
 * sets `scroll-behavior: smooth` on `<html>` globally; `window.scrollTo`
 * only ignores that when given the *non-standard* `behavior: "instant"`
 * value, which isn't guaranteed everywhere. If it's not honored, a plain
 * `useEffect`-based reset animates from wherever the browser happened to
 * land toward 0 — and if a layout shift (e.g. data finishing a fetch)
 * lands mid-animation, the user is stranded part-way down the page,
 * looking at a blank stretch above the real content. Setting `scrollTop`
 * directly is a synchronous property write, not a "scrolling operation",
 * so it's never subject to CSS scroll-behavior at all; running it in
 * `useLayoutEffect` (not `useEffect`) means it happens before the
 * browser's first paint of this component, so there's nothing to
 * animate away from in the first place.
 */
export function useScrollTopOnMount() {
  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);
}
