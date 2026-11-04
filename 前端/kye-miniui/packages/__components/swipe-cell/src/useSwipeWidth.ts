import { ref } from 'vue'
import taro from '@tarojs/taro'
import { useTaroRect } from '@packages/utils/src/useTaroRect'

export default () => {
  // 左右滑动ref - 用于获取宽度
  const leftRef = ref<HTMLElement>()
  const leftRefWidth = ref(0)
  const rightRef = ref<HTMLElement>()
  const rightRefWidth = ref(0)
  // 左/右滑动区域id
  const refRandomId = Math.random().toString(36).slice(-8)
  const leftRefId = `ky-swipe-cell-left-${refRandomId}`
  const rightRefId = `ky-swipe-cell-right-${refRandomId}`

  /* 初始化记录左右滑块宽度 */
  const initWidth = () => {
    return new Promise((resolve, reject) => {
      useTaroRect(leftRef, taro).then(
        (rect: any) => {
          leftRefWidth.value = rect?.width || 0
          resolve(true)
        },
        () => {},
      )
      useTaroRect(rightRef, taro).then(
        (rect: any) => {
          rightRefWidth.value = rect?.width || 0
          resolve(true)
        },
        () => {},
      )
    })
  }

  return {
    leftRef,
    rightRef,
    leftRefWidth,
    rightRefWidth,
    refRandomId,
    leftRefId,
    rightRefId,
    initWidth,
  }
}
