import { Copy, Check, Download } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface OutputPanelProps {
  title: string;
  content: string;
  icon: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  badge?: string;
}

export default function OutputPanel({ title, content, icon, loading, loadingText, badge }: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="output-panel"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-display font-semibold text-foreground text-sm">{title}</h3>
          {badge && <span className="status-badge-success">{badge}</span>}
        </div>
        {content && (
          <div className="flex items-center gap-1">
            <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button onClick={handleDownload} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-6">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">{loadingText || 'Processing...'}</span>
        </div>
      ) : content ? (
        <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      ) : (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No content yet. Upload a document and process it.
        </div>
      )}
    </motion.div>
  );
}
