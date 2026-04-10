import { motion } from 'framer-motion';

interface ProcessingProgressProps {
  stage: string;
  progress: number;
}

export default function ProcessingProgress({ stage, progress }: ProcessingProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{stage}</span>
        <span className="font-medium text-primary">{Math.round(progress * 100)}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--gradient-primary)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
