/* eslint-disable no-undef */
import Taro from '@tarojs/taro'
import { isH5Env } from '@public/utils'

interface ExposureBinding {
  eventCode?: string
  otherParams?: () => {}
}

export default {
  mounted(el: any, binding: { value: ExposureBinding }) {
    // TODO h5适配
    if (isH5Env) {
      return
    }
    const options = binding.value || {}

    // 保存 observer 实例
    let observer: Taro.IntersectionObserver | null = null

    const invoke = () => {
      const eventCode = options?.eventCode
      const otherParams = options?.otherParams ? options?.otherParams() : {}
      if (eventCode) {
        console.error(eventCode, otherParams)
      }
      stopObserve()
    }

    const stopObserve = () => {
      if (observer) {
        observer.disconnect()
        observer = null
      }
    }

    observer = Taro.createIntersectionObserver(this, {
      thresholds: [0],
    })

    observer.relativeToViewport().observe(`#${el.id}`, (res) => {
      if (res?.intersectionRatio && res?.intersectionRatio > 0) invoke()
    })
    //
    // 解绑时清理
    el._exposureStop = stopObserve
  },

  unmounted(el: any) {
    if (el._exposureStop) {
      el._exposureStop()
      delete el._exposureStop
    }
  },
}
