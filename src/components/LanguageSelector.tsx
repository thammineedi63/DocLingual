import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  excludeCode?: string;
}

export default function LanguageSelector({ label, value, onChange, excludeCode }: LanguageSelectorProps) {
  const langs = excludeCode
    ? SUPPORTED_LANGUAGES.filter(l => l.code !== excludeCode)
    : SUPPORTED_LANGUAGES;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Languages className="w-4 h-4 text-primary" />
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-card border-border">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {langs.map(lang => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.name}</span>
                <span className="text-muted-foreground text-xs">({lang.nativeName})</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
