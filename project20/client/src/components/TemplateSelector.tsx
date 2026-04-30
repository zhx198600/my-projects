import { useState } from 'react'
import { Template, TemplateLayout } from '../types'
import { templateService } from '../services/templateService'

interface TemplateSelectorProps {
  selectedTemplate: Template | null
  selectedLayout: TemplateLayout | null
  onTemplateSelect: (template: Template) => void
  onLayoutSelect: (layout: TemplateLayout) => void
}

const categoryLabels: Record<Template['category'], string> = {
  business: '商务',
  academic: '学术',
  creative: '创意',
  minimal: '简约'
}

const layoutTypeLabels: Record<TemplateLayout['type'], string> = {
  title: '标题页',
  content: '内容页',
  list: '列表页',
  'image-text': '图文混排',
  'two-column': '两栏布局',
  comparison: '对比表格'
}

function TemplateSelector({
  selectedTemplate,
  selectedLayout,
  onTemplateSelect,
  onLayoutSelect
}: TemplateSelectorProps) {
  const templates = templateService.getAllTemplates()
  const [activeCategory, setActiveCategory] = useState<Template['category'] | 'all'>('all')

  const filteredTemplates = activeCategory === 'all'
    ? templates
    : templates.filter(t => t.category === activeCategory)

  const categories: (Template['category'] | 'all')[] = ['all', 'business', 'minimal', 'academic', 'creative']

  const renderColorPreview = (template: Template) => {
    const { colorScheme } = template
    const colors = [
      colorScheme.primary,
      colorScheme.secondary,
      colorScheme.accent,
      colorScheme.background,
      colorScheme.textPrimary
    ]

    return (
      <div className="flex gap-1 mt-3">
        {colors.map((color, idx) => (
          <div
            key={idx}
            className="w-5 h-5 rounded-full border border-gray-200"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">选择模板</h3>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? '全部' : categoryLabels[cat]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => onTemplateSelect(template)}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  template.category === 'business' ? 'bg-blue-100 text-blue-700' :
                  template.category === 'minimal' ? 'bg-gray-100 text-gray-700' :
                  template.category === 'academic' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {categoryLabels[template.category]}
                </span>
              </div>
              {renderColorPreview(template)}
              <div className="mt-3 text-xs text-gray-500">
                {template.layouts.length} 种布局
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedTemplate && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            选择布局 - {selectedTemplate.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedTemplate.layouts.map(layout => (
              <button
                key={layout.id}
                onClick={() => onLayoutSelect(layout)}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  selectedLayout?.id === layout.id
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-gray-900">{layout.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    layout.type === 'title' ? 'bg-red-100 text-red-700' :
                    layout.type === 'content' ? 'bg-green-100 text-green-700' :
                    layout.type === 'list' ? 'bg-blue-100 text-blue-700' :
                    layout.type === 'image-text' ? 'bg-purple-100 text-purple-700' :
                    layout.type === 'two-column' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {layoutTypeLabels[layout.type]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{layout.description}</p>
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-1">适用场景：</p>
                  <div className="flex flex-wrap gap-1">
                    {layout.suitableFor.map((scene, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {scene}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTemplate && selectedLayout && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">样式预览</h3>
          
          <div 
            className="rounded-lg p-8 min-h-64"
            style={{
              backgroundColor: selectedTemplate.colorScheme.background,
              border: `2px solid ${selectedTemplate.colorScheme.border}`
            }}
          >
            <h4 
              style={{
                fontFamily: selectedTemplate.fonts.title.family,
                fontSize: selectedTemplate.fonts.title.size,
                fontWeight: selectedTemplate.fonts.title.weight,
                color: selectedTemplate.colorScheme.primary,
                marginBottom: '1rem'
              }}
            >
              幻灯片标题示例
            </h4>
            <div
              style={{
                fontFamily: selectedTemplate.fonts.body.family,
                fontSize: selectedTemplate.fonts.body.size,
                color: selectedTemplate.colorScheme.textPrimary,
                lineHeight: selectedTemplate.fonts.body.lineHeight
              }}
            >
              <p style={{ marginBottom: '0.75rem' }}>
                这是一段示例内容文字，用于展示模板的排版效果。
                使用了 {selectedTemplate.name} 模板的 {selectedLayout.name} 布局。
              </p>
              <p style={{ color: selectedTemplate.colorScheme.textSecondary }}>
                主色调: <span style={{ color: selectedTemplate.colorScheme.primary }}>{selectedTemplate.colorScheme.primary}</span>
                &nbsp;|&nbsp;
                强调色: <span style={{ color: selectedTemplate.colorScheme.accent }}>{selectedTemplate.colorScheme.accent}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateSelector
