// Extractive summarization (runs entirely in browser, no API needed)

export function summarizeText(text: string, maxSentences: number = 5): string {
  if (!text.trim()) return '';

  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?।])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  if (sentences.length <= maxSentences) {
    return sentences.join(' ');
  }

  // Score sentences by word frequency
  const wordFreq: Record<string, number> = {};
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but', 'with', 'this', 'that', 'it', 'as', 'by', 'from', 'be', 'has', 'have', 'had', 'not', 'will', 'can', 'do', 'does', 'did', 'would', 'could', 'should', 'may', 'might']);

  for (const w of words) {
    if (w.length > 2 && !stopWords.has(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }

  // Score each sentence
  const scored = sentences.map((sentence, index) => {
    const sentWords = sentence.toLowerCase().split(/\s+/);
    let score = 0;
    for (const w of sentWords) {
      score += wordFreq[w] || 0;
    }
    // Normalize by length
    score = score / Math.max(sentWords.length, 1);
    // Boost early sentences
    if (index < 3) score *= 1.5;
    return { sentence, score, index };
  });

  // Pick top sentences, maintain order
  const selected = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index);

  return selected.map(s => s.sentence).join(' ');
}
