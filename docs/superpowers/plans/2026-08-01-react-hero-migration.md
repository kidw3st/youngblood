# YOUNGBLOOD React Hero Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage hero of the YOUNGBLOOD static site with a React + TypeScript + Vite hero that ports the boomerang-video / liquid-glass / fade-up mechanics from the reference spec, recolored into YOUNGBLOOD's black/yellow graffiti identity, deployed via GitHub Actions alongside the four untouched static pages.

**Architecture:** A standalone Vite React-TS project lives in `app/` and builds to `app/dist/`. A GitHub Actions workflow builds `app/` and publishes `app/dist/*` together with the existing untouched `about.html`, `artists.html`, `booking.html`, `location.html`, `404.html`, `assets/`, `.nojekyll` as a single GitHub Pages artifact — so `/` is the new React hero and every other URL is unchanged.

**Tech Stack:** React 18, TypeScript, Vite 6, Tailwind CSS 3, lucide-react, Vitest (for pure-logic unit tests).

**Spec references:**
- Design: `docs/superpowers/specs/2026-08-01-react-hero-migration-design.md`

## Global Constraints

- No UI library other than `lucide-react` for icons (per user's original reference spec).
- Accent color is `#FFD600` everywhere the reference spec used `blue-700`.
- Fonts: `Anton` for the display headline (`--font-display` equivalent), `Rubik Wet Paint` for the wordmark/logo, `Inter` for body text — loaded via a Google Fonts `<link>` in `app/index.html`. The reference spec's `Helvetica Regular` CDN font is **not** used.
- `.liquid-glass` and `.animate-fade-up` CSS must be ported verbatim from the reference spec, including `animation-fill-mode: backwards` (never `both`/`forwards` — it breaks `backdrop-filter` on child `.liquid-glass` elements once the animation ends).
- `BoomerangVideoBg` container: `absolute inset-0 z-0 scale-[1.08] origin-center overflow-hidden`.
- Scope is the homepage hero only. Do not modify `about.html`, `artists.html`, `booking.html`, `location.html`, `404.html`, or `assets/`.
- Switching the GitHub Pages source setting to "GitHub Actions" requires explicit user confirmation before it is done (Task 11) — do not do it silently as part of adding the workflow file.

---

## File Structure

```
app/
  package.json
  vite.config.ts
  tsconfig.json
  tsconfig.node.json
  tailwind.config.js
  postcss.config.js
  index.html
  public/
    favicon.svg
    hero-loop.mp4          (added in Task 9)
  src/
    main.tsx
    App.tsx
    index.css
    components/
      BoomerangVideoBg.tsx
      Header.tsx
      Hero.tsx
      NowPlayingWidget.tsx
    lib/
      pingPong.ts
      formatTime.ts
      demoBeat.ts
    lib/__tests__/
      pingPong.test.ts
      formatTime.test.ts
      demoBeat.test.ts
.github/workflows/deploy.yml
```

---

### Task 1: Scaffold the Vite + React + TS + Tailwind + Vitest project

**Files:**
- Create: `app/package.json`
- Create: `app/vite.config.ts`
- Create: `app/tsconfig.json`
- Create: `app/tsconfig.node.json`
- Create: `app/tailwind.config.js`
- Create: `app/postcss.config.js`
- Create: `app/index.html`
- Create: `app/src/main.tsx`
- Create: `app/src/App.tsx`
- Create: `app/src/index.css`
- Create: `app/public/favicon.svg` (copy of `assets/images/favicon.svg`)

**Interfaces:**
- Produces: `App` component (default export from `app/src/App.tsx`, currently a placeholder) that later tasks fill in.
- Produces: Tailwind theme tokens `accent` (`#FFD600`), `fontFamily.display` (`Anton`), `fontFamily.brush` (`Rubik Wet Paint`), `fontFamily.sans` (`Inter`) — later tasks use these as `bg-accent`, `text-accent`, `fill-accent`, `font-display`, `font-brush`.

- [ ] **Step 1: Create `app/package.json`**

```json
{
  "name": "youngblood-hero",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "lucide-react": "^0.469.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "vite": "^6.0.5",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `app/vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    assetsDir: 'app-assets',
  },
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 3: Create `app/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `app/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create `app/tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#FFD600',
      },
      fontFamily: {
        display: ['Anton', 'Arial Narrow', 'sans-serif'],
        brush: ["'Rubik Wet Paint'", 'cursive'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 6: Create `app/postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Create `app/index.html`**

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>YOUNGBLOOD — Студия звукозаписи в Москве</title>
    <meta
      name="description"
      content="YOUNGBLOOD Recording Studio — профессиональная запись, сведение, продакшн и релиз треков в самом центре Москвы. Твой звук. Твои правила."
    />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Anton&family=Rubik+Wet+Paint&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
    />
  </head>
  <body class="bg-black">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `app/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.liquid-glass {
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0.15) 20%,
    rgba(255, 255, 255, 0) 40%,
    rgba(255, 255, 255, 0) 60%,
    rgba(255, 255, 255, 0.15) 80%,
    rgba(255, 255, 255, 0.45) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.animate-fade-up {
  animation: fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
.delay-1 {
  animation-delay: 0.1s;
}
.delay-2 {
  animation-delay: 0.25s;
}
.delay-3 {
  animation-delay: 0.4s;
}
.delay-4 {
  animation-delay: 0.55s;
}
.delay-5 {
  animation-delay: 0.75s;
}
@media (prefers-reduced-motion: reduce) {
  .animate-fade-up {
    animation: none;
  }
}
```

