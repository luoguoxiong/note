<template>
  <k-button
    class="back-version-button"
    type="default"
    size="small"
    v-click-report="{
      eventCode: 'clk_home_oldversion_v1',
      region_code: 'top_navigation',
      otherParams: {
        event_code: 'clk_home_oldversion_v1',
        page_code: 'client_menu_v1',
        page_name: 'client_menu_v1',
        button_name: '主页_客户端顶部返回旧版_点击',
      },
    }"
    @click="handleBtn"
  >
    <template #icon>
      <k-icon><Back /></k-icon>
    </template>
    返回旧版
  </k-button>
</template>

<script setup lang="ts">
import { KButton, KIcon } from '@netc-design-pc/ui'
import { Back } from '@netc-design-pc/icons'

defineOptions({
  name: 'back-version-button',
})

const emit = defineEmits(['click'])

const handleBtn = () => {
  emit('click', 'back-version-button')
}
</script>

<style lang="scss" scoped>
.back-version-button {
  position: absolute;
  left: 175px;
  top: 10px;
  z-index: 10;
  color: #fff;
  background-color: transparent;
  border-color: #fff;
  // .el-button-icon {
  //   width: 12px;
  //   height: 12px;
  //   padding-right: 4px;
  // }
  // :deep(.el-button--transparent) {
  //   padding: 4px 8px;
  //   background: transparent;
  //   color: #ffffff;
  //   &:hover,
  //   &:focus,
  //   &:active {
  //     border-color: #dcdfe6;
  //   }
  //   > span {
  //     display: flex;
  //   }
  // }
  // /* 老项目 global.scss 全局工具类, 新项目无全局定义, 此处补齐 */
  // .fs-12 {
  //   font-size: 12px;
  // }
}
</style>
