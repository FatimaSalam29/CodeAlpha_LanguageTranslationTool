import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  Copy,
  Eraser,
  Languages,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AUTO_DETECT,
  getLanguageName,
  isRtl,
  isSupportedLanguage,
  normalizeLanguageCode,
} from "@/lib/languages";
import { translateText } from "@/lib/translate.functions";
import { MAX_CHARS, translateInputSchema, type TranslateInput } from "@/lib/translate.schema";
import { cn } from "@/lib/utils";

import { LanguageSelect } from "./LanguageSelect";

interface Translation {
  text: string;
  target: string;
  detected: string | null;
}

export function Translator() {
  const [text, setText] = useState("");
  const [source, setSource] = useState<string>(AUTO_DETECT);
  const [target, setTarget] = useState<string>("es");
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const translateFn = useServerFn(translateText);
  const mutation = useMutation({
    mutationFn: (input: TranslateInput) => translateFn({ data: input }),
    onSuccess: (result, input) => {
      if (result.ok) {
        setError(null);
        setTranslation({
          text: result.translatedText,
          target: input.target,
          detected: result.detectedSourceLanguage
            ? normalizeLanguageCode(result.detectedSourceLanguage)
            : null,
        });
      } else {
        setTranslation(null);
        setError(result.error);
      }
    },
    onError: (err) => {
      console.error(err);
      setTranslation(null);
      setError("We couldn't reach the translation service. Check your connection and try again.");
    },
  });
  const isLoading = mutation.isPending;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const detected = source === AUTO_DETECT ? (translation?.detected ?? null) : null;
  const charCount = text.length;
  const overLimit = charCount > MAX_CHARS;
  const canSwap =
    !isLoading && (source !== AUTO_DETECT || (!!detected && isSupportedLanguage(detected)));

  function handleTranslate() {
    const parsed = translateInputSchema.safeParse({ text, source, target });
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Please check your input.";
      setError(message);
      setTranslation(null);
      return;
    }
    setError(null);
    mutation.mutate(parsed.data);
  }

  function handleSwap() {
    if (!canSwap) return;
    const newTarget = source === AUTO_DETECT ? detected! : source;
    setSource(target);
    setTarget(newTarget);
    if (translation) {
      // Move the translated text into the input; the user re-translates it explicitly.
      setText(translation.text);
      setTranslation(null);
    }
    setError(null);
  }

  function handleSourceChange(value: string) {
    setSource(value);
    if (value === target) setTarget(source === AUTO_DETECT ? (detected ?? "en") : source);
  }

  function handleTargetChange(value: string) {
    if (value === source) setSource(target);
    setTarget(value);
  }

  function handleClear() {
    setText("");
    setTranslation(null);
    setError(null);
    mutation.reset();
    inputRef.current?.focus();
  }

  async function handleCopy() {
    if (!translation) return;
    try {
      await navigator.clipboard.writeText(translation.text);
      setCopied(true);
      toast.success("Translation copied to clipboard");
    } catch {
      toast.error("Couldn't copy automatically. Please select the text and copy it manually.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleTranslate();
    }
  }

  return (
    <section
      aria-label="Translator"
      className="animate-fade-up overflow-hidden rounded-3xl border border-border bg-card shadow-card"
    >
      {/* Language bar */}
      <div className="flex items-end gap-2 border-b border-border bg-surface px-4 py-4 sm:gap-4 sm:px-6">
        <LanguageSelect
          id="source-language"
          label="From"
          value={source}
          onChange={handleSourceChange}
          allowAutoDetect
          detectedLanguage={detected}
          disabled={isLoading}
        />
        <Button
          type="button"
          variant="soft"
          size="icon"
          onClick={handleSwap}
          disabled={!canSwap}
          aria-label="Swap languages"
          title={
            canSwap ? "Swap languages" : "Translate first so the source language can be detected"
          }
          className="mb-1 size-10 shrink-0 rounded-full transition-transform duration-300 hover:rotate-180"
        >
          <ArrowLeftRight />
        </Button>
        <LanguageSelect
          id="target-language"
          label="To"
          value={target}
          onChange={handleTargetChange}
          disabled={isLoading}
        />
      </div>

      {/* Panels */}
      <div className="grid md:grid-cols-2">
        {/* Input */}
        <div className="flex min-h-[300px] flex-col border-b border-border md:border-b-0 md:border-r">
          <label htmlFor="source-text" className="sr-only">
            Text to translate
          </label>
          <textarea
            id="source-text"
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            dir={isRtl(source === AUTO_DETECT ? detected : source) ? "rtl" : "auto"}
            placeholder="Type or paste text here…"
            className="min-h-[220px] flex-1 resize-none bg-transparent px-5 pt-5 text-lg leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70 sm:px-6 sm:text-xl"
          />
          <div className="flex items-center justify-between gap-3 px-4 pb-4 sm:px-5">
            <span
              className={cn(
                "text-xs tabular-nums text-muted-foreground",
                overLimit && "font-semibold text-destructive",
              )}
            >
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
            <Button
              type="button"
              variant="subtle"
              size="pill"
              onClick={handleClear}
              disabled={!text && !translation && !error}
            >
              <Eraser />
              Clear
            </Button>
          </div>
        </div>

        {/* Output */}
        <div className="flex min-h-[300px] flex-col bg-surface/60" aria-live="polite">
          <div className="flex-1 px-5 pt-5 sm:px-6">
            {isLoading ? (
              <div className="space-y-3 pt-1" aria-label="Translating">
                <div className="shimmer h-5 w-11/12 rounded-md" />
                <div className="shimmer h-5 w-9/12 rounded-md" />
                <div className="shimmer h-5 w-10/12 rounded-md" />
                <div className="shimmer h-5 w-6/12 rounded-md" />
              </div>
            ) : error ? (
              <div
                role="alert"
                className="animate-fade-up flex gap-3 rounded-2xl border border-destructive/20 bg-destructive-soft p-4 text-sm"
              >
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                <div className="space-y-2">
                  <p className="font-semibold text-destructive">Translation failed</p>
                  <p className="leading-relaxed text-foreground/80">{error}</p>
                  {text.trim() && !overLimit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTranslate}
                      className="mt-1 rounded-lg bg-card"
                    >
                      <RotateCcw />
                      Try again
                    </Button>
                  )}
                </div>
              </div>
            ) : translation ? (
              <p
                dir={isRtl(translation.target) ? "rtl" : "auto"}
                className="animate-fade-up whitespace-pre-wrap break-words text-lg leading-relaxed text-foreground sm:text-xl"
              >
                {translation.text}
              </p>
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Languages className="size-6" />
                </div>
                <p className="max-w-[16rem] text-sm text-muted-foreground">
                  Your translation will appear here.
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 px-4 pb-4 sm:px-5">
            <span className="truncate text-xs text-muted-foreground">
              {translation && !isLoading ? getLanguageName(translation.target) : "\u00a0"}
            </span>
            <Button
              type="button"
              variant="subtle"
              size="pill"
              onClick={handleCopy}
              disabled={!translation || isLoading}
              aria-label="Copy translation"
            >
              {copied ? <Check className="text-success" /> : <Copy />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="hidden text-xs text-muted-foreground sm:block">
          Press{" "}
          <kbd className="rounded-md border border-border bg-secondary px-1.5 py-0.5 font-sans text-[11px] font-semibold">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="rounded-md border border-border bg-secondary px-1.5 py-0.5 font-sans text-[11px] font-semibold">
            Enter
          </kbd>{" "}
          to translate
        </p>
        <Button
          type="button"
          variant="hero"
          size="xl"
          onClick={handleTranslate}
          disabled={isLoading || !text.trim() || overLimit}
          className="sm:min-w-44"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Languages />}
          {isLoading ? "Translating…" : "Translate"}
        </Button>
      </div>
    </section>
  );
}
