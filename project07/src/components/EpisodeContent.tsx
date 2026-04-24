import { useMemo, useState, useEffect, useRef } from 'react';
import { Episode, Scene, Character, DialogueLine } from '../types';

interface EpisodeContentProps {
  episode: Episode;
}

const characterColorMap: Record<string, { bg: string; border: string; text: string; avatar: string }> = {
  default: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', avatar: 'bg-blue-400' },
  0: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', avatar: 'bg-blue-400' },
  1: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', avatar: 'bg-emerald-400' },
  2: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', avatar: 'bg-amber-400' },
  3: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', avatar: 'bg-rose-400' },
  4: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-900', avatar: 'bg-cyan-400' },
  5: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-900', avatar: 'bg-violet-400' },
};

const emotionTags: Record<string, { label: string; bg: string; text: string }> = {
  '惊讶': { label: '惊讶', bg: 'bg-amber-100', text: 'text-amber-700' },
  '愤怒': { label: '愤怒', bg: 'bg-red-100', text: 'text-red-700' },
  '悲伤': { label: '悲伤', bg: 'bg-blue-100', text: 'text-blue-700' },
  '恐惧': { label: '恐惧', bg: 'bg-purple-100', text: 'text-purple-700' },
  '快乐': { label: '快乐', bg: 'bg-green-100', text: 'text-green-700' },
  '平静': { label: '平静', bg: 'bg-slate-100', text: 'text-slate-700' },
  '紧张': { label: '紧张', bg: 'bg-orange-100', text: 'text-orange-700' },
  '困惑': { label: '困惑', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  '感动': { label: '感动', bg: 'bg-pink-100', text: 'text-pink-700' },
  '幸福': { label: '幸福', bg: 'bg-rose-100', text: 'text-rose-700' },
  '调皮': { label: '调皮', bg: 'bg-lime-100', text: 'text-lime-700' },
};

function getCharacterColor(_characterId: string, index: number): typeof characterColorMap.default {
  return characterColorMap[index.toString()] || characterColorMap.default;
}

function getEmotionTag(emotion?: string) {
  if (!emotion) return null;
  return emotionTags[emotion] || { label: emotion, bg: 'bg-slate-100', text: 'text-slate-700' };
}

function Avatar({ character, size = 'md' }: { character: Character; size?: 'sm' | 'md' | 'lg' }) {
  const color = characterColorMap[Math.floor(Math.random() * 6).toString()] || characterColorMap.default;
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className={`${sizeClasses[size]} ${color.avatar} rounded-full flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0 transition-transform duration-200 hover:scale-110`}>
      {character.name.charAt(0)}
    </div>
  );
}

function SceneCard({ scene, delay = 0 }: { scene: Scene; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`bg-slate-50 rounded-xl p-4 border border-slate-200 transition-all duration-500 ease-out hover:shadow-md hover:border-slate-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-105">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 transition-colors duration-200">{scene.location}</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {scene.time}
            </span>
            {scene.atmosphere && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full transition-all duration-200 hover:bg-slate-300">
                {scene.atmosphere}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-2">{scene.description}</p>
        </div>
      </div>
    </div>
  );
}

function CharacterCard({ character, color, delay = 0 }: { character: Character; color: typeof characterColorMap.default; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`${color.bg} ${color.border} border rounded-xl p-3 flex items-center gap-3 min-w-0 transition-all duration-500 ease-out hover:shadow-md hover:scale-[1.02] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <Avatar character={character} size="md" />
      <div className="min-w-0">
        <h4 className={`font-semibold ${color.text} truncate`}>{character.name}</h4>
        <p className={`text-xs ${color.text} opacity-75 truncate`}>{character.description}</p>
      </div>
    </div>
  );
}

function DialogueBubble({
  dialogue,
  characterIndex,
  character,
  delay = 0,
}: {
  dialogue: DialogueLine;
  characterIndex: number;
  character?: Character;
  delay?: number;
}) {
  const color = getCharacterColor(dialogue.characterId, characterIndex);
  const emotionTag = getEmotionTag(dialogue.emotion);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`flex gap-3 transition-all duration-400 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      {character && <Avatar character={character} size="sm" />}
      {!character && (
        <div className={`w-8 h-8 ${color.avatar} rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm flex-shrink-0 transition-transform duration-200 hover:scale-110`}>
          {dialogue.characterName.charAt(0)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-semibold text-sm ${color.text}`}>{dialogue.characterName}</span>
          {emotionTag && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${emotionTag.bg} ${emotionTag.text} transition-all duration-200 hover:scale-105`}
            >
              {emotionTag.label}
            </span>
          )}
        </div>
        <div className={`${color.bg} ${color.border} border rounded-2xl rounded-tl-md p-3 transition-all duration-200 hover:shadow-sm`}>
          <p className={`text-sm ${color.text} leading-relaxed`}>{dialogue.content}</p>
        </div>
      </div>
    </div>
  );
}

export function EpisodeContent({ episode }: EpisodeContentProps) {
  const characterMap = useMemo(() => {
    const map = new Map<string, { char: Character; index: number }>();
    episode.characters.forEach((char, index) => {
      map.set(char.id, { char, index });
    });
    return map;
  }, [episode.characters]);

  const [isContentVisible, setIsContentVisible] = useState(false);
  const [showTwistReveal, setShowTwistReveal] = useState(false);
  const episodeKey = useRef(episode.id || episode.episodeNumber);

  useEffect(() => {
    const currentKey = episode.id || episode.episodeNumber;
    if (episodeKey.current !== currentKey) {
      episodeKey.current = currentKey;
      setIsContentVisible(false);
      setShowTwistReveal(false);
    }

    const timer = setTimeout(() => setIsContentVisible(true), 100);
    return () => clearTimeout(timer);
  }, [episode.id, episode.episodeNumber]);

  useEffect(() => {
    if (episode.isTwist && isContentVisible) {
      const timer = setTimeout(() => setShowTwistReveal(true), 300);
      return () => clearTimeout(timer);
    }
  }, [episode.isTwist, isContentVisible]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div
        className={`p-4 md:p-6 border-b transition-all duration-500 ease-out ${
          episode.isTwist
            ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border-amber-200'
            : 'bg-white border-slate-200'
        } ${isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm font-medium ${
            episode.isTwist ? 'text-amber-600' : 'text-slate-500'
          }`}>
            第 {episode.episodeNumber} 集
          </span>
          {episode.isTwist && (
            <span
              className={`px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-sm transition-all duration-500 ${
                showTwistReveal ? 'animate-glow scale-100 opacity-100' : 'scale-75 opacity-0'
              }`}
            >
              ✦ 反转集
            </span>
          )}
        </div>
        <h1 className={`text-xl md:text-2xl font-bold text-slate-900 transition-all duration-500 ${
          showTwistReveal && episode.isTwist ? 'animate-reveal' : ''
        }`}>
          {episode.title}
        </h1>
        {episode.isTwist && episode.twistHint && (
          <div
            className={`mt-3 p-3 bg-white bg-opacity-70 rounded-lg border border-amber-200 transition-all duration-500 ease-out ${
              showTwistReveal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-amber-700">伏笔提示</p>
                <p className="text-sm text-amber-600 mt-1">{episode.twistHint}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 md:p-6 space-y-6 transition-all duration-500 ${
        isContentVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        {episode.scenes.length > 0 && (
          <section>
            <h2 className={`text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2 transition-all duration-500 ${
              isContentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}>
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              场景
            </h2>
            <div className="space-y-3">
              {episode.scenes.map((scene, index) => (
                <SceneCard key={scene.id} scene={scene} delay={index * 100 + 200} />
              ))}
            </div>
          </section>
        )}

        {episode.characters.length > 0 && (
          <section>
            <h2 className={`text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2 transition-all duration-500 ${
              isContentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`} style={{ transitionDelay: '300ms' }}>
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              本集角色
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {episode.characters.map((char, index) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  color={getCharacterColor(char.id, index)}
                  delay={index * 80 + 400}
                />
              ))}
            </div>
          </section>
        )}

        {episode.dialogues.length > 0 && (
          <section>
            <h2 className={`text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2 transition-all duration-500 ${
              isContentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`} style={{ transitionDelay: '500ms' }}>
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              对话
            </h2>
            <div
              className={`space-y-4 p-4 rounded-xl transition-all duration-500 ${
                episode.isTwist
                  ? 'bg-gradient-to-br from-amber-50/50 to-rose-50/50 border border-amber-200'
                  : 'bg-slate-50'
              } ${showTwistReveal && episode.isTwist ? 'animate-glow' : ''}`}
            >
              {episode.dialogues.map((dialogue, index) => {
                const charData = characterMap.get(dialogue.characterId);
                return (
                  <DialogueBubble
                    key={index}
                    dialogue={dialogue}
                    characterIndex={charData?.index ?? index % 6}
                    character={charData?.char}
                    delay={index * 60 + 600}
                  />
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className={`text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2 transition-all duration-500 ${
            isContentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`} style={{ transitionDelay: '700ms' }}>
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            本集小结
          </h2>
          <div
            className={`p-4 rounded-xl transition-all duration-500 ease-out ${
              episode.isTwist
                ? 'bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 border-2 border-amber-300 shadow-md'
                : 'bg-slate-100 border border-slate-200'
            } ${isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '800ms' }}
          >
            {episode.isTwist && (
              <div className={`flex items-center gap-2 mb-2 transition-all duration-500 ${
                showTwistReveal ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}>
                <span className="text-2xl animate-bounce">✨</span>
                <span className="font-bold text-amber-700">反转揭示</span>
              </div>
            )}
            <p className={`text-sm leading-relaxed ${
              episode.isTwist ? 'text-amber-900' : 'text-slate-700'
            }`}>
              {episode.summary}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default EpisodeContent;
