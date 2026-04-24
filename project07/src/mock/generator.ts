import { Script } from '../types';
import { scriptTemplates } from './templates';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

class SeededRandom {
  private seed: number;
  private lastUsedIndex: Map<string, number> = new Map();

  constructor(seed?: string) {
    if (seed) {
      this.seed = simpleHash(seed);
    } else {
      this.seed = Date.now();
    }
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pickFromArray<T>(arr: T[], category?: string): T {
    if (arr.length === 0) {
      throw new Error('Array is empty');
    }
    
    let index: number;
    if (category) {
      const lastIndex = this.lastUsedIndex.get(category) ?? -1;
      do {
        index = this.nextInt(0, arr.length - 1);
      } while (arr.length > 1 && index === lastIndex);
      this.lastUsedIndex.set(category, index);
    } else {
      index = this.nextInt(0, arr.length - 1);
    }
    
    return arr[index];
  }
}

const globalRandom = new SeededRandom();

function matchGenre(userInput: string): string {
  const input = userInput.toLowerCase();
  
  const genreKeywords: Record<string, string[]> = {
    '悬疑': ['悬疑', '推理', '侦探', '破案', '犯罪', '凶手', '真相', '谋杀', '谜团', '解密'],
    '爱情': ['爱情', '恋爱', '都市', '邂逅', '缘分', '相爱', '分手', '复合', '甜蜜', '浪漫'],
    '科幻': ['科幻', '未来', '太空', '人工智能', '机器人', '穿越', '时空', '宇宙', '星际', '科技'],
    '喜剧': ['喜剧', '搞笑', '轻松', '幽默', '欢乐', '有趣', '爆笑', '恶搞', '乌龙'],
    '职场': ['职场', '励志', '奋斗', '创业', '工作', '晋升', '梦想', '拼搏', '逆袭'],
    '奇幻': ['奇幻', '冒险', '魔法', '龙', '精灵', '巫师', '神话', '传说', '剑', '勇士', '勇者', '魔王'],
    '恐怖': ['恐怖', '惊悚', '鬼', '幽灵', '灵异', '诅咒', '噩梦', '恐惧', '闹鬼', '吓人'],
    '历史': ['历史', '古装', '古代', '宫廷', '皇帝', '王朝', '朝代', '古风', '古代剧'],
    '家庭': ['家庭', '亲情', '家人', '父母', '子女', '父女', '母女', '父子', '母子', '家人']
  };
  
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    for (const keyword of keywords) {
      if (input.includes(keyword)) {
        return genre;
      }
    }
  }
  
  const genres = Object.keys(genreKeywords);
  return genres[Math.floor(Math.random() * genres.length)];
}

interface KeywordMapping {
  keywords: string[];
  names: { male: string[]; female: string[]; neutral: string[] };
  descriptions: string[];
}

