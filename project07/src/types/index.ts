/**
 * 角色类型
 * 定义剧本中的角色信息
 */
export interface Character {
  id: string;
  name: string;
  description: string;
  dialogueStyle: string;
}

/**
 * 场景类型
 * 定义剧本中的场景信息
 */
export interface Scene {
  id: string;
  description: string;
  location: string;
  time: string;
  atmosphere?: string;
}

/**
 * 对话行类型
 * 定义剧本中的对话信息
 */
export interface DialogueLine {
  characterId: string;
  characterName: string;
  content: string;
  emotion?: string;
}

/**
 * 剧集类型
 * 定义剧本中的单集信息
 */
export interface Episode {
  id?: string;
  episodeNumber: number;
  title: string;
  scenes: Scene[];
  characters: Character[];
  dialogues: DialogueLine[];
  summary: string;
  isTwist?: boolean;
  twistHint?: string;
}

/**
 * 完整剧本类型
 * 定义完整的剧本信息
 */
export interface Script {
  id: string;
  userInput: string;
  title: string;
  episodes: Episode[];
  genre: string;
  createdAt: string;
  totalEpisodes: number;
  twistType: string;
}
