<template>
  <!-- 货好时间选择基础布局 -->
  <view class="gt-base">
    <!-- 有数据时显示内容区域 -->
    <template v-if="!isEmpty">
      <view class="gt-base-content">
        <slot></slot> <!-- 时间选择器内容 -->
      </view>
      <slot name="footer"></slot> <!-- 底部操作栏 -->
    </template>

    <!-- 无数据时显示空状态 -->
    <KyEmpty :theme-name="themeName" v-else />
  </view>
</template>

<script setup lang="ts">
import KyEmpty from '../empty/index.vue'
import './index.scss'

/**
 * @description 基础布局组件属性接口
 */
interface GoodsTimeBaseLayout {
  isEmpty: boolean // 是否为空状态
  themeName: string // 主题名称（用于空状态组件）
}

/**
 * @description 定义组件属性
 */
defineProps<GoodsTimeBaseLayout>()
</script>