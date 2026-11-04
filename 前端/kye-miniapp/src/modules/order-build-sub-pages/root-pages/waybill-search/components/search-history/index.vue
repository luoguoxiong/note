<template>
  <view class="page-search-history">
    <ky-popup
      :show="searchHistoryVisible"
      position="top"
      safe-area-inset-top
      @clickOverlay="handleUpdateVisible(false)"
    >
      <view class="page-search-history-content">
        <view class="history-header">
          <KyImage
            class="history-header-back"
            src="https://ic-img.ky-express.com/netc/20250118_30166203715_!!1737183846496_80_80.png"
          />
          <view class="history-header-input"><ky-input placeholder="运单号/手机号/姓名/自定义编码/标签/托寄物" /></view>
        </view>
        <view class="history-content">
          <!-- 搜索历史 -->
          <!-- <view class="display-type-history">
            <view class="display-type-history-header">
              <view class="display-type-history-header-title">查件历史</view>
              <view class="display-type-history-header-icon">
                <KyImage
                  class="display-type-history-header-icon"
                  src="https://ic-img.ky-express.com/netc/20250118_21866203750_!!1737187068588_56_56.png"
                />
              </view>
            </view>
            <view class="display-type-history-content">
              <view class="display-type-history-content-item">
                <view class="text">13424253647</view>
                <KyImage
                  class="close"
                  src="https://ic-img.ky-express.com/netc/20250118_34166203764_!!1737168727304_56_56.png"
                />
              </view>
              <view class="display-type-history-content-item">
                <view class="text">13424253647</view>
                <KyImage
                  class="close"
                  src="https://ic-img.ky-express.com/netc/20250118_34166203764_!!1737168727304_56_56.png"
                />
              </view>
              <view class="display-type-history-content-item">
                <view class="text">13424253647</view>
                <KyImage
                  class="close"
                  src="https://ic-img.ky-express.com/netc/20250118_34166203764_!!1737168727304_56_56.png"
                />
              </view>
            </view>
          </view> -->
          <!-- 联想 -->
          <view class="display-type-link">
            <view class="display-type-link-header">联想搜索</view>
            <view class="display-type-link-content">
              <view class="display-type-link-content-item">
                <view class="text">1020是生鲜，需冷藏</view>
                <ky-tag size="5" bgColor="#fff" borderColor="#D3D5DB" textColor="#8C8F99">标签</ky-tag>
              </view>
              <view class="display-type-link-content-item">
                <view class="text">1020是生鲜，需冷藏</view>
                <ky-tag size="5" bgColor="#fff" borderColor="#D3D5DB" textColor="#8C8F99">标签</ky-tag>
              </view>
              <view class="display-type-link-content-item">
                <view class="text">1020是生鲜，需冷藏</view>
                <ky-tag size="5" bgColor="#fff" borderColor="#D3D5DB" textColor="#8C8F99">标签</ky-tag>
              </view>
            </view>
          </view>
        </view>
      </view>
    </ky-popup>
  </view>
</template>

<script setup lang="ts">
import KyImage from '@order-public-sub-public/components/base/ky-image/index.vue'
import './index.scss'

defineProps<{
  searchHistoryVisible: boolean
}>()

const emit = defineEmits(['update:searchHistoryVisible'])

const handleUpdateVisible = (visible: boolean) => {
  console.log('visible', visible)
  emit('update:searchHistoryVisible', visible)
}
</script>
