import { NextResponse } from 'next/server'

interface GenerateRequest {
  keyword: string
  wordCount: 'short' | 'medium' | 'long'
  tone: 'formal' | 'casual' | 'humorous' | 'professional'
  articleType: 'wechat' | 'xiaohongshu' | 'toutiao'
}

const wordCountMap = {
  short: { min: 250, max: 350, chars: '约300字' },
  medium: { min: 500, max: 700, chars: '约600字' },
  long: { min: 900, max: 1100, chars: '约1000字' },
}

const toneMap = {
  formal: '正式严谨',
  casual: '轻松随意',
  humorous: '幽默风趣',
  professional: '专业权威',
}

const articleTypeMap = {
  wechat: { name: '微信公众号', style: '深度好文风格，段落清晰，适合公众号排版' },
  xiaohongshu: { name: '小红书', style: '种草笔记风格，添加emoji，多用感叹号，亲切口语化' },
  toutiao: { name: '头条', style: '资讯标题党风格，吸引眼球，信息密度高' },
}

function generateMockContent(
  keyword: string,
  wordCount: 'short' | 'medium' | 'long',
  tone: string,
  articleType: 'wechat' | 'xiaohongshu' | 'toutiao'
): string {
  const lengths = {
    short: 3,
    medium: 5,
    long: 8,
  }
  
  const paragraphs = lengths[wordCount]
  
  const toneIntroductions = {
    formal: `尊敬的读者，本文将深入探讨**${keyword}**这一重要议题。在当今社会，**${keyword}**已经成为我们不可忽视的重要话题。`,
    casual: `嘿，今天咱们来聊聊**${keyword}**这个事儿。说实话，**${keyword}**现在真的越来越火了！`,
    humorous: `说到**${keyword}**，我可就不困了啊！你知道吗？**${keyword}**这玩意儿，简直就是当代人的"精神食粮"！`,
    professional: `从专业角度分析，**${keyword}**作为当前领域的研究热点，具有重要的理论价值和实践意义。本文将系统阐述**${keyword}**的核心内涵与外延。`,
  }

  const xiaohongshuIntro = `✨宝子们！今天必须给你们安利**${keyword}**！！！
真的绝绝子！谁用谁知道！！💯

😭后悔没有早知道系列！！！
关于**${keyword}**的干货都整理在下面了👇👇

姐妹们赶紧码住收藏！！！点赞关注不迷路哦～💕`

  const toutiaoIntro = `【震惊！】关于**${keyword}**，99%的人都不知道这个真相！

❗️信息量巨大！建议收藏！

今天就来揭秘**${keyword}**背后的秘密，看完保证你刷新认知！👇`

  let intro = ''
  if (articleType === 'xiaohongshu') {
    intro = xiaohongshuIntro
  } else if (articleType === 'toutiao') {
    intro = toutiaoIntro
  } else {
    intro = toneIntroductions[tone as keyof typeof toneIntroductions]
  }
  
  const bodyParagraphs = [
    `首先，我们需要明确**${keyword}**的基本概念和核心要素。**${keyword}**不仅仅是一个简单的名词，它代表着一种趋势、一种方向，更是一种思维方式的转变。在实际应用中，**${keyword}**展现出了强大的生命力和广阔的发展前景。`,
    `其次，**${keyword}**的价值在于它能够解决实际问题，创造真正的价值。无论是对于个人发展还是企业战略，深入理解和运用**${keyword}**都将成为获取竞争优势的关键所在。许多成功的案例已经充分证明了这一点。`,
    `进一步来说，**${keyword}**的发展历程也给我们带来了许多宝贵的启示。从最初的概念提出到如今的广泛应用，每一个阶段都凝聚着无数人的智慧和汗水。这也让我们更加期待**${keyword}**未来的发展。`,
    `当然，我们也不能忽视在推广**${keyword}**过程中可能遇到的挑战和困难。任何新生事物的发展都不会一帆风顺，**${keyword}**也不例外。但正是这些挑战，才使得**${keyword}**的价值更加凸显。`,
    `在技术层面，**${keyword}**也在不断创新和突破。新的方法、新的工具层出不穷，为**${keyword}**的深入应用提供了坚实的技术支撑。这种持续的创新能力，正是**${keyword}**能够保持活力的根本原因。`,
    `从用户反馈来看，**${keyword}**获得了广泛的认可和好评。越来越多的人开始接触、了解并喜爱上**${keyword}**。这种良好的用户基础，为**${keyword}**的持续发展奠定了坚实的社会基础。`,
    `展望未来，**${keyword}**还有无限的可能性等待我们去发掘和探索。随着技术的进步和认知的深入，相信**${keyword}**将会在更多领域发挥更加重要的作用，为社会发展贡献更大的力量。`,
    `最后，我想说的是，**${keyword}**不是终点，而是一个全新的起点。让我们携手并进，共同见证和参与**${keyword}**的成长与发展，开创更加美好的明天！`,
  ]

  const xiaohongshuTags = `\n\n#${keyword} #干货分享 #知识科普 #生活小技巧\n喜欢的宝子们点个赞👍收藏关注一下叭～爱你们哟😘`
  const toutiaoTags = `\n\n对此你怎么看？欢迎在评论区留言讨论！\n#${keyword} #热点话题 #深度解析`
  
  const conclusions = {
    formal: `综上所述，**${keyword}**是一个值得我们持续关注和深入研究的重要课题。希望本文能够为各位读者提供有价值的参考和启发。`,
    casual: `总的来说，**${keyword}**真的挺不错的！希望大家都能从中受益，咱们下次接着聊~`,
    humorous: `怎么样？看完这篇关于**${keyword}**的"大作"，是不是感觉收获满满，整个人都升华了？不用谢，请叫我雷锋！`,
    professional: `综上，**${keyword}**的研究和应用具有重要的现实意义和深远的历史意义。建议相关从业者进一步加强对此领域的关注和投入。`,
  }
  
  let content = intro + '\n\n'
  
  for (let i = 0; i < paragraphs - 1; i++) {
    if (articleType === 'xiaohongshu') {
      content += `👉 ${bodyParagraphs[i % bodyParagraphs.length]}\n\n`
    } else if (articleType === 'toutiao') {
      content += `【重点${i + 1}】${bodyParagraphs[i % bodyParagraphs.length]}\n\n`
    } else {
      content += bodyParagraphs[i % bodyParagraphs.length] + '\n\n'
    }
  }
  
  if (articleType === 'xiaohongshu') {
    content += `💡最后想说...真的太香了！姐妹们冲鸭！！！${xiaohongshuTags}`
  } else if (articleType === 'toutiao') {
    content += `对此你怎么看？欢迎转发评论！${toutiaoTags}`
  } else {
    content += conclusions[tone as keyof typeof conclusions]
  }
  
  return content
}

