/** Languages offered in the dropdowns. Codes are ISO 639-1 / RFC 3066 codes accepted by MyMemory. */
export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ar", name: "Arabic" },
  { code: "bn", name: "Bengali" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "nl", name: "Dutch" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "gu", name: "Gujarati" },
  { code: "he", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "id", name: "Indonesian" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ms", name: "Malay" },
  { code: "fa", name: "Persian" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  { code: "pa", name: "Punjabi" },
  { code: "ru", name: "Russian" },
  { code: "es", name: "Spanish" },
  { code: "sw", name: "Swahili" },
  { code: "sv", name: "Swedish" },
  { code: "ta", name: "Tamil" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "vi", name: "Vietnamese" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

/** Special source value: let the translation service detect the input language. */
export const AUTO_DETECT = "auto" as const;

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code) as [LanguageCode, ...LanguageCode[]];

/** Languages written right-to-left, so text areas can set dir="rtl". */
const RTL_CODES = new Set<string>(["ar", "he", "iw", "fa", "ur"]);

export function isRtl(code: string | null | undefined): boolean {
  return !!code && RTL_CODES.has(code);
}

/** Normalise codes the API may return (e.g. "iw", "fr-FR") to the codes used in the dropdowns. */
export function normalizeLanguageCode(code: string): string {
  const trimmed = code.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "iw") return "he";
  if (lower === "zh" || lower === "zh-cn") return "zh-CN";
  if (lower === "zh-tw") return "zh-TW";
  // Drop region suffixes for everything else ("fr-FR" -> "fr").
  return lower.split(/[-_]/)[0] ?? lower;
}

export function isSupportedLanguage(code: string): code is LanguageCode {
  return (LANGUAGE_CODES as readonly string[]).includes(code);
}

export function getLanguageName(code: string): string {
  const normalized = normalizeLanguageCode(code);
  return LANGUAGES.find((l) => l.code === normalized)?.name ?? code.toUpperCase();
}
