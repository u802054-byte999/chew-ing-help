
import React from 'react';
import type { VocabularyEntry } from '../types';
import { VocabularyCard } from './VocabularyCard';

interface ResultsDisplayProps {
  results: VocabularyEntry[];
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md">
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">找不到相關詞彙</h3>
        <p className="mt-2 text-slate-500 dark:text-slate-400">請嘗試使用不同的國字或注音組合。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((entry, index) => (
        <VocabularyCard key={index} entry={entry} />
      ))}
    </div>
  );
};
