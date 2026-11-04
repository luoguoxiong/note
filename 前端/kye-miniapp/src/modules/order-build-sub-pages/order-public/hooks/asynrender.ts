import { ref } from 'vue'

export const hasRest = ref(false)
export const timeFlag = ref(0)
/**
 * 异步渲染
 */
export const asynrender = ref(false)

setTimeout(() => {
  asynrender.value = true
}, 2500)

// 费用弹框没有弹起来的时候是 12 .这样ios上就不会遮挡其他地方的弹框 弹起来的时候是14 大于热区,这样就底部的费用弹框就高于寄收
export const footerZIndex = ref(14)

export const setFooterZIndex = (show: boolean) => {
  if (show) {
    footerZIndex.value = 12
  } else {
    // 这里加延迟 因为有些modal，有动画
    setTimeout(() => {
      footerZIndex.value = 14
    }, 500)
  }
}

// 飞书 ios会有穿透问题，暂时用弹框的时候 不能滚动来控制，弹框起来的时候这个变量设置true则下单页面的overflow hidden反之auto
export const popupShow = ref(false)

export const setPopupShhow = (show: boolean) => {
  popupShow.value = show
}
