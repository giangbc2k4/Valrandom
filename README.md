# Valrandom

Next.js app for randomizing players, assigning teams, and showing animated results. It is designed as a small interactive tool with a visual UI, music player, and multilingual text support.

## Features

- Player entry and management.
- Random team assignment logic.
- Result screen for generated teams.
- Agent/team assignment helpers.
- Header and music player components.
- Internationalization helper.
- Animated UI with Framer Motion and particles.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- lucide-react
- tsparticles

## Project Structure

```text
app/page.tsx                 Main app screen
app/players/                 Player setup flow
app/teams/                   Team setup flow
app/result/                  Result display
app/lib/teamRandomizer.ts    Team randomization logic
app/lib/assignAgents.ts      Agent assignment logic
app/lib/i18n.tsx             Text/localization helper
app/components/              Shared UI components
```

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Roadmap

- Add screenshots or a demo GIF.
- Document the exact randomization rules.
- Rename the package from `my-app` to `valrandom`.

## User flow and domain logic

The landing page leads to player entry, team configuration and the result screen. Keep randomization in `app/lib/teamRandomizer.ts` and agent assignment in `assignAgents.ts`; UI components should not duplicate those rules. Agent/map metadata and matching assets must use stable, consistent IDs.

## Fairness rules to document

Clarify minimum/maximum players, odd player handling, whether agents may repeat, whether roles must balance and how maps are selected. A shuffle is random but not necessarily skill-balanced. If results must be reproducible, add a seed and display it on the result page.

## Testing and production

Test 0/1 players, odd counts, duplicate names, more teams than players, missing assets and direct refresh of `/result` without prior state. Verify mobile layout, reduced-motion preference and browsers that block audio autoplay. Before publishing, run lint/build, optimize large images and confirm licensing for Valorant imagery/audio. Use URL/localStorage if results should survive refresh or be shareable.
