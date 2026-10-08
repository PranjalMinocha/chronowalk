# ChronoWalk Manhattan

ChronoWalk is a hackathon prototype for exploring evidence-backed versions of Manhattan across three eras: the 1940s, the mid-1980s, and today.

The landing page combines historical NYC aerial imagery with selectable street-level portals. Each portal opens a real-time immersive reconstruction powered by Reactor's LingBot World 2 model. The reconstruction prompt is constrained by a documented reference image, tax-lot identity, era, and a six-metre exploration boundary.

## Highlights

- Navigable historical aerial map with era switching.
- 16 source-backed portal/era combinations across Manhattan.
- Six portals in the 1940s, five in the mid-1980s, and five in the current era.
- References from the NYC Municipal Archives, Library of Congress, and Wikimedia Commons.
- First-person look and movement controls with a compact, full-screen immersive view.
- Conservative prompts that prioritize fixed architecture and quiet streets over invented activity.
- Visible provenance, confidence, and source links for every reconstruction.

Featured locations include Times Square, the Flatiron Building, Penn Station, Madison Square Garden, the Empire State Building, and the Chrysler Building.

## Run locally

You need Node.js and a Reactor API key.

```bash
cp .env.example .env.local
# Set REACTOR_API_KEY in .env.local

npm install
npm run dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001).

The API key stays server-side. `app/api/reactor/token/route.ts` exchanges it for a short-lived token scoped to LingBot World 2 sessions.

## Controls

- Drag the aerial map to pan; use the map buttons to zoom.
- Select a portal pin, then choose an era.
- In the immersive world, use arrow keys to look around.
- Use WASD to move within the six-metre evidence boundary.
- Open **Controls & evidence** for source details and advanced controls.

## Evidence model

Portal definitions and provenance live in `lib/chronowalk-worlds.ts`. A portal is available in an era only when a matching reference exists; the interface does not silently borrow an unrelated image. Historical tax photographs are tied to Manhattan block-and-lot identifiers, while modern references retain their source and license metadata.

The aerial layer presents an era-level experience rather than claiming that every tile was captured in the exact label year.

## Project structure

- `components/ChronoWalkLanding.tsx` — historical map, timeline, and portal selection.
- `components/ChronoWalkWorldHUD.tsx` — in-world location and boundary HUD.
- `lib/chronowalk-worlds.ts` — portal registry, evidence, provenance, and reconstruction prompts.
- `app/LingbotWorld2App.tsx` — Reactor session lifecycle and immersive layout.
- `components/lingbot-world-2/` — real-time camera, movement, and prompt controls.
- `public/chronowalk/` — local evidence images used by the portal registry.

## Verification

```bash
npx tsc --noEmit
npm run build
```

## Technology

Next.js 15, React 19, TypeScript, Tailwind CSS, `@reactor-models/lingbot-world-2`, and `@reactor-team/js-sdk`.

This is a hackathon prototype. Historical reconstructions include clearly labeled inference where the reference does not show a surface or detail.
