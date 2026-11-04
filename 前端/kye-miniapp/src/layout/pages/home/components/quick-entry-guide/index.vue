<script setup lang="ts">
import { ref } from 'vue'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import { isWxMiniApp, isWxAppEnv, isWxPcAppletEnv, px2real } from '@/public/utils'
import { getSystemInfo } from '@/public/utils/getSystemInfo'
import './index.scss'

defineOptions({ name: 'QuickEntryGuide' })

// 气泡素材（设计稿导出）
const guideArrow = 'https://ic-img.ky-express.com/netc/20261010_96749_!!1791623419063_17_12.png'
const guideMore = 'https://ic-img.ky-express.com/netc/20261010_38790_!!1791623419071_24_24.png'
const guideClose = 'https://ic-img.ky-express.com/netc/20261010_3525_!!1791623419068_32_32.png'

/**
 * 首页右上角"..."快捷入口引导气泡（需求 #575672）
 * 触发：首次访问 / 删除小程序后重进 / 清除微信缓存后重进
 *   —— 本地标记不存在即视为触发场景，删除小程序或清缓存后标记自然失效，重新触发；
 *      版本升级保留本地标记，不触发
 * 消失：离开首页 / 关闭小程序后重进 / 点击"..."（打开胶囊菜单页面触发 onHide）/ 点击 ×
 * 兜底：缓存读写或胶囊信息异常时默认不展示，不影响首页使用
 */
const GUIDE_FLAG_KEY = 'HOME_QUICK_ENTRY_GUIDE_FLAG'

const visible = ref(false)
const position = ref({ top: 0, right: 0 })
// PC 端微信小程序（含企微 PC 端），文案与移动端区分
const isPcTerminal = isWxPcAppletEnv

const handleClose = () => {
  visible.value = false
}

const tryShowGuide = async () => {
  // 仅微信小程序（移动端 + PC 端）展示
  if (!isWxMiniApp || isWxAppEnv || visible.value) return
  try {
    // 标记存在说明非触发场景（含关闭小程序后重进、版本升级后重进）
    if (Taro.getStorageSync(GUIDE_FLAG_KEY)) return
    Taro.setStorageSync(GUIDE_FLAG_KEY, '1')
    const { menuButtonInfo, windowWidth } = await getSystemInfo()
    // 气泡箭头对准胶囊"..."按钮中心（胶囊左半部分为"..."）
    const dotsCenterX = menuButtonInfo.left + menuButtonInfo.width / 4
    position.value = {
      top: menuButtonInfo.bottom + px2real(12),
      right: windowWidth - dotsCenterX - px2real(56.5),
    }
    visible.value = true
  } catch (error) {
    // 兜底：异常时默认不展示
    visible.value = false
  }
}

useDidShow(() => {
  tryShowGuide()
})

// 离开首页 / 关闭小程序 / 打开右上角"..."菜单时隐藏
useDidHide(() => {
  visible.value = false
})
</script>

<template>
  <view
    v-if="visible"
    class="quick-entry-guide"
    :style="{ top: `${position.top}px`, right: `${position.right}px` }"
  >
    <image class="quick-entry-guide__arrow" :src="guideArrow" />
    <view class="quick-entry-guide__body">
      <view class="quick-entry-guide__content">
        <view class="quick-entry-guide__text">
          <text>点击</text>
          <text>“</text>
          <image class="quick-entry-guide__more" :src="guideMore" />
          <text>”</text>
          <text>{{ isPcTerminal ? '将小程序添加至电脑桌面' : '添加至我的小程序；后续' }}</text>
        </view>
        <view v-if="!isPcTerminal" class="quick-entry-guide__text">微信首页下拉即可快速访问</view>
      </view>
      <view class="quick-entry-guide__close" @tap.stop="handleClose">
        <image class="quick-entry-guide__close-icon" :src="guideClose" />
      </view>
    </view>
  </view>
</template>
