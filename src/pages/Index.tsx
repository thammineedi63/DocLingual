import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Languages, BookOpen, Sparkles, Scan, Globe, ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import FileUploadZone from '@/components/FileUploadZone';
import LanguageSelector from '@/components/LanguageSelector';
import ProcessingProgress from '@/components/ProcessingProgress';
import OutputPanel from '@/components/OutputPanel';
import { Button } from '@/components/ui/button';
import { extractText } from '@/lib/extractText';
import { translateText, detectLanguage, type DetectionResult } from '@/lib/translate';
import { summarizeText } from '@/lib/summarize';
import { getLanguageByCode } from '@/lib/languages';
import { toast } from 'sonner';

interface ProcessingState {
  stage: string;
  progress: number;
}

export default function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState('hi');
  const [processing, setProcessing] = useState<ProcessingState | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceSummary, setSourceSummary] = useState('');
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [extractionMethod, setExtractionMethod] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const clearResults = useCallback(() => {
    setExtractedText('');
    setTranslatedText('');
    setSourceSummary('');
    setTranslatedSummary('');
    setDetection(null);
    setExtractionMethod('');
    setHasResults(false);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!file) return;
    clearResults();

    try {
      // Step 1: Extract text with multiple OCR langs for scanned docs
      setProcessing({ stage: 'Extracting text from document...', progress: 0.05 });

      const result = await extractText(
        file,
        ['eng', 'hin', 'tam', 'tel', 'fra', 'deu', 'spa', 'ara', 'rus', 'jpn', 'kor', 'chi_sim'],
        (stage, progress) => {
          setProcessing({ stage, progress: progress * 0.35 });
        }
      );

      if (!result.text) {
        toast.error('No text could be extracted from the document');
        setProcessing(null);
        return;
      }

      setExtractedText(result.text);
      setExtractionMethod(result.method === 'ocr' ? 'OCR (Scanned)' : 'Digital');

      // Step 2: Auto-detect source language
      setProcessing({ stage: 'Auto-detecting source language...', progress: 0.4 });
      const detected = await detectLanguage(result.text);
      setDetection(detected);

      // Step 3: Translate (source → target)
      setProcessing({ stage: `Translating from ${detected.langName}...`, progress: 0.5 });
      setIsTranslating(true);
      const tgtLangCode = getLanguageByCode(targetLang)?.myMemoryCode || targetLang;
      const translated = await translateText(result.text, detected.langCode, tgtLangCode);
      setTranslatedText(translated);
      setIsTranslating(false);

      // Step 4: Summarize
      setProcessing({ stage: 'Generating summary...', progress: 0.8 });
      setIsSummarizing(true);
      const summary = summarizeText(result.text, 5);
      setSourceSummary(summary);

      // Translate summary
      setProcessing({ stage: 'Translating summary...', progress: 0.9 });
      const translatedSum = await translateText(summary, detected.langCode, tgtLangCode);
      setTranslatedSummary(translatedSum);
      setIsSummarizing(false);

      setProcessing(null);
      setHasResults(true);
      toast.success('Document analyzed successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Processing failed');
      setProcessing(null);
      setIsTranslating(false);
      setIsSummarizing(false);
    }
  }, [file, targetLang, clearResults]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Globe className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-foreground tracking-tight">DocLingual</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">Multilingual Document Analysis</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Auto-detect</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> 20+ Languages</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> OCR Support</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Upload + Settings Row */}
        <div className="glass-card-elevated p-5 mb-6">
          <div className="grid md:grid-cols-[1fr_280px] gap-5">
            {/* Upload */}
            <div className="space-y-3">
              <h2 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Document
              </h2>
              <FileUploadZone
                file={file}
                onFileSelect={(f) => { setFile(f); clearResults(); }}
                onClear={() => { setFile(null); clearResults(); }}
              />
            </div>

            {/* Settings */}
            <div className="space-y-4 md:border-l md:border-border md:pl-5">
              {/* Detected language display */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Scan className="w-4 h-4 text-primary" />
                  Source Language
                </label>
                <div className="h-10 px-3 rounded-md border border-border bg-muted/50 flex items-center gap-2 text-sm">
                  {detection ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="font-medium text-foreground">{detection.langName}</span>
                      <span className="text-muted-foreground text-xs">(auto-detected)</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Will be auto-detected</span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90 md:rotate-0" />
              </div>

              <LanguageSelector label="Target Language" value={targetLang} onChange={setTargetLang} />

              <Button
                onClick={handleProcess}
                disabled={!file || !!processing}
                className="w-full font-display font-semibold h-11"
                style={!processing && file ? { background: 'var(--gradient-primary)' } : undefined}
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Analyze Document
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <AnimatePresence>
          {processing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="glass-card p-5">
                <ProcessingProgress stage={processing.stage} progress={processing.progress} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Translation direction indicator */}
        {detection && hasResults && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <span className="status-badge-success">{detection.langName}</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="status-badge-processing">{getLanguageByCode(targetLang)?.name}</span>
          </motion.div>
        )}

        {/* Output panels */}
        <div className="grid md:grid-cols-2 gap-5">
          <OutputPanel
            title="Extracted Text"
            content={extractedText}
            icon={<FileText className="w-4 h-4 text-primary" />}
            badge={extractionMethod || undefined}
          />
          <OutputPanel
            title="Translated Text"
            content={translatedText}
            icon={<Languages className="w-4 h-4 text-accent" />}
            loading={isTranslating}
            loadingText="Translating document..."
            badge={translatedText ? getLanguageByCode(targetLang)?.name : undefined}
          />
          <OutputPanel
            title="Summary (Original)"
            content={sourceSummary}
            icon={<Sparkles className="w-4 h-4 text-primary" />}
            loading={isSummarizing}
            loadingText="Generating summary..."
            badge={detection?.langName}
          />
          <OutputPanel
            title="Summary (Translated)"
            content={translatedSummary}
            icon={<BookOpen className="w-4 h-4 text-accent" />}
            loading={isSummarizing}
            loadingText="Translating summary..."
            badge={translatedSummary ? getLanguageByCode(targetLang)?.name : undefined}
          />
        </div>
      </main>

      <footer className="border-t border-border mt-12 py-5 text-center text-[11px] text-muted-foreground">
        DocLingual — Auto-detects source language · Translates between 20+ international languages · OCR for scanned documents
      </footer>
    </div>
  );
}
