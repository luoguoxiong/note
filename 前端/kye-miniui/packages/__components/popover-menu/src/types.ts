// import { ExtractPropTypes } from 'vue'

// export const popoverMenuProps = {
// } as const

// export type PopoverMenuProps = ExtractPropTypes<typeof popoverMenuProps>
type PopoverLocation =
  | 'bottom'
  | 'top'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end'

export type PopoverMenuProps = {
  location: PopoverLocation
  offset?: [number, number]
  /** 是否使用button */
  useButton: Boolean
  /** 菜单列表 */
  menus: Array<{
    /** 类型 */
    type: number | string
    /** 名称 */
    label: string
    /** 图标 */
    icon?: string
  }>
}
