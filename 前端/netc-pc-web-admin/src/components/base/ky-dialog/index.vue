<template>
  <div>
    <el-dialog
      v-bind="{ ...$attrs, ...$props }"
      :show-close="false"
      destroy-on-close
      @update:model-value="updateModelValue"
      @close="onClose"
      @open="onOpen"
      :style="dialogStyle"
    >
      <template #header>
        <div class="ky-dialog-header">
          <slot name="header">
            <div class="header-wrapper">
              <span class="text">{{ title }}</span>
            </div>
            <div class="close-div" v-if="showClose" @click="closeDialog">
              <ClosePopupIcon name="close-popup"></ClosePopupIcon>
            </div>
          </slot>
        </div>
      </template>
      <slot> </slot>
      <template #footer v-if="hasFooter">
        <div class="ky-dialog-footer">
          <slot name="footer">
            <ky-button ghost="ghost-grey" @click="closeDialog">取消</ky-button>
            <ky-button @click="confirm" type="primary">确定</ky-button>
          </slot>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { DialogProps } from 'element-plus'
import ClosePopupIcon from '@/components/ui/close-popup-icon/index.vue'
import KyButton from '@/components/base/ky-button/index.vue'

defineOptions({
  inheritAttrs: false,
})
type CustomDialogProps = Partial<DialogProps> & {
  visible?: boolean
  modelValue?: boolean
  hasFooter?: boolean // 是否有footer
  maxHeight?: number
}

// interface CustomDialogProps extends DialogProps {
//   visible: boolean
// }
const props = withDefaults(defineProps<CustomDialogProps>(), {
  title: '弹框标题',
  showClose: true,
  modal: true,
  hasFooter: true,
  closeOnPressEscape: true,
})

const emits = defineEmits(['close', 'confirm', 'onClose', 'onOpen', 'update:modelValue'])

const dialogStyle = computed(() => {
  const { maxHeight } = props
  if (maxHeight) {
    return {
      maxHeight: maxHeight + 'px',
    }
  }
  return ''
})

const updateModelValue = (value: boolean) => {
  emits('update:modelValue', value)
}
const onClose = () => {
  // 右上角按钮的关闭事件
  emits('onClose')
  closeDialog()
}
const onOpen = () => {
  emits('onOpen')
}
const closeDialog = () => {
  emits('update:modelValue', false)
  emits('close')
}
const confirm = () => {
  emits('confirm')
}
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>

<style lang="scss">
.ky-dialog-footer {
  .ky-button-wrapper + .ky-button-wrapper {
    margin-left: 12px;
  }
}
</style>
