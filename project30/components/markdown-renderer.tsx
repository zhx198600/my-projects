"use client"

import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const renderMarkdown = (text: string) => {
    const paragraphs = text.split('\n\n').filter((p) => p.trim())

    return paragraphs.map((paragraph, index) => {
      const parts: React.ReactNode[] = []
      let lastIndex = 0
      const boldRegex = /\*\*(.+?)\*\*/g
      let match

      while ((match = boldRegex.exec(paragraph)) !== null) {
        if (match.index > lastIndex) {
          parts.push(paragraph.substring(lastIndex, match.index))
        }
        parts.push(
          <strong key={`bold-${index}-${match.index}`} className="font-semibold text-slate-900 dark:text-white">
            {match[1]}
          </strong>
        )
        lastIndex = match.index + match[0].length
      }

      if (lastIndex < paragraph.length) {
        parts.push(paragraph.substring(lastIndex))
      }

      return (
        <p key={index} className={`mb-4 last:mb-0 leading-relaxed ${className}`}>
          {parts.length > 0 ? parts : paragraph}
        </p>
      )
    })
  }

  return <div className="text-slate-700 dark:text-slate-300">{renderMarkdown(content)}</div>
}
