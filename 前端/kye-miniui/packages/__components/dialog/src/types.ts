export interface DialogProps {
  /** 是否显示弹出层 */
  show: boolean
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 标题 */
  title?: string
  /** 文本内容 */
  message?: string
  /** 是否展示确认按钮 */
  showConfirmButton?: boolean
  /** 是否展示取消按钮 */
  showCancelButton?: boolean
  /** 确认按钮文案 */
  confirmButtonText?: string
  /** 确认按钮字体颜色 */
  confirmButtonColor?: string
  /** 取消按钮文案 */
  cancelButtonText?: string
  /** 取消按钮字体颜色 */
  cancelButtonColor?: string
  /** 层级设置 */
  zIndex?: number
  /** 是否显示遮罩层 */
  overlay?: boolean
  /** 是否点击遮罩关闭 */
  closeOnClickOverlay?: boolean
  /** 弹窗位置偏移量 */
  offset?: number
  useButton?: boolean
  buttonId?: string
  openType?: string
  /* 弹窗是否禁止穿透 */
  catchMove?: boolean
  /* 确认按钮是否loading */
  confirmLoading?: boolean
  /* 关闭按钮是否loading */
  cancelLoading?: boolean
  /** 点击取消按钮 */
  cancle?: () => void
  /** 点击确认按钮 */
  confirm?: () => void
  /** 点击关闭按钮 */
  close?: () => void
  /** 关闭前的回调 */
  beforeClose?: (action: string) => void
}
export interface FuncDialogProps extends Omit<DialogProps, 'show'> {
  parentClassName: string
}
