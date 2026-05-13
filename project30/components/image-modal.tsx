"use client"

import React, { useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageData {
  url: string
  prompt: string
  alt: string
}

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  images: ImageData[]
  initialIndex?: number
}

export function ImageModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex)

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }, [images.length])

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = images[currentIndex].url
    link.download = `image-${currentIndex + 1}.jpg`
    link.target = "_blank"
    link.click()
  }

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") goToPrevious()
      if (e.key === "ArrowRight") goToNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, goToPrevious, goToNext])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentImage = images[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex flex-col h-full w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white">
            <span className="text-sm text-white/70">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 hover:text-white h-10 w-10 p-0"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 hover:text-white h-10 w-10 p-0"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative min-h-0">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-0 text-white hover:bg-white/20 hover:text-white h-12 w-12 p-0 rounded-full"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div className="flex flex-col items-center max-h-full">
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="max-h-[calc(100vh-220px)] w-auto object-contain rounded-lg shadow-2xl"
            />
            <p className="mt-4 text-white/70 text-sm text-center max-w-lg px-4">
              {currentImage.prompt}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 text-white hover:bg-white/20 hover:text-white h-12 w-12 p-0 rounded-full"
            onClick={goToNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-4 overflow-x-auto py-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                index === currentIndex
                  ? "ring-2 ring-blue-500 scale-105"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={image.url}
                alt={`缩略图 ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
