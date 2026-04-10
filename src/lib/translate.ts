// Using MyMemory Translation API (free, supports many languages including Indian languages)

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  if (sourceLang === targetLang) return text;
  if (!text.trim()) return '';

  const chunks = splitIntoChunks(text, 400);
  const results: string[] = [];

  for (const chunk of chunks) {
    const encoded = encodeURIComponent(chunk);
    const langpair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=${langpair}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        results.push(data.responseData.translatedText);
      } else if (typeof data.responseStatus === 'string' && data.responseStatus === '403') {
        // "PLEASE SELECT TWO DISTINCT LANGUAGES" — same lang detected
        results.push(chunk);
      } else {
        results.push(chunk);
      }
    } catch {
      results.push(chunk);
    }

    await new Promise(r => setTimeout(r, 300));
  }

  return results.join(' ');
}

function splitIntoChunks(text: string, maxLength: number): string[] {
  const sentences = text.split(/(?<=[.!?।\n])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (current.length + sentence.length > maxLength && current) {
      chunks.push(current.trim());
      current = '';
    }
    current += sentence + ' ';
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.length ? chunks : [text];
}

export interface DetectionResult {
  langCode: string;
  langName: string;
  confidence: number;
}

export async function detectLanguage(text: string): Promise<DetectionResult> {
  const sample = text.slice(0, 300);
  const encoded = encodeURIComponent(sample);

  try {
    // Use a dummy target that's unlikely to be the source
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=autodetect|en`;
    const response = await fetch(url);
    const data = await response.json();

    // Check matches for detected language
    if (data.matches && data.matches.length > 0) {
      const source = data.matches[0].source;
      if (source) {
        // source is like "en-GB", "fr-FR", "hi-IN" — extract base code
        const baseCode = source.split('-')[0].toLowerCase();
        return {
          langCode: baseCode,
          langName: getLanguageNameFromCode(baseCode),
          confidence: data.matches[0].match || 0,
        };
      }
    }

    if (data.responseData?.detectedLanguage) {
      const code = data.responseData.detectedLanguage.toLowerCase();
      return { langCode: code, langName: getLanguageNameFromCode(code), confidence: 0.5 };
    }
  } catch {
    // ignore
  }

  return { langCode: 'en', langName: 'English', confidence: 0 };
}

const LANG_NAMES: Record<string, string> = {
  en: 'English', ta: 'Tamil', te: 'Telugu', hi: 'Hindi', bn: 'Bengali',
  mr: 'Marathi', gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', pa: 'Punjabi',
  ur: 'Urdu', fr: 'French', de: 'German', es: 'Spanish', ar: 'Arabic',
  zh: 'Chinese', ja: 'Japanese', ko: 'Korean', ru: 'Russian', pt: 'Portuguese',
  it: 'Italian', nl: 'Dutch', pl: 'Polish', sv: 'Swedish', tr: 'Turkish',
  vi: 'Vietnamese', th: 'Thai', id: 'Indonesian', ms: 'Malay', fi: 'Finnish',
  da: 'Danish', no: 'Norwegian', cs: 'Czech', ro: 'Romanian', hu: 'Hungarian',
  el: 'Greek', he: 'Hebrew', uk: 'Ukrainian', bg: 'Bulgarian', hr: 'Croatian',
  sk: 'Slovak', sl: 'Slovenian', lt: 'Lithuanian', lv: 'Latvian', et: 'Estonian',
  sr: 'Serbian', ca: 'Catalan', ga: 'Irish', cy: 'Welsh', sw: 'Swahili',
  af: 'Afrikaans', ne: 'Nepali', si: 'Sinhala', km: 'Khmer', lo: 'Lao',
  my: 'Myanmar', am: 'Amharic', ka: 'Georgian', az: 'Azerbaijani', uz: 'Uzbek',
  kk: 'Kazakh', mn: 'Mongolian', tg: 'Tajik', ky: 'Kyrgyz',
};

function getLanguageNameFromCode(code: string): string {
  return LANG_NAMES[code] || code.toUpperCase();
}
