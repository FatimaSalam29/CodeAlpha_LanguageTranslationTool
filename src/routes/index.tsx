import { createFileRoute } from "@tanstack/react-router";
import { Globe2, Languages, ShieldCheck } from "lucide-react";

import { Translator } from "@/components/translator/Translator";
import { LANGUAGES } from "@/lib/languages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Glossa — Instant Language Translator" },
      {
        name: "description",
        content: `Translate text between ${LANGUAGES.length} languages instantly with Google Cloud Translation.`,
      },
      { property: "og:title", content: "Glossa — Instant Language Translator" },
      {
        property: "og:description",
        content: `Translate text between ${LANGUAGES.length} languages instantly with Google Cloud Translation.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div aria-hidden className="grid-fade pointer-events-none absolute inset-x-0 top-0 h-[520px]" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
            <Languages className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Glossa</span>
        </a>
        <span className="hidden items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur sm:inline-flex">
          <span className="size-1.5 rounded-full bg-success" />
          Powered by Google Cloud Translation
        </span>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6 sm:px-8 sm:pt-10">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Globe2 className="size-3.5" />
            {LANGUAGES.length} languages supported
          </span>
          <h1 className="text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl md:text-6xl">
            Translate with <span className="text-gradient">clarity</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Accurate, instant translations for everyday text — powered by Google&apos;s
            neural machine translation.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <Translator />
          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Your text is sent securely to Google Cloud Translation and is not stored by this app.
          </p>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border/70 py-6">
        <p className="mx-auto max-w-6xl px-5 text-center text-xs text-muted-foreground sm:px-8">
          © {new Date().getFullYear()} Glossa · Built for the CodeAlpha AI Internship
        </p>
      </footer>
    </div>
  );
}
