import { Template } from '../types'

const businessClassicColorScheme = {
  id: 'business-classic-colors',
  name: '商务经典配色',
  primary: '#1a365d',
  secondary: '#4a5568',
  accent: '#3182ce',
  background: '#ffffff',
  backgroundAlt: '#f7fafc',
  textPrimary: '#1a202c',
  textSecondary: '#718096',
  border: '#e2e8f0'
}

const minimalModernColorScheme = {
  id: 'minimal-modern-colors',
  name: '简约现代配色',
  primary: '#2d3748',
  secondary: '#718096',
  accent: '#48bb78',
  background: '#ffffff',
  backgroundAlt: '#f7fafc',
  textPrimary: '#1a202c',
  textSecondary: '#718096',
  border: '#e2e8f0'
}

const academicProfessionalColorScheme = {
  id: 'academic-professional-colors',
  name: '学术专业配色',
  primary: '#1a365d',
  secondary: '#4a5568',
  accent: '#d69e2e',
  background: '#ffffff',
  backgroundAlt: '#f7fafc',
  textPrimary: '#1a202c',
  textSecondary: '#718096',
  border: '#e2e8f0'
}

const creativeVibrantColorScheme = {
  id: 'creative-vibrant-colors',
  name: '创意活力配色',
  primary: '#6b46c1',
  secondary: '#805ad5',
  accent: '#e53e3e',
  background: '#ffffff',
  backgroundAlt: '#faf5ff',
  textPrimary: '#1a202c',
  textSecondary: '#718096',
  border: '#e2e8f0'
}

const templateFonts = {
  title: {
    family: "'Inter', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    size: '2.5rem',
    weight: 'bold' as const,
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  subtitle: {
    family: "'Inter', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    size: '1.5rem',
    weight: 'normal' as const,
    lineHeight: 1.4,
    letterSpacing: '0'
  },
  body: {
    family: "'Inter', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    size: '1.125rem',
    weight: 'normal' as const,
    lineHeight: 1.6,
    letterSpacing: '0'
  },
  caption: {
    family: "'Inter', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    size: '0.875rem',
    weight: 'normal' as const,
    lineHeight: 1.5,
    letterSpacing: '0'
  }
}

const commonLayouts = [
  {
    id: 'layout-title',
    name: '标题页',
    description: '大标题 + 副标题居中展示',
    type: 'title' as const,
    suitableFor: ['封面页', '章节过渡页', '结尾感谢页'],
    preview: '居中的标题和副标题'
  },
  {
    id: 'layout-content',
    name: '内容页',
    description: '标题在上，内容在下的标准布局',
    type: 'content' as const,
    suitableFor: ['正文内容', '说明文字', '概念阐述'],
    preview: '顶部标题，下方为内容区域'
  },
  {
    id: 'layout-list',
    name: '列表页',
    description: '标题在上，项目符号列表展示',
    type: 'list' as const,
    suitableFor: ['要点列举', '步骤说明', '优势特点'],
    preview: '顶部标题，下方为项目列表'
  },
  {
    id: 'layout-image-text',
    name: '图文混排',
    description: '左文右图或左图右文的混合布局',
    type: 'image-text' as const,
    suitableFor: ['产品展示', '案例分析', '图文结合说明'],
    preview: '左侧文字，右侧图片或相反'
  },
  {
    id: 'layout-two-column',
    name: '两栏布局',
    description: '左右两栏并列展示内容',
    type: 'two-column' as const,
    suitableFor: ['对比说明', '并列内容', '分类展示'],
    preview: '左右两栏内容并列展示'
  },
  {
    id: 'layout-comparison',
    name: '对比表格',
    description: '表格形式展示对比内容',
    type: 'comparison' as const,
    suitableFor: ['产品对比', '方案比较', '优劣势分析'],
    preview: '表格形式的对比布局'
  }
]

export const templates: Template[] = [
  {
    id: 'template-business-classic',
    name: '商务经典',
    description: '专业、稳重的商务风格，适合企业汇报、项目演示',
    category: 'business',
    colorScheme: businessClassicColorScheme,
    fonts: templateFonts,
    layouts: commonLayouts,
    defaultLayout: 'layout-content'
  },
  {
    id: 'template-minimal-modern',
    name: '简约现代',
    description: '简洁、清爽的现代风格，适合科技演示、产品介绍',
    category: 'minimal',
    colorScheme: minimalModernColorScheme,
    fonts: templateFonts,
    layouts: commonLayouts,
    defaultLayout: 'layout-content'
  },
  {
    id: 'template-academic-professional',
    name: '学术专业',
    description: '严谨、专业的学术风格，适合论文答辩、学术报告',
    category: 'academic',
    colorScheme: academicProfessionalColorScheme,
    fonts: templateFonts,
    layouts: commonLayouts,
    defaultLayout: 'layout-content'
  },
  {
    id: 'template-creative-vibrant',
    name: '创意活力',
    description: '活泼、有活力的创意风格，适合创业展示、创意方案',
    category: 'creative',
    colorScheme: creativeVibrantColorScheme,
    fonts: templateFonts,
    layouts: commonLayouts,
    defaultLayout: 'layout-content'
  }
]
