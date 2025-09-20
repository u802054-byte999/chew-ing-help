import React, { useCallback } from 'react';
import type { VocabularyEntry } from '../types';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface VocabularyCardProps {
  entry: VocabularyEntry;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({ entry }) => {
  const handleSpeak = useCallback(() => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(entry.word);
      utterance.lang = 'zh-TW';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('您的瀏覽器不支援語音播放功能。');
    }
  }, [entry.word]);

  const moeDictUrl = `https://dict.concised.moe.edu.tw/search.jsp?md=1&word=${encodeURIComponent(
    entry.word
  )}`;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 transition-shadow hover:shadow-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-bold text-sky-600 dark:text-sky-400">
              {entry.word}
            </h2>
            <a
              href={moeDictUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
              aria-label={`在教育部辭典中查詢「${entry.word}」`}
              title="在教育部辭典中查詢"
            >
              <ExternalLinkIcon className="h-5 w-5" />
            </a>
          </div>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">
            {entry.pronunciation}
          </p>
        </div>
        <button
          onClick={handleSpeak}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-500 dark:hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800 transition-colors"
          aria-label={`播放 ${entry.word} 的發音`}
        >
          <SpeakerIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
            【解釋】
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            {entry.definition}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
            【例句】
          </h3>
          <p className="text-slate-600 dark:text-slate-300 italic">
            「{entry.example}」
          </p>
        </div>
      </div>
    </div>
  );
};
