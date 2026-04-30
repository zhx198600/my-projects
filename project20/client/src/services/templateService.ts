import { Template, TemplateLayout } from '../types'
import { templates } from '../data/templates'

class TemplateService {
  private templates: Template[]

  constructor(templatesData: Template[] = templates) {
    this.templates = templatesData
  }

  getAllTemplates(): Template[] {
    return [...this.templates]
  }

  getTemplateById(id: string): Template | undefined {
    return this.templates.find(template => template.id === id)
  }

  getTemplatesByCategory(category: Template['category']): Template[] {
    return this.templates.filter(template => template.category === category)
  }

  getDefaultTemplate(): Template {
    const businessTemplate = this.getTemplatesByCategory('business')[0]
    if (businessTemplate) {
      return businessTemplate
    }
    return this.templates[0]
  }

  recommendLayout(template: Template, slideType: string): TemplateLayout | undefined {
    const typeMap: Record<string, string> = {
      'title': 'layout-title',
      'cover': 'layout-title',
      'content': 'layout-content',
      'text': 'layout-content',
      'list': 'layout-list',
      'bullet': 'layout-list',
      'image-text': 'layout-image-text',
      'image': 'layout-image-text',
      'two-column': 'layout-two-column',
      'comparison': 'layout-comparison',
      'compare': 'layout-comparison'
    }

    const layoutId = typeMap[slideType.toLowerCase()]
    if (layoutId) {
      return template.layouts.find(layout => layout.id === layoutId)
    }

    return template.layouts.find(layout => layout.id === template.defaultLayout)
  }

  applyTemplate(
    template: Template,
    layout: TemplateLayout
  ): {
    containerStyle: React.CSSProperties
    titleStyle: React.CSSProperties
    contentStyle: React.CSSProperties
  } {
    const { colorScheme, fonts } = template

    const baseContainerStyle: React.CSSProperties = {
      backgroundColor: colorScheme.background,
      color: colorScheme.textPrimary,
      fontFamily: fonts.body.family,
      padding: '2rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }

    const baseTitleStyle: React.CSSProperties = {
      fontFamily: fonts.title.family,
      fontSize: fonts.title.size,
      fontWeight: fonts.title.weight,
      lineHeight: fonts.title.lineHeight,
      letterSpacing: fonts.title.letterSpacing,
      color: colorScheme.primary,
      marginBottom: '1.5rem'
    }

    const baseContentStyle: React.CSSProperties = {
      fontFamily: fonts.body.family,
      fontSize: fonts.body.size,
      fontWeight: fonts.body.weight,
      lineHeight: fonts.body.lineHeight,
      color: colorScheme.textPrimary,
      flex: 1
    }

    switch (layout.type) {
      case 'title':
        return {
          containerStyle: {
            ...baseContainerStyle,
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          },
          titleStyle: {
            ...baseTitleStyle,
            fontSize: '3rem',
            marginBottom: '1rem'
          },
          contentStyle: {
            ...baseContentStyle,
            fontFamily: fonts.subtitle.family,
            fontSize: fonts.subtitle.size,
            color: colorScheme.textSecondary,
            flex: 'none'
          }
        }

      case 'list':
        return {
          containerStyle: baseContainerStyle,
          titleStyle: baseTitleStyle,
          contentStyle: {
            ...baseContentStyle,
            paddingLeft: '1rem'
          }
        }

      case 'image-text':
        return {
          containerStyle: {
            ...baseContainerStyle,
            flexDirection: 'row',
            alignItems: 'center',
            gap: '2rem'
          },
          titleStyle: baseTitleStyle,
          contentStyle: {
            ...baseContentStyle,
            flex: 1
          }
        }

      case 'two-column':
        return {
          containerStyle: baseContainerStyle,
          titleStyle: baseTitleStyle,
          contentStyle: {
            ...baseContentStyle,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem'
          }
        }

      case 'comparison':
        return {
          containerStyle: baseContainerStyle,
          titleStyle: baseTitleStyle,
          contentStyle: {
            ...baseContentStyle,
            display: 'flex',
            flexDirection: 'column'
          }
        }

      case 'content':
      default:
        return {
          containerStyle: baseContainerStyle,
          titleStyle: baseTitleStyle,
          contentStyle: baseContentStyle
        }
    }
  }
}

export const templateService = new TemplateService()
