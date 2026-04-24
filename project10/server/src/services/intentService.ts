import { db } from '../db';
import { Knowledge, MatchResult, ProcessMessageResult, IntentService } from '../types';

class IntentServiceClass implements IntentService {
  private defaultReply: string = '抱歉，我暂时无法解答您的问题，请稍后再试或联系人工客服。';

  private preprocess(message: string): string {
    return message.toLowerCase().trim();
  }

  private tokenize(message: string): string[] {
    return message.split(/[\s，。！？、；：""''（）\,\.\!\?\;\:]+/).filter(t => t.length > 0);
  }

  private parseKeywords(keywordsStr: string): string[] {
    return keywordsStr.split(/[,，]/).map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
  }

  public match(message: string): MatchResult | null {
    const processedMessage = this.preprocess(message);
    const tokens = this.tokenize(processedMessage);
    
    const allKnowledge = db.all<Knowledge>('SELECT * FROM knowledge');
    
    if (allKnowledge.length === 0) {
      return null;
    }

    let bestMatch: MatchResult | null = null;
    let highestScore = 0;

    for (const knowledge of allKnowledge) {
      const keywords = this.parseKeywords(knowledge.keywords);
      
      if (keywords.length === 0) {
        continue;
      }

      const matchedKeywords: string[] = [];
      for (const keyword of keywords) {
        for (const token of tokens) {
          if (token.includes(keyword) || keyword.includes(token)) {
            if (!matchedKeywords.includes(keyword)) {
              matchedKeywords.push(keyword);
            }
            break;
          }
        }
      }

      const score = matchedKeywords.length / keywords.length;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = {
          knowledgeId: knowledge.id,
          question: knowledge.question,
          answer: knowledge.answer,
          matchScore: score,
          matchedKeywords
        };
      }
    }

    return highestScore > 0 ? bestMatch : null;
  }

  public getDefaultReply(): string {
    return this.defaultReply;
  }

  public processMessage(message: string): ProcessMessageResult {
    const match = this.match(message);
    
    if (match) {
      return {
        answer: match.answer,
        isFallback: false,
        matchResult: match
      };
    }
    
    return {
      answer: this.defaultReply,
      isFallback: true
    };
  }
}

export const intentService = new IntentServiceClass();
