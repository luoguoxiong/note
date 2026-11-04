/**
 * @Desc: types
 * @Date: 2025/12/18
 */

export type ComponentName = 'custom-input' | 'custom-textarea'

export interface NativeComponentEntryOptions {
  dest?: string // 组件文件导出目录
  components: ComponentName[] // 需要导入组件列表
}

export interface RegisterComponentOptions extends NativeComponentEntryOptions {
  projectRoot: string // 项目目录
}
