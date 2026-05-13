"use client"

import React, { useState, useEffect } from "react"
import { ZoomIn, Image as ImageIcon, Maximize2 } from "lucide-react"
import { ImageModal } from "./image-modal"

interface ImageData {
  url: string
  prompt: string
  alt: string
}

interface ImageGridProps {
  images: ImageData[]
  isLoading?: boolean
}

const LazyImage: React.FC<{
  src: string
  alt: string
  onClick: () => void
  className?: string
}> = ({ src, alt, onClick, className }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "100px" }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden group cursor-pointer ${className}`}
      onClick={onClick}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-slate-400" />
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          } group-hover:scale-110`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <Maximize2 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ImageGrid({ images, isLoading = false }: ImageGridProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const openImage = (index: number) => {
    setSelectedIndex(index)
    setModalOpen(true)
  }

  const gridClass =
    images.length === 1
      ? "grid-cols-1"
      : images.length === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

  if (isLoading) {
    return (
      <div className={`grid ${gridClass} gap-4`}>
        {[1, 2, 3].slice(0, Math.max(1, images.length || 3)).map((i) => (
          <div
            key={i}
            className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return null
  }

  return (
    <>
      <div className={`grid ${gridClass} gap-4`}>
        {images.map((image, index) => (
          <LazyImage
            key={index}
            src={image.url}
            alt={image.alt}
            onClick={() => openImage(index)}
            className={`aspect-video rounded-xl shadow-md hover:shadow-xl transition-shadow ${
              images.length === 3 && index === 0
                ? "sm:col-span-2 lg:col-span-1"
                : ""
            }`}
          />
        ))}
      </div>

      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={images}
        initialIndex={selectedIndex}
      />
    </>
  )
}
