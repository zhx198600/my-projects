import SensitiveWord from '../models/SensitiveWord';

type DfaNode = Map<string, DfaNode | boolean>;

class SensitiveWordFilter {
  private root: DfaNode = new Map();
  private isInitialized = false;

  async init() {
    const words = await SensitiveWord.find();
    this.buildTree(words.map(w => w.word));
    this.isInitialized = true;
    console.log(`DFA树构建完成，共加载 ${words.length} 个敏感词`);
  }

  async reload() {
    this.root = new Map();
    this.isInitialized = false;
    await this.init();
  }

  private buildTree(words: string[]) {
    for (const word of words) {
      this.addWord(word);
    }
  }

  private addWord(word: string) {
    let node = this.root;
    const chars = Array.from(word.toLowerCase().trim());
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (!node.has(char)) {
        const newNode: DfaNode = new Map();
        node.set(char, newNode);
        node = newNode;
      } else {
        node = node.get(char) as DfaNode;
      }
      
      if (i === chars.length - 1) {
        node.set('isEnd', true);
      }
    }
  }

  containsSensitive(text: string): { hasSensitive: boolean; words: string[] } {
    if (!this.isInitialized) {
      return { hasSensitive: false, words: [] };
    }

    const foundWords: Set<string> = new Set();
    const chars = Array.from(text.toLowerCase());
    
    for (let i = 0; i < chars.length; i++) {
      let node = this.root;
      let j = i;
      let wordBuilder = '';
      
      while (j < chars.length && node.has(chars[j])) {
        const char = chars[j];
        wordBuilder += char;
        node = node.get(char) as DfaNode;
        
        if (node.get('isEnd') === true) {
          foundWords.add(wordBuilder);
        }
        
        j++;
      }
    }

    return {
      hasSensitive: foundWords.size > 0,
      words: Array.from(foundWords)
    };
  }

  filterText(text: string, replaceChar: string = '*'): { filtered: string; hasSensitive: boolean; words: string[] } {
    if (!this.isInitialized) {
      return { filtered: text, hasSensitive: false, words: [] };
    }

    const result = this.containsSensitive(text);
    if (!result.hasSensitive) {
      return { filtered: text, hasSensitive: false, words: [] };
    }

    let filtered = text;
    for (const word of result.words) {
      const regex = new RegExp(this.escapeRegex(word), 'gi');
      filtered = filtered.replace(regex, replaceChar.repeat(word.length));
    }

    return {
      filtered,
      hasSensitive: true,
      words: result.words
    };
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export const sensitiveWordFilter = new SensitiveWordFilter();

export default sensitiveWordFilter;
