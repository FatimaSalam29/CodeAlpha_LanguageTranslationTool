import { describe, expect, it, vi } from "vitest";

import { normalizeLanguageCode } from "./languages";
import { buildMyMemoryUrl, decodeEntities, translateWithMyMemory } from "./mymemory";
import { MAX_CHARS, translateInputSchema } from "./translate.schema";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("translation input rules", () => {
  it("allows at most 500 characters (MyMemory free limit)", () => {
    expect(MAX_CHARS).toBe(500);
    const ok = translateInputSchema.safeParse({ text: "a".repeat(500), source: "en", target: "es" });
    const tooLong = translateInputSchema.safeParse({
      text: "a".repeat(501),
      source: "en",
      target: "es",
    });
    expect(ok.success).toBe(true);
    expect(tooLong.success).toBe(false);
  });

  it("rejects empty text", () => {
    expect(translateInputSchema.safeParse({ text: "   ", source: "en", target: "es" }).success).toBe(
      false,
    );
  });

  it("rejects the same source and target language", () => {
    expect(translateInputSchema.safeParse({ text: "hi", source: "fr", target: "fr" }).success).toBe(
      false,
    );
  });
});

describe("MyMemory request", () => {
  it("sends the text and language pair to the MyMemory endpoint", () => {
    const url = new URL(buildMyMemoryUrl({ text: "Hello world", source: "en", target: "ur" }));
    expect(url.origin + url.pathname).toBe("https://api.mymemory.translated.net/get");
    expect(url.searchParams.get("q")).toBe("Hello world");
    expect(url.searchParams.get("langpair")).toBe("en|ur");
  });

  it("uses autodetect when the source is set to detect language", () => {
    const url = new URL(buildMyMemoryUrl({ text: "Bonjour", source: "auto", target: "en" }));
    expect(url.searchParams.get("langpair")).toBe("autodetect|en");
  });
});

describe("MyMemory response handling", () => {
  it("returns the API's translated text and detected language", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        responseData: { translatedText: "C'est&nbsp;ok", detectedLanguage: "fr-FR" },
        responseStatus: 200,
        quotaFinished: false,
      }),
    );
    const result = await translateWithMyMemory(
      { text: "It's ok", source: "auto", target: "fr" },
      { fetchImpl },
    );
    expect(result).toEqual({ ok: true, translatedText: "C'est\u00a0ok", detectedSourceLanguage: "fr" });
  });

  it("surfaces API errors reported in the body", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        responseData: { translatedText: "QUERY LENGTH LIMIT EXCEEDED" },
        responseStatus: "403",
        responseDetails: "QUERY LENGTH LIMIT EXCEEDED",
      }),
    );
    const result = await translateWithMyMemory({ text: "x", source: "en", target: "es" }, { fetchImpl });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Query length limit exceeded");
  });

  it("reports the daily quota instead of showing the warning as a translation", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        responseData: { translatedText: "MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS" },
        responseStatus: 200,
      }),
    );
    const result = await translateWithMyMemory({ text: "x", source: "en", target: "es" }, { fetchImpl });
    expect(result.ok).toBe(false);
  });

  it("reports network failures", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    const result = await translateWithMyMemory({ text: "x", source: "en", target: "es" }, { fetchImpl });
    expect(result.ok).toBe(false);
  });
});

describe("helpers", () => {
  it("decodes HTML entities", () => {
    expect(decodeEntities("&quot;a&quot; &amp; &#39;b&#39; &#x263A;")).toBe("\"a\" & 'b' \u263a");
  });

  it("normalises returned language codes", () => {
    expect(normalizeLanguageCode("iw")).toBe("he");
    expect(normalizeLanguageCode("zh-TW")).toBe("zh-TW");
    expect(normalizeLanguageCode("es-ES")).toBe("es");
  });
});
