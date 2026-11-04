import { Placement } from '@popperjs/core/lib/enums'

export interface localCheckResult {
  key: string
  passed: boolean
  showType?: CheckShowType
  content?: string
  bubbleConfig?: popoverConfigType
  blockedFlag?: boolean
  noNeedErrorColor?: boolean
  extraData?: any
  needCompatible?: boolean
  closeCallback?: (bol?: boolean) => void
}

export interface popoverConfigType {
  placement?: Placement
  offset?: [number, number]
  appendTo?: Element | 'parent' | ((ref: Element) => Element) | undefined | null
  waybillNumber?: string
  maxWidth?: number
  theme?: 'light' | 'dark' | 'warning' | 'error'
}

/**
 * @description 错误展示类型
 */
export enum CheckShowType {
  BUBBLE = 1, // 气泡
  BAR = 2, // 创可贴
  TOAST = 3, // 吐司提示
  DIALOG = 4, // 弹窗提示
  POPUP = 5, //底部弹窗
}
