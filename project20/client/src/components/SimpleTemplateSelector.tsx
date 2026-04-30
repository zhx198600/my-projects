import { useState } from 'react'
import { Template } from '../types'
import { templateService } from '../services/templateService'

interface SimpleTemplateSelectorProps {
  selectedTemplate: Template
  onTemplateChange: (template: Template) => void
}

const categoryLabels: Record<Template['category'], string> = {
  business: '商务',
  academic: '学术',
  creative: '创意',
  minimal: '简约'
}

function SimpleTemplateSelector({
  selectedTemplate,
  onTemplateChange
}: SimpleTemplateSelectorProps) {
  const templates = templateService.getAllTemplates()
  const [isOpen, setIsOpen] = useState(false)

  const renderColorPreview = (template: Template) => {
    const { colorScheme } = template
    const colors = [
      colorScheme.primary,
      colorScheme.secondary,
      colorScheme.accent,
    ]

    return (
      <div className="flex gap-1">
        {colors.map((color, idx) => (
          <div
            key={idx}
            className="w-4 h-4 rounded-full border border-gray-200"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900">
            {selectedTemplate.name}
          </span>
          <span className="text-xs text-gray-500">
            {categoryLabels[selectedTemplate.category]}风格
          </span>
        </div>
        <div className="flex items-center gap-2">
          {renderColorPreview(selectedTemplate)}
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700">选择模板</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onTemplateChange(template)
                    setIsOpen(false)
                  }}
                  className={`w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    selectedTemplate.id === template.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {template.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        template.category === 'business' ? 'bg-blue-100 text-blue-700' :
                        template.category === 'minimal' ? 'bg-gray-100 text-gray-700' :
                        template.category === 'academic' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {categoryLabels[template.category]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2">
                      {renderColorPreview(template)}
                      <span className="text-xs text-gray-400">
                        {template.layouts.length} 种布局
                      </span>
                    </div>
                  </div>
                  {selectedTemplate.id === template.id && (
                    <div className="ml-3">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SimpleTemplateSelector
