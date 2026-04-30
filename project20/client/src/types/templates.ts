export interface ColorScheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  backgroundAlt: string
  textPrimary: string
  textSecondary: string
  border: string
}

export interface FontSpec {
  family: string
  size: string
  weight: 'normal' | 'bold' | 'lighter' | number
  lineHeight?: number
  letterSpacing?: string
}

export interface TemplateFonts {
  title: FontSpec
  subtitle: FontSpec
  body: FontSpec
  caption: FontSpec
}

export interface TemplateLayout {
  id: string
  name: string
  description: string
  type: 'title' | 'content' | 'list' | 'image-text' | 'two-column' | 'comparison'
  suitableFor: string[]
  preview: string
}

export interface Template {
  id: string
  name: string
  description: string
  category: 'business' | 'academic' | 'creative' | 'minimal'
  colorScheme: ColorScheme
  fonts: TemplateFonts
  layouts: TemplateLayout[]
  defaultLayout: string
}
