import { NextResponse } from 'next/server'

interface TranslateRequest {
  text: string
  direction: 'zh-to-en' | 'en-to-zh'
}

function preserveBold(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '__BOLD_START__$1__BOLD_END__')
}

function restoreBold(text: string): string {
  return text.replace(/__BOLD_START__([^*]+?)__BOLD_END__/g, '**$1**')
}

function generateMockTranslation(text: string, direction: 'zh-to-en' | 'en-to-zh'): string {
  const preservedText = preserveBold(text)
  
  const defaultZhToEn = `**Artificial Intelligence** is fundamentally transforming our way of life and work paradigms. It represents one of the most significant technological revolutions of the 21st century, bringing unprecedented changes to human society.

The rapid development of **AI technology** has profoundly impacted various industries including healthcare, education, finance, and manufacturing processes. Intelligent systems are enhancing productivity while creating new possibilities for innovation and growth.

As we embrace this digital transformation, understanding and leveraging **Artificial Intelligence** becomes essential for maintaining competitiveness in the global marketplace.`

  const defaultEnToZh = `**人工智能**正在从根本上改变我们的生活方式和工作模式。它代表了21世纪最重要的技术革命之一，给人类社会带来了前所未有的变革。

**AI技术**的快速发展深刻影响了医疗、教育、金融和制造业等各个行业。智能系统在提高生产力的同时，也为创新和增长创造了新的可能性。

在我们迎接这场数字化转型的过程中，理解并运用**人工智能**对于在全球市场中保持竞争力变得至关重要。`

  if (direction === 'zh-to-en') {
    const sentences = preservedText.split(/[。！？；]+/).filter(s => s.trim())
    
    if (sentences.length <= 3) {
      const sentenceTranslations: Record<string, string> = {
        '人工智能正在深刻改变我们的生活方式和工作模式': '**Artificial Intelligence** is profoundly transforming our lifestyle and work patterns',
        '人工智能': '**Artificial Intelligence**',
        '正在深刻改变': 'is profoundly transforming',
        '我们的生活方式': 'our way of life',
        '和工作模式': 'and work models',
        '这是一个示例文本用于演示翻译功能': 'This is a sample text demonstrating translation capabilities with **Markdown formatting** preserved',
        '你好世界': 'Hello World',
        '翻译测试': 'Translation Test',
        '技术改变生活': '**Technology** changes life',
        '创新驱动未来': '**Innovation** drives the future',
        '深度学习': '**Deep Learning**',
        '机器学习': '**Machine Learning**',
        '大数据': '**Big Data**',
        '云计算': '**Cloud Computing**',
      }
      
      let translated = text
      for (const [zh, en] of Object.entries(sentenceTranslations).sort((a, b) => b[0].length - a[0].length)) {
        translated = translated.replace(new RegExp(zh, 'g'), en)
      }
      
      if (translated === text || /[\u4e00-\u9fa5]/.test(translated)) {
        return defaultZhToEn
      }
      
      return restoreBold(translated)
    }
    
    return defaultZhToEn
  } else {
    return defaultEnToZh
  }
}

function buildPrompt(text: string, direction: 'zh-to-en' | 'en-to-zh'): string {
  const langInfo = direction === 'zh-to-en' 
    ? '将中文翻译成地道流畅的英文' 
    : '将英文翻译成地道流畅的中文'
  
  return `你是一个专业的翻译专家。${langInfo}。

【核心要求】
1. 翻译方向：${direction === 'zh-to-en' ? '中文 → 英文' : '英文 → 中文'}
2. 保留所有的 **Markdown 加粗格式**，如果原文中有 **加粗** 的内容，翻译后也要用 **加粗** 标记
3. 翻译要准确、流畅、自然，符合目标语言的表达习惯
4. 只返回翻译结果本身，不要添加任何额外说明

【待翻译文本】
${text}

请直接返回翻译结果。`
}

export async function POST(request: Request) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 2800)

  try {
    const body: TranslateRequest = await request.json()
    const { text, direction } = body

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: '翻译文本不能为空' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    const useMock = !apiKey || apiKey.trim() === ''

    if (useMock) {
      clearTimeout(timeoutId)
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500))
      const mockTranslation = generateMockTranslation(text.trim(), direction)
      return NextResponse.json({
        translation: mockTranslation,
        mode: 'mock',
        direction,
      })
    }

    const prompt = buildPrompt(text.trim(), direction)

    try {
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的翻译专家，擅长中英文互译，保留Markdown格式。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const mockTranslation = generateMockTranslation(text.trim(), direction)
        return NextResponse.json({
          translation: mockTranslation,
          mode: 'mock',
          note: 'API调用失败，已切换至模拟模式',
          direction,
        })
      }

      const data = await response.json()
      const translation = data.choices?.[0]?.message?.content || ''

      return NextResponse.json({
        translation,
        mode: 'llm',
        model: data.model,
        direction,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      const mockTranslation = generateMockTranslation(text.trim(), direction)
      return NextResponse.json({
        translation: mockTranslation,
        mode: 'mock',
        note: '网络请求失败，已切换至模拟模式',
        direction,
      })
    }
  } catch (error) {
    clearTimeout(timeoutId)
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
}