- [ ] **Step 9: Create `app/src/App.tsx` (placeholder, filled in by later tasks)**

```tsx
export function App() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <p className="p-6 text-white">YOUNGBLOOD hero — under construction</p>
    </div>
  );
}
```

- [ ] **Step 10: Create `app/src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 11: Copy the favicon**

```bash
mkdir -p app/public
cp assets/images/favicon.svg app/public/favicon.svg
```

- [ ] **Step 12: Install dependencies**

Run: `cd app && npm install`
Expected: installs without errors, creates `app/node_modules` and `app/package-lock.json`.

- [ ] **Step 13: Verify the dev server boots**

Run: `cd app && npm run dev -- --port 5173` (start in background, or run and then Ctrl-C once confirmed)
Expected: Vite prints a `Local: http://localhost:5173/` URL; fetching it returns the placeholder page with "YOUNGBLOOD hero — under construction" in white text on black.

- [ ] **Step 14: Commit**

```bash
git add app/package.json app/vite.config.ts app/tsconfig.json app/tsconfig.node.json app/tailwind.config.js app/postcss.config.js app/index.html app/src/main.tsx app/src/App.tsx app/src/index.css app/public/favicon.svg app/package-lock.json
git commit -m "Scaffold Vite React-TS hero project in app/"
```

---

### Task 2: Pure helper functions — ping-pong index, time formatting, beat step classifier

**Files:**
- Create: `app/src/lib/pingPong.ts`
- Test: `app/src/lib/__tests__/pingPong.test.ts`
- Create: `app/src/lib/formatTime.ts`
- Test: `app/src/lib/__tests__/formatTime.test.ts`
- Create: `app/src/lib/demoBeat.ts` (pure `classifyStep` part only in this task; audio I/O added in Task 6)
- Test: `app/src/lib/__tests__/demoBeat.test.ts`

**Interfaces:**
- Produces: `pingPongIndex(step: number, length: number): number` — used by `BoomerangVideoBg` (Task 3).
- Produces: `formatTime(totalSeconds: number): string` — used by `NowPlayingWidget` (Task 7).
- Produces: `classifyStep(step: number): { isKick: boolean; isHat: boolean }` — used by `demoBeat.ts` (Task 6).

- [ ] **Step 1: Write the failing tests for `pingPongIndex`**

Create `app/src/lib/__tests__/pingPong.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { pingPongIndex } from '../pingPong';

describe('pingPongIndex', () => {
  it('counts forward from 0 to length-1', () => {
    expect(pingPongIndex(0, 4)).toBe(0);
    expect(pingPongIndex(1, 4)).toBe(1);
    expect(pingPongIndex(2, 4)).toBe(2);
    expect(pingPongIndex(3, 4)).toBe(3);
  });

  it('counts backward from length-1 to 0', () => {
    expect(pingPongIndex(4, 4)).toBe(2);
    expect(pingPongIndex(5, 4)).toBe(1);
    expect(pingPongIndex(6, 4)).toBe(0);
  });

  it('repeats the cycle', () => {
    expect(pingPongIndex(7, 4)).toBe(1);
    expect(pingPongIndex(8, 4)).toBe(2);
  });

  it('returns 0 for a single-frame sequence', () => {
    expect(pingPongIndex(0, 1)).toBe(0);
    expect(pingPongIndex(5, 1)).toBe(0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd app && npx vitest run src/lib/__tests__/pingPong.test.ts`
Expected: FAIL — `Cannot find module '../pingPong'`.

- [ ] **Step 3: Implement `pingPongIndex`**

Create `app/src/lib/pingPong.ts`:

```ts
export function pingPongIndex(step: number, length: number): number {
  if (length <= 1) return 0;
  const cycle = 2 * (length - 1);
  const pos = step % cycle;
  return pos < length ? pos : cycle - pos;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd app && npx vitest run src/lib/__tests__/pingPong.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Write the failing tests for `formatTime`**

Create `app/src/lib/__tests__/formatTime.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatTime } from '../formatTime';

