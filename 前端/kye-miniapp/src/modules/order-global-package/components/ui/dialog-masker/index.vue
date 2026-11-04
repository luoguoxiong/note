<template>
  <root-portal :enable="show">
    <Overlay
      :show="show"
      v-if="overlay"
      :closeOnClickOverlay="closeOnClickOverlay"
      @clickOverlay="onOverlayClick"
      :zIndex="zIndex"
      v-bind="$attrs"
    >
      <div :class="['custom-ky-dialog', renderClassName ? className : '']">
        <div class="custom-ky-dialog-content">
          <!-- title -->
          <div class="ky-dialog-header overlay-dialog-header">
            <slot name="title" v-if="$slots.title"></slot>
            <div class="custom-ky-dialog-title" v-else-if="title" v-html="title"></div>
            <div class="close-icon" v-if="closeable" @click="onClose">
              <SvgIcon class="dialog-masker-header-close" name="close-icon-padding" />
            </div>
          </div>

          <!-- content -->
          <div class="custom-ky-dialog-body" v-if="$slots.default">
            <slot></slot>
          </div>
          <div class="custom-ky-dialog-body" v-else-if="message" v-html="message"></div>
        </div>

        <!--  footer  -->
        <div class="ky-dialog-footer" v-if="showCancelButton || showConfirmButton">
          <slot name="footer" v-if="$slots.footer"></slot>
          <div v-else>
            <div class="ky-dialog-button-wrap">
              <div
                class="ky-dialog-button ky-dialog-button-cancle"
                :style="{ color: cancelButtonColor }"
                @click="onCancel"
                v-if="showCancelButton"
              >
                {{ cancelButtonText }}
              </div>
              <div
                class="ky-dialog-button ky-dialog-button-confirm"
                :style="{ color: confirmButtonColor }"
                @click="onConfirm"
                v-if="showConfirmButton"
              >
                {{ confirmButtonText }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  </root-portal>
</template>

<script lang="ts" setup>
import { Overlay } from '@kye-netc/kye-miniui'
import { DialogMaskerProps } from './types'
import './index.scss'
import SvgIcon from '../../ui/svg-icon/index.vue'
import { getDialogRootClass } from '../../../validate/pageConfig'
import { render } from 'vue'

const props = withDefaults(defineProps<DialogMaskerProps>(), {
  title: '',
  message: '',
  showConfirmButton: true,
  showCancelButton: false,
  confirmButtonText: '确认',
  confirmButtonColor: '#8365F6',
  cancelButtonText: '取消',
  cancelButtonColor: '#686B75',
  zIndex: 100,
  overlay: true,
  closeOnClickOverlay: false,
  closeable: false,
  renderClassName: true,
})
const emit = defineEmits(['update:show', 'cancel', 'confirm', 'close'])

const onCancel = async () => {
  await onBeforeClose('cancel')
  emit('cancel')
  emit('update:show', false)
}

const onConfirm = async () => {
  await onBeforeClose('confirm')
  emit('confirm')
  emit('update:show', false)
}
const closeFun = () => {
  const parentClassName = getDialogRootClass() || 'dialog_root_order'
  const page = document.getElementsByClassName(parentClassName)?.[0] || document.body
  render(null, page)
}
const onClose = async () => {
  await onBeforeClose('close')
  emit('close')
  emit('update:show', false)
  closeFun()
}

const onBeforeClose = async (action: string) => {
  if (typeof props.beforeClose === 'function') {
    const result = await props.beforeClose(action)
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
</script>
