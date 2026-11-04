import { Placement } from '@popperjs/core/lib/enums'
import { CheckShowType, ModuleType } from '@order-public-sub-public/constants'

export interface checkResultType {
  id: number
  key: string
  showType: CheckShowType
  preConfig?: {
    mask?: boolean // 是否需要点击热区触发
    startPosition?: ModuleType //热区从哪个组件开始
  }
  content: string //文案 统一按v-html处理
}
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

export interface effectBubbleOtherParams {
  needResetError?: boolean
  needFirstToast?: boolean
  needCompatible?: boolean
}

export interface popoverConfigType {
  placement?: Placement
  offset?: [number, number]
  appendTo?: Element | 'parent' | ((ref: Element) => Element) | undefined | null
  waybillNumber?: string
  maxWidth?: number
  theme?: 'light' | 'dark' | 'warning' | 'error'
}