describe('formatTime', () => {
  it('formats whole minutes and seconds', () => {
    expect(formatTime(33)).toBe('0:33');
    expect(formatTime(90)).toBe('1:30');
  });

  it('pads seconds under 10', () => {
    expect(formatTime(65)).toBe('1:05');
  });

  it('prefixes negative values with a minus sign', () => {
    expect(formatTime(-81)).toBe('-1:21');
  });

  it('rounds fractional seconds', () => {
    expect(formatTime(33.6)).toBe('0:34');
  });
});
```

- [ ] **Step 6: Run the tests to verify they fail**

Run: `cd app && npx vitest run src/lib/__tests__/formatTime.test.ts`
Expected: FAIL — `Cannot find module '../formatTime'`.

- [ ] **Step 7: Implement `formatTime`**

Create `app/src/lib/formatTime.ts`:

```ts
export function formatTime(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? '-' : '';
  const abs = Math.abs(Math.round(totalSeconds));
  const minutes = Math.floor(abs / 60);
  const seconds = abs % 60;
  return `${sign}${minutes}:${seconds.toString().padStart(2, '0')}`;
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `cd app && npx vitest run src/lib/__tests__/formatTime.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 9: Write the failing tests for `classifyStep`**

Create `app/src/lib/__tests__/demoBeat.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { classifyStep } from '../demoBeat';

describe('classifyStep', () => {
  it('marks a kick every 4th step starting at 0', () => {
    expect(classifyStep(0).isKick).toBe(true);
    expect(classifyStep(4).isKick).toBe(true);
    expect(classifyStep(8).isKick).toBe(true);
    expect(classifyStep(12).isKick).toBe(true);
    expect(classifyStep(1).isKick).toBe(false);
    expect(classifyStep(2).isKick).toBe(false);
  });

  it('marks a hat on every odd step', () => {
    expect(classifyStep(1).isHat).toBe(true);
    expect(classifyStep(3).isHat).toBe(true);
    expect(classifyStep(0).isHat).toBe(false);
    expect(classifyStep(2).isHat).toBe(false);
  });
});
```

- [ ] **Step 10: Run the tests to verify they fail**

Run: `cd app && npx vitest run src/lib/__tests__/demoBeat.test.ts`
Expected: FAIL — `Cannot find module '../demoBeat'`.

- [ ] **Step 11: Implement `classifyStep` in `demoBeat.ts`**

Create `app/src/lib/demoBeat.ts` with just the pure part for now (audio functions added in Task 6):

```ts
export interface BeatStep {
  isKick: boolean;
  isHat: boolean;
}

export function classifyStep(step: number): BeatStep {
  return { isKick: step % 4 === 0, isHat: step % 2 === 1 };
}
```

- [ ] **Step 12: Run the tests to verify they pass**

Run: `cd app && npx vitest run src/lib/__tests__/demoBeat.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 13: Run the full test suite**

Run: `cd app && npm test`
Expected: all 10 tests pass, 0 failures.

- [ ] **Step 14: Commit**

```bash
git add app/src/lib
git commit -m "Add pingPongIndex, formatTime, classifyStep pure helpers with tests"
```

---

### Task 3: `BoomerangVideoBg` component

**Files:**
- Create: `app/src/components/BoomerangVideoBg.tsx`

**Interfaces:**
- Consumes: `pingPongIndex(step: number, length: number): number` from `../lib/pingPong` (Task 2).
- Produces: `BoomerangVideoBg` component, props `{ src?: string }` (default `'/hero-loop.mp4'`), used by `App.tsx` (Task 8).

- [ ] **Step 1: Create `app/src/components/BoomerangVideoBg.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';
import { pingPongIndex } from '../lib/pingPong';

const MAX_WIDTH = 960;
const PLAYBACK_FPS = 30;

interface BoomerangVideoBgProps {
  src?: string;
}

export function BoomerangVideoBg({ src = '/hero-loop.mp4' }: BoomerangVideoBgProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const rafHandleRef = useRef<number | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [playingFrames, setPlayingFrames] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const captureFrame = () => {
      if (video.videoWidth === 0) return;
      const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
      const w = Math.round(video.videoWidth * scale);
      const h = Math.round(video.videoHeight * scale);
      const frame = document.createElement('canvas');
      frame.width = w;
      frame.height = h;
      const ctx = frame.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        framesRef.current.push(frame);
      }
    };

    const supportsRvfc = 'requestVideoFrameCallback' in video;

    const scheduleNext = () => {
      if (supportsRvfc) {
        (video as HTMLVideoElement & {
          requestVideoFrameCallback: (cb: () => void) => number;
        }).requestVideoFrameCallback(() => {
          captureFrame();
          scheduleNext();
        });
      } else {
        rafHandleRef.current = requestAnimationFrame(() => {
          captureFrame();
          scheduleNext();
        });
      }
    };

    const handleEnded = () => {
      if (!supportsRvfc && rafHandleRef.current !== null) {
        cancelAnimationFrame(rafHandleRef.current);
        rafHandleRef.current = null;
      }
      setPlayingFrames(true);
    };

    const handleError = () => setVideoFailed(true);

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadedmetadata', scheduleNext, { once: true });

    video.play().catch(() => setVideoFailed(true));

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadedmetadata', scheduleNext);
      if (rafHandleRef.current !== null) {
        cancelAnimationFrame(rafHandleRef.current);
      }
    };
  }, [src]);

  useEffect(() => {
    if (!playingFrames) return;
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || frames.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = frames[0].width;
    canvas.height = frames[0].height;

    let step = 0;
    const interval = window.setInterval(() => {
      const idx = pingPongIndex(step, frames.length);
      ctx.drawImage(frames[idx], 0, 0);
      step += 1;
    }, 1000 / PLAYBACK_FPS);

    return () => window.clearInterval(interval);
  }, [playingFrames]);

  return (
    <div className="absolute inset-0 z-0 scale-[1.08] origin-center overflow-hidden">
      {!videoFailed && !playingFrames && (
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          crossOrigin="anonymous"
          className="h-full w-full object-cover"
        />
      )}
      {!videoFailed && playingFrames && (
        <canvas ref={canvasRef} className="h-full w-full object-cover" />
      )}
      {videoFailed && (
        <div className="h-full w-full bg-gradient-to-b from-[#0d0d0d] to-black" />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire it into `App.tsx` temporarily to verify it renders**

Edit `app/src/App.tsx`:

```tsx
import { BoomerangVideoBg } from './components/BoomerangVideoBg';

export function App() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <BoomerangVideoBg />
      <p className="relative z-10 p-6 text-white">YOUNGBLOOD hero — under construction</p>
    </div>
  );
}
```

- [ ] **Step 3: Verify manually in the browser**

Run: `cd app && npm run dev`, open the printed local URL.
Expected: no console errors; because `/hero-loop.mp4` does not exist yet (added in Task 9), the `<video>` element fires an `error` event and the component falls back to the `bg-gradient-to-b from-[#0d0d0d] to-black` div — the page shows a dark gradient instead of a broken video icon, confirming the fallback path works.

- [ ] **Step 4: Run the full test suite (regression check)**

Run: `cd app && npm test`
Expected: still 10/10 passing (this task adds no new pure-logic tests — it's covered by Task 2's `pingPongIndex` tests plus manual browser verification).

- [ ] **Step 5: Commit**

```bash
git add app/src/components/BoomerangVideoBg.tsx app/src/App.tsx
git commit -m "Add BoomerangVideoBg component with rVFC capture and error fallback"
```

---

### Task 4: `Header` component

**Files:**
- Create: `app/src/components/Header.tsx`

**Interfaces:**
- Produces: `Header` component (no props), used by `App.tsx` (Task 8).

- [ ] **Step 1: Create `app/src/components/Header.tsx`**

```tsx
import { useState } from 'react';
import { Menu, Phone, X } from 'lucide-react';

const NAV_LINKS = [
  { href: 'index.html', label: 'Главная' },
  { href: 'about.html', label: 'О нас' },
  { href: 'artists.html', label: 'Артисты' },
  { href: 'location.html', label: 'Расположение' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="absolute top-0 z-20 w-full px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="index.html" className="flex items-center gap-2 text-white">
            <svg viewBox="0 0 40 40" fill="none" className="h-5 w-5">
              <path
                d="M6 14l4 3 6-9 6 9 4-3-2 12H8L6 14z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <rect x="9" y="28" width="22" height="2.4" rx="1.2" fill="currentColor" stroke="none" />
            </svg>
            <span className="font-brush text-base tracking-tight">YB</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white/90 transition-transform duration-200 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:+79991234567"
              className="flex items-center gap-2 rounded-xl bg-white p-1 pr-3 transition-transform duration-200 hover:scale-105 active:scale-95 sm:pr-4"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
                <Phone size={14} strokeWidth={2} className="text-black" />
              </span>
              <span className="hidden text-sm text-gray-900 sm:inline">+7 (999) 123-45-67</span>
            </a>
            <button
              type="button"
              aria-label="Меню"
              onClick={() => setMenuOpen((open) => !open)}
              className="liquid-glass flex h-9 w-9 items-center justify-center rounded-xl text-white transition-transform duration-200 md:hidden"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <nav className="liquid-glass absolute left-4 right-4 top-20 z-20 mx-4 rounded-2xl p-2 md:hidden">
          {[...NAV_LINKS, { href: 'booking.html', label: 'Записаться' }].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block rounded-xl px-4 py-3 text-sm text-white/90 hover:bg-white/10"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </>
  );
}
```

- [ ] **Step 2: Wire it into `App.tsx` temporarily to verify it renders**

Edit `app/src/App.tsx`, add `<Header />` after `<BoomerangVideoBg />`.

- [ ] **Step 3: Verify manually in the browser**

Run: `cd app && npm run dev`, open the printed local URL.
Expected: crown+YB logo top-left, nav links centered on a desktop-width viewport (hidden below `md`), white phone pill top-right with a yellow icon square, mobile menu button appears only when the viewport is narrower than `md` (resize the browser to confirm) and toggles the dropdown open/closed on click.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/Header.tsx app/src/App.tsx
git commit -m "Add Header component with YOUNGBLOOD nav and phone pill"
```

---

### Task 5: `Hero` component

**Files:**
- Create: `app/src/components/Hero.tsx`

**Interfaces:**
- Produces: `Hero` component (no props), used by `App.tsx` (Task 8).

- [ ] **Step 1: Create `app/src/components/Hero.tsx`**

```tsx
export function Hero() {
  return (
    <div className="relative z-10 px-4 pt-28 sm:px-6 sm:pt-36 md:pt-44">
      <div className="mx-auto max-w-6xl">
        <span
          className="liquid-glass animate-fade-up delay-1 mb-5 inline-block rounded-lg px-4 py-1.5 text-xs text-white sm:mb-6 sm:text-sm"
          style={{ background: 'rgba(255, 255, 255, 0.16)' }}
        >
          Студия звукозаписи · Москва
        </span>

        <h1 className="animate-fade-up delay-2 max-w-3xl font-display text-4xl uppercase leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-7xl">
          твой звук.
          <br />
          твои правила.
        </h1>

        <p className="animate-fade-up delay-3 mt-5 max-w-md text-sm leading-relaxed text-white/90 sm:mt-6 sm:text-base md:text-lg">
          Запись, сведение и продакшн для тех, кто формирует новую волну.
        </p>

        <div className="animate-fade-up delay-4 mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="booking.html"
            className="rounded-xl bg-white px-7 py-2.5 text-center text-sm text-gray-900 transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            Записаться
          </a>
          <a
            href="artists.html"
            className="liquid-glass rounded-xl px-7 py-2.5 text-center text-sm text-white transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            Наши артисты
          </a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into `App.tsx` temporarily to verify it renders**

Edit `app/src/App.tsx`, add `<Hero />` after `<Header />`, remove the placeholder `<p>`.

- [ ] **Step 3: Verify manually in the browser**

Run: `cd app && npm run dev`, open the printed local URL.
Expected: badge, two-line uppercase headline, subtext, and two buttons fade up in sequence on load (badge first, then headline, subtext, buttons); "Записаться" is a solid white pill, "Наши артисты" is a translucent glass pill with a visible thin gradient border.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/Hero.tsx app/src/App.tsx
git commit -m "Add Hero component with badge, headline, subtext, CTAs"
```

---

### Task 6: `demoBeat` audio module

**Files:**
- Modify: `app/src/lib/demoBeat.ts` (add `startDemoBeat`/`stopDemoBeat` alongside the existing `classifyStep` from Task 2)

**Interfaces:**
- Consumes: `classifyStep(step: number): BeatStep` (already in this file from Task 2).
- Produces: `startDemoBeat(ctx: AudioContext): number` (returns an interval id) and `stopDemoBeat(timerId: number): void`, used by `NowPlayingWidget` (Task 7).

- [ ] **Step 1: Extend `app/src/lib/demoBeat.ts`**

Ported directly from the existing vanilla-JS demo-beat generator at `assets/js/main.js:344-374` (kick oscillator + noise-burst hat, 130ms step, 16-step loop) — same audio parameters, adapted to explicit `AudioContext` typing:

```ts
export interface BeatStep {
  isKick: boolean;
  isHat: boolean;
}

export function classifyStep(step: number): BeatStep {
  return { isKick: step % 4 === 0, isHat: step % 2 === 1 };
}

function playKick(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.9, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

function playHat(ctx: AudioContext): void {
  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 7000;
  const gain = ctx.createGain();
  gain.gain.value = 0.18;
  source.connect(highpass).connect(gain).connect(ctx.destination);
  source.start();
}

const STEP_TIME_MS = 130;
const STEPS_PER_LOOP = 16;

export function startDemoBeat(ctx: AudioContext): number {
  let step = 0;
  return window.setInterval(() => {
    const { isKick, isHat } = classifyStep(step);
    if (isKick) playKick(ctx);
    if (isHat) playHat(ctx);
    step = (step + 1) % STEPS_PER_LOOP;
  }, STEP_TIME_MS);
}

export function stopDemoBeat(timerId: number): void {
  window.clearInterval(timerId);
}
```

- [ ] **Step 2: Run the full test suite (regression check)**

Run: `cd app && npm test`
Expected: still 10/10 passing — `classifyStep`'s existing tests from Task 2 are unaffected; `startDemoBeat`/`stopDemoBeat` need a live `AudioContext` so they're covered by manual browser verification in Task 7, not unit tests.

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/demoBeat.ts
git commit -m "Add startDemoBeat/stopDemoBeat ported from main.js demo-beat generator"
```

---

### Task 7: `NowPlayingWidget` component

**Files:**
- Create: `app/src/components/NowPlayingWidget.tsx`

**Interfaces:**
- Consumes: `formatTime(totalSeconds: number): string` from `../lib/formatTime` (Task 2); `startDemoBeat(ctx: AudioContext): number` and `stopDemoBeat(timerId: number): void` from `../lib/demoBeat` (Task 6).
- Produces: `NowPlayingWidget` component (no props), used by `App.tsx` (Task 8).

- [ ] **Step 1: Create `app/src/components/NowPlayingWidget.tsx`**

Track data and durations match the real roster in `assets/js/main.js`'s `ARTISTS` array (FLEXY "Ночная смена" 2:41, MAYOT "Район" 2:55, YUNGWAY "На волне" 2:33):

```tsx
import { useEffect, useRef, useState } from 'react';
import { BarChart3, Heart } from 'lucide-react';
import { formatTime } from '../lib/formatTime';
import { startDemoBeat, stopDemoBeat } from '../lib/demoBeat';

interface Track {
  artist: string;
  title: string;
  durationSeconds: number;
}

const TRACKS: Track[] = [
  { artist: 'FLEXY', title: 'Ночная смена', durationSeconds: 161 },
  { artist: 'MAYOT', title: 'Район', durationSeconds: 175 },
  { artist: 'YUNGWAY', title: 'На волне', durationSeconds: 153 },
];

const START_ELAPSED = 33;

export function NowPlayingWidget() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [elapsed, setElapsed] = useState(START_ELAPSED);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const beatTimerRef = useRef<number | null>(null);

  const track = TRACKS[trackIndex];

  useEffect(() => {
    if (!playing) return;
    const tick = window.setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= track.durationSeconds) {
          setPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [playing, track.durationSeconds]);

  useEffect(() => {
    if (playing) {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      beatTimerRef.current = startDemoBeat(audioCtxRef.current);
    } else if (beatTimerRef.current !== null) {
      stopDemoBeat(beatTimerRef.current);
      beatTimerRef.current = null;
    }
    return () => {
      if (beatTimerRef.current !== null) {
        stopDemoBeat(beatTimerRef.current);
        beatTimerRef.current = null;
      }
    };
  }, [playing]);

  function changeTrack(direction: 1 | -1) {
    setPlaying(false);
    setElapsed(0);
    setTrackIndex((i) => (i + direction + TRACKS.length) % TRACKS.length);
  }

  const progressPercent = Math.round((elapsed / track.durationSeconds) * 100);
  const remaining = elapsed - track.durationSeconds;

  return (
    <div className="animate-fade-up delay-5 absolute bottom-4 right-4 z-20 w-[270px] sm:bottom-6 sm:right-6 sm:w-72 md:bottom-8 md:right-10">
      <div className="rounded-2xl bg-white p-2.5 pr-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Пауза' : 'Слушать демо-бит'}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <BarChart3 size={20} strokeWidth={2.5} className="text-black" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-gray-900">
              {track.artist} — {track.title}
            </p>
            <div className="mt-1.5 h-1 rounded-full bg-gray-200">
              <div className="h-1 rounded-full bg-accent" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-gray-500">
              <span>{formatTime(elapsed)}</span>
              <span>{formatTime(remaining)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => changeTrack(-1)}
          className="flex-1 rounded-2xl bg-white py-2 text-sm text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Назад
        </button>
        <button
          type="button"
          onClick={() => setLiked((l) => !l)}
          aria-label={liked ? 'Убрать из избранного' : 'В избранное'}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95"
        >
          <Heart size={16} className={liked ? 'fill-accent text-accent' : 'text-accent'} />
        </button>
        <button
          type="button"
          onClick={() => changeTrack(1)}
          className="flex-1 rounded-2xl bg-white py-2 text-sm text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Вперёд
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into `App.tsx` to verify it renders**

Edit `app/src/App.tsx`, add `<NowPlayingWidget />` as the last child.

- [ ] **Step 3: Verify manually in the browser**

Run: `cd app && npm run dev`, open the printed local URL.
Expected: track card bottom-right shows "FLEXY — Ночная смена", progress bar ~20% filled, times read `0:33` and `-2:08`; clicking the yellow play button starts an audible kick/hat loop and the progress bar + time labels advance every second; clicking again stops the audio and the timer freezes; "Назад"/"Вперёд" switch tracks and reset progress to 0; the heart button toggles fill color.

- [ ] **Step 4: Run the full test suite (regression check)**

Run: `cd app && npm test`
Expected: still 10/10 passing.

- [ ] **Step 5: Commit**

```bash
git add app/src/components/NowPlayingWidget.tsx app/src/App.tsx
git commit -m "Add NowPlayingWidget with demo-beat playback and track switching"
```

---

### Task 8: Final `App.tsx` composition

**Files:**
- Modify: `app/src/App.tsx`

**Interfaces:**
- Consumes: `BoomerangVideoBg` (Task 3), `Header` (Task 4), `Hero` (Task 5), `NowPlayingWidget` (Task 7).

- [ ] **Step 1: Write the final `app/src/App.tsx`**

```tsx
import { BoomerangVideoBg } from './components/BoomerangVideoBg';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { NowPlayingWidget } from './components/NowPlayingWidget';

export function App() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <BoomerangVideoBg />
      <Header />
      <Hero />
      <NowPlayingWidget />
    </div>
  );
}
```

- [ ] **Step 2: Verify manually in the browser at three breakpoints**

Run: `cd app && npm run dev`, open the printed local URL, use the browser's device toolbar to check:
- **375px wide (mobile):** header shows logo + phone icon (no phone number text) + glass menu button; hero text stacks full-width; buttons stack vertically; Now Playing widget is 270px wide bottom-right.
- **768px wide (tablet):** same as mobile but phone number text visible; nav links still hidden until `md` (768px is exactly the Tailwind `md` boundary — confirm nav links appear at 768px and up).
- **1440px wide (desktop):** full nav links visible, hero headline at largest clamp size, Now Playing widget at `md:` offsets.

Expected: no horizontal scrollbar at any width, no layout overlap between Hero content and the Now Playing widget.

- [ ] **Step 3: Verify `prefers-reduced-motion`**

In Chrome DevTools, open the Rendering tab, set "Emulate CSS media feature `prefers-reduced-motion`" to `reduce`, reload.
Expected: badge/headline/subtext/buttons/widget appear immediately with no fade/slide-in animation, `.liquid-glass` blur still renders correctly on the buttons and menu (confirming `animation-fill-mode: backwards` isn't leaving a stray `transform` behind).

- [ ] **Step 4: Commit**

```bash
git add app/src/App.tsx
git commit -m "Compose final App.tsx with all hero sections"
```

---

### Task 9: Generate and wire the boomerang background video

**Files:**
- Create: `app/public/hero-loop.mp4`

- [ ] **Step 1: Generate the video**

Use an available AI video-generation tool to produce a 3-5 second, black-and-white, looping-friendly clip matching the YOUNGBLOOD mockup mood: a graffiti-tagged studio wall or booth interior with subtle ambient motion (drifting smoke, a shaft of light, dust) — no on-screen text, no visible faces required. Export at or below 960px on the long edge, muted, mp4 (H.264).

- [ ] **Step 2: Place the file**

Save the exported clip as `app/public/hero-loop.mp4`.

- [ ] **Step 3: Verify in the browser**

Run: `cd app && npm run dev`, open the printed local URL, wait for the clip to play once through.
Expected: after the first forward playthrough, the `<video>` element is replaced by a `<canvas>` that loops the captured frames forward-then-backward continuously (no visible jump or black flash at the loop boundary); `document.querySelector('canvas')` exists in the DOM after a few seconds.

- [ ] **Step 4: If generation is not available or the result is unusable**

Leave `app/public/hero-loop.mp4` absent. `BoomerangVideoBg`'s existing `error` handler (Task 3) already falls back to the dark gradient — confirm this fallback still looks acceptable behind the Header/Hero/NowPlayingWidget content before moving on, and note in the Task 12 QA pass that the video is a follow-up rather than treating it as a blocker.

- [ ] **Step 5: Commit (only if a usable video was produced)**

```bash
git add app/public/hero-loop.mp4
git commit -m "Add AI-generated boomerang background video"
```

---

### Task 10: Production build verification

**Files:**
- None created — verification only.

- [ ] **Step 1: Run the production build**

Run: `cd app && npm run build`
Expected: `tsc -b` reports no type errors, `vite build` completes, `app/dist/` is created containing `index.html` and an `app-assets/` subfolder (not `assets/` — confirming `build.assetsDir` from Task 1 avoided colliding with the repo's existing `assets/` folder).

- [ ] **Step 2: Preview the production build**

Run: `cd app && npm run preview -- --port 4173`, open `http://localhost:4173/`.
Expected: page renders identically to `npm run dev`; check the Network tab to confirm hashed asset filenames are requested from `/app-assets/...` and load with 200 status.

- [ ] **Step 3: Confirm no collision with the static site's assets**

Run: `ls app/dist` and `ls app/dist/app-assets` from the repo root.
Expected: `app/dist/app-assets/` contains only this app's own bundled JS/CSS (hashed filenames), and there is no file named `assets/` inside `app/dist` that would collide with the repo-root `assets/` folder used by `about.html` etc.

- [ ] **Step 4: Add `app/dist` and `app/node_modules` to `.gitignore`**

Read the current `.gitignore`, then append if not already present:

```
app/node_modules/
app/dist/
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore
git commit -m "Ignore app/node_modules and app/dist"
```

---

### Task 11: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: app/package-lock.json

      - name: Install app dependencies
        working-directory: app
        run: npm ci

      - name: Build hero app
        working-directory: app
        run: npm run build

      - name: Assemble Pages artifact
        run: |
          mkdir -p site
          cp -r app/dist/. site/
          cp about.html artists.html booking.html location.html 404.html site/
          cp .nojekyll site/
          cp -r assets site/assets

      - uses: actions/upload-pages-artifact@v3
        with:
          path: site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify the workflow YAML is well-formed**

Run: `cd "/c/Users/Максим/youngblood/.claude/worktrees/youngblood-build" && python -c "import yaml, sys; yaml.safe_load(open('.github/workflows/deploy.yml'))" 2>&1 || py -c "import yaml, sys; yaml.safe_load(open('.github/workflows/deploy.yml'))"`
Expected: no output (no exception) means the YAML parses correctly. If `yaml` module is missing, alternatively run `gh workflow view deploy.yml` after pushing, or paste the file into a YAML linter — the goal is only to catch indentation mistakes before pushing.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions workflow to build and deploy the hero app"
```

- [ ] **Step 4: STOP — get explicit user confirmation before touching repository settings**

Do not proceed past this point automatically. Ask the user: "Workflow committed. To actually go live, GitHub Pages' source needs to switch from 'Deploy from a branch' to 'GitHub Actions' in the repo settings — confirm before I do this?" Only after explicit yes:

Run: `gh api repos/{owner}/{repo}/pages -X PUT -f build_type=workflow` (replace `{owner}/{repo}` with the actual GitHub slug, found via `git remote get-url origin`), or guide the user to do it manually at `Settings → Pages → Source → GitHub Actions` if `gh api` fails due to permissions.

- [ ] **Step 5: Push and confirm a successful deploy**

Run: `git push` (to the branch GitHub Pages is configured to deploy from — confirm which branch that is via `gh api repos/{owner}/{repo}/pages` before pushing, since this worktree is on `worktree-youngblood-build`, not `main`).
Run: `gh run watch` (or `gh run list --workflow=deploy.yml` then `gh run watch <run-id>`).
Expected: workflow run completes with all green steps; the Pages URL from `gh api repos/{owner}/{repo}/pages --jq .html_url` serves the new hero on `/` and the existing pages unchanged on their URLs.

---

### Task 12: Final manual QA and wrap-up

**Files:**
- None created — verification only.

- [ ] **Step 1: Cross-page link check**

From the deployed (or `npm run preview`d) hero, click every link: logo → `index.html`, each nav item → its static page, "Записаться" and the header phone pill, both Hero CTAs, every mobile-menu link.
Expected: every link resolves to the correct existing static page, no 404s.

- [ ] **Step 2: Re-run the full test suite one more time**

Run: `cd app && npm test`
Expected: 10/10 passing.

- [ ] **Step 3: Re-run the production build one more time**

Run: `cd app && npm run build`
Expected: succeeds with no type errors (guards against any drift introduced during manual QA edits).

- [ ] **Step 4: Update the project README**

Read `README.md`, add a short section (near "Технологии") noting that the homepage hero now lives in `app/` (React + Vite + TS) and is built/deployed by `.github/workflows/deploy.yml`, while `about.html`/`artists.html`/`booking.html`/`location.html` remain plain static HTML — pointing future readers at `docs/superpowers/specs/2026-08-01-react-hero-migration-design.md` for the full rationale.

- [ ] **Step 5: Final commit**

```bash
git add README.md
git commit -m "Document the React hero app in README"
```
