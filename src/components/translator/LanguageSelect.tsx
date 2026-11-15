import { Sparkles } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AUTO_DETECT, LANGUAGES, getLanguageName } from "@/lib/languages";

interface LanguageSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowAutoDetect?: boolean;
  detectedLanguage?: string | null;
  disabled?: boolean;
}

export function LanguageSelect({
  id,
  label,
  value,
  onChange,
  allowAutoDetect = false,
  detectedLanguage,
  disabled,
}: LanguageSelectProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <label
        htmlFor={id}
        className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
      >
        {label}
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled ?? false}>
        <SelectTrigger
          id={id}
          className="h-12 rounded-xl border-border bg-card px-3 text-[15px] sm:px-4 font-medium shadow-none transition-all hover:border-ring/50 focus:ring-0 focus:shadow-glow data-[state=open]:border-ring/60 data-[state=open]:shadow-glow"
        >
          <SelectValue>
            {value === AUTO_DETECT ? (
              <span className="flex min-w-0 items-center gap-2">
                <Sparkles className="size-4 shrink-0 text-primary" />
                <span className="truncate">
                  {detectedLanguage
                    ? `Detected: ${getLanguageName(detectedLanguage)}`
                    : "Detect language"}
                </span>
              </span>
            ) : (
              getLanguageName(value)
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-80 rounded-xl border-border shadow-card">
          {allowAutoDetect && (
            <>
              <SelectItem value={AUTO_DETECT} className="rounded-lg py-2">
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Detect language
                </span>
              </SelectItem>
              <SelectSeparator />
            </>
          )}
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="rounded-lg py-2">
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
