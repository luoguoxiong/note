import { reactive } from 'vue'
import type { UrgeDialogProps } from './urge-dialog.vue'

export interface ShowUrgeDialogOptions extends Omit<UrgeDialogProps, 'show'> {
  confirm?: () => void
  cancel?: () => void
}

/** 全局弹窗状态（单例） */
const dialogState = reactive({
  show: false,
  title: '温馨提示' as string,
  message: '' as string,
  confirmButtonText: '我知道了' as string,
  cancelButtonText: '取消' as string,
  showCancelButton: false as boolean,
})

let resolvePromise: ((value: boolean) => void) | null = null
let rejectPromise: ((reason?: unknown) => void) | null = null

/**
 * 催派提示弹窗 - 函数式调用（Taro 小程序环境）
 */
export const showUrgeDialog = (options: ShowUrgeDialogOptions): Promise<boolean> => {
  if (!options || typeof options !== 'object') {
    throw new Error('showUrgeDialog need options')
  }

  const { confirm, cancel, ...props } = options

  return new Promise<boolean>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject

    // 先注册回调，再更新状态触发渲染
    ;(dialogState as any)._confirm = () => {
      confirm?.()
      dialogState.show = false
      resolvePromise?.(true)
      resolvePromise = null
      rejectPromise = null
    }
    ;(dialogState as any)._cancel = () => {
      cancel?.()
      dialogState.show = false
      rejectPromise?.('cancel')
      resolvePromise = null
      rejectPromise = null
    }

    // 更新状态，触发组件响应式渲染
    Object.assign(dialogState, props, { show: true })
  })
}

export { dialogState }
