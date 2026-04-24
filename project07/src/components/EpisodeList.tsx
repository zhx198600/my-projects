import { Episode } from '../types';

interface EpisodeListProps {
  episodes: Episode[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function EpisodeList({ episodes, currentIndex, onSelect }: EpisodeListProps) {
  return (
    <>
      <div className="hidden md:flex md:flex-col md:w-64 md:bg-slate-50 md:border-r border-slate-200 md:overflow-y-auto">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">剧集列表</h2>
          <p className="text-sm text-slate-500">{episodes.length} 集</p>
        </div>
        <nav className="flex-1 p-2">
          {episodes.map((episode, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-all duration-200 group min-h-11 touch-manipulation
                ${index === currentIndex
                  ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm'
                  : 'hover:bg-slate-100 border-l-4 border-transparent'
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      index === currentIndex ? 'text-blue-600' : 'text-slate-500'
                    }`}>
                      第 {episode.episodeNumber} 集
                    </span>
                    {episode.isTwist && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full">
                        反转
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 line-clamp-2 ${
                    index === currentIndex ? 'text-slate-900 font-medium' : 'text-slate-700'
                  }`}>
                    {episode.title}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 mt-1 transition-transform duration-200 ${
                    index === currentIndex ? 'opacity-100 text-blue-500' : 'opacity-0 group-hover:opacity-50 text-slate-400'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="md:hidden">
        <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-medium text-slate-800">
              第 {episodes[currentIndex].episodeNumber} 集
            </h2>
            <p className="text-xs text-slate-500">{episodes[currentIndex].title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className={`p-2 rounded-lg transition-colors min-h-11 touch-manipulation
                ${currentIndex === 0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm text-slate-500">
              {currentIndex + 1} / {episodes.length}
            </span>
            <button
              onClick={() => onSelect(Math.min(episodes.length - 1, currentIndex + 1))}
              disabled={currentIndex === episodes.length - 1}
              className={`p-2 rounded-lg transition-colors min-h-11 touch-manipulation
                ${currentIndex === episodes.length - 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-1.5 p-3 bg-white border-b border-slate-200 overflow-x-auto">
          {episodes.map((episode, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`flex-shrink-0 min-w-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 min-h-10 touch-manipulation
                ${index === currentIndex
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
                ${episode.isTwist ? 'ring-2 ring-amber-300' : ''}`}
            >
              <span className="truncate block">
                {episode.episodeNumber}
                {episode.isTwist && <span className="ml-1">✦</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default EpisodeList;
