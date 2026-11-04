<template>
  <ky-dialog
    ref="dialogRef"
    :show="visible"
    :title="title"
    :message="dialogMessage"
    :confirm-button-text="confirmText"
    :cancel-button-text="cancelText"
    :show-cancel-button="showCancel"
    :close-on-click-overlay="closable"
    :z-index="9000"
    :show-close="closable"
    :use-button="true"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <!-- 警告提示条 -->
    <view v-if="tipBar" class="alert-tip-bar">
      <img
        class="alert-tip-bar__icon"
        src="https://ic-img.ky-express.com/netc/20251216_69135_!!1765855277433_24_24.svg+xml"
        alt=""
      />
      <text class="alert-tip-bar__text">{{ tipBar }}</text>
    </view>

    <!-- 自定义内容插槽（优先级高于 content prop） -->
    <slot>
      <!-- 无插槽时渲染 content（HTML） -->
      <rich-text v-if="content" :nodes="content" class="alert-content--html" />
    </slot>
  </ky-dialog>
</template>

<script setup lang="ts">
import { computed, ref, useSlots, watch } from 'vue'

/**
 * 客户编码模块 - 通用确认弹窗组件
 *
 * 用于解绑确认、重复绑定提示、黑名单提示等场景
 * 支持自定义标题、内容（prop/插槽）、警告提示条、按钮文案
 *
 * 使用 miniUI ky-dialog 组件（专用确认对话框）
 *
 * 两种内容模式：
 * 1. content 模式：传入 HTML 字符串，通过 rich-text 渲染
 * 2. 插槽模式：使用默认插槽 #default 自定义内容，优先级高于 content
 */
interface Props {
  /** 是否显示 */
  visible: boolean
  /** 弹窗标题 */
  title?: string
  /** 弹窗内容（HTML字符串），与二选一，优先级低于插槽 */
  content?: string
  /** 警告提示条文本（显示在内容上方橙色区域） */
  tipBar?: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 是否可点击遮罩关闭 */
  closable?: boolean
  /** 确认按钮是否 loading */
  confirmLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  content: '',
  tipBar: '',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  closable: false,
  confirmLoading: false,
})

const dialogRef = ref<{ showConfirmLoading: () => void; hideConfirmLoading: () => void }>()

/** 有插槽时不传 message 给 ky-dialog，避免重复渲染 */
const dialogMessage = computed(() => {
  // 如果有插槽使用者，不传 message（由 slot 自行渲染）
  const hasSlot = !!useSlots().default
  return hasSlot ? '' : props.content
})

watch(
  () => props.confirmLoading,
  (newValue) => {
    newValue ? dialogRef.value?.showConfirmLoading() : dialogRef.value?.hideConfirmLoading()
  },
)

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
}>()

/**
 * 处理确认按钮点击
 */
const handleConfirm = () => {
  emit('confirm')
}

/**
 * 处理取消按钮点击
 */
const handleCancel = () => {
  emit('cancel')
}

/**
 * 处理关闭弹窗（点击遮罩或关闭按钮）
 */
const handleClose = () => {
  if (props.closable) {
    emit('close')
  }
  console.log('handleClose', props.closable)
}
</script>

<style lang="less">
.alert-tip-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  align-self: stretch;
  box-sizing: border-box;
  background: #fff3e5;
  margin-left: -32px;
  margin-right: -32px;
  margin-bottom: 16px;

  .alert-tip-bar__icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    margin-top: 5px;
    align-self: flex-start;
  }

  .alert-tip-bar__text {
    text-align: left;
    font-size: 24px;
    font-weight: normal;
    line-height: 34px;
    color: #ff9300;
    flex: 1;
  }
}
</style>
