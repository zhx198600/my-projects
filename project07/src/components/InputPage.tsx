import React, { useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../context';

interface InputPageProps {
  onGenerate?: (userInput: string) => void;
  isLoading?: boolean;
}

const MAX_CHARS = 500;
const MIN_CHARS = 10;

export function InputPage(props: InputPageProps = {}) {
  const context = useAppContext();
  
  const onGenerate = props.onGenerate ?? context.startGenerate;
  const isLoading = props.isLoading ?? context.isGenerating;

  const [input, setInput] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setInput(value);
    }
  }, []);

  const handleGenerate = useCallback(() => {
    if (input.length >= MIN_CHARS && input.length <= MAX_CHARS && !isLoading) {
      onGenerate(input);
    }
  }, [input, isLoading, onGenerate]);

  const charCount = input.length;
  const isTooShort = charCount < MIN_CHARS;
  const isMaxLength = charCount === MAX_CHARS;
  const isButtonDisabled = isTooShort || isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div
          className={`text-center mb-10 transition-all duration-500 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            创意剧本生成器
          </h1>
          <p className="text-base md:text-lg text-slate-500">
            输入你的想法，让AI帮你创作
          </p>
        </div>

        <div
          className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 transition-all duration-500 ease-out animate-delay-100 ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ animationDelay: '100ms' }}
        >
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              描述你的创意
            </label>
            <textarea
              value={input}
              onChange={handleChange}
              placeholder="例如：一个关于时间旅行的悬疑故事，主角发现自己被困在同一天..."
              className="w-full min-h-40 md:min-h-48 p-4 border-2 border-slate-200 rounded-xl resize-y
                focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                text-slate-800 placeholder-slate-400 transition-all duration-200 touch-manipulation
                focus:scale-[1.01] focus:shadow-lg hover:border-slate-300"
              disabled={isLoading}
            />
            <div className="flex justify-end mt-2">
              <span
                className={`text-sm font-medium transition-all duration-300 ${
                  isMaxLength ? 'text-red-500 scale-105' : 'text-slate-400'
                }`}
              >
                {charCount} / {MAX_CHARS}
              </span>
            </div>
          </div>

          <div className="mt-4 min-h-6">
            {isTooShort && !isLoading && (
              <p className="text-sm text-amber-600 flex items-center gap-1 animate-fadeIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                请输入至少{MIN_CHARS}个字的创意
              </p>
            )}
            {isMaxLength && (
              <p className="text-sm text-red-500 flex items-center gap-1 animate-fadeIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                已达到字数上限{MAX_CHARS}字
              </p>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={isButtonDisabled}
              className={`w-full min-h-12 px-6 rounded-xl font-semibold text-lg transition-all duration-200
                flex items-center justify-center gap-2 touch-manipulation will-change-transform
                ${isButtonDisabled
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-blue-500 active:shadow-md active:translate-y-0 active:bg-blue-700'
                }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spinSmooth h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  生成中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  生成剧本
                </>
              )}
            </button>
          </div>
        </div>

        <p
          className={`text-center text-sm text-slate-400 mt-6 transition-all duration-500 ease-out ${
            isMounted ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          提示：描述得越详细，生成的剧本越精彩
        </p>
      </div>
    </div>
  );
}

export default InputPage;
