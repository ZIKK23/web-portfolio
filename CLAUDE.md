# CLAUDE.md

Web portfolio for **Hilmi Zikri** ("Zikri"). Next.js 16 (App Router) + TypeScript, migrated from a static HTML/CSS/JS site.

## Stack
- Next.js 16, React 19, TypeScript
- Hand-written CSS (no Tailwind/CSS Modules) site-wide, imported once via `styles/main.css` in `app/layout.tsx`
- EmailJS (CDN script, no npm dep) for contact form

## Commands
- `npm run dev` — dev server
- `npm run build` — production build (also type-checks)
- `npm run lint` — eslint

## Structure
- `app/` — routes: `/` (landing), `/projects`, `/about`, `/contact`. Each `page.tsx` just renders a component from `components/`.
- `components/` — one folder per page (`Landing/` — `HeroIntro.tsx`, `RolePicker.tsx`, see below; `Projects/`, `About/`, `Contact/`) plus shared `Nav.tsx`, `Footer.tsx`; `components/animations/<source-name>/` for ported GitHub animation effects (currently empty — see Goal/roadmap).
- `lib/` — typed data for pages, added as needed (currently empty).
- `styles/` — `main.css` chains `@import`s: tokens → base → typography → components/* → pages/* → utilities/* → responsive.
- `public/Assets/` — images. `public/CNAME` — GitHub Pages custom domain.

### Landing page (`/`) — 2 stacked sections + Footer
`app/page.tsx` renders `<main><HeroIntro/><RolePicker/></main><Footer/>`. Each section is a normal `min-height: 100dvh` flex-centered block in `styles/pages/landing.css` — earlier attempts used `position: fixed`/`vh`-math overlays (a leftover from the original static site) and that caused everything to visually collide once real content existed below the hero; don't reintroduce fixed/vh positioning here.
- `HeroIntro.tsx` — Section 1, name reveal: typewriter "Hi! I'm" + big `<h1>ZIKRI</h1>` reveal, `no-scroll` body-lock until the reveal transition finishes. Root carries `className="landing"` deliberately — `styles/utilities/animations.css` keys off `.landing`'s presence to suppress the generic page-fade-in on the home page.
- `RolePicker.tsx` — Section 2, drag-and-drop role picker ("Hi! I'm a [Drop Here]" + draggable "Full-Stack Dev" pill). Dropping the pill adds `body.fade-out` (0.5s opacity transition, `styles/base.css`) then hard-navigates to `/projects` via `window.location.href` (was `/projects#programming-page` — that anchor was a leftover from the deleted accordion Projects page and never existed in any later version of `/projects`; fragment dropped). **This fade-to-blank-then-navigate is intentional, not a bug** — confirmed by driving a real Chromium instance with Playwright (see Important context) end-to-end: the drop lands correctly and the redirect fires with zero console errors. It reads as "the page froze" to a first-time user because the whole page goes blank for 0.5s right before the URL changes — if this UX gets reported as broken again, it's this transition, not the drag/drop logic. Near-verbatim port of the original vanilla drag/drop handlers, just scoped to this component's own root instead of the old shared-fixed-overlay version.
- `HeroIntro.tsx`'s mount effect adds `document.body.classList.add('no-scroll')` during the reveal animation, removed once a `transitionend` fires. Since `<Nav/>` is always mounted independent of the current page, a nav click can unmount `HeroIntro` mid-animation — the effect cleanup unconditionally removes `no-scroll` and cancels pending timeouts/listeners (a `cancelled` flag) specifically to prevent that class getting stuck on `<body>` forever (which freezes scroll site-wide until reload). Any future component doing a similar "lock scroll until an animation finishes" pattern needs the same unconditional-cleanup treatment.

## Important context
- **Projects page cards removed (2026-07-16), starting over.** The GSAP 3D sticky-cards effect (`components/animations/3d-sticky-cards/StickyCards.tsx`), its stylesheet (`styles/components/sticky-cards.css`), and its placeholder data (`lib/projects.ts`) are all deleted, along with the now-unused `gsap` dependency — explicit user ask to restart the cards from scratch rather than iterate on the sticky-cards version. `/projects` currently renders only the page header (`components/Projects/ProjectsPage.tsx`), no card content at all. Next card treatment is undecided — don't assume sticky-cards/GSAP is the direction unless asked.
- **`/3d-preview` route deleted (2026-07-16).** It was a full standalone 3D portfolio (Txema Albero's `3d-portfolio-main`) ported in to preview before deciding what to keep. Its one keeper piece, `FrozenKeyboard.tsx` (a 3D keyboard built with react-three-fiber/drei/three/simple-icons), was folded into the landing page as a third "Tech Stack" section, then later fully removed too (2026-07-16, same day, different ask — the user wanted the landing page back to just Hero + RolePicker). `FrozenKeyboard.tsx`, `LanguageProvider.tsx`, `SeasonProvider.tsx`, `lib/threeDPortfolio/*`, the react-three-fiber/drei/three/simple-icons deps, and `public/3d-portfolio/` (sounds + fonts) are all gone now — nothing in the repo renders 3D anymore. Everything else from the original `/3d-preview` port — `ThreeDPortfolioPage.tsx`, `ProjectModal.tsx`, `Carousel.tsx`, `CopyEmail.tsx`, `CustomCursor.tsx`, `FrozenBackground.tsx`, `LanguagePicker.tsx`, `MagneticTargets.tsx`, `Reveal.tsx`, `ScrollProgress.tsx`, `SeasonPicker.tsx`, `SectionNav.tsx`, `smooth-scroll.tsx`, the `app/3d-preview/` route itself, `postcss.config.mjs`/Tailwind v4/`lenis` deps, and the `public/3d-portfolio/projects/`+`cv*.pdf` assets — was already gone before that. `components/Nav.tsx`'s `pathname.startsWith('/3d-preview')` early-return was removed too (dead check, no route to guard against anymore). Re-porting any of it (3D keyboard, seasonal themes, ES/EN i18n picker, project modal, etc.) would mean redoing the port from scratch — there's no git history to recover it from beyond this repo's own commits.
- **Git repo, but young history.** `git log`/`blame` work, but the pre-migration static site predates this repo's commits — for that, see the `portfolio-refactor-modular-css/` reference folder below.
- **`portfolio-refactor-modular-css/` (untracked, user-added 2026-07-16).** A copy of the original pre-Next.js static site (`index.html`, `landing-page.js`, `styles/`, etc.) — reference material for restoring/comparing original behavior, not part of the app. Not imported or built by anything in `app/`/`components/`.
- **No chrome-devtools MCP configured.** For live browser verification (e.g. reproducing a drag-and-drop or interaction bug), `npm install playwright` in a scratch temp dir (not this project's `package.json`) and drive `http://localhost:3000` with a throwaway Node script — faster than guessing from source reading alone, and doesn't pollute the project's dependencies.
- The legacy static-site files (`index.html`, `about.js`, `style.css`, `contact.html/js`, `projects.html/js`, `gallery.js`, `hamburger-menu.js`, `landing-page.js`, `lighting-presets.js`, `page-effects.js`, `viewer3d.js`), the `3d-portfolio-main/` reference source folder, and duplicate root-level `Assets/`/`CNAME` (byte-identical copies of `public/Assets/`/`public/CNAME` — Next.js only serves from `public/`) have all been deleted (explicit user ask) — everything needed was already copied into `app/`/`components/`/`lib/`/`styles/`/`public/` before removal.
- Pages are `'use client'` components porting original vanilla-JS behavior near-verbatim inside `useEffect` (drag-and-drop, SVG path draw) — intentional to preserve exact original UX, not accidental complexity.
- Deploy/CI intentionally not set up yet (deferred by user during initial scaffold).

## Known open items (placeholder content not yet swapped to real)
- `public/CNAME` still `dylanchen.me` — needs user's real domain.
- EmailJS service/template/key in `components/Contact/ContactPage.tsx` still point to original owner's account.
- Resume download button removed from About page (2026-07-16) — the linked PDFs (`public/Assets/DylanChenResume.pdf` + `Dylan Chen Resume - 9_8_25.pdf`) were the original owner's real resume (third-party PII), deleted before pushing the repo public. `components/About/AboutPage.tsx` has a comment marking where to add Zikri's own resume and restore the link.
- About page bio content (university, work history, etc.) is still the original owner's real biography — only the *name* was swapped to Zikri, bio text itself was never asked to be rewritten.
- Projects page has no card content at all (see Important context) — needs a new card treatment built from scratch, then populated with Zikri's real projects (titles, descriptions, repo links).

## Goal / roadmap
Base scaffold + migration is done. Landing page narrowed to a single "Full-Stack Dev" role; Projects page's old 4-category accordion (Engineering/Design/Photography/Programming, plus the GLB model viewer and photo gallery it depended on) was replaced with a GSAP 3D sticky-cards effect, which was itself later removed (see Important context) — the user wants to restart the Projects page's card treatment from scratch. Next: design and build a new card treatment for `/projects`, populate it with Zikri's real projects, and continue porting eye-catching animations from GitHub repos into `components/animations/<source-name>/` as they come up.

The `/3d-preview` full-portfolio preview (see Important context) has served its purpose and is fully gone, including its one-time keeper (the 3D keyboard) — the landing page is back to just Hero + RolePicker. Seasonal themes / bilingual ES/EN i18n / a 3D tech-stack visual are no longer staged from that source and would need a fresh port from scratch if picked back up.

## Working style
- Ponytail/lazy-code style: no speculative abstractions, reuse what's already here, shortest correct diff.
- User prefers giving personal info (email, socials, etc.) conversationally one at a time in chat rather than via batched question prompts.
