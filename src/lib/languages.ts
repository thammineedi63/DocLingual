export interface Language {
  code: string;
  name: string;
  nativeName: string;
  tesseractCode: string;
  myMemoryCode: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', tesseractCode: 'eng', myMemoryCode: 'en' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', tesseractCode: 'tam', myMemoryCode: 'ta' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', tesseractCode: 'tel', myMemoryCode: 'te' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', tesseractCode: 'hin', myMemoryCode: 'hi' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', tesseractCode: 'ben', myMemoryCode: 'bn' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', tesseractCode: 'mar', myMemoryCode: 'mr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', tesseractCode: 'guj', myMemoryCode: 'gu' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', tesseractCode: 'kan', myMemoryCode: 'kn' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', tesseractCode: 'mal', myMemoryCode: 'ml' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', tesseractCode: 'pan', myMemoryCode: 'pa' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', tesseractCode: 'urd', myMemoryCode: 'ur' },
  { code: 'fr', name: 'French', nativeName: 'Français', tesseractCode: 'fra', myMemoryCode: 'fr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', tesseractCode: 'deu', myMemoryCode: 'de' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', tesseractCode: 'spa', myMemoryCode: 'es' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', tesseractCode: 'ara', myMemoryCode: 'ar' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', tesseractCode: 'chi_sim', myMemoryCode: 'zh-CN' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', tesseractCode: 'jpn', myMemoryCode: 'ja' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', tesseractCode: 'kor', myMemoryCode: 'ko' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', tesseractCode: 'rus', myMemoryCode: 'ru' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', tesseractCode: 'por', myMemoryCode: 'pt' },
];

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(l => l.code === code);
}
