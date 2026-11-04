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

export interface PopoverRootPosition {
  width: number
  height: number
  left: number
  top: number
  bottom:number
  right: number
}

export type PopoverDirection = "top" | "bottom" | "left" | "right";

export interface PopoverProps {
  show: boolean;
  theme: PopoverTheme;
  location: PopoverLocation;
  offset?: number[];
  arrowOffset: number;
  showArrow?: boolean;
  custClass?: string
}

