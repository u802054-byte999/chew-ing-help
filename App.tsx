import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { fetchVocabulary } from './services/geminiService';
import type { VocabularyEntry } from './types';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<string[]>(['', '', '', '']);
  const [results, setResults] = useState<VocabularyEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSubmit = useCallback(async () => {
    if (inputs.every((input) => input.trim() === '')) {
      setError('請至少在一個格子中輸入國字或注音。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);

    try {
      const fetchedVocabulary = await fetchVocabulary(inputs);
      setResults(fetchedVocabulary);
    } catch (err) {
      console.error(err);
      setError('查詢時發生錯誤，請稍後再試或調整您的輸入。');
    } finally {
      setIsLoading(false);
    }
  }, [inputs]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <main className="container mx-auto max-w-3xl p-4 sm:p-6 md:p-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BookOpenIcon className="h-10 w-10 text-sky-500" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              注音詞彙通
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            在格子中輸入國字或注音，自由組合查詢詞彙
          </p>
        </header>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg mb-8">
          <InputForm
            inputs={inputs}
            setInputs={setInputs}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
        
        {error && (
            <div className="text-center p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                {error}
            </div>
        )}

        <div className="mt-8">
          {isLoading ? (
            <Loader />
          ) : hasSearched ? (
            <ResultsDisplay results={results} />
          ) : (
            <div className="text-center py-10 px-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">準備好開始學習了嗎？</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">在上方任一格子中輸入國字或注音，即可開始查詢。</p>
            </div>
          )}
        </div>
      </main>
      <footer className="text-center p-4 mt-8">
        <p className="text-sm text-slate-500 dark:text-slate-500">
            Powered by Google Gemini API
        </p>
      </footer>
    </div>
  );
};

export default App;
