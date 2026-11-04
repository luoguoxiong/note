import { ExtractPropTypes } from 'vue'

export const cellGroupProps = {
  title: String, // 分组标题
  desc: String, // 分组描述
  inset: Boolean, // 是否开启圆角
} as const

export type CellGroupProps = ExtractPropTypes<typeof cellGroupProps>
