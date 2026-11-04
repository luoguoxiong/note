import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { isIphone } from '@order-public-sub-public/utils/device'
import Taro, { ENV_TYPE } from '@tarojs/taro'
import type { ObjectDirective } from 'vue'

type vCopyOptions = string | number | vCopyOptionsParams

type vCopyOptionsParams = {
  content: string | number
  successText?: string
  errorText?: string
  duration?: number
}

interface CopyHTMLElement extends HTMLElement {
  $copyValue: vCopyOptionsParams
  $handle: () => void
}

const vCopy: ObjectDirective<CopyHTMLElement, vCopyOptions> = {
  mounted(el, binding) {
    const { value } = binding

    let vCopyOptionsPrams: vCopyOptionsParams = {
      content: '',
      successText: '复制成功',
      errorText: '复制失败',
      duration: 500,
    }
    if (typeof value === 'string' || typeof value === 'number') {
      vCopyOptionsPrams.content = value
    } else {
      vCopyOptionsPrams = { ...vCopyOptionsPrams, ...value }
    }
    el.$copyValue = vCopyOptionsPrams

    const showSuccessToast = () => {
      showToast({ message: el.$copyValue.successText || '复制成功' })
    }
    const showFailToast = () => {
      Taro.showModal({
        title: '温馨提示',
        content: '复制失败，请前往系统-找到APP-剪切板权限选择始终开启',
        confirmText: '我知道了',
        showCancel: false,
      })
    }

    el.$handle = () => {
      if (Taro.getEnv() !== ENV_TYPE.WEB) {
        Taro.setClipboardData({
          data: el.$copyValue.content.toString(),
          success: showSuccessToast,
          fail: showFailToast,
        })
        return
      }
      const fakeElement = document.createElement('textarea')
      fakeElement.setAttribute('readonly', '') // 防止触发软键盘
      fakeElement.style.cursor = 'pointer'
      fakeElement.style.position = 'absolute'
      fakeElement.style.top = '0'
      fakeElement.style.border = '0'
      fakeElement.style.padding = '0'
      fakeElement.style.margin = '0'
      fakeElement.style.zIndex = '-9999px'
      fakeElement.style.left = '-9999px'
      fakeElement.value = el.$copyValue?.content.toString()
      document.body.appendChild(fakeElement)

      if (isIphone) {
        // 处理部分IOS系统使用execCommand('copy') 方法失败的问题
        // window.getSelection()?.removeAllRanges()
        const range = document.createRange()
        range.selectNode(fakeElement)
        // window.getSelection()?.addRange(range)
        fakeElement?.select()
        fakeElement.setSelectionRange(0, fakeElement.value.length) //适配高版本ios
      } else {
        fakeElement?.select()
      }

      const isTrue = document.execCommand('Copy')
      if (!isTrue || !el.$copyValue?.content) {
        showFailToast()
        return
      }
      showSuccessToast()
      // window.getSelection()?.removeAllRanges()
      document.body.removeChild(fakeElement)
    }

    el.addEventListener('click', el.$handle)
  },

  updated(el, binding) {
    const { value } = binding
    if (typeof value === 'string' || typeof value === 'number') {
      el.$copyValue = { ...el.$copyValue, content: value }
    } else {
      el.$copyValue = value
    }
  },

  unmounted(el) {
    el.removeEventListener('click', el.$handle)
  },
}

export default vCopy
