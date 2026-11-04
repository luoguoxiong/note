<template>
  <div class="select-size-footer">
    <template v-if="isBatch">
      <div class="footer-batch flex items-center space-between">
        <div class="footer-select-all flex items-center" @click="() => emit('toggleSelectAll')">
          <SvgIcon v-if="isAllSelected" name="radio-checked" class="footer-check-icon" />
          <SvgIcon v-else name="radio-unchecked" class="footer-check-icon" />
          <span class="footer-all-text">全选</span>
          <span class="footer-count"
            >已选<span class="count-highlight">{{ selectedCount }}</span
            >条</span
          >
        </div>
        <KyButton class="footer-confirm-btn" text="确定" @click="() => emit('confirm')"></KyButton>
      </div>
    </template>
    <template v-else>
      <KyButton
        v-if="activeTab === 'select-size' && canAddSize"
        class="footer-add-btn"
        block
        text="新增尺寸"
        @click="() => emit('addSize')"
      ></KyButton>
    </template>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import KyButton from '@order-global-package-order-sub/components/base/ky-button/index.vue'

withDefaults(
  defineProps<{
    /** 是否批量态 */
    isBatch?: boolean
    /** 当前 tab：select-size-我的尺寸 history-size-历史尺寸 */
    activeTab?: string
    /** 已选条数 */
    selectedCount?: number
    /** 当前 tab 是否全选 */
    isAllSelected?: boolean
    /** 是否展示新增尺寸入口（平台/ mySizeOptFlag 控制） */
    canAddSize?: boolean
  }>(),
  {
    isBatch: false,
    activeTab: 'select-size',
    selectedCount: 0,
    isAllSelected: false,
    canAddSize: true,
  },
)

const emit = defineEmits(['toggleSelectAll', 'confirm', 'addSize'])
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
