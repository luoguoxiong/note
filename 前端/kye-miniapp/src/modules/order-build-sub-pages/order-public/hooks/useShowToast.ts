import Taro from '@tarojs/taro'
import { getDialogRootClass } from '@order-public-sub-public/validate/pageConfig'
import { render } from 'vue'
// @order-public-sub-public/hooks/useShowToast

export const showToast = (data: string | { message: string }) => {
  if (typeof data === 'string') return Taro.showToast({ title: data, icon: 'none' })

  return Taro.showToast({ title: data?.message, icon: 'none' })
}

// import { showDialog } from '@order-public-sub-public/hooks/useShowToast'
export const showDialog = (options: {
  message?: string
  content?: string
  confirmButtonText?: string
  cancelButtonText?: string
  confirmText?: string
  cancelText?: string
  allowHtml?: boolean
  title?: string
}) => {
  return new Promise((resolve, reject) => {
    Taro.showModal({
      content: options.message || options.content,
      cancelText: options.cancelButtonText || options.cancelText,
      confirmText: options.confirmButtonText || options.confirmText,
      ...options,
      success(res) {
        if (res.confirm) {
          resolve('confirm')
        } else if (res.cancel) {
          resolve('cancel')
        }
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

export type Field = {
  primary: string
  default: string
  warning: string
  danger: string
  plain: string
}

export type PickerInstance = {
  primary: string
  default: string
  warning: string
  danger: string
  plain: string
}
export type FieldType = {
  primary: string
  default: string
  warning: string
  danger: string
  plain: string
}
export type DialogOptions = {
  primary: string
  default: string
  warning: string
  danger: string
  plain: string
}

export const showLoadingToast = (params: {
  title?: string
  mask?: boolean
  duration?: number
  forbidClick?: boolean
}) => {
  const { title = '加载中', mask = true, duration = 1000, forbidClick = false } = params
  console.log(forbidClick)

  Taro.showLoading({
    title,
    mask,
  })
  if (duration > 0) {
    setTimeout(() => {
      Taro.hideLoading()
    }, duration)
  }
}
export const closeToast = () => {
  Taro.hideLoading()
}

export const showSuccessToast = (message: string) => {
  Taro.showToast({
    title: message,
    icon: 'success',
    duration: 2000,
  })
}

export const showFailToast = (message: string) => {
  Taro.showToast({
    title: message,
    icon: 'none',
    duration: 2000,
  })
}

// TODO 先占位
export const closeDialog = () => {
  const parentClassName = getDialogRootClass() || 'dialog_root_order'
  const page = document.getElementsByClassName(parentClassName)?.[0] || document.body
  render(null, page)
}
