import { Any, GlobalEvent } from '@/types'
import { ButtonType } from 'element-plus'
import { Placement } from '@popperjs/core/lib/enums'

export interface ButtonProps extends GlobalEvent {
  disabled?: boolean
  text?: string
  loadingType?: string
  type?: ButtonType | undefined
  // 'ghost':有边框 | 'ghost-bg-color':有背景色 | 'ghost-black':黑色边框
  ghost?: 'ghost' | 'ghost-bg-color' | 'ghost-black' | 'ghost-grey' | ''
  [key: string]: Any
  disabledTips?: string // 禁用提示内容
  effect?: string // 提示弹层风格
  placement?: Placement // 弹层展示位置
  loading?: boolean
  loadingIconType?: string // 加载图标类型
}
