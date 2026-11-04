import { ref } from 'vue'

/**
 * 底部弹框 z-index 控制
 * 弹框未弹出时=12（不遮挡），弹出时=14（高于热区）
 * （从 @order-public/hooks/asynrender 迁移）
 */
export const footerZIndex = ref(14)

export const setFooterZIndex = (show: boolean) => {
  if (show) {
    footerZIndex.value = 12
  } else {
    setTimeout(() => {
      footerZIndex.value = 14
    }, 250)
  }
}
