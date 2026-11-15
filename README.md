# Glossa — Language Translator

A clean, responsive language translation web app built for the **CodeAlpha AI Internship**.
Type text, choose a source and target language, and get a real translation from the free
[MyMemory Translation API](https://mymemory.translated.net/doc/spec.php).

## Features

- Text input with live character counter (500-character limit of the free MyMemory API)
- Source and target language dropdowns (31 common languages) with automatic language detection
- Swap languages button (also moves the translation into the input)
- Translate, Copy Translation and Clear buttons — `Ctrl/Cmd + Enter` also translates
- Loading indicators, clear error messages (network errors, API errors, daily quota) and retry
- Right-to-left display for Arabic, Hebrew, Persian and Urdu
- Fully responsive on desktop and mobile

## How translation works

The browser calls `https://api.mymemory.translated.net/get?q=<text>&langpair=<source>|<target>`
directly (MyMemory is free, needs no API key and allows cross-origin requests). The translated
text shown is exactly what the API returns — there are no mock or hardcoded translations and no
secret environment variables. See `src/lib/mymemory.ts`.

## Tech stack

React 19 · TanStack Start / Router · TanStack Query · TypeScript · Tailwind CSS v4 · Vite

## Run locally

```sh
npm install      # or: bun install
npm run dev      # http://localhost:8080
npm test         # unit tests for the translation rules
```

## Deploy as a static site

```sh
npm run build:static                       # site served from the domain root
BASE_PATH=/my-repo/ npm run build:static   # site served from a sub-path
```

The output in `dist/client` can be uploaded to any static host (Netlify, Vercel,
Cloudflare Pages, GitHub Pages…).

### GitHub Pages

1. Push this project to a GitHub repository (default branch `main`).
2. In the repository open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy-pages.yml`) builds and publishes the site to
   `https://<username>.github.io/<repository>/` on every push to `main`.

## Project structure

```text
src/
├── components/translator/   Translator card + language dropdown
├── lib/languages.ts         Supported languages and helpers
├── lib/mymemory.ts          MyMemory API client and error handling
├── lib/translate.schema.ts  Input validation rules
├── lib/translate.test.ts    Tests for the translation rules
└── routes/index.tsx         Home page
```
