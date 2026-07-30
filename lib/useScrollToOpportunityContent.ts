"use client";

import { useLayoutEffect } from "react";

/**
 * Forces the opportunity/candidate detail page open on the
 * #opportunity-content anchor, before the browser ever paints — see
 * "Force opportunity content into view". A plain scroll-to-top wasn't
 * enough on its own: `app/globals.css` sets `scroll-behavior: smooth` on
 * `<html>` globally, and `Element.scrollIntoView()`'s default ("auto")
 * behavior defers to that CSS rule, so it would still animate down from
 * wherever the browser happened to land instead of snapping straight to
 * the anchor. Overriding `scrollBehavior` to "auto" first makes every
 * scroll call below instant; restoring it afterward leaves smooth
 * scrolling intact for any later in-page interaction.
 *
 * `stillLoading` re-triggers the same reset once the real (taller) data
 * has replaced the short "Loading…" placeholder. Both detail pages fetch
 * their content after mount, so the very first run of this effect fires
 * against a near-empty page; once the fetch resolves and the full card
 * mounts, the browser can drift the scroll position away from the top
 * (e.g. focus handling inside the newly-mounted content), and a one-time,
 * pre-data mount effect has no way to correct for that.
 */
export function useScrollToOpportunityContent(stillLoading?: boolean) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const previousScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    document.getElementById("opportunity-content")?.scrollIntoView({ block: "start" });
    html.style.scrollBehavior = previousScrollBehavior;
  }, [stillLoading]);
}
