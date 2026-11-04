import { isAndroid, isIphone, isWxPcApplet } from '@order-public-sub-public/utils/device'
import type { ObjectDirective } from 'vue'

interface KeyBoardHTMLElement extends HTMLElement {
  _resizeFn?: () => void
  _handlerFocusin?: (e: FocusEvent) => void
  _handlerFocusout?: () => void
}

let focusoutTimeout: number | null = null

const vKeyBoard: ObjectDirective<KeyBoardHTMLElement> = {
  mounted(el) {
    if (!isAndroid || isWxPcApplet) return
    let isElementShow = document.querySelector('#isElementShow') as HTMLElement | null

    const originHeight = document.documentElement.clientHeight || document.body.clientHeight

    const resizeFn = () => {
      const resizeHeight = document.documentElement.clientHeight || document.body.clientHeight
      isElementShow = document.querySelector('#isElementShow') as HTMLElement | null // 弹窗关闭后可能找不到元素，重新获取
      const diffHeight = Number(originHeight || 0) - Number(resizeHeight || 0)
      if (resizeHeight < originHeight && diffHeight > 100) {
        isElementShow && (isElementShow.style.display = 'none')
      } else {
        isElementShow && (isElementShow.style.display = 'block')
      }
    }

    if (isElementShow && isAndroid) {
      window.addEventListener('resize', resizeFn)
    }

    const handlerFocusin = (e: FocusEvent) => {
      if (!['input', 'textarea'].includes((e?.target as HTMLElement)?.tagName.toLowerCase())) {
        // button 等点击也会引起 focusin 事件
        return
      }

      focusoutTimeout && clearTimeout(focusoutTimeout) // 先操作button再focus input，会导致input 的 focusout事件先触发
      isElementShow = document.querySelector('#isElementShow')
      isElementShow && (isElementShow.style.display = 'none')
      if (isAndroid) {
        setTimeout(() => {
          el.scrollIntoView({
            block: 'start',
            behavior: 'smooth',
          })
        }, 100)
      }
    }

    const handlerFocusout = () => {
      focusoutTimeout = setTimeout(() => {
        isElementShow = document.querySelector('#isElementShow')
        isElementShow && (isElementShow.style.display = 'block')
      }, 300)
    }

    // 添加判断不然由于handlerFocusout 延迟执行在安卓会部分机型出现冲突无法隐藏
    if (el && isIphone) {
      el.addEventListener('focusin', handlerFocusin)
      el.addEventListener('focusout', handlerFocusout)
    }

    // Store the event listeners and functions on the element
    el._resizeFn = resizeFn
    el._handlerFocusin = handlerFocusin
    el._handlerFocusout = handlerFocusout
  },
  unmounted(el) {
    if (!isAndroid || isWxPcApplet) return
    el._resizeFn && window.removeEventListener('resize', el._resizeFn)
    el._handlerFocusin && el.removeEventListener('focusin', el._handlerFocusin)
    el._handlerFocusout && el.removeEventListener('focusout', el._handlerFocusout)

    // Clean up the stored event listeners and functions on the element
    delete el._resizeFn
    delete el._handlerFocusin
    delete el._handlerFocusout
  },
}

export default vKeyBoard
