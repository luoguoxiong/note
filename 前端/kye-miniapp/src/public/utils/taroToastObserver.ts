import { throttle } from 'lodash-es'
import Taro from '@tarojs/taro'

const WRAPPER_CLASS = 'taro__toast-page-wrapper'

const routeWhiteList = ['/modules/user/pages/changeLogin/index', '/modules/webview/pages/webview/index']

/** 当前是否为 webview 页面（此类页面不展示 taro toast） */
const isWebviewPage = (): boolean => {
  const route = Taro.getCurrentPages().slice?.(-1)?.[0]?.route ?? ''
  return !!route && routeWhiteList.includes(route)
}

/** 给 taro__toast 套一层容器，已套过则直接返回原容器 */
const ensureToastWrapped = (el: HTMLElement): HTMLElement | null => {
  if (el.parentElement?.classList.contains(WRAPPER_CLASS)) {
    return el.parentElement as HTMLElement
  }
  const wrapper = document.createElement('div')
  wrapper.className = WRAPPER_CLASS
  el.parentNode?.insertBefore(wrapper, el)
  wrapper.appendChild(el)
  return wrapper
}

/** 按是否 webview 页控制 toast 容器显隐（不改 toast 自带的 display 逻辑） */
const toggleTaroToastByPage = (): void => {
  const el = document.querySelector('.taro__toast') as HTMLElement | null
  if (!el) return
  const wrapper = ensureToastWrapped(el)
  if (!wrapper) return
  if (isWebviewPage()) {
    wrapper.style.display = 'none'
  } else {
    wrapper.style.display = ''
  }
}

/**
 * H5 下监听 taro__toast 挂载，套一层容器后按是否 webview 页控制容器显隐。
 * 仅在 H5 环境生效，非 H5 调用无副作用。
 */
export const observeTaroToastForH5 = (): void => {
  if (Taro.getEnv() !== Taro.ENV_TYPE.WEB || typeof document === 'undefined') return
  const observer = new MutationObserver(throttle(toggleTaroToastByPage, 80))
  observer.observe(document.body, { childList: true, subtree: true })
}
