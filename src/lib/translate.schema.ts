import { z } from "zod";

import { AUTO_DETECT, LANGUAGE_CODES } from "./languages";

/** MyMemory's free API accepts at most 500 characters per request. */
export const MAX_CHARS = 500;

export const translateInputSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1, "Enter some text to translate.")
      .max(MAX_CHARS, `Text must be ${MAX_CHARS.toLocaleString()} characters or fewer.`),
    source: z.union([z.literal(AUTO_DETECT), z.enum(LANGUAGE_CODES)]),
    target: z.enum(LANGUAGE_CODES),
  })
  .refine((d) => d.source !== d.target, {
    message: "Choose two different languages.",
    path: ["target"],
  });

export type TranslateInput = z.infer<typeof translateInputSchema>;

export type TranslateResult =
  | { ok: true; translatedText: string; detectedSourceLanguage: string | null }
  | { ok: false; error: string };
