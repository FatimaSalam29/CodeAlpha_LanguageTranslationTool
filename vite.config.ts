// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// `npm run build:static` sets STATIC_EXPORT=true to prerender the app into plain HTML/JS/CSS
// (dist/client) for static hosts such as GitHub Pages. BASE_PATH sets the sub-path the site is
// served from, e.g. "/my-repo/" for https://<user>.github.io/my-repo/.
const isStaticExport = process.env['STATIC_EXPORT'] === "true";
const basePath = process.env['BASE_PATH'] || "/";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(isStaticExport && {
      prerender: { enabled: true, crawlLinks: true, failOnError: true },
      pages: [{ path: "/" }],
    }),
  },
  ...(isStaticExport && { nitro: false as const, vite: { base: basePath } }),
});
