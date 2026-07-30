/**
 * Regression guard for "Fix opportunity page scroll landing" — run with:
 *
 *   npx tsx scripts/verify-opportunity-page-scroll-reset.ts
 *
 * Scope note: there's no headless browser in this project (same
 * constraint documented in verify-route-planning-actions.ts), so this
 * can't literally render a page and check DOM order top-to-bottom. What
 * it guards against instead is regressing the two concrete causes this
 * bug actually had:
 *
 *   1. The scroll-to-top call being removed, downgraded back to a plain
 *      useEffect, or reintroduced with the non-standard "instant"
 *      behavior value that isn't reliably honored against
 *      app/globals.css's global `scroll-behavior: smooth`.
 *   2. The vertical-centering / huge-top-padding pattern the bug report
 *      hypothesized (min-h-screen + items-center, or a large pt-/py-
 *      spacer) creeping into either page's outer container.
 *
 * Exits non-zero (and prints every failure) so this can run in CI.
 */
import { readFileSync } from "fs";
import { join } from "path";

const PAGES = [
  "app/opportunity/[id]/page.tsx",
  "app/opportunity/candidate/[id]/page.tsx",
];

const BAD_CONTAINER_PATTERN = /min-h-screen[^"]*\bitems-center\b|\bitems-center\b[^"]*min-h-screen/;
const BAD_SPACING_PATTERN = /\b(?:pt|py|mt)-(?:2[4-9]|[3-9]\d)\b/; // pt-24+ / py-24+ / mt-24+

let failed = false;

for (const relPath of PAGES) {
  const source = readFileSync(join(process.cwd(), relPath), "utf8");

  if (!source.includes("useScrollTopOnMount")) {
    console.error(`FAIL  ${relPath}  does not call useScrollTopOnMount() — scroll-to-top reset is missing`);
    failed = true;
  } else {
    console.log(`OK    ${relPath}  calls useScrollTopOnMount()`);
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

if (failed) {
  console.error("\nFAILED — an opportunity page may land scrolled or with a blank top area again.");
  process.exit(1);
} else {
  console.log("\nAll opportunity page scroll-landing checks passed.");
}
