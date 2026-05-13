import { NextResponse } from 'next/server'

interface ImageGenerationRequest {
  content: string
  count: number
  mode?: 'mock' | 'dalle'
  size?: '256x256' | '512x512' | '1024x1024'
}

interface ImageResult {
  url: string
  prompt: string
  alt: string
}

function extractImagePrompts(content: string, count: number): string[] {
  const keywords = content
    .replace(/[#*`\[\]()]/g, '')
    .split(/[，。！？；：,.!?;:\s\n]+/)
    .filter(word => word.length >= 2 && word.length <= 10)
    .slice(0, 20)

  const themes = [
    '现代简约风格，高清摄影，专业照明，8K分辨率',
    '创意插画风格，色彩丰富，艺术感强，扁平化设计',
    '自然风景风格，清新明亮，构图优美，景深效果',
    '商务办公风格，专业大气，高端质感，极简美学',
    '科技未来风格，蓝色调，光影效果，数字化呈现',
  ]

  const mainKeyword = keywords[0] || '创意设计'
  const subKeywords = keywords.slice(1, 5).join(' ')

  const prompts: string[] = []
  for (let i = 0; i < count; i++) {
    const theme = themes[i % themes.length]
    prompts.push(`${mainKeyword} ${subKeywords}，${theme}`)
  }

  return prompts
}

function extractKeywordsForImageSearch(originalContent: string): string[] {
  const keywordMap: Record<string, string[]> = {
    '儿童': ['children', 'kids', 'child', 'school', 'play', 'toys', 'happy'],
    '孩子': ['children', 'kids', 'child', 'family', 'baby', 'play'],
    '宝宝': ['baby', 'children', 'kids', 'family', 'infant'],
    '幼儿': ['children', 'toddler', 'baby', 'kindergarten', 'play'],
    '教育': ['education', 'learning', 'school', 'teaching', 'books', 'children'],
    '学习': ['learning', 'education', 'study', 'books', 'school'],
    '人工智能': ['artificial intelligence', 'technology', 'ai', 'robot'],
    'AI': ['artificial intelligence', 'technology', 'ai', 'robot'],
    '机器学习': ['machine learning', 'data', 'technology', 'computer'],
    '深度学习': ['deep learning', 'neural network', 'technology', 'ai'],
    '大数据': ['big data', 'analytics', 'technology', 'charts'],
    '云计算': ['cloud computing', 'technology', 'servers', 'internet'],
    '科技': ['technology', 'computer', 'digital', 'innovation'],
    '技术': ['technology', 'engineering', 'computer', 'digital'],
    '健康': ['health', 'fitness', 'wellness', 'medical', 'nature'],
    '医疗': ['medical', 'health', 'doctor', 'hospital', 'science'],
    '医院': ['hospital', 'medical', 'doctor', 'health', 'nurse'],
    '商业': ['business', 'office', 'market', 'finance', 'work'],
    '商务': ['business', 'office', 'professional', 'meeting'],
    '旅行': ['travel', 'adventure', 'nature', 'landscape', 'tourism'],
    '旅游': ['travel', 'vacation', 'landscape', 'tourism', 'nature'],
    '美食': ['food', 'cooking', 'restaurant', 'delicious', 'culinary'],
    '饮食': ['food', 'healthy', 'cooking', 'nutrition'],
    '运动': ['sports', 'fitness', 'exercise', 'athletics', 'training'],
    '健身': ['fitness', 'gym', 'exercise', 'workout', 'sports'],
    '音乐': ['music', 'concert', 'musician', 'art', 'sound'],
    '艺术': ['art', 'painting', 'creative', 'gallery', 'design'],
    '设计': ['design', 'creative', 'architecture', 'art', 'modern'],
    '创意': ['creative', 'innovation', 'art', 'design', 'ideas'],
    '自然': ['nature', 'landscape', 'forest', 'mountains', 'outdoors'],
    '环境': ['environment', 'nature', 'eco', 'green', 'sustainability'],
    '金融': ['finance', 'money', 'banking', 'investment', 'business'],
    '经济': ['economy', 'finance', 'business', 'market', 'trade'],
    '家庭': ['family', 'home', 'love', 'happiness', 'children'],
    '生活': ['lifestyle', 'home', 'cozy', 'modern', 'living'],
    '工作': ['work', 'office', 'business', 'career', 'professional'],
    '职场': ['career', 'office', 'business', 'professional', 'meeting'],
    '宠物': ['pets', 'dog', 'cat', 'animal', 'cute'],
    '狗': ['dog', 'pets', 'animal', 'puppy'],
    '猫': ['cat', 'pets', 'animal', 'kitten'],
    '咖啡': ['coffee', 'cafe', 'drink', 'breakfast'],
    '汽车': ['car', 'automobile', 'transport', 'vehicle'],
    '婚礼': ['wedding', 'marriage', 'love', 'romance', 'bride'],
    '节日': ['holiday', 'festival', 'celebration', 'decorations'],
    '花园': ['garden', 'flowers', 'plants', 'nature', 'spring'],
  }

  let matchedTags: string[] = []
  let highestMatchCount = 0

  for (const [zh, enTags] of Object.entries(keywordMap)) {
    const regex = new RegExp(zh, 'g')
    const matches = originalContent.match(regex)
    const matchCount = matches ? matches.length : 0
    
    if (matchCount > 0) {
      if (matchCount > highestMatchCount) {
        highestMatchCount = matchCount
        matchedTags = enTags
      } else if (matchCount === highestMatchCount) {
        matchedTags = [...matchedTags, ...enTags]
      }
    }
  }

  if (matchedTags.length === 0) {
    return ['technology', 'business', 'abstract', 'creative', 'modern']
  }

  return Array.from(new Set(matchedTags))
}

function generateMockImages(prompts: string[], size: string, originalContent: string): ImageResult[] {
  const sizeMap: Record<string, string> = {
    '256x256': '256/256',
    '512x512': '512/512',
    '1024x1024': '1024/1024',
  }
  const dim = sizeMap[size] || '512/512'
  const [width, height] = dim.split('/')

  const contentKeywords = extractKeywordsForImageSearch(originalContent)
  const mainKeywords = contentKeywords.slice(0, 4).join(',')

  const variants = [
    mainKeywords,
    contentKeywords.slice(0, 3).join(','),
    contentKeywords.slice(0, 2).join(','),
  ]

  return prompts.map((prompt, index) => {
    const keywords = variants[index % variants.length] || 'children,kids,happy'
    const seed = Date.now() + index * 1000
    
    const imageProviders = [
      `https://loremflickr.com/${width}/${height}/${encodeURIComponent(keywords)}?random=${seed}`,
      `https://picsum.photos/seed/${encodeURIComponent(keywords)}${seed}/${width}/${height}`,
    ]
    
    return {
      url: imageProviders[index % imageProviders.length],
      prompt,
      alt: `配图 ${index + 1}: ${keywords}`,
    }
  })
}

async function generateDalleImages(
  prompts: string[],
  size: string,
  apiKey: string,
  baseURL: string,
  signal: AbortSignal,
  originalContent: string
): Promise<ImageResult[]> {
  const results: ImageResult[] = []
  const sizeMap: Record<string, string> = {
    '256x256': '256/256',
    '512x512': '512/512',
    '1024x1024': '1024/1024',
  }
  const dim = sizeMap[size] || '512/512'
  const [width, height] = dim.split('/')
  const contentKeywords = extractKeywordsForImageSearch(originalContent)

  for (const prompt of prompts) {
    try {
      const response = await fetch(`${baseURL}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: prompt.slice(0, 1000),
          n: 1,
          size,
          response_format: 'url',
        }),
        signal,
      })

      if (response.ok) {
        const data = await response.json()
        const imageUrl = data.data?.[0]?.url
        if (imageUrl) {
          results.push({
            url: imageUrl,
            prompt,
            alt: `AI生成图片: ${prompt.slice(0, 30)}...`,
          })
          continue
        }
      }
    } catch (e) {
      console.error('DALL-E generation error:', e)
    }

    const keywords = contentKeywords.slice(0, 3).join(',') || 'technology,business'
    const seed = Date.now() + results.length
    results.push({
      url: `https://loremflickr.com/${width}/${height}/${keywords}?lock=${seed}`,
      prompt,
      alt: `配图 ${results.length + 1}: ${keywords}`,
    })
  }

  return results
}

export async function POST(request: Request) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 29500)

  try {
    const body: ImageGenerationRequest = await request.json()
    const { content, count, mode = 'mock', size = '512x512' } = body

    if (!content || !content.trim()) {
      clearTimeout(timeoutId)
      return NextResponse.json(
        { error: '文案内容不能为空' },
        { status: 400 }
      )
    }

    const imageCount = Math.min(Math.max(1, count), 3)
    const prompts = extractImagePrompts(content, imageCount)

    const apiKey = process.env.OPENAI_API_KEY
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const useMock = mode === 'mock' || !apiKey || apiKey.trim() === ''

    let images: ImageResult[]
    let actualMode: 'mock' | 'dalle'
    let note: string | undefined

    if (useMock) {
      images = generateMockImages(prompts, size, content)
      actualMode = 'mock'
      note = mode === 'dalle' ? '未配置API密钥，已切换至模拟模式' : undefined
    } else {
      try {
        images = await generateDalleImages(prompts, size, apiKey, baseURL, controller.signal, content)
        actualMode = 'dalle'
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          clearTimeout(timeoutId)
          return NextResponse.json(
            { error: '图片生成超时，请稍后重试' },
            { status: 504 }
          )
        }
        console.error('DALL-E API Error:', fetchError)
        images = generateMockImages(prompts, size, content)
        actualMode = 'mock'
        note = 'API调用失败，已切换至模拟模式'
      }
    }

    clearTimeout(timeoutId)

    return NextResponse.json({
      images,
      mode: actualMode,
      note,
      prompts,
    })
  } catch (error) {
    clearTimeout(timeoutId)
    console.error('Server Error:', error)

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: '请求超时，请稍后重试' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
}