function buildPrompt(
  keyword: string,
  wordCount: 'short' | 'medium' | 'long',
  tone: string,
  articleType: 'wechat' | 'xiaohongshu' | 'toutiao'
): string {
  const countInfo = wordCountMap[wordCount]
  const toneInfo = toneMap[tone as keyof typeof toneMap]
  const typeInfo = articleTypeMap[articleType]
  
  return `你是一个专业的文案写作专家。请根据以下要求生成高质量的中文文案：

【核心要求】
1. 主题关键词：${keyword}
2. 字数要求：${countInfo.chars}（${countInfo.min}-${countInfo.max}字）
3. 语气风格：${toneInfo}
4. 文章平台：${typeInfo.name} - ${typeInfo.style}

【格式要求】
1. 文案中所有"${keyword}"关键词必须自动加粗，使用**${keyword}**格式
2. 适当分段，每段之间空一行
3. 小红书风格请多使用emoji和亲切的口语化表达，结尾加话题标签
4. 头条风格请使用吸引眼球的标题和分点阐述
5. 语言流畅自然，符合中文表达习惯

请直接返回生成的文案内容，不需要额外说明。确保文案在15秒内可以生成完成。`
}

export async function POST(request: Request) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 14500)

  try {
    const body: GenerateRequest = await request.json()
    const { keyword, wordCount, tone, articleType = 'wechat' } = body

    if (!keyword || !keyword.trim()) {
      return NextResponse.json(
        { error: '关键词不能为空' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    const useMock = !apiKey || apiKey.trim() === ''

    if (useMock) {
      clearTimeout(timeoutId)
      const mockContent = generateMockContent(keyword.trim(), wordCount, tone, articleType)
      return NextResponse.json({
        content: mockContent,
        mode: 'mock',
        wordCount,
        tone,
        articleType,
        keyword: keyword.trim(),
      })
    }

    const prompt = buildPrompt(keyword.trim(), wordCount, tone, articleType)

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
              content: '你是一个专业的中文文案写作助手，擅长生成各种风格的高质量文案。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('LLM API Error:', errorData)
        
        const mockContent = generateMockContent(keyword.trim(), wordCount, tone, articleType)
        return NextResponse.json({
          content: mockContent,
          mode: 'mock',
          note: 'API调用失败，已切换至模拟模式',
          wordCount,
          tone,
          articleType,
          keyword: keyword.trim(),
        })
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''

      return NextResponse.json({
        content,
        mode: 'llm',
        model: data.model,
        usage: data.usage,
        wordCount,
        tone,
        articleType,
        keyword: keyword.trim(),
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error('Fetch Error:', fetchError)
      
      const mockContent = generateMockContent(keyword.trim(), wordCount, tone, articleType)
      return NextResponse.json({
        content: mockContent,
        mode: 'mock',
        note: '网络请求失败，已切换至模拟模式',
        wordCount,
        tone,
        articleType,
        keyword: keyword.trim(),
      })
    }
  } catch (error) {
    clearTimeout(timeoutId)
    console.error('Server Error:', error)
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
}
