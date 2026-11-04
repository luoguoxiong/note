export interface DialogMaskerProps {
  /** 是否显示弹出层 */
  show?: boolean
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
  /** 点击取消按钮 */
  cancle?: () => void
  /** 点击确认按钮 */
  confirm?: () => void
  //关闭前的回调
  beforeClose?: (action: string) => void
  customTitle?: string
  titleIcon?: string
  storageFlag?: boolean
  className?: string
  renderClassName?: boolean //是否要className渲染到class
  closeable?: boolean
}
export interface FuncDialogProps extends Omit<DialogMaskerProps, 'show'> {
  parentClassName: string
}
