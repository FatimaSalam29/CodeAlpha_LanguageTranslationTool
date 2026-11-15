import { AUTO_DETECT, normalizeLanguageCode } from "./languages";
import type { TranslateInput, TranslateResult } from "./translate.schema";

/** Public MyMemory endpoint. Free, keyless and CORS-enabled, so it is called straight from the browser. */
export const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";

interface MyMemoryResponse {
  responseData?: { translatedText?: string; detectedLanguage?: string | null } | null;
  responseStatus?: number | string;
  responseDetails?: string;
  quotaFinished?: boolean | null;
}

export function buildMyMemoryUrl(input: TranslateInput): string {
  const source = input.source === AUTO_DETECT ? "autodetect" : input.source;
  const params = new URLSearchParams({ q: input.text, langpair: `${source}|${input.target}` });
  return `${MYMEMORY_ENDPOINT}?${params.toString()}`;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
};

/** MyMemory sometimes returns HTML entities (e.g. &nbsp; &#39;) inside plain-text translations. */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code =
        entity[1] === "x" || entity[1] === "X"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

const QUOTA_MESSAGE =
  "The free daily translation limit has been reached for your network. Please try again later.";

function describeServiceError(status: number, details: string | undefined): string {
  if (status === 429) return QUOTA_MESSAGE;
  const clean = (details ?? "").trim();
  if (!clean) return `The translation service returned an error (${status}). Please try again.`;
  // MyMemory reports errors in upper case; turn them into a readable sentence.
  const sentence = clean.charAt(0) + clean.slice(1).toLowerCase();
  return `The translation service couldn't process this request: ${sentence}`;
}

/**
 * Translate text with the MyMemory API.
 * Never fabricates output: every success comes from the API response.
 */
export async function translateWithMyMemory(
  input: TranslateInput,
  options: { signal?: AbortSignal; fetchImpl?: typeof fetch } = {},
): Promise<TranslateResult> {
  const fetchImpl = options.fetchImpl ?? fetch;

  let response: Response;
  try {
    response = await fetchImpl(
      buildMyMemoryUrl(input),
      options.signal ? { signal: options.signal } : undefined,
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return {
      ok: false,
      error: "Couldn't reach the translation service. Check your internet connection and try again.",
    };
  }

  if (response.status === 429) return { ok: false, error: QUOTA_MESSAGE };
  if (!response.ok) {
    return {
      ok: false,
      error: `The translation service is unavailable right now (error ${response.status}). Please try again shortly.`,
    };
  }

  let data: MyMemoryResponse;
  try {
    data = (await response.json()) as MyMemoryResponse;
  } catch {
    return { ok: false, error: "The translation service sent an unreadable response. Please try again." };
  }

  const status = Number(data.responseStatus);
  if (data.quotaFinished === true) return { ok: false, error: QUOTA_MESSAGE };
  if (status !== 200) return { ok: false, error: describeServiceError(status, data.responseDetails) };

  const translated = data.responseData?.translatedText;
  if (!translated || !translated.trim()) {
    return { ok: false, error: "The translation service returned an empty result. Please try again." };
  }
  if (/^MYMEMORY WARNING/i.test(translated)) return { ok: false, error: QUOTA_MESSAGE };

  const detected = data.responseData?.detectedLanguage;
  return {
    ok: true,
    translatedText: decodeEntities(translated),
    detectedSourceLanguage: detected ? normalizeLanguageCode(detected) : null,
  };
}
