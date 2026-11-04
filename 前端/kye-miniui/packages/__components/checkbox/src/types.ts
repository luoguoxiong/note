export type CheckboxType = 'round' | 'check' | 'button' | 'button-check' | 'button-select'

export type CheckboxProps = Partial<{
  modelValue: string | number | boolean // 当前选中
  name: string | number // 选项name
  direction: 'vertical' | 'horizontal' // 方向vertical: 垂直 , horizontal: 水平
  size: 'large' | 'medium' | 'normal' | 'small' | 'mini' // 尺寸
  type: CheckboxType // 风格
  disabled: boolean // 是否禁用
  checked: boolean // 是否选中
  isError: boolean // 是否报错
  labelPosition: 'left' | 'right' // 文本位置
  iconSize: number // 图标大小
}>
