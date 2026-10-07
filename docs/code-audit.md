# Code audit — 7 October 2026

Scope: the Next.js client application, its gradient, palette and typography studios, persistence, exports, input boundaries, keyboard access and build configuration. There are no application API routes or database/authentication services in this repository.

## Confirmed findings and fixes

| Severity | Finding and trigger | Correction / location |
| --- | --- | --- |
| High | Deleting H1, then opening Typography → Mockups → Marketing crashed the app. | Missing heading fallback in `src/components/TypographyPreviewArea.tsx`. |
| High | Malformed locally saved palette/typography data could crash galleries or load invalid values. | Validate unknown records at the storage boundary; migrate missing legacy fields in `src/lib/presetStorage.ts` and `validation.ts`. Gradient validation rejects invalid hex lengths and non-finite values, normalizes alpha, and repairs duplicate stop IDs. |
| Medium | Linear PNG endpoints were outside the image; conic exports were rotated; radial geometry differed from CSS; conic SVG silently became linear. | Shared rendering geometry in `src/lib/gradientUtils.ts`. Radial canvas transforms remain active through painting. Conic SVG embeds its rendered PNG because SVG has no native conic gradient paint server. |
| Medium | Noisy CSS contained unescaped quotes inside its data URL. HSB selection generated unsupported CSS functions. | Complete URI encoding; CSS format selector offers HEX/RGB/HSL. Radial CSS honors configured size. |
| Medium | Partial hex edits entered application state, producing invalid CSS and canvas export failures; embedded alpha was inconsistent. | Local input drafts and normalized committed colors in `ColorStopsList.tsx` and `GradientMaker.tsx`; alpha hex and stop opacity are combined. |
| Medium | Flipping nonuniform/hard-stop gradients changed their shape. | Reverse positions and stop order, including ties. |
| Medium | Bad image files left extraction loading indefinitely; outdated callbacks and drag listeners could outlive the studio. | Decode/read error handlers, upload size/type checks, extraction version checks, drag cancellation and unmount cleanup. |
| Medium | Toolbar palette export omitted Info colors. Clicking a Primary shade changed the base and made contrast inspection describe a different color. | Include Info export data; separate inspection from base-color selection in palette components. |
| Medium | Primary hex text stopped following changes after it was focused; RGB's middle input was labeled S. | Derive non-editing display values, clear focus on blur, label RGB correctly in `PaletteSidebar.tsx`. |
| Medium | Typography save/load replaced the original override baseline. Reset overrides also deleted custom styles and names. Storage write failures still changed the visible saved list. | Persist style definitions, reconstruct legacy defaults, reset only overrides, and update saved state after successful storage writes. |
| Medium | Numeric overrides allowed invalid dimensions; large generated styles could not enable overrides after validation was introduced. | Validate finite supported ranges at the state boundary, including large generated headings. |
| Medium | Quoted palette names broke exported JS; kebab-case React theme keys were unquoted; names could break generated comments. | Safe export identifiers/comments and quoted JS keys. Generated React themes are checked with TypeScript in strict mode. |
| Medium | Responsive settings were absent from exported web code. | Fluid CSS sizing and stepped web output for CSS variables, SCSS, Tailwind and React; type-safe responsive React hook. Native/token exports describe base metrics. |
| Medium | Rounding contrast before classification could turn 4.4992 into a false AA pass. The 3:1 category was incorrectly called A. | Preserve full precision for decisions, round only display, label 3:1 as AA Large. See [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). |
| Low | Preset cards, stop handles and typography override controls lacked keyboard operation. Dialogs lacked focus containment/restoration and consistent Escape handling. | Native controls/roles, accessible names, keyboard stop adjustment, and shared `src/hooks/useDialog.ts`. |
| Low | A palette color query could override an explicitly selected studio; URL updates dropped fragments. | Explicit studio precedence and preserved URL hash/history state. |
| Low | Artificial startup delay, duplicated initialization effects, unused imports/props, and loose `any` types obscured behavior. | Client hydration boundary, lazy initial state, derived field values, typed exports, and lint cleanup. |
| Low | A parent lockfile changed Next.js workspace discovery. Local production requested Vercel-only telemetry assets and got a 404. | Explicit Turbopack root and deployment-gated Speed Insights. |

## Structure

- Moved all 174 curated gradient presets, unchanged, to `src/lib/gradientPresets.ts`; rendering utilities fell from 5,332 to about 413 lines.
- Added focused modules for input/storage validation, preset migration, export text and downloads.
- Added a shared dialog hook and dependency-free test commands using Node's built-in runner and the existing TypeScript compiler.
- Kept pre-existing untracked studio images intact.

## Dependency follow-up

The subsequent npm audit fix request was checked against the npm registry on 7 October 2026. The starting dependency tree had Next.js 16.4.0 with `eslint-config-next` 14.2.35, which broke the flat ESLint configuration. Updated `eslint-config-next` to `^16.4.0` to match Next.js and ran the non-breaking `npm audit fix`, which updated `brace-expansion` from 1.1.15 to 1.1.21. The dependency manifest and lockfile contain these changes.

- `npm audit --omit=dev`: **0 vulnerabilities**.
- Full audit: **5 high-severity entries**, all from the development-only chain `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`.
- These entries represent one underlying [braces stack-exhaustion advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). The latest published `braces` is 3.0.3; the advisory lists no patched version.
- Do not apply the current `npm audit fix --force` recommendation: it downgrades `eslint-config-next` to 14.2.35, recreating the reproduced lint failure and reintroducing its vulnerable `glob` dependency. Keep the compatible version and revisit when upstream publishes a fix. Audit warnings have not been suppressed.
- The affected glob call in Next.js's lint plugin processes the ESLint `settings.next.rootDir` option. This project does not set that option; production dependencies do not include this chain.
- After dependency repair, lint, TypeScript, all 22 tests, and the Next.js 16.4.0 production build pass. The earlier browser checks below were performed before this dependency follow-up.

## Verification

- `npm run lint`: no errors or warnings.
- `npm run typecheck`: passes.
- `npm test`: 22 tests, including generated React theme semantic compilation in all responsive modes.
- `npm run build`: production build succeeds.
- Production browser checks: gradient partial/invalid hex, explicit alpha, keyboard movement, save/delete and Escape, actual radial/noisy downloads, CSS data-URL validity; palette inspect/randomize/save/load/delete and Info export; dialog focus trap; typography numeric validation, custom-style-preserving reset, override restoration, missing-H1 Marketing preview, and export dismissal.
- Storage corruption tested in all studios; explicit studio URL precedence, 390px viewport overflow checks, and broken-image loading recovery passed without uncaught page errors.
- Downloaded radial PNG verified at 1920×1080: center `(255, 0, 0, 255)`, corner `(3, 19, 43, 255)`, matching the test gradient.

## Limits

- The development-only dependency advisory above remains pending an upstream compatible fix.
- Browser validation used Chromium. Safari/Firefox and native Swift/Dart/Android compilation were not run. No claim is made that every possible bug or security issue has been eliminated.
- Development Turbopack encountered stale manifests in this session. After moving the generated development cache aside, the normal local preview restarted and returned HTTP 200. Production browser verification used the built app.
- Conic SVG output contains an embedded raster image. CSS remains resolution-independent; linear/radial SVG gradients remain vector.

Rendering references: [CSS gradient geometry](https://www.w3.org/TR/css-images-3/), [Canvas rendering semantics](https://html.spec.whatwg.org/multipage/canvas.html).