const keywordMappings: KeywordMapping[] = [
  {
    keywords: ['厨师', '料理', '厨房', '做菜', '餐厅'],
    names: {
      male: ['陈大厨', '王师傅', '李主厨', '张一刀', '刘百味'],
      female: ['林小厨', '周美味', '吴佳肴', '郑香兰', '孙大厨'],
      neutral: ['厨艺大师', '美味创造者', '料理达人']
    },
    descriptions: ['技艺精湛的厨师，对料理充满热情', '米其林三星主厨，追求完美的味道', '热爱烹饪的厨师，相信食物能传递温暖']
  },
  {
    keywords: ['医生', '医院', '手术', '护士', '治疗', '诊所'],
    names: {
      male: ['张医生', '李大夫', '王医师', '陈教授', '刘主任'],
      female: ['林医生', '周大夫', '吴医师', '郑护士长', '孙医生'],
      neutral: ['白衣天使', '生命守护者', '医者仁心']
    },
    descriptions: ['医术高明的医生，以救死扶伤为己任', '经验丰富的医师，见过无数生死', '热爱本职工作的医护人员，相信医学的力量']
  },
  {
    keywords: ['警察', '警探', '刑警', '侦探', '破案', '案件', '法医'],
    names: {
      male: ['李警官', '王警探', '张刑警', '陈队长', '刘神探'],
      female: ['林警官', '周警探', '吴刑警', '郑探长', '孙警官'],
      neutral: ['正义使者', '真相追寻者', '罪恶克星']
    },
    descriptions: ['经验丰富的警官，以追求真相为己任', '敏锐的侦探，擅长从细微处发现线索', '坚守正义的执法者，相信法网恢恢疏而不漏']
  },
  {
    keywords: ['教师', '老师', '学校', '教育', '学生', '课堂', '教授'],
    names: {
      male: ['王老师', '李教授', '张讲师', '陈导师', '刘教员'],
      female: ['林老师', '周教授', '吴讲师', '郑导师', '孙老师'],
      neutral: ['灵魂工程师', '知识传播者', '人生引路人']
    },
    descriptions: ['热爱教育事业的教师，相信知识改变命运', '经验丰富的导师，善于引导学生发现自我', '充满热情的教育工作者，每个学生都是独特的存在']
  },
  {
    keywords: ['作家', '写作', '小说', '作者', '记者', '编辑', '编剧'],
    names: {
      male: ['陈作家', '李主编', '王记者', '张编剧', '刘撰稿'],
      female: ['林作家', '周主编', '吴记者', '郑编剧', '孙撰稿'],
      neutral: ['文字魔法师', '故事编织者', '真相记录者']
    },
    descriptions: ['热爱写作的作家，用文字创造精彩世界', '敏锐的记者，善于发现隐藏的真相', '充满想象力的创作者，每个故事都有生命']
  },
  {
    keywords: ['演员', '明星', '导演', '电影', '剧组', '拍戏', '歌手', '艺人'],
    names: {
      male: ['顾影帝', '江导演', '韩巨星', '秦歌神', '尤演员'],
      female: ['苏影后', '许导演', '何巨星', '吕歌后', '施演员'],
      neutral: ['舞台王者', '荧幕传奇', '艺术追求者']
    },
    descriptions: ['才华横溢的演员，在戏中体验不同人生', '追求艺术的导演，用镜头讲述动人故事', '闪耀的明星，在聚光灯下展现最好的自己']
  },
  {
    keywords: ['程序员', 'IT', '黑客', '工程师', '代码', '软件', '互联网'],
    names: {
      male: ['码神', '架构师', '技术大牛', '全栈工程师', '黑客K'],
      female: ['程序媛', '女工程师', '技术女神', '代码女王', '黑客Q'],
      neutral: ['数字世界创造者', '代码诗人', '技术探索者']
    },
    descriptions: ['技术精湛的程序员，用代码改变世界', '充满创造力的工程师，善于解决复杂问题', '热爱技术的开发者，相信代码的力量']
  },
  {
    keywords: ['律师', '法务', '法庭', '诉讼', '辩护', '法官', '检察官'],
    names: {
      male: ['张律师', '李法务', '王辩护', '陈检察官', '刘大状'],
      female: ['林律师', '周法务', '吴辩护', '郑检察官', '孙大状'],
      neutral: ['正义代言人', '法律守护者', '辩才无碍']
    },
    descriptions: ['专业的律师，以法律为武器追求正义', '经验丰富的法务，善于处理复杂案件', '坚守法律精神的从业者，相信公正与法治']
  }
];

function extractKeywords(userInput: string): KeywordMapping | null {
  const input = userInput.toLowerCase();
  
  for (const mapping of keywordMappings) {
    for (const keyword of mapping.keywords) {
      if (input.includes(keyword)) {
        return mapping;
      }
    }
  }
  
  return null;
}

function selectRandomTemplate(templates: Script[], userInput: string, seed?: string): Script {
  const matchedGenre = matchGenre(userInput);
  const genreTemplates = templates.filter(t => t.genre === matchedGenre);
  
  const random = seed ? new SeededRandom(seed + userInput) : globalRandom;
  
  if (genreTemplates.length > 0) {
    return random.pickFromArray(genreTemplates, 'template-' + matchedGenre);
  }
  
  return random.pickFromArray(templates, 'template-any');
}

