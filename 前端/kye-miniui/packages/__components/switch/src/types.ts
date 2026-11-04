export type KySwitchProps = Partial<{
  modelValue: boolean
  color: string
  // UI暂只支持三种
  size: 'large' | 'medium' | 'normal' | 'small' | 'mini'
  checked: boolean
  disabled: boolean
  type?: 'switch' | 'checkbox'
  loading: boolean
  activeValue: string | number | boolean
  inactiveValue: string | number | boolean
  activeColor: string
  inactiveColor: string
}>
