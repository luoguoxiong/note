<template>
  <div class="download-center-icon">
    <el-badge v-if="showRedDot" class="red-dot" :is-dot="showRedDot">
      <k-button text style="color: #fff; padding: 8px">
        <k-icon><Download /></k-icon>
        <span v-if="!isMinWidth1280">下载中心</span>
      </k-button>
    </el-badge>
    <el-badge
      v-else
      class="download-center-badge"
      :value="unDownData.unDownCount"
      :hidden="unDownData.unDownCount === 0"
    >
      <k-button text style="color: #fff; padding: 8px">
        <k-icon><Download /></k-icon>
        <span v-if="!isMinWidth1280">下载中心</span>
      </k-button>
    </el-badge>
  </div>
</template>

<script setup lang="ts">
import { KButton, KIcon } from '@netc-design-pc/ui'
import { Download } from '@netc-design-pc/icons'

/**
 * 下载中心-顶栏图标(红点/未下载数角标)
 * 来源: netc-pc-web/src/views/download/download-center-icon.vue
 */
export interface UnDownData {
  unDownCount?: number
  versionId?: string
  [key: string]: any
}

withDefaults(
  defineProps<{
    isMinWidth1280?: boolean
    showRedDot?: boolean
    unDownData?: UnDownData
  }>(),
  {
    isMinWidth1280: false,
    showRedDot: false,
    unDownData: () => ({}),
  }
)
</script>

<style scoped lang="scss">
.download-center-icon {
  .ml-4 {
    margin-left: 4px;
  }
  // .svg-icon {
  //   width: 1em;
  //   height: 1em;
  //   vertical-align: -0.15em;
  // }
  // :deep(.el-button.is-text) {
  //   color: #fff;
  //   font-size: 13px;
  //   margin-left: 4px;
  //   padding: 8px;
  // }
  /* 交互态(hover/focus/active)由父级 header/index.scss 的 .menu 规则统一接管,
     本组件内的规则(5 级)会被其静态规则(6 级)压过, 故不再重复定义 */
  .red-dot {
    :deep(.el-badge__content.is-fixed.is-dot) {
      right: 8px;
      top: 5px;
      background-color: #f73f31;
      border: none;
    }
  }
  .download-center-badge {
    :deep(.el-badge__content.is-fixed) {
      transform: translateY(-50%) translateX(100%) scale(0.85);
      top: 9px;
      right: 10px;
      padding: 0;
      border: none;
      min-width: 18px;
    }
  }
}
</style>
