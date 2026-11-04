import Dialog from './dialog.vue'
import { createVNode, reactive, render } from 'vue'
import { FuncDialogProps } from './types'

export const showDialog = (options: FuncDialogProps) => {
  const { parentClassName = '', confirm = () => {}, cancle = () => {}, close = () => {} } = options

  const mountNode = document.getElementsByClassName(parentClassName)

  const page = (mountNode.length ? mountNode?.[mountNode.length - 1] : mountNode?.[0]) || document.body
  const state = reactive({
    ...options,
  })

  let vnode: any

  /* 更新确认按钮loading变量 */
  const showConfirmLoading = () => {
    if (vnode?.component?.exposed?.showConfirmLoading) {
      vnode.component.exposed.showConfirmLoading()
    }
  }

  /* 更新取消按钮loading变量 */
  const showCancelLoading = () => {
    if (vnode?.component?.exposed?.showCancelLoading) {
      vnode.component.exposed.showCancelLoading()
    }
  }

  /* 更新确认按钮loading变量 */
  const hideConfirmLoading = () => {
    if (vnode?.component?.exposed?.hideConfirmLoading) {
      vnode.component.exposed.hideConfirmLoading()
    }
  }

  /* 更新取消按钮loading变量 */
  const hideCancelLoading = () => {
    if (vnode?.component?.exposed?.hideCancelLoading) {
      vnode.component.exposed.hideCancelLoading()
    }
  }

  const promise = new Promise((resolve, reject) => {
    vnode = createVNode(Dialog, {
      ...state,
      catchMove: true,
      onConfirm: () => {
        confirm()
        // 延迟用于render太快-点透触发底部按钮事件
        setTimeout(() => {
          render(null, page)
          resolve(true)
        }, 50)
      },
      onCancel: () => {
        cancle()
        setTimeout(() => {
          render(null, page)
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('cancel')
        }, 50)
      },
      onClose: () => {
        close()
        setTimeout(() => {
          render(null, page)
          reject('close')
        }, 50)
      },
      show: true,
    })

    render(vnode, page)
  })
  return Object.assign(promise, {
    vnode,
    showConfirmLoading,
    showCancelLoading,
    hideConfirmLoading,
    hideCancelLoading
  })
}
