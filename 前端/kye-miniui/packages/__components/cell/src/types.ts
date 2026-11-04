export type CellProps = Partial<{
  title: string // title
  label: string // title下方描述信息
  value: string // 右侧内容
  placeholder: string // 右侧placeholder
  icon: string // 左侧图标链接
  isLink: boolean // 是否包含箭头
  clickable: boolean // 时刻可点击
  center: boolean // 是否使左右内容都垂直居中
  required: boolean // 必填图标是否展示
  size: 'large' | 'normal' // 单元格尺寸
  inset: boolean // 是否开启圆角
  isError: boolean // 内容是否为error状态
  descTextAlign: string
  requiredDirection: 'right' | 'left' // 必填图标展示位置
  disabled: boolean
}>
