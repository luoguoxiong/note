<template>
  <section class="page">
    <el-tooltip
      popper-class="custom-tooltip"
      effect="dark"
      placement="bottom"
      content="设置"
      :disabled="!isMinWidth1280"
    >
      <!-- <i class="el-icon-setting" @click="openSetting">
        <span class="version-icon" v-if="setNewIcon"></span>
      </i> -->
      <el-badge :is-dot="setNewIcon" class="setting-dot">
        <el-button
          type="primary"
          text
          @click="emit('openSetting')"
          v-click-report="{
            pageCode: 'page_native_client_v1',
            eventCode: 'clk_native_client_menu_setting_v1',

            page_code: 'page_native_client_v1',
            page_name: 'page_native_client_v1',
            region_code: 'top_navigation',
            event_type_id: 2101,
            button_name: '本地客户端_设置_点击',
          }"
        >
          <svg-icon name="setting-icon"></svg-icon>
          <span v-if="!isMinWidth1280" class="ml-4">设置</span>
        </el-button>
      </el-badge>
    </el-tooltip>
    <el-tooltip
      popper-class="custom-tooltip"
      effect="dark"
      placement="bottom"
      content="刷新"
      :disabled="!isMinMediaWidth"
    >
      <el-badge :is-dot="false" class="setting-dot">
        <el-button
          type="primary"
          text
          @click="emit('refresh')"
          :loading="refreshStatus"
          v-click-report="{
            pageCode: 'page_native_client_v1',
            eventCode: 'clk_native_client_menu_refresh_v1',

            page_code: 'page_native_client_v1',
            page_name: 'page_native_client_v1',
            region_code: 'top_navigation',
            event_type_id: 2101,
            button_name: '本地客户端_刷新_点击',
          }"
        >
          <svg-icon name="refresh-icon" v-if="!refreshStatus"></svg-icon>
          <span v-if="!isMinWidth1280" class="ml-4">刷新</span>
        </el-button>
      </el-badge>
      <!-- <i class="el-icon-refresh-right" @click="refresh"></i> -->
    </el-tooltip>
    <zoomOperate v-if="showZoomOperate" />
  </section>
</template>

<script setup lang="ts">
/**
 * 页面模式操作区(设置/刷新/缩放): 从 new-client/index.vue 拆出(原 .page 模板块及强相关样式)
 */
import zoomOperate from './zoom/zoom-operate.vue'

defineOptions({ name: 'PageActions' })

defineProps<{
  isMinWidth1280?: boolean
  setNewIcon?: boolean
  refreshStatus?: boolean
  showZoomOperate?: boolean
}>()

const emit = defineEmits<{
  (e: 'openSetting'): void
  (e: 'refresh'): void
}>()

/** 旧代码遗留: 老项目从未定义 isMinMediaWidth(undefined), 即刷新 tooltip 恒为禁用 —— 保持原行为 */
const isMinMediaWidth = undefined
</script>

<style lang="scss" scoped>
.page {
  i {
    font-size: 16px;
    color: #fff;
    margin-left: 34px;
    cursor: pointer;
    position: relative;
    height: 22px;
    top: 2px;
  }
}
.ml-4 {
  margin-left: 4px;
}
.setting-dot {
  :deep(.el-badge__content.is-fixed.is-dot) {
    right: 8px;
    top: 5px;
    background-color: #f73f31;
    border: none;
  }
}
/* 按钮均在 .page 内, 嵌套一级保证特异性;
   text 属性在 element-plus 下类名为 .el-button--primary.is-text(老项目 .el-button--text) */
.page {
  :deep(.el-button--primary.is-text) {
    color: #fff;
    font-size: 13px;
    margin-left: 4px;
    padding: 8px;
  }
  /* 提升特异性覆盖 element-plus .el-button.is-text:not(.is-disabled):hover (0,4,0),
     保持老项目交互态: hover 深色底 / focus、active 透明 */
  :deep(.el-button.el-button:hover) {
    background: rgba(36, 38, 43, 0.16);
  }
  :deep(.el-button.el-button:focus),
  :deep(.el-button.el-button:active) {
    background: none;
    /* 老项目 element-ui 无 focus-visible 轮廓, 去除点击后的 2px outline 边框 */
    outline: none;
  }
}
</style>
