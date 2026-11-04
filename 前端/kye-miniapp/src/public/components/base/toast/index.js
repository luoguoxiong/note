// showToast.js
import Taro from '@tarojs/taro'

// 全局Toast状态
let toastVisible = false
let toastTimer = null
let toastOptions = {}

// 默认配置
const defaultOptions = {
  title: '',
  icon: 'none',
  image: '',
  duration: 1500,
  mask: false,
  position: 'center',
}

// 显示Toast
const showToast = (options) => {
  // 合并配置
  const config = { ...defaultOptions, ...options }

  // 保存配置
  toastOptions = config

  // 清除之前的定时器
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }

  // 显示Toast
  toastVisible = true

  // 触发页面更新
  updateAllPages()

  // 设置自动关闭定时器
  if (config.duration > 0) {
    toastTimer = setTimeout(() => {
      hideToast()
    }, config.duration)
  }

  return {
    hide: hideToast,
  }
}

// 隐藏Toast
const hideToast = () => {
  toastVisible = false
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }

  // 触发页面更新
  updateAllPages()
}

// 获取当前所有页面实例并更新
const updateAllPages = () => {
  try {
    const pages = Taro.getCurrentPages()
    if (pages && pages.length) {
      pages.forEach((page) => {
        if (page && page.$vm && page.$vm.update) {
          page.$vm.update()
        }
      })
    }
  } catch (error) {
    console.warn('Toast update error:', error)
  }
}

// Toast组件
const TaroToast = {
  name: 'TaroToast',
  setup() {
    return () => {
      if (!toastVisible) return null

      const { title, icon, image, mask, position } = toastOptions

      // 位置类名
      const positionClass = `taro-toast--${position}`

      // 图标类名
      const iconClass = icon === 'none' ? 'taro-toast--text' : `taro-toast--${icon}`

      return (
        <view>
          {/* 遮罩层 */}
          {mask && <view class="taro-toast-mask"></view>}

          {/* Toast内容 */}
          <view class={`taro-toast ${positionClass} ${iconClass}`}>
            {icon !== 'none' && (
              <view class="taro-toast__icon">
                {image ? (
                  <image src={image} class="taro-toast__image" mode="aspectFit" />
                ) : icon === 'success' ? (
                  <view class="taro-toast__success">✓</view>
                ) : icon === 'loading' ? (
                  <view class="taro-toast__loading">
                    <view class="loading-spinner"></view>
                  </view>
                ) : icon === 'error' ? (
                  <view class="taro-toast__error">✕</view>
                ) : null}
              </view>
            )}
            <text class="taro-toast__content">{title}</text>
          </view>
        </view>
      )
    }
  },
}

// 导出方法
export default {
  show: showToast,
  hide: hideToast,
  TaroToast,
}
