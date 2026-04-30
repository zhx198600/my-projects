import mammoth from 'mammoth'
import fs from 'fs'
import path from 'path'
import { WordParseResult } from '../types'

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

const detectDocumentFormat = (filePath: string): 'doc' | 'docx' | 'unknown' => {
  try {
    const buffer = fs.readFileSync(filePath)
    
    if (buffer.length >= 2) {
      if (
        buffer[0] === 0x50 && buffer[1] === 0x4b
      ) {
        return 'docx'
      }
      
      if (
        buffer[0] === 0xd0 && buffer[1] === 0xcf &&
        buffer[2] === 0x11 && buffer[3] === 0xe0
      ) {
        return 'doc'
      }
    }
    
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

export const parseWordDocument = async (
  filePath: string,
  originalName: string,
  fileSize: number
): Promise<WordParseResult> => {
  const format = detectDocumentFormat(filePath)
  
  if (format === 'doc') {
    throw new Error('当前版本暂不支持旧版 .doc 格式，请将文档另存为 .docx 格式后重新上传')
  }
  
  if (format === 'unknown') {
    throw new Error('无法识别的文件格式，请确保上传的是有效的 Word 文档（.docx 格式）')
  }

  try {
    const result = await mammoth.extractRawText({ path: filePath })
    const content = result.value

    if (!content || content.trim().length === 0) {
      throw new Error('文档内容为空或无法解析')
    }

    const wordCount = calculateWordCount(content)
    const lineCount = calculateLineCount(content)

    const fileName = path.basename(filePath)

    return {
      fileName,
      originalName,
      fileSize,
      content,
      wordCount,
      lineCount,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage.includes('zip') || errorMessage.includes('central directory')) {
      throw new Error('文档格式错误：该文件可能不是有效的 .docx 文档。旧版 .doc 格式暂不支持，请另存为 .docx 格式')
    }
    
    throw new Error(`文档解析失败: ${errorMessage}`)
  }
}

export const cleanupFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (error) {
    console.error('临时文件清理失败:', error)
  }
}

export const parseTextInput = (
  content: string
): { content: string; wordCount: number; lineCount: number } => {
  const wordCount = calculateWordCount(content)
  const lineCount = calculateLineCount(content)

  return {
    content,
    wordCount,
    lineCount,
  }
}
