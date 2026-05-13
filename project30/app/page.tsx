"use client"

import React, { useState, useEffect } from "react"
import {
  FileText,
  Languages,
  Image,
  Volume2,
  History,
  Copy,
  Check,
  Download,
  Sparkles,
  Trash2,
  X,
  Info,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Zap,
  Clock,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { ImageGrid } from "@/components/image-grid"
import { TextToSpeechPlayer } from "@/components/text-to-speech-player"

interface GenerateResult {
  content: string
  mode: "mock" | "llm"
  note?: string
  model?: string
  wordCount: string
  tone: string
  keyword: string
}

interface TranslateResult {
  translation: string
  mode: "mock" | "llm"
  note?: string
  model?: string
}

interface ImageResult {
  url: string
  prompt: string
  alt: string
}

interface HistoryItem {
  id: string
  type: "generate" | "translate" | "image"
  input: string
  output: string
  timestamp: number
  metadata?: Record<string, string>
}

const STORAGE_KEY = "ai-tool-history"
const MAX_HISTORY = 50

export default function UnifiedToolPage() {
  const [activeTab, setActiveTab] = useState("generate")
  const [showGuide, setShowGuide] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const [keyword, setKeyword] = useState("")
  const [wordCount, setWordCount] = useState<"short" | "medium" | "long">("medium")
  const [tone, setTone] = useState<"formal" | "casual" | "humorous" | "professional">("casual")
  const [articleType, setArticleType] = useState<"wechat" | "xiaohongshu" | "toutiao">("wechat")
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [direction, setDirection] = useState<"zh-to-en" | "en-to-zh">("zh-to-en")
  const [translateText, setTranslateText] = useState("")
  const [translateResult, setTranslateResult] = useState<TranslateResult | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)

  const [imageContent, setImageContent] = useState("")
  const [imageCount, setImageCount] = useState("2")
  const [images, setImages] = useState<ImageResult[]>([])
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)

  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generateTime, setGenerateTime] = useState(0)
  const [translateTime, setTranslateTime] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch {
        setHistory([])
      }
    }
  }, [])

  const saveToHistory = (item: Omit<HistoryItem, "id" | "timestamp">) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    }
    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const handleGenerate = async () => {
    if (!keyword.trim()) return
    setIsGenerating(true)
    setError(null)
    setGenerateResult(null)
    const startTime = Date.now()

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), wordCount, tone, articleType }),
      })
      if (!response.ok) throw new Error("生成失败")
      const data = await response.json()
      setGenerateResult(data)
      saveToHistory({
        type: "generate",
        input: keyword,
        output: data.content,
        metadata: { tone, wordCount, articleType },
      })
    } catch {
      setError("文案生成失败，请稍后重试")
    } finally {
      setGenerateTime(Date.now() - startTime)
      setIsGenerating(false)
    }
  }

  const handleTranslate = async () => {
    if (!translateText.trim()) return
    setIsTranslating(true)
    setError(null)
    setTranslateResult(null)
    const startTime = Date.now()

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: translateText.trim(), direction }),
      })
      if (!response.ok) throw new Error("翻译失败")
      const data = await response.json()
      setTranslateResult(data)
      saveToHistory({
        type: "translate",
        input: translateText,
        output: data.translation,
        metadata: { direction },
      })
    } catch {
      setError("翻译失败，请稍后重试")
    } finally {
      setTranslateTime(Date.now() - startTime)
      setIsTranslating(false)
    }
  }

  const handleGenerateImages = async () => {
    if (!imageContent.trim()) return
    setIsGeneratingImages(true)
    setError(null)
    setImages([])

    try {
      const response = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: imageContent.trim(), count: Number(imageCount) }),
      })
      if (!response.ok) throw new Error("图片生成失败")
      const data = await response.json()
      setImages(data.images)
      saveToHistory({
        type: "image",
        input: imageContent,
        output: data.images.length + " 张图片",
        metadata: { count: imageCount },
      })
    } catch {
      setError("图片生成失败，请稍后重试")
    } finally {
      setIsGeneratingImages(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sampleKeywords = ["人工智能", "远程办公", "健康饮食", "终身学习", "环境保护"]
  const sampleTranslateTexts = [
    "人工智能正在深刻改变我们的生活方式和工作模式。",
    "The quick brown fox jumps over the lazy dog.",
  ]

  const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 opacity-50" />
      </div>
      <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">{title}</p>
      <p className="text-sm text-center max-w-xs">{description}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            AI 智能工具箱
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            一站式 AI 工具：文案生成 · 智能翻译 · 配图生成 · 语音合成
          </p>
        </header>

        {showGuide && (
          <Card className="mb-6 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">🚀 快速开始指南</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-400">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      点击「文案生成」输入关键词创作高质量内容
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      使用「智能翻译」进行中英文互译
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      在「配图生成」中输入文案生成相关图片
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      使用「语音合成」朗读任何文本内容
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowGuide(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Tabs defaultValue="generate" value={activeTab} onValueChange={(tab) => {
              setActiveTab(tab)
              if (generateResult?.content) {
                if (tab === 'translate') setTranslateText(generateResult.content.replace(/[#*`]/g, ''))
                if (tab === 'images') setImageContent(generateResult.content.replace(/[#*`]/g, ''))
              }
            }}>
              <TabsList className="w-full grid grid-cols-4 h-14">
                <TabsTrigger value="generate" className="text-sm gap-2">
                  <FileText className="h-4 w-4" />
                  文案生成
                </TabsTrigger>
                <TabsTrigger value="translate" className="text-sm gap-2">
                  <Languages className="h-4 w-4" />
                  智能翻译
                </TabsTrigger>
                <TabsTrigger value="images" className="text-sm gap-2">
                  <Image className="h-4 w-4" />
                  配图生成
                </TabsTrigger>
                <TabsTrigger value="tts" className="text-sm gap-2">
                  <Volume2 className="h-4 w-4" />
                  语音合成
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generate">
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      文案生成设置
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <Label>核心关键词</Label>
                        <Input
                          placeholder="输入核心关键词，如：人工智能"
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          className="h-12"
                        />
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-slate-500">快速示例：</span>
                          {sampleKeywords.map((kw) => (
                            <button
                              key={kw}
                              onClick={() => setKeyword(kw)}
                              className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {kw}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label>文案长度</Label>
                          <ToggleGroup type="single" value={wordCount} onValueChange={(v) => v && setWordCount(v as any)} className="justify-start">
                            <ToggleGroupItem value="short" className="flex-1">简短</ToggleGroupItem>
                            <ToggleGroupItem value="medium" className="flex-1">中等</ToggleGroupItem>
                            <ToggleGroupItem value="long" className="flex-1">详细</ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                        <div className="space-y-3">
                          <Label>语气风格</Label>
                          <Select value={tone} onValueChange={(v) => setTone(v as any)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="formal">正式严谨</SelectItem>
                              <SelectItem value="casual">轻松随意</SelectItem>
                              <SelectItem value="humorous">幽默风趣</SelectItem>
                              <SelectItem value="professional">专业权威</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>文章类型</Label>
                        <ToggleGroup type="single" value={articleType} onValueChange={(v) => v && setArticleType(v as any)} className="justify-start">
                          <ToggleGroupItem value="wechat" className="flex-1">
                            💬 微信公众号
                          </ToggleGroupItem>
                          <ToggleGroupItem value="xiaohongshu" className="flex-1">
                            📕 小红书
                          </ToggleGroupItem>
                          <ToggleGroupItem value="toutiao" className="flex-1">
                            📰 头条
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>

                      <Button
                        size="lg"
                        onClick={handleGenerate}
                        disabled={isGenerating || !keyword.trim()}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                      >
                        {isGenerating ? (
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            生成中
                          </div>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            一键生成文案
                          </>
                        )}
                      </Button>
                    </div>

                    {generateResult && (
                      <div className="mt-8 pt-6 border-t">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-lg">生成结果</h3>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleCopy(generateResult.content)}>
                              {copied ? <><Check className="h-4 w-4 mr-1 text-green-500" />已复制</> : <><Copy className="h-4 w-4 mr-1" />复制</>}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleExportMarkdown(generateResult.content, "文案")}>
                              <Download className="h-4 w-4 mr-1" />
                              导出 Markdown
                            </Button>
                          </div>
                        </div>
                        <div className="prose prose-slate dark:prose-invert max-w-none p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl">
                          <MarkdownRenderer content={generateResult.content} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
                          <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 font-medium flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5" />
                            {generateResult.mode === "mock" ? "模拟模式" : "LLM 模式"}
                          </span>
                          <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-medium">
                            <Clock className="h-3.5 w-3.5 inline mr-1" />
                            {generateTime}ms
                          </span>
                          {generateResult.note && <span className="text-amber-600">{generateResult.note}</span>}
                        </div>
                      </div>
                    )}

                    {!generateResult && !isGenerating && (
                      <EmptyState
                        icon={FileText}
                        title="暂无文案"
                        description="输入关键词并点击「一键生成文案」按钮，AI 将为您创作高质量内容"
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="translate">
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Languages className="h-5 w-5 text-blue-500" />
                        智能翻译
                      </CardTitle>
                      <ToggleGroup
                        type="single"
                        value={direction}
                        onValueChange={(v) => v && setDirection(v as any)}
                      >
                        <ToggleGroupItem value="zh-to-en">中 → 英</ToggleGroupItem>
                        <ToggleGroupItem value="en-to-zh">英 → 中</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label>{direction === "zh-to-en" ? "中文原文" : "English Source"}</Label>
                        <Textarea
                          placeholder={direction === "zh-to-en" ? "输入要翻译的中文文本..." : "Enter English text..."}
                          value={translateText}
                          onChange={(e) => setTranslateText(e.target.value)}
                          className="min-h-[200px]"
                        />
                        <div className="flex gap-2">
                          {sampleTranslateTexts.map((text) => (
                            <button
                              key={text}
                              onClick={() => setTranslateText(text)}
                              className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[150px]"
                            >
                              {text.slice(0, 20)}...
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>{direction === "zh-to-en" ? "English" : "中文译文"}</Label>
                          {translateResult && (
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleCopy(translateResult.translation)} className="h-8">
                                {copied ? <><Check className="h-4 w-4 mr-1 text-green-500" />已复制</> : <><Copy className="h-4 w-4 mr-1" />复制</>}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleExportMarkdown(translateResult.translation, "翻译")} className="h-8">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="min-h-[200px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-4">
                          {isTranslating ? (
                            <div className="flex flex-col items-center justify-center h-full py-12">
                              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4" />
                              <p className="text-slate-600 dark:text-slate-400">AI 正在翻译中...</p>
                            </div>
                          ) : translateResult ? (
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                              <MarkdownRenderer content={translateResult.translation} />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                              <Languages className="h-10 w-10 mb-3 opacity-50" />
                              <p className="text-center text-sm">翻译结果将显示在这里</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleTranslate}
                      disabled={isTranslating || !translateText.trim()}
                      className="w-full h-12 mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      {isTranslating ? "翻译中..." : "立即翻译"}
                    </Button>

                    {translateResult && (
                      <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
                        <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 font-medium flex items-center gap-1">
                          <Zap className="h-3.5 w-3.5" />
                          {translateResult.mode === "mock" ? "模拟模式" : "LLM 模式"}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-medium">
                          {translateTime}ms
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images">
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Image className="h-5 w-5 text-blue-500" />
                      AI 配图生成
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <Label>文案内容（用于提取关键词生成配图）</Label>
                        <Textarea
                          placeholder="粘贴您的文案内容，AI 将自动提取关键词生成配图..."
                          value={imageContent}
                          onChange={(e) => setImageContent(e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>生成图片数量</Label>
                        <ToggleGroup type="single" value={imageCount} onValueChange={(v) => v && setImageCount(v)} className="justify-start">
                          <ToggleGroupItem value="1">1 张</ToggleGroupItem>
                          <ToggleGroupItem value="2">2 张</ToggleGroupItem>
                          <ToggleGroupItem value="3">3 张</ToggleGroupItem>
                        </ToggleGroup>
                      </div>

                      <Button
                        size="lg"
                        onClick={handleGenerateImages}
                        disabled={isGeneratingImages || !imageContent.trim()}
                        className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
                      >
                        {isGeneratingImages ? (
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            生成配图中
                          </div>
                        ) : (
                          <>
                            <Image className="h-5 w-5 mr-2" />
                            生成智能配图
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="mt-8">
                      {isGeneratingImages ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1, 2, 3].slice(0, Number(imageCount)).map((i) => (
                            <div key={i} className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                          ))}
                        </div>
                      ) : images.length > 0 ? (
                        <ImageGrid images={images} />
                      ) : (
                        <EmptyState
                          icon={Image}
                          title="暂无配图"
                          description="输入文案内容，AI 将自动生成相关的精美配图（点击可预览大图）"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tts">
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-blue-500" />
                      语音合成
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <Label>要朗读的文本</Label>
                        <Textarea
                          placeholder="输入要朗读的文本内容，支持中英文..."
                          value={generateResult?.content || translateResult?.translation || ""}
                          onChange={(e) => {}}
                          className="min-h-[120px]"
                        />
                        {!generateResult?.content && !translateResult?.translation && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            提示：在「文案生成」或「智能翻译」中生成内容后，可直接在这里朗读
                          </p>
                        )}
                      </div>

                      {generateResult?.content || translateResult?.translation ? (
                        <TextToSpeechPlayer text={(generateResult?.content || translateResult?.translation)!} />
                      ) : (
                        <EmptyState
                          icon={Volume2}
                          title="暂无文本可朗读"
                          description="请先在「文案生成」或「智能翻译」中生成内容，或直接输入文本进行语音合成"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-900 shadow-2xl z-50 transition-transform duration-300 border-l border-slate-200 dark:border-slate-800 ${showHistory ? "translate-x-0" : "translate-x-full"}`}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                历史记录
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowHistory(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <Button variant="outline" size="sm" onClick={clearHistory} className="w-full mb-4 text-red-600 hover:text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                清空历史
              </Button>
              <div className="space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-8">暂无历史记录</p>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 group relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          {item.type === "generate" && <><FileText className="h-3 w-3" />文案生成</>}
                          {item.type === "translate" && <><Languages className="h-3 w-3" />智能翻译</>}
                          {item.type === "image" && <><Image className="h-3 w-3" />配图生成</>}
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute -top-1 -right-1"
                          onClick={() => deleteHistoryItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium truncate">{item.input.slice(0, 30)}...</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        <Button
          variant="outline"
          className="fixed bottom-6 right-6 shadow-lg rounded-full h-14 w-14 z-40 bg-white dark:bg-slate-800"
          onClick={() => setShowHistory(!showHistory)}
        >
          <History className="h-5 w-5" />
        </Button>

        <footer className="text-center text-sm text-slate-500 mt-12">
          <p>使用 Next.js + shadcn/ui 构建 · 所有数据存储在本地浏览器</p>
        </footer>
      </div>
    </div>
  )
}
