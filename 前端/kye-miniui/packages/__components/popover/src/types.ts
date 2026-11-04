export type PopoverTheme = 'light' | 'dark' | 'warning' | 'error'

export type PopoverLocation =
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

export type PopoverDirection = 'top' | 'bottom' | 'left' | 'right'

export type PopoverSkew = 'start' | 'end'

export type PopoverAnimation = 'fade' | 'bounce'

export interface PopoverProps {
  show?: boolean
  theme?: PopoverTheme
  location?: PopoverLocation
  offset?: [number, number]
  arrowOffset?: number
  showArrow?: boolean
  targetId?: string
  listenClickId?: string
  custClass?: string
  animation?: PopoverAnimation
}

export type PopoverScreen = {
  height: number
  width: number
}

export interface PopoverPosition {
  width: number
  height: number
  left: number
  top: number
  bottom: number
  right: number
}
