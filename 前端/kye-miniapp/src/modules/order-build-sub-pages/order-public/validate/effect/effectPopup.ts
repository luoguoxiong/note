import { createApp, ComponentPublicInstance, render, createVNode } from 'vue'

import LimitBottomPopup from '@order-public-sub-public/components/business/limit-custom/limit-bottom-popup/index.vue'
import Masker from '@order-public-sub-public/components/business/limit-custom/masker/index.vue'
import { updateLimitResult } from '@order-public-sub-public/validate/limit'
import { LimitResult } from '@order-public-sub-public/constants'
import { getDomToTopHeight } from '@order-public-sub-public/validate/utils'
import { getDialogRootClass } from '@order-public-sub-public/validate/pageConfig'
import { Overlay } from '@kye-netc/kye-miniui'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

let unmountNormalyMask: any
//底部面板副作用
export const effectPopup = (data: any) => {
  const { type, blockedFlag } = data || {}
  // debugger

  const parentClassName = getDialogRootClass()
  const page = document.getElementsByClassName(parentClassName)?.[0] || document.body
  const unmount = () => {
    render(null, page)
  }
  return new Promise((resolve, reject) => {
    const vnode = createVNode(LimitBottomPopup, {
      ...data,
      cancel: async () => {
        unmount()
        await updateLimitResult({ type, flag: LimitResult.拒绝, data })
        if (blockedFlag) {
          reject(data)
        } else {
          resolve(data)
        }
      },
      submit: async () => {
        unmount()
        await updateLimitResult({ type, flag: LimitResult.确认, data })
        resolve(data)
      },
      close: async () => {
        unmount()
        await updateLimitResult({ type, flag: LimitResult.取消, data })
        reject(data)
      },
      show: true,
    })
    render(vnode, page)
  })
}
/**
 *生成遮罩层
 * @param {*} blockedFlag 是否中断流程，相当于是否强制
 * @param {*} callback 点击的回调函数
 * @param {*} topSelector 不遮当的模块
 */
export const effectMasker = async (params: {
  blockedFlag: boolean
  callback: () => void
  topSelector?: string[]
  immediate?: boolean
}) => {
  const { blockedFlag, callback, topSelector, immediate } = params
  const top = await getDomToTopHeight(topSelector)
  const vnode = createVNode(Masker, {
    immediate,
    top,
    onClick: () => {
      if (!blockedFlag) {
        unmount()
      }
      callback()
    },
    show: true,
  })
  const footerMaskerVnode = createVNode(Masker, {
    immediate,
    getContainer: true,
    onClick: () => {
      if (!blockedFlag) {
        unmount()
      }
      callback()
    },
    show: true,
  })
  const page = document.getElementsByClassName('order-content')?.[0] || document.body
  const footerPage = document.getElementsByClassName('order-footer-ref')?.[0] || document.body
  render(vnode, page)
  render(footerMaskerVnode, footerPage)
  const unmount = () => {
    render(null, page)
    render(null, footerPage)
  }
  piniaStore.globalData.setMaskInstance({ data: unmount })
  // return
  // const { blockedFlag, callback, topSelector, immediate } = params
  // unmountInstance()
  // const top = getDomToTopHeight(topSelector)
  // const app = createApp(Masker, {
  //   effectMasker,
  //   top,
  //   onClick: () => {
  //     if (!blockedFlag) {
  //       unmount()
  //     }
  //     callback()
  //   },
  // })
  // const parentNode = document.createElement('div')
  // const instance: ComponentPublicInstance = app.mount(parentNode)
  // const containerDom = instance.$el
  // const footerDom = containerDom.cloneNode(true)
  // const orderContent = document.querySelector('#orderContent')
  // const orderFooter = document.querySelector('.order-footer-ref') // 本来是通过id获取换成类目
  //
  // orderContent?.appendChild(containerDom)
  // footerDom.style.top = 0
  // orderFooter?.appendChild(footerDom)
  // footerDom.addEventListener('click', () => {
  //   instance.$emit('click')
  // })
  // if (immediate) {
  //   instance.$emit('click')
  // }
  // const unmount = () => {
  //   app.unmount()
  //   // try {
  //   //   if (orderContent?.contains(containerDom)) {
  //   //     orderContent?.removeChild(containerDom)
  //   //   }
  //   //   if (orderFooter?.contains(footerDom)) {
  //   //     orderFooter?.removeChild(footerDom)
  //   //   }
  //   // } catch (error) {
  //   //   console.error(error)
  //   // }
  // }
  // unmountNormalyMask = unmount
  return {
    // instance,
    unmount,
  }
}

export const unmountInstance = () => {
  if (typeof unmountNormalyMask === 'function') {
    unmountNormalyMask()
  }
}

let unmountConfirmMaskFunc: any
export const confirmMasker = (contentSelector?: string, top?: number) => {
  // unmountConfirmMask()
  // const maskerApp = createApp(Masker, {
  //   effectMasker,
  //   top: top || 0,
  //   querySelector: `#${contentSelector}`,
  // })
  // const parentNode = document.createElement('div')
  // const instance: ComponentPublicInstance = maskerApp.mount(parentNode)
  // const containerDom = instance.$el
  // const selector = contentSelector ? `#${contentSelector}` : '#app'
  // const maskContent = document.querySelector(selector)
  // maskContent?.appendChild(containerDom)
  //
  // const unmount = () => {
  //   maskerApp.unmount()
  //   try {
  //     if (maskContent?.contains(containerDom)) {
  //       maskContent?.removeChild(containerDom)
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }
  //
  // unmountConfirmMaskFunc = unmount
  const unmount = () => {
    console.log(contentSelector)
  }
  const maskerApp = () => {
    console.log(contentSelector)
  }
  return { unmount, maskerApp }
}

export const unmountConfirmMask = () => {
  if (typeof unmountConfirmMaskFunc === 'function') {
    unmountConfirmMaskFunc()
  }
}
