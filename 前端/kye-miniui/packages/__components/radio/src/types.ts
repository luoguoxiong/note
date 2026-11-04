// import { ExtractPropTypes } from 'vue'

// export const radioProps = {} as const

// export type RadioProps = ExtractPropTypes<typeof radioProps>

export type RadioType = 'round' | 'check' | 'button' | 'button-check' | 'button-select'

export type RadioProps = Partial<{
  modelValue: string | number | boolean
  name: string | boolean
  direction: 'vertical' | 'horizontal'
  size: 'large' | 'medium' | 'normal' | 'small' | 'mini'
  type: RadioType
  disabled: boolean
  checked: boolean
  isError: boolean
  labelPosition: 'left' | 'right'
  iconSize: number,
  checkedHighlight: boolean
}>
