import crypto from 'crypto'
import { TextStructure, SlideContent, PaginationResult } from '../types'

const STOP_WORDS = new Set([
  '的',
  '是',
  '在',
  '有',
  '和',
  '与',
  '或',
  '了',
  '着',
  '过',
  '我',
  '你',
  '他',
  '她',
  '它',
  '们',
  '这',
  '那',
  '之',
  '而',
  '以',
  '于',
  '上',
  '下',
  '中',
  '时',
  '为',
  '对',
  '将',
  '从',
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
  '七',
  '八',
  '九',
  '十',
  '个',
  '只',
  '些',
  '很',
  '也',
  '都',
  '就',
  '还',
  '又',
  '再',
  '可',
  '能',
  '会',
  '要',
  '可',
  '以',
  '该',
  '应',
  '当',
  '等',
  '第',
  '章',
  '节',
  '篇',
  '页',
  '行',
  '列',
  '项',
  '点',
  '条',
  '与',
  '及',
  '并',
  '但',
  '如',
  '若',
  '因',
  '所',
  '则',
  '且',
  '虽',
  '然',
  '但',
  '是',
  '不',
  '没',
  '无',
  '非',
  '未',
  '别',
  '更',
  '最',
  '太',
  '极',
  '甚',
  '颇',
  '较',
  '比',
  '像',
  '如',
  '到',
  '向',
  '往',
  '朝',
  '去',
  '来',
  '进',
  '出',
  '过',
  '经',
  '把',
  '被',
  '让',
  '给',
  '叫',
  '使',
  '令',
  '请',
  '要',
  '想',
  '说',
  '问',
  '答',
  '道',
  '云',
  '曰',
  '讲',
  '谈',
  '论',
  '议',
  '人',
  '事',
  '物',
  '地',
  '时',
  '方',
  '处',
  '位',
  '置',
  '点',
])

