/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@wangeditor/editor-for-vue' {
  import type { DefineComponent } from 'vue'
  import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

  export const Editor: DefineComponent<{
    defaultConfig?: Partial<IEditorConfig>
    defaultHtml?: string
    modelValue?: string
    mode?: 'default' | 'simple'
  }>

  export const Toolbar: DefineComponent<{
    editor: IDomEditor | null
    defaultConfig?: Partial<IToolbarConfig>
    mode?: 'default' | 'simple'
  }>
}
