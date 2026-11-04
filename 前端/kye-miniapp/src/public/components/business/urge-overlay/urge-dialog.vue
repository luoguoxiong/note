<template>
  <root-portal :enable="dialogState.show" v-show="dialogState.show">
    <ky-overlay :show="dialogState.show" class="urge-dialog-overlay" :closeOnClickOverlay="false" position="center">
      <view class="urge-dialog-wrapper" catchMove>
        <view class="urge-dialog-box">
          <!-- 渐变头部 -->
          <view class="urge-dialog-header"></view>
          <!-- 内容区 -->
          <view class="urge-dialog-content">
            <view class="urge-dialog-title">{{ dialogState.title }}</view>
            <view class="urge-dialog-message">{{ dialogState.message }}</view>
          </view>
          <!-- 按钮区：统一通栏圆角胶囊样式 -->
          <view class="urge-dialog-footer">
            <!-- 双按钮 -->
            <view v-if="dialogState.showCancelButton" class="urge-dialog-btn-group">
              <view class="urge-dialog-btn-left urge-dialog-btn-box" @click="handleCancel">
                {{ dialogState.cancelButtonText }}
              </view>
              <view class="urge-dialog-btn-right urge-dialog-btn-box" @click="handleConfirm">
                {{ dialogState.confirmButtonText }}
              </view>
            </view>
            <!-- 单按钮：通栏实心 -->
            <view v-else class="urge-dialog-btn-single urge-dialog-btn-box" @click="handleConfirm">
              {{ dialogState.confirmButtonText }}
            </view>
          </view>
          <!-- 顶部图标 -->
          <!-- <image
            class="urge-dialog-icon"
            src="https://ic-img.ky-express.com/netc/20251022_99938_!!1761125858221_300_300.png"
            mode="aspectFit"
          /> -->
        </view>
      </view>
    </ky-overlay>
  </root-portal>
</template>

<script lang="ts" setup>
import './urge-dialog.scss'
import { dialogState } from './index'

const handleConfirm = () => {
  ;(dialogState as any)._confirm?.()
}

const handleCancel = () => {
  ;(dialogState as any)._cancel?.()
}
</script>