const TITLE_PATTERNS = [
  {
    pattern: /^第[一二三四五六七八九十零百千]+[章节部分篇][：:：]?\s*(.*)$/,
    level: 1,
    type: 'heading1' as const,
  },
  { pattern: /^第\d+[章节部分篇][：:：]?\s*(.*)$/, level: 1, type: 'heading1' as const },
  { pattern: /^[一二三四五六七八九十]+[、.．]\s*(.*)$/, level: 2, type: 'heading2' as const },
  { pattern: /^\d+\.\d+\s+(.*)$/, level: 2, type: 'heading2' as const },
  { pattern: /^\d+[、.．]\s*(.*)$/, level: 3, type: 'heading3' as const },
  { pattern: /^#\s+(.*)$/, level: 1, type: 'heading1' as const },
  { pattern: /^##\s+(.*)$/, level: 2, type: 'heading2' as const },
  { pattern: /^###\s+(.*)$/, level: 3, type: 'heading3' as const },
]

const LIST_PATTERNS = [
  /^[-•*●○■□◆◇★☆▶▷▸►▹▻▼▽▾▿◀◁◂◄◅◁←↑→↓↔↕↖↗↘↙]\s/,
  /^\d+[、.．)]\s/,
  /^\([一二三四五六七八九十]+\)\s/,
  /^\([a-zA-Z]\)\s/,
  /^\[.\]\s/,
]

const IDEAL_WORDS_PER_PAGE = 250
const MAX_WORDS_PER_PAGE = 400
const MIN_WORDS_TO_MERGE = 100

const calculateWordCount = (content: string): number => {
  if (!content || content.trim().length === 0) {
    return 0
  }

  const trimmedContent = content.trim()
  const chineseChars = trimmedContent.match(/[\u4e00-\u9fa5]/g) || []
  const englishWords = trimmedContent.match(/[a-zA-Z]+/g) || []
  const numbers = trimmedContent.match(/\d+/g) || []
  const otherLanguages =
    trimmedContent.match(/[^\u4e00-\u9fa5\s\w\d!@#$%^&*()_+=[\]{};':"\\|,.<>/?`~\-\n\r\t]+/g) || []

  const countWords = (words: string[]): number => {
    return words.reduce((count, word) => {
      if (word.length <= 2) {
        return count + 1
      }
      if (word.length <= 4) {
        return count + 2
      }
      return count + Math.ceil(word.length / 2)
    }, 0)
  }

  const englishCount = countWords(englishWords)
  const otherCount = otherLanguages.reduce((acc, chars) => acc + chars.length, 0)

  return chineseChars.length + englishCount + numbers.length + otherCount
}

const calculateLineCount = (content: string): number => {
  if (!content) {
    return 0
  }
  const lines = content.split(/\r?\n/)
  return lines.length
}

const generateId = (): string => {
  return crypto.randomUUID()
}

export const analyzeTextStructure = (content: string): TextStructure[] => {
  if (!content) {
    return []
  }

  const lines = content.split(/\r?\n/)
  const structures: TextStructure[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    if (trimmedLine.length === 0) {
      structures.push({ type: 'empty', content: line })
      continue
    }

    let isTitle = false
    for (const titlePattern of TITLE_PATTERNS) {
      const match = trimmedLine.match(titlePattern.pattern)
      if (match) {
        structures.push({
          type: titlePattern.type,
          content: line,
          level: titlePattern.level,
        })
        isTitle = true
        break
      }
    }
    if (isTitle) continue

    let isList = false
    for (const listPattern of LIST_PATTERNS) {
      if (listPattern.test(trimmedLine)) {
        structures.push({ type: 'list-item', content: line })
        isList = true
        break
      }
    }
    if (isList) continue

    structures.push({ type: 'paragraph', content: line })
  }

  return structures
}

export const calculateContentHash = (content: string): string => {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex')
}

export const extractKeywords = (content: string, maxKeywords: number = 5): string[] => {
  if (!content || content.trim().length === 0) {
    return []
  }

  const words: Map<string, number> = new Map()

  const chineseWords = content.match(/[\u4e00-\u9fa5]{2,}/g) || []
  for (const word of chineseWords) {
    if (!STOP_WORDS.has(word)) {
      words.set(word, (words.get(word) || 0) + 1)
    }
  }

  const englishWords = content.match(/[a-zA-Z]{3,}/g) || []
  for (const word of englishWords) {
    const lowerWord = word.toLowerCase()
    words.set(lowerWord, (words.get(lowerWord) || 0) + 1)
  }

  const singleChineseChars = content.match(/[\u4e00-\u9fa5]/g) || []
  const charFrequency: Map<string, number> = new Map()
  for (const char of singleChineseChars) {
    if (!STOP_WORDS.has(char)) {
      charFrequency.set(char, (charFrequency.get(char) || 0) + 1)
    }
  }

  const sortedWords = Array.from(words.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word)

  if (sortedWords.length < maxKeywords) {
    const additionalChars = Array.from(charFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords - sortedWords.length)
      .map(([char]) => char)
    return [...sortedWords, ...additionalChars]
  }

  return sortedWords
}

interface ContentBlock {
  content: string
  wordCount: number
  type: 'title' | 'paragraph' | 'list'
  level?: number
  isMainTitle?: boolean
}

const extractBlockContent = (line: string, type: TextStructure['type']): string => {
  if (type === 'empty') {
    return line
  }

  const trimmed = line.trim()

  for (const titlePattern of TITLE_PATTERNS) {
    const match = trimmed.match(titlePattern.pattern)
    if (match) {
      return match[1] || trimmed
    }
  }

  for (const listPattern of LIST_PATTERNS) {
    if (listPattern.test(trimmed)) {
      return trimmed
        .replace(/^[-•*●○■□◆◇★☆▶▷▸►▹▻▼▽▾▿◀◁◂◄◅◁←↑→↓↔↕↖↗↘↙]+\s*/, '')
        .replace(/^\d+[、.．)]\s*/, '')
        .replace(/^\([一二三四五六七八九十]+\)\s*/, '')
        .replace(/^\([a-zA-Z]\)\s*/, '')
        .replace(/^\[.\]\s*/, '')
    }
  }

  return trimmed
}

const buildContentBlocks = (structures: TextStructure[]): ContentBlock[] => {
  const blocks: ContentBlock[] = []
  let currentParagraph: string[] = []
  let currentList: string[] = []

  const flushParagraph = (): void => {
    if (currentParagraph.length > 0) {
      const content = currentParagraph.join('\n')
      blocks.push({
        content,
        wordCount: calculateWordCount(content),
        type: 'paragraph',
      })
      currentParagraph = []
    }
  }

  const flushList = (): void => {
    if (currentList.length > 0) {
      const content = currentList.join('\n')
      blocks.push({
        content,
        wordCount: calculateWordCount(content),
        type: 'list',
      })
      currentList = []
    }
  }

  for (let i = 0; i < structures.length; i++) {
    const structure = structures[i]

    if (structure.type === 'empty') {
      flushParagraph()
      flushList()
      continue
    }

    if (structure.type.startsWith('heading')) {
      flushParagraph()
      flushList()

      const isMainTitle =
        structure.type === 'heading1' &&
        structure.content.includes('第') &&
        (structure.content.includes('章') ||
          structure.content.includes('节') ||
          structure.content.includes('部分') ||
          structure.content.includes('篇'))

      blocks.push({
        content: structure.content,
        wordCount: calculateWordCount(structure.content),
        type: 'title',
        level: structure.level,
        isMainTitle,
      })
      continue
    }

    if (structure.type === 'list-item') {
      flushParagraph()
      currentList.push(structure.content)
      continue
    }

    flushList()
    currentParagraph.push(structure.content)
  }

  flushParagraph()
  flushList()

  return blocks
}

interface PageBuilder {
  blocks: ContentBlock[]
  totalWords: number
}

const findSentenceEnd = (content: string, startIndex: number): number => {
  const sentenceEnders = ['。', '！', '？', '!', '?', '.']
  let minIndex = content.length

  for (const ender of sentenceEnders) {
    const index = content.indexOf(ender, startIndex)
    if (index !== -1 && index < minIndex) {
      minIndex = index + 1
    }
  }

  if (minIndex === content.length) {
    const lastSpace = content.lastIndexOf('\n', startIndex)
    if (lastSpace !== -1) {
      return lastSpace + 1
    }
  }

  return minIndex
}

const splitLongBlock = (block: ContentBlock, maxWords: number): ContentBlock[] => {
  if (block.wordCount <= maxWords) {
    return [block]
  }

  const result: ContentBlock[] = []
  let remainingContent = block.content

  while (remainingContent.length > 0) {
    const charsToCheck = Math.min(remainingContent.length, maxWords * 2)
    const sampleContent = remainingContent.substring(0, charsToCheck)
    const sampleWordCount = calculateWordCount(sampleContent)

    if (sampleWordCount <= maxWords) {
      const blockContent = remainingContent.substring(0, charsToCheck)
      result.push({
        content: blockContent,
        wordCount: calculateWordCount(blockContent),
        type: block.type,
        level: block.level,
        isMainTitle: block.isMainTitle,
      })
      remainingContent = remainingContent.substring(charsToCheck)
    } else {
      const targetWords = maxWords
      let splitIndex = Math.floor(remainingContent.length * (targetWords / sampleWordCount))
      splitIndex = findSentenceEnd(remainingContent, Math.max(0, splitIndex - 50))

      if (splitIndex >= remainingContent.length) {
        splitIndex = remainingContent.length
      }

      const blockContent = remainingContent.substring(0, splitIndex)
      const blockWordCount = calculateWordCount(blockContent)

      if (blockWordCount > 0) {
        result.push({
          content: blockContent,
          wordCount: blockWordCount,
          type: block.type,
          level: block.level,
          isMainTitle: block.isMainTitle,
        })
      }

      remainingContent = remainingContent.substring(splitIndex)
    }
  }

  return result
}

const buildPages = (blocks: ContentBlock[]): PageBuilder[] => {
  const pages: PageBuilder[] = []
  let currentPage: PageBuilder = { blocks: [], totalWords: 0 }

  const hasMainTitle = blocks.some(b => b.isMainTitle)
  let firstTitleHandled = false

  const processedBlocks: ContentBlock[] = []
  for (const block of blocks) {
    if (block.wordCount > MAX_WORDS_PER_PAGE && block.type !== 'title') {
      const splitBlocks = splitLongBlock(block, MAX_WORDS_PER_PAGE)
      processedBlocks.push(...splitBlocks)
    } else {
      processedBlocks.push(block)
    }
  }

  for (const block of processedBlocks) {
    if (hasMainTitle && !firstTitleHandled && block.isMainTitle) {
      if (currentPage.blocks.length > 0) {
        pages.push({ ...currentPage })
        currentPage = { blocks: [], totalWords: 0 }
      }
      currentPage.blocks.push(block)
      currentPage.totalWords += block.wordCount
      pages.push({ ...currentPage })
      currentPage = { blocks: [], totalWords: 0 }
      firstTitleHandled = true
      continue
    }

    if (block.type === 'title' && block.level !== undefined && block.level <= 2) {
      if (currentPage.blocks.length > 0) {
        pages.push({ ...currentPage })
        currentPage = { blocks: [], totalWords: 0 }
      }
      currentPage.blocks.push(block)
      currentPage.totalWords += block.wordCount
      continue
    }

    if (currentPage.totalWords + block.wordCount <= IDEAL_WORDS_PER_PAGE) {
      currentPage.blocks.push(block)
      currentPage.totalWords += block.wordCount
      continue
    }

    if (
      currentPage.totalWords < MIN_WORDS_TO_MERGE &&
      currentPage.totalWords + block.wordCount <= MAX_WORDS_PER_PAGE
    ) {
      currentPage.blocks.push(block)
      currentPage.totalWords += block.wordCount
      continue
    }

    if (currentPage.blocks.length > 0) {
      pages.push({ ...currentPage })
      currentPage = { blocks: [], totalWords: 0 }
    }

    if (block.wordCount > MAX_WORDS_PER_PAGE) {
      const splitBlocks = splitLongBlock(block, MAX_WORDS_PER_PAGE)
      for (const splitBlock of splitBlocks) {
        pages.push({ blocks: [splitBlock], totalWords: splitBlock.wordCount })
      }
    } else {
      currentPage.blocks.push(block)
      currentPage.totalWords = block.wordCount
    }
  }

  if (currentPage.blocks.length > 0) {
    pages.push(currentPage)
  }

  return pages
}

const extractPageTitle = (page: PageBuilder): string => {
  const titleBlock = page.blocks.find(b => b.type === 'title')
  if (titleBlock) {
    const content = extractBlockContent(titleBlock.content, 'heading1')
    return content.trim()
  }

  const firstContent = page.blocks.find(b => b.content.trim().length > 0)
  if (firstContent) {
    const content = firstContent.content.trim()
    const maxLength = 30
    if (content.length <= maxLength) {
      return content
    }
    return content.substring(0, maxLength) + '...'
  }

  return ''
}

const buildSlideContent = (page: PageBuilder, index: number): SlideContent => {
  const content = page.blocks
    .map(b => b.content)
    .join('\n\n')
    .trim()
  const title = extractPageTitle(page)
  const keywords = extractKeywords(content, 5)
  const wordCount = calculateWordCount(content)

  let type: SlideContent['type'] = 'content'
  if (page.blocks.some(b => b.isMainTitle)) {
    type = 'title'
  } else if (page.blocks.some(b => b.type === 'list')) {
    type = 'list'
  }

  return {
    id: generateId(),
    index,
    title,
    content,
    keywords,
    wordCount,
    type,
  }
}

const verifyContentIntegrity = (originalContent: string, slides: SlideContent[]): boolean => {
  const combinedContent = slides.map(s => s.content).join('\n\n')
  const normalizedOriginal = originalContent.replace(/\r\n/g, '\n').trim()
  const normalizedCombined = combinedContent.replace(/\r\n/g, '\n').trim()

  if (normalizedOriginal === normalizedCombined) {
    return true
  }

  const originalChars = normalizedOriginal.replace(/\s+/g, '')
  const combinedChars = normalizedCombined.replace(/\s+/g, '')

  return originalChars === combinedChars
}

export const paginateContent = (content: string): PaginationResult => {
  if (!content || content.trim().length === 0) {
    return {
      originalContent: '',
      contentHash: calculateContentHash(''),
      slides: [],
      totalSlides: 0,
      totalWords: 0,
      totalLines: 0,
    }
  }

  const originalContent = content
  const contentHash = calculateContentHash(originalContent)
  const totalWords = calculateWordCount(originalContent)
  const totalLines = calculateLineCount(originalContent)

  const structures = analyzeTextStructure(originalContent)
  const blocks = buildContentBlocks(structures)
  const pages = buildPages(blocks)

  const slides: SlideContent[] = []
  for (let i = 0; i < pages.length; i++) {
    slides.push(buildSlideContent(pages[i], i + 1))
  }

  if (!verifyContentIntegrity(originalContent, slides)) {
    console.warn('内容完整性验证失败，尝试使用简单分页策略')
    return paginateContentSimple(originalContent)
  }

  return {
    originalContent,
    contentHash,
    slides,
    totalSlides: slides.length,
    totalWords,
    totalLines,
  }
}

const paginateContentSimple = (content: string): PaginationResult => {
  const originalContent = content
  const contentHash = calculateContentHash(originalContent)
  const totalWords = calculateWordCount(originalContent)
  const totalLines = calculateLineCount(originalContent)

  const paragraphs = content.split(/\n\n+/)
  const slides: SlideContent[] = []
  let currentContent = ''
  let currentWordCount = 0
  let slideIndex = 1

  const addSlide = (slideContent: string): void => {
    const trimmedContent = slideContent.trim()
    if (trimmedContent.length === 0) return

    const keywords = extractKeywords(trimmedContent, 5)
    const wordCount = calculateWordCount(trimmedContent)

    let title = ''
    const firstLine = trimmedContent.split('\n')[0].trim()
    if (firstLine.length <= 50) {
      title = firstLine
    } else {
      title = firstLine.substring(0, 30) + '...'
    }

    let type: SlideContent['type'] = 'content'
    if (slideIndex === 1 && firstLine.length <= 50) {
      type = 'title'
    }

    slides.push({
      id: generateId(),
      index: slideIndex++,
      title,
      content: trimmedContent,
      keywords,
      wordCount,
      type,
    })
  }

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim()
    if (trimmedParagraph.length === 0) continue

    const paragraphWordCount = calculateWordCount(trimmedParagraph)

    if (paragraphWordCount > MAX_WORDS_PER_PAGE) {
      if (currentContent.length > 0) {
        addSlide(currentContent)
        currentContent = ''
        currentWordCount = 0
      }

      const sentences = trimmedParagraph.split(/([。！？.!?])/)
      let sentenceGroup = ''
      let groupWordCount = 0

      for (let i = 0; i < sentences.length; i += 2) {
        const sentence = sentences[i] + (sentences[i + 1] || '')
        const sentenceWordCount = calculateWordCount(sentence)

        if (groupWordCount + sentenceWordCount > MAX_WORDS_PER_PAGE) {
          if (sentenceGroup.length > 0) {
            addSlide(sentenceGroup)
            sentenceGroup = ''
            groupWordCount = 0
          }
        }

        sentenceGroup += sentence
        groupWordCount += sentenceWordCount
      }

      if (sentenceGroup.length > 0) {
        addSlide(sentenceGroup)
      }
    } else if (currentWordCount + paragraphWordCount <= IDEAL_WORDS_PER_PAGE) {
      if (currentContent.length > 0) {
        currentContent += '\n\n'
      }
      currentContent += trimmedParagraph
      currentWordCount += paragraphWordCount
    } else if (
      currentWordCount < MIN_WORDS_TO_MERGE &&
      currentWordCount + paragraphWordCount <= MAX_WORDS_PER_PAGE
    ) {
      if (currentContent.length > 0) {
        currentContent += '\n\n'
      }
      currentContent += trimmedParagraph
      currentWordCount += paragraphWordCount
    } else {
      if (currentContent.length > 0) {
        addSlide(currentContent)
        currentContent = ''
        currentWordCount = 0
      }
      currentContent = trimmedParagraph
      currentWordCount = paragraphWordCount
    }
  }

  if (currentContent.length > 0) {
    addSlide(currentContent)
  }

  return {
    originalContent,
    contentHash,
    slides,
    totalSlides: slides.length,
    totalWords,
    totalLines,
  }
}

export const verifyPaginationResult = (result: PaginationResult): boolean => {
  const contentHash = calculateContentHash(result.originalContent)
  if (contentHash !== result.contentHash) {
    return false
  }

  const combinedContent = result.slides.map(s => s.content).join('\n\n')
  const normalizedOriginal = result.originalContent.replace(/\r\n/g, '\n').trim()
  const normalizedCombined = combinedContent.replace(/\r\n/g, '\n').trim()

  if (normalizedOriginal === normalizedCombined) {
    return true
  }

  const originalChars = normalizedOriginal.replace(/\s+/g, '')
  const combinedChars = normalizedCombined.replace(/\s+/g, '')

  return originalChars === combinedChars
}
