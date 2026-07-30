/**
 * Regression guard for opportunity-page scroll landing — covers both
 * "Fix opportunity page scroll landing" and the follow-up "Force
 * opportunity content into view". Run with:
 *
 *   npx tsx scripts/verify-opportunity-page-scroll-reset.ts
 *
 * Scope note: there's no headless browser in this project (same
 * constraint documented in verify-route-planning-actions.ts), so this
 * can't literally render a page and check DOM order top-to-bottom. What
 * it guards against instead is regressing the concrete causes this bug
 * actually had:
 *
 *   1. The #opportunity-content anchor or the scroll-into-view-on-mount
 *      hook being removed from either detail page.
 *   2. A Link into either detail page dropping the #opportunity-content
 *      fragment, so a soft navigation lands without the anchor to
 *      scroll to in the first place.
 *   3. The vertical-centering / huge-top-padding pattern the original
 *      bug report hypothesized (min-h-screen + items-center, or a large
 *      pt-/py-/mt- spacer) creeping into either page's outer container.
 *
 * Exits non-zero (and prints every failure) so this can run in CI.
 */
import { readFileSync } from "fs";
import { join } from "path";

const PAGES = [
  "app/opportunity/[id]/page.tsx",
  "app/opportunity/candidate/[id]/page.tsx",
];

// Every known non-admin link into an opportunity/candidate detail page —
// each must carry the #opportunity-content fragment so a soft navigation
// always has the anchor to land on.
const LINK_SITES = [
  "components/route/BestNextRouteCard.tsx",
  "components/route/OpportunityTile.tsx",
  "components/opportunity/OpportunityDetailCard.tsx",
  "components/trailmap/MapConfidenceNotice.tsx",
];

const BAD_CONTAINER_PATTERN = /min-h-screen[^"]*\bitems-center\b|\bitems-center\b[^"]*min-h-screen/;
const BAD_SPACING_PATTERN = /\b(?:pt|py|mt)-(?:2[4-9]|[3-9]\d)\b/; // pt-24+ / py-24+ / mt-24+
const OPPORTUNITY_HREF_PATTERN = /href=\{`(?:\$\{detailHref\}|\/opportunity\/(?:candidate\/)?\$\{[^}]+\}|\/opportunity\/\$\{[^}]+\})[^`]*`\}/g;

let failed = false;

for (const relPath of PAGES) {
  const source = readFileSync(join(process.cwd(), relPath), "utf8");

  if (!source.includes("useScrollToOpportunityContent")) {
    console.error(`FAIL  ${relPath}  does not call useScrollToOpportunityContent() — scroll-into-view reset is missing`);
    failed = true;
  } else {
    console.log(`OK    ${relPath}  calls useScrollToOpportunityContent()`);
  }

  if (!source.includes('id="opportunity-content"')) {
    console.error(`FAIL  ${relPath}  is missing the <div id="opportunity-content" /> anchor`);
    failed = true;
  } else {
    console.log(`OK    ${relPath}  has the #opportunity-content anchor`);
  }

  if (BAD_CONTAINER_PATTERN.test(source)) {
    console.error(`FAIL  ${relPath}  outer container combines min-h-screen with items-center (vertical centering)`);
    failed = true;
  } else {
    console.log(`OK    ${relPath}  no min-h-screen + items-center centering pattern`);
  }

  if (BAD_SPACING_PATTERN.test(source)) {
    console.error(`FAIL  ${relPath}  contains a large pt-/py-/mt- spacer (24+) that could push content below the fold`);
    failed = true;
  } else {
    console.log(`OK    ${relPath}  no oversized top spacing utility classes`);
  }
}

for (const relPath of LINK_SITES) {
  const source = readFileSync(join(process.cwd(), relPath), "utf8");
  const matches = source.match(OPPORTUNITY_HREF_PATTERN) ?? [];

  if (matches.length === 0) {
    console.error(`FAIL  ${relPath}  no opportunity/candidate hrefs found to check (did the link get removed or restructured?)`);
    failed = true;
    continue;
  }

  const missingAnchor = matches.filter((m) => !m.includes("#opportunity-content"));
  if (missingAnchor.length > 0) {
    console.error(`FAIL  ${relPath}  ${missingAnchor.length} opportunity href(s) missing #opportunity-content: ${missingAnchor.join(", ")}`);
    failed = true;
  } else {
    console.log(`OK    ${relPath}  all ${matches.length} opportunity href(s) carry #opportunity-content`);
  }
}

if (failed) {
  console.error("\nFAILED — an opportunity page may land scrolled or with a blank top area again.");
  process.exit(1);
} else {
  console.log("\nAll opportunity page scroll-landing checks passed.");
}
