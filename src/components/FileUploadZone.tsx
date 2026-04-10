import { useCallback, useState } from 'react';
import { Upload, FileText, Image, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  file: File | null;
  onClear: () => void;
}

const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.webp'];

export default function FileUploadZone({ onFileSelect, file, onClear }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const validate = useCallback((f: File) => {
    setError('');
    if (f.size > MAX_SIZE) { setError('File too large (max 20MB)'); return false; }
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) { setError('Unsupported file type'); return false; }
    return true;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && validate(f)) onFileSelect(f);
  }, [onFileSelect, validate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validate(f)) onFileSelect(f);
  }, [onFileSelect, validate]);

  const icon = file?.type.startsWith('image/') ? Image : FileText;
  const IconComponent = icon;

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.label
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`upload-zone flex flex-col items-center justify-center gap-3 p-10 ${isDragging ? 'upload-zone-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-foreground">Drop your document here</p>
              <p className="text-sm text-muted-foreground mt-1">PDF, DOCX, TXT, or image files up to 20MB</p>
            </div>
            <input type="file" className="hidden" accept={ACCEPTED.join(',')} onChange={handleChange} />
          </motion.label>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · {file.type || 'unknown'}</p>
            </div>
            <button onClick={onClear} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
