export interface PropsType {
  modelValue?: string | number
  formatter?: (value: string) => string
  placeholder?: string
  dataValidate?: string
  disabled?: boolean
  clearable?: boolean
  position?: 'left' | 'right'
  requiredTag?: boolean
}
