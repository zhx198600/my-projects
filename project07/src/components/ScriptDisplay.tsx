import { useState, useEffect, useCallback } from 'react';
import { Script } from '../types';
import { useAppContext } from '../context';
import { EpisodeList } from './EpisodeList';
import { EpisodeContent } from './EpisodeContent';
import { exportScriptAsTxt, copyScriptToClipboard } from '../utils';
import { useLocalStorage } from '../hooks';

interface ScriptDisplayProps {
  script?: Script;
  onBack?: () => void;
  onRegenerate?: () => void;
}

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export function ScriptDisplay(props: ScriptDisplayProps = {}) {
  const context = useAppContext();

  const script = props.script ?? context.currentScript;
  const onBack = props.onBack ?? context.goToInputPage;
  const onRegenerate = props.onRegenerate ?? context.regenerate;

  const [isMounted, setIsMounted] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });
  const [savedScripts, setSavedScripts] = useLocalStorage<Script[]>('saved-scripts', []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!script) return;
    try {
      const success = await copyScriptToClipboard(script);
      if (success) {
        showToast('已复制到剪贴板', 'success');
      } else {
        showToast('复制失败，请重试', 'error');
      }
    } catch {
      showToast('复制失败，请重试', 'error');
    }
  }, [script, showToast]);

  const handleSave = useCallback(() => {
    if (!script) return;
    try {
      const isAlreadySaved = savedScripts.some((s) => s.id === script.id);
      if (isAlreadySaved) {
        showToast('该剧本已保存过', 'info');
        return;
      }
      setSavedScripts([...savedScripts, script]);
      showToast('已保存到本地', 'success');
    } catch {
      showToast('保存失败，请重试', 'error');
    }
  }, [script, savedScripts, setSavedScripts, showToast]);

  const handleExport = useCallback(() => {
    if (!script) return;
    try {
      exportScriptAsTxt(script);
      showToast('已开始下载', 'success');
    } catch {
      showToast('导出失败，请重试', 'error');
    }
  }, [script, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!script) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div
          className={`text-center transition-all duration-500 ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <svg
            className="w-16 h-16 mx-auto text-slate-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-slate-500 text-lg">暂无剧本内容</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);

  const currentEpisode = script.episodes[currentEpisodeIndex];
  const hasTwist = script.episodes.some((ep) => ep.isTwist);

  const toastBgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }[toast.type];

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col transition-opacity duration-500 ${
        isMounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {toast.visible && (
        <div
          className={`fixed top-4 right-4 z-50 ${toastBgColor} text-white px-6 py-3 rounded-lg shadow-lg animate-slideDown flex items-center gap-2`}
        >
          {toast.type === 'success' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.type === 'info' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <header
        className={`bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 transition-all duration-500 ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 flex-shrink-0 min-h-11 touch-manipulation hover:shadow-sm"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="hidden sm:inline">返回首页</span>
              </button>

              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">
                  {script.title}
                </h1>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-slate-500">{script.genre}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">{script.totalEpisodes} 集</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">{script.twistType}</span>
                  {hasTwist && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                        含反转
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200 hidden sm:block min-h-11 touch-manipulation hover:shadow-sm"
                title="复制剧本"
              >
                <svg
                  className="w-5 h-5 transition-transform duration-200 hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <button
                onClick={handleSave}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200 hidden sm:block min-h-11 touch-manipulation hover:shadow-sm"
                title="保存"
              >
                <svg
                  className="w-5 h-5 transition-transform duration-200 hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>

              <button
                onClick={handleExport}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200 hidden sm:block min-h-11 touch-manipulation hover:shadow-sm"
                title="导出"
              >
                <svg
                  className="w-5 h-5 transition-transform duration-200 hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>

              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 min-h-11 touch-manipulation hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-300 hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="hidden sm:inline">重新生成</span>
              </button>
            </div>
          </div>

          {script.userInput && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <div>
                  <p className="text-xs text-blue-600 font-medium mb-1">您的创意输入：</p>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    "{script.userInput}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main
        className={`flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full bg-white shadow-lg overflow-hidden transition-all duration-500 animate-delay-200 ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <EpisodeList
          episodes={script.episodes}
          currentIndex={currentEpisodeIndex}
          onSelect={setCurrentEpisodeIndex}
        />

        <div className="flex-1 flex flex-col min-h-0">
          {currentEpisode ? (
            <EpisodeContent episode={currentEpisode} />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto text-slate-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-slate-500">暂无剧集内容</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer
        className={`md:hidden bg-white border-t border-slate-200 sticky bottom-0 z-40 min-h-14 transition-all duration-500 animate-delay-300 ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex justify-around items-stretch">
          <button
            onClick={onBack}
            className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-slate-500 hover:text-slate-700 transition-all duration-200 flex-1 min-h-11 touch-manipulation hover:bg-slate-50"
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs">首页</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-slate-500 hover:text-slate-700 transition-all duration-200 flex-1 min-h-11 touch-manipulation hover:bg-slate-50"
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs">复制</span>
          </button>

          <button
            onClick={handleSave}
            className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-slate-500 hover:text-slate-700 transition-all duration-200 flex-1 min-h-11 touch-manipulation hover:bg-slate-50"
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <span className="text-xs">保存</span>
          </button>

          <button
            onClick={onRegenerate}
            className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-blue-600 hover:text-blue-700 transition-all duration-200 flex-1 min-h-11 touch-manipulation hover:bg-blue-50"
          >
            <svg
              className="w-5 h-5 transition-transform duration-300 hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-xs">再生</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default ScriptDisplay;
