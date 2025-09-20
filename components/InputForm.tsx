import React from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface InputFormProps {
  inputs: string[];
  setInputs: (value: string[]) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({
  inputs,
  setInputs,
  onSubmit,
  isLoading,
}) => {
  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };
  
  const placeHolders = ["例：開", "例：ㄒㄧㄣ", "例：ㄅㄨˋ", "例：ㄧˋ"];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {inputs.map((value, index) => (
          <div key={index}>
            <label htmlFor={`input-${index}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              第 {index + 1} 字 / 音
            </label>
            <input
              id={`input-${index}`}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              placeholder={placeHolders[index]}
              className="w-full px-2 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition text-center text-xl"
              disabled={isLoading}
            />
          </div>
        ))}
      </div>
      <div className="mt-2">
        <button
          onClick={onSubmit}
          disabled={isLoading || inputs.every((input) => input.trim() === '')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 text-lg"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              查詢中...
            </>
          ) : (
            <>
              <SearchIcon className="h-6 w-6" />
              <span>查詢詞彙</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};