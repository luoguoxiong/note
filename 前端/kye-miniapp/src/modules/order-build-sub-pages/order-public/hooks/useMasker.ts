/*
 * @Description: 全局遮罩层
 * @Date: 2024-08-16 15:15:02
 */

import { effectMasker } from '@order-public-sub-public/validate/effect/effectPopup'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'

// 遮罩组件卸载
let unmountMasker: (() => void) | null = null
/**
 * @description 增加遮罩
 */
export const addMasker = (tips: string) => {
  if (!unmountMasker) {
    unmountMasker = effectMasker({
      blockedFlag: true,
      callback: () => {
        showToast(tips || '正在操作中')
      },
      topSelector: [],
    }).unmount
  }
}

/**
 * @description 移除遮罩
 */
export const removeMasker = () => {
  // 移除遮罩
  unmountMasker?.()
  unmountMasker = null
}
