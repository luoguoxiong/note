import { document } from '@tarojs/runtime'
import { nextTick, useDidHide, useDidShow } from '@tarojs/taro'
import { onMounted } from 'vue'
import { isH5Env, report_EXP_event } from '../utils'
import { createObserve } from '../createObserve'

export const useExposureReport = (ids: string[], publicParams?: { [key: string]: any }) => {
  let isCreate = false

  let disconnects: any = []
  const publicParam = publicParams || {}
  const createPageObserve = () => {
    if (isCreate) return
    isCreate = true
    disconnects.map((disconnect) => disconnect?.())
    disconnects = ids.map((id) => {
      const el = document.getElementById(id)
      if (el) {
        const close = createObserve(id, () => {
          const exposure = isH5Env ? el?.['exposure-report'] : el?.props?.['exposure-report']
          const { eventCode, otherParams } = exposure || {}
          const extraParmas = typeof otherParams === 'function' ? otherParams() : otherParams || {}
          const params = { ...extraParmas, ...publicParam }
          report_EXP_event(eventCode, params)
          console.log('曝光埋点-信息', el, eventCode, params)
          close()
        })
        return close
      }
    })
  }

  onMounted(() => {
    nextTick(() => {
      createPageObserve()
    })
  })

  useDidShow(() => {
    nextTick(() => {
      createPageObserve()
    })
  })

  useDidHide(() => {
    isCreate = false
  })

  return createPageObserve
}
