export interface PopoverType {
  modelValue?: boolean
  show?: boolean
  text?: string
  trigger?: PopoverTrigger
  closeOnClickAction?: boolean
  placement?: any
}

export type PopoverTrigger = 'click' | 'manual'
