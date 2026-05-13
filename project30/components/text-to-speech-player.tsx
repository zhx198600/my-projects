"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Download,
  Loader2,
  Globe,
  AlertCircle,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface TextToSpeechPlayerProps {
  text: string
}

type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "stopped" | "error" | "timeout"

export function TextToSpeechPlayer({ text }: TextToSpeechPlayerProps) {
  const [status, setStatus] = useState<PlaybackStatus>("idle")
  const [volume, setVolume] = useState([1])
  const [rate, setRate] = useState([1])
  const [pitch, setPitch] = useState([1])
  const [language, setLanguage] = useState<"zh" | "en">("zh")
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const clearTimeoutHandler = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleError = useCallback((message: string) => {
    setStatus("error")
    setErrorMessage(message)
    clearTimeoutHandler()
    window.speechSynthesis.cancel()
  }, [clearTimeoutHandler])

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
      
      const chineseVoice = availableVoices.find(
        (v) => v.lang.includes("zh") || v.lang.includes("cmn")
      )
      if (chineseVoice) {
        setSelectedVoice(chineseVoice)
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      clearTimeoutHandler()
      window.speechSynthesis.cancel()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [clearTimeoutHandler])

  useEffect(() => {
    if (language === "zh") {
      const chineseVoice = voices.find(
        (v) => v.lang.includes("zh") || v.lang.includes("cmn")
      )
      if (chineseVoice) {
        setSelectedVoice(chineseVoice)
      }
    } else {
      const englishVoice = voices.find((v) => v.lang.includes("en"))
      if (englishVoice) {
        setSelectedVoice(englishVoice)
      }
    }
  }, [language, voices])

  useEffect(() => {
    if (status === "loading") {
      timeoutRef.current = setTimeout(() => {
        handleError("语音合成超时（5秒），请稍后重试")
        setStatus("timeout")
      }, 5000)
    }

    return () => clearTimeoutHandler()
  }, [status, handleError, clearTimeoutHandler])

  useEffect(() => {
    setProgress(0)
    setStatus("idle")
    setErrorMessage(null)
  }, [text])

  const startRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: false,
          audio: true,
        } as any)
        streamRef.current = stream

        if (MediaRecorder.isTypeSupported("audio/wav")) {
          mediaRecorderRef.current = new MediaRecorder(stream, {
            mimeType: "audio/wav",
          })
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mediaRecorderRef.current = new MediaRecorder(stream, {
            mimeType: "audio/webm",
          })
        } else {
          mediaRecorderRef.current = new MediaRecorder(stream)
        }

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data)
          }
        }

        mediaRecorderRef.current.start()
      }
    } catch (err) {
      console.log("Recording not available:", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }

  const handleDownload = () => {
    if (audioChunksRef.current.length === 0) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.volume = volume[0]
      utterance.rate = rate[0]
      utterance.pitch = pitch[0]
      utterance.lang = language === "zh" ? "zh-CN" : "en-US"
      if (selectedVoice) utterance.voice = selectedVoice

      const blob = new Blob([text], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "speech-content.txt"
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    const mimeType = audioChunksRef.current[0]?.type || "audio/webm"
    const blob = new Blob(audioChunksRef.current, { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `speech-${Date.now()}.webm`
    a.click()
    URL.revokeObjectURL(url)
    audioChunksRef.current = []
  }

  const handlePlay = () => {
    if (!text.trim()) {
      setErrorMessage("请先输入要朗读的文本")
      setStatus("error")
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.volume = isMuted ? 0 : volume[0]
    utterance.rate = rate[0]
    utterance.pitch = pitch[0]
    utterance.lang = language === "zh" ? "zh-CN" : "en-US"
    if (selectedVoice) utterance.voice = selectedVoice

    utterance.onstart = () => {
      clearTimeoutHandler()
      setStatus("playing")
      setProgress(0)
    }

    utterance.onboundary = (event) => {
      if (event.charIndex > 0) {
        const percent = Math.min((event.charIndex / text.length) * 100, 95)
        setProgress(percent)
      }
    }

    utterance.onend = () => {
      clearTimeoutHandler()
      setStatus("stopped")
      setProgress(100)
      stopRecording()
    }

    utterance.onerror = (event) => {
      clearTimeoutHandler()
      handleError(`语音合成错误: ${event.error}`)
      stopRecording()
    }

    utteranceRef.current = utterance
    setStatus("loading")
    setErrorMessage(null)

    startRecording().then(() => {
      window.speechSynthesis.speak(utterance)
    })
  }

  const handlePause = () => {
    window.speechSynthesis.pause()
    setStatus("paused")
  }

  const handleResume = () => {
    window.speechSynthesis.resume()
    setStatus("playing")
  }

  const handleStop = () => {
    clearTimeoutHandler()
    window.speechSynthesis.cancel()
    setStatus("stopped")
    setProgress(0)
    stopRecording()
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (utteranceRef.current) {
      utteranceRef.current.volume = !isMuted ? 0 : volume[0]
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                语音朗读
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-500" />
              <ToggleGroup
                type="single"
                value={language}
                onValueChange={(value) => value && setLanguage(value as "zh" | "en")}
                className="justify-start"
              >
                <ToggleGroupItem value="zh" className="h-8 px-3 text-sm">
                  中文
                </ToggleGroupItem>
                <ToggleGroupItem value="en" className="h-8 px-3 text-sm">
                  English
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Label className="text-slate-600 dark:text-slate-400">
                播放进度
              </Label>
              <span className="text-blue-600 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
              {status === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleStop}
              disabled={status === "idle" || status === "loading"}
              className="h-12 w-12 rounded-full border-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <Square className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              onClick={
                status === "playing"
                  ? handlePause
                  : status === "paused"
                    ? handleResume
                    : handlePlay
              }
              disabled={status === "loading"}
              className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30"
            >
              {status === "loading" ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : status === "playing" ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="h-12 w-12 rounded-full border-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/30"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-red-500" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
              disabled={status === "loading" || status === "playing"}
              className="h-12 w-12 rounded-full border-2 hover:bg-green-50 hover:border-green-300 hover:text-green-600 dark:hover:bg-green-950/30"
              title="下载音频"
            >
              <Download className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label className="text-slate-600 dark:text-slate-400">
                  音量
                </Label>
                <span className="text-blue-600 font-medium">
                  {Math.round(volume[0] * 100)}%
                </span>
              </div>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={1}
                min={0}
                step={0.05}
                className="w-full"
                disabled={isMuted}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label className="text-slate-600 dark:text-slate-400">
                  语速
                </Label>
                <span className="text-blue-600 font-medium">
                  {rate[0].toFixed(1)}x
                </span>
              </div>
              <Slider
                value={rate}
                onValueChange={setRate}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label className="text-slate-600 dark:text-slate-400">
                  音调
                </Label>
                <span className="text-blue-600 font-medium">
                  {pitch[0].toFixed(1)}
                </span>
              </div>
              <Slider
                value={pitch}
                onValueChange={setPitch}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {status === "playing" && (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="flex items-end gap-1 h-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-500 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 100 + 20}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                正在朗读...
              </span>
            </div>
          )}

          {status === "loading" && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                正在准备语音合成...
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
              <X className="h-5 w-5 text-red-500 ml-auto cursor-pointer hover:text-red-600" onClick={() => {
                setErrorMessage(null)
                setStatus("idle")
              }} />
            </div>
          )}

          <div className="text-xs text-center text-slate-500 dark:text-slate-400">
            使用浏览器 Web Speech API · 语音合成超时保护 5 秒
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
