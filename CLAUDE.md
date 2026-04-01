# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Resgen-UI is an Angular 19 SPA for AI-powered resume generation. Users authenticate via Auth0, manage profiles, select resume templates, and generate/download PDF resumes from a backend API.

The Angular app lives in `resgen-ui/` — all commands below are run from that subdirectory.

## Commands

```bash
cd resgen-ui

npm start          # Dev server (ng serve)
npm run build      # Production build
npm run build:azure # Azure-specific production build
npm test           # Run Jasmine/Karma tests
npm run watch      # Build in watch mode
```

To run a single test file, use Karma's `--include` flag or set `fit`/`fdescribe` in the spec file.

## Architecture

### Component Structure

All components are **standalone** (Angular 19, no NgModules). Feature components live in `src/app/components/`:

- `home/` — Resume generation hub: select profile + template → call API → display/download PDF
- `profile/create-profile/` & `profile/edit-profile/` — Reactive forms with dynamic FormArrays for work experience; custom date-range validators
- `resume/` — View and manage saved resumes
- `account/` — Auth0 user info display
- `welcome/` — Unauthenticated landing page
- `modal/` — Reusable success/error modal (uses `@Input`/`@Output`)

### Routing

Defined in `src/app/app.routes.ts`. All routes except `/welcome` are protected by Auth0's `AuthGuard`. Default redirect goes to `/welcome`.

### Auth Flow

1. Auth0 handles login/logout
2. `IAMService` (`src/app/services/IAMService.ts`) exposes `isAuthenticated$` and caches user data to `localStorage` (`user.id`, `user.name`, `user.email`, `user.picture`, `user.auth0.token`)
3. `Auth0HttpInerceptorFnService` is a functional HTTP interceptor that attaches `Authorization: Bearer <token>` to outgoing requests

### API Communication

Components inject `HttpClient` directly — there is **no centralized data service layer**. The base URL comes from `environment.apiUrl`:
- Dev: `http://localhost:5039/api`
- Prod: Azure-hosted API (`environment.prod.ts`)

User ID for API calls is retrieved from `localStorage.getItem('user.id')`.

Key endpoint pattern: `GET /Resume/generate-resume` returns a PDF blob, which is converted to an object URL for the `ng2-pdf-viewer` or triggered as a download.

### Styling

Tailwind CSS 4 + Flowbite 3. The custom `@Flowbite()` decorator (in `src/flowbite-decorator.ts`) wraps `ngOnInit` to ensure Flowbite initializes after Angular renders the DOM. Apply it to any component that uses Flowbite widgets (dropdowns, datepickers, sidebars).

### State Management

- **Auth state**: RxJS Observables via `IAMService` and Auth0 library
- **Tab selection**: `TabService` (`src/app/services/tab.service.ts`) — a `BehaviorSubject` shared app-wide
- **Form state**: Managed locally per component via `FormBuilder`

### Deployment

GitHub Actions (`.github/workflows/`) automatically builds and deploys to Azure Static Web Apps on push to `main`.

## TypeScript

`tsconfig.json` enables strict mode with `noImplicitOverride`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`, and `noFallthroughCasesInSwitch`. Templates also use strict checking.