function generateUniqueId(seed?: string): string {
  if (seed) {
    return `script-${simpleHash(seed)}-${Date.now()}`;
  }
  return `script-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function replacePlaceholders(template: Script, userInput: string, seed?: string): Script {
  const placeholderPattern = /\{userInput\}/g;
  const keywordPlaceholder = /\{用户关键词\}/g;
  
  const keywordMapping = extractKeywords(userInput);
  const random = seed ? new SeededRandom(seed + 'replace') : globalRandom;
  
  const replaceInString = (str: string, characterName?: string): string => {
    let result = str.replace(placeholderPattern, userInput).replace(keywordPlaceholder, userInput);
    
    if (keywordMapping) {
      const names = keywordMapping.names;
      
      if (characterName) {
        const templateFirstNames = ['李明', '王警官', '老周', '张律师', '陈护士', '王大爷', '小美', '程大伟', '方小美', '张伟', '林晓', '李总监', '亚瑟', '艾琳', '盖伦', '顾言之', '林小雨', '林建国', '艾尔', '陈峰', '陈远'];
        const templateLastNames = ['律师', '护士', '大爷', '警官', '大伟', '小美', '张伟', '林晓', '总监', '亚瑟', '艾琳', '盖伦', '顾言之', '小雨', '建国', '艾尔', '陈峰', '陈远'];
        
        const isMaleName = templateFirstNames.some(name => 
          characterName.includes(name) || name.includes(characterName.slice(0, 2))
        );
        const isFemaleName = characterName.includes('美') || characterName.includes('晓') || characterName.includes('雨') || characterName.includes('娜');
        
        let replacementName: string;
        if (isFemaleName) {
          replacementName = random.pickFromArray(names.female, 'name-female');
        } else if (isMaleName) {
          replacementName = random.pickFromArray(names.male, 'name-male');
        } else {
          replacementName = random.pickFromArray(names.neutral, 'name-neutral');
        }
        
        for (const fname of templateFirstNames) {
          if (characterName.includes(fname) || fname.includes(characterName.slice(0, Math.min(2, characterName.length)))) {
            result = result.split(characterName).join(replacementName);
            break;
          }
        }
        for (const lname of templateLastNames) {
          if (characterName.includes(lname)) {
            result = result.split(characterName).join(replacementName);
            break;
          }
        }
      }
    }
    
    return result;
  };
  
  const deepReplace = <T>(obj: T, contextName?: string): T => {
    if (typeof obj === 'string') {
      return replaceInString(obj, contextName) as T;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => {
        if (typeof item === 'object' && item !== null && 'name' in item && typeof (item as { name: unknown }).name === 'string') {
          return deepReplace(item, (item as { name: string }).name);
        }
        return deepReplace(item, contextName);
      }) as T;
    }
    if (obj !== null && typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      const objAsRecord = obj as Record<string, unknown>;
      const nameValue = 'name' in objAsRecord && typeof objAsRecord.name === 'string' ? objAsRecord.name : contextName;
      
      for (const [key, value] of Object.entries(obj)) {
        result[key] = deepReplace(value, nameValue);
      }
      return result as T;
    }
    return obj;
  };
  
  return deepReplace(template);
}

export async function generateScript(userInput: string, seed?: string): Promise<Script> {
  const minDelay = 2000;
  const maxDelay = 5000;
  const delayTime = Math.random() * (maxDelay - minDelay) + minDelay;
  
  await delay(delayTime);
  
  const selectedTemplate = selectRandomTemplate(scriptTemplates, userInput, seed);
  
  const scriptWithPlaceholders = replacePlaceholders(selectedTemplate, userInput, seed);
  
  const finalScript: Script = {
    ...scriptWithPlaceholders,
    id: generateUniqueId(seed),
    userInput: userInput,
    createdAt: new Date().toISOString()
  };
  
  return finalScript;
}

export {
  delay,
  matchGenre,
  selectRandomTemplate,
  extractKeywords,
  SeededRandom,
  simpleHash
};
