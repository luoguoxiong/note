<template>
  <root-portal :enable="show">
    <Overlay
      :show="show"
      v-if="overlay"
      :closeOnClickOverlay="closeOnClickOverlay"
      @clickOverlay="onOverlayClick"
      :zIndex="zIndex"
      v-bind="$attrs"
      :catchMove="catchMove"
    >
      <div class="ky-dialog" :style="{ top: offset + 'px' }">
        <div class="ky-dialog-content">
          <!-- title -->
          <div class="ky-dialog-header">
            <slot name="title" v-if="$slots.title"></slot>
            <div class="ky-dialog-title" v-else-if="title" v-html="title"></div>
            <div class="ky-dialog-header-close" v-if="showClose" @click.stop="onClose"></div>
          </div>

          <!-- content -->
          <div class="ky-dialog-body" v-if="$slots.default">
            <slot></slot>
          </div>
          <div class="ky-dialog-body" v-else-if="message" v-html="message"></div>
        </div>

        <!--  footer  -->
        <div class="ky-dialog-footer">
          <slot name="footer" v-if="$slots.footer"></slot>
          <div v-else>
            <div class="ky-dialog-button-wrap">
              <DialogBtn
                v-if="showCancelButton"
                :class="['ky-dialog-button', 'ky-dialog-button-cancle']"
                :style="{ color: cancelButtonColor }"
                :useButton="props.useButton"
                @click="onCancel"
                :loading="state.cancelLoading"
                plain
                >{{ cancelButtonText }}</DialogBtn
              >
              <DialogBtn
                v-if="showConfirmButton"
                :class="['ky-dialog-button', 'ky-dialog-button-confirm', showCancelButton && 'border']"
                :style="{ color: confirmButtonColor }"
                :useButton="props.useButton"
                @click="onConfirm"
                :id="buttonId"
                :open-type="openType"
                :loading="state.confirmLoading"
                plain
                >{{ confirmButtonText }}</DialogBtn
              >
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  </root-portal>
</template>

<script lang="ts" setup>
import Overlay from '@ky-miniui-lib/overlay'
import { DialogProps } from './types'
import './index.scss'
import { reactive } from 'vue'
import DialogBtn from './btn.vue'

const props = withDefaults(defineProps<DialogProps>(), {
  title: '',
  message: '',
  showConfirmButton: true,
  showCancelButton: false,
  confirmButtonText: '确认',
  confirmButtonColor: '#8365F6',
  cancelButtonText: '取消',
  cancelButtonColor: '#686B75',
  overlay: true,
  offset: 0,
  closeOnClickOverlay: false,
  useButton: false,
  showClose: false,
  buttonId: '',
  openType: '',
  catchMove: true,
  confirmLoading: false,
  cancelLoading: false,
})

const state = reactive({
  // 确认按钮loading状态
  confirmLoading: props.confirmLoading,
  cancelLoading: props.cancelLoading,
})

const emit = defineEmits(['update:show', 'cancel', 'close'])

const onCancel = async () => {
  await onBeforeClose('cancel')
  emit('cancel')
  emit('update:show', false)
}

const onClose = async () => {
  emit('close')
  emit('update:show', false)
}

const onConfirm = async () => {
  await onBeforeClose('confirm')
  emit('confirm')
  emit('update:show', false)
}

const onBeforeClose = async (action: string) => {
  if (typeof props.beforeClose === 'function') {
    const result = await props.beforeClose(action)
    console.log('beforeClose', result)
    if (!result) {
      return Promise.reject(result)
    }
  }
  return Promise.resolve(true)
}

const onOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    emit('update:show', false)
  }
}

type UpdatePayload = Partial<typeof state>
/* 更新动态数据 */
const updateData = (payload: UpdatePayload) => {
  Object.keys(payload).forEach((key) => {
    if (key in state) {
      // @ts-ignore
      state[key] = payload[key]
    }
  })
}

/* 显示确定按钮confirmLoading */
const showConfirmLoading = () => {
  if (!props.showConfirmButton) {
    return
  }
  updateData({
    confirmLoading: true,
  })
}

/* 隐藏定按钮confirmLoading */
const hideConfirmLoading = () => {
  if (!props.showConfirmButton) {
    return
  }
  updateData({
    confirmLoading: false,
  })
}

/* 显示cancelLoading */
const showCancelLoading = () => {
  if (!props.showCancelButton) {
    return
  }
  updateData({
    cancelLoading: true,
  })
}

/* 隐藏cancelLoading */
const hideCancelLoading = () => {
  if (!props.showCancelButton) {
    return
  }
  updateData({
    cancelLoading: false,
  })
}

defineExpose({
  updateData,
  showConfirmLoading,
  hideConfirmLoading,
  showCancelLoading,
  hideCancelLoading,
})
</script>
