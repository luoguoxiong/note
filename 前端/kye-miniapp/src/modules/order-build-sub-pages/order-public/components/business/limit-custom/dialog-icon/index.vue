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
      <view class="ky-dialog ky-title-bg">
        <view class="ky-dialog-content">
          <view class="title-container">
            <view class="title-icon" v-if="titleIcon" :style="`background-image:url('${titleIcon}')`"></view>
            <view class="title">{{ customTitle }}</view>
            <view v-if="storageFlag">
              <span class="message-render">
                <span v-html="message"></span>
                <span class="picker-limit-contact-phone" @tap="contactBusiness">
                  <i class="picker-limit-contact-phone-icon-phone"></i>
                  <span class="picker-limit-contact-phone-tips-text">联系商务</span>
                </span>
              </span>
            </view>
            <div class="intro" v-else v-html="message"></div>
            <view
              class="ky-title-dialog-call"
              v-if="extraDataValue?.contacters"
              v-for="item in extraDataValue?.contacters"
              @click.stop="openCallPhone(item.contacterPhone)"
            >
              <view class="ky-title-dialog-person">{{ item.contacterName }}：</view>
              <view class="ky-title-dialog-phone">{{ item.contacterPhone }}</view>
              <img
                class="ky-title-dialog-icon"
                src="https://ic-img.ky-express.com/netc/20250619_60549_!!1750317877017_32_32.png"
                alt=""
              />
            </view>
          </view>
        </view>

        <!--  footer  -->
        <view class="ky-dialog-footer">
          <slot name="footer" v-if="$slots.footer"></slot>
          <view v-else>
            <view class="ky-dialog-button-wrap">
              <view
                class="ky-dialog-button ky-dialog-button-cancle"
                :style="{ color: cancelButtonColor }"
                @click="onCancel"
                v-if="showCancelButton"
                >{{ cancelButtonText }}</view
              >
              <view
                class="ky-dialog-button ky-dialog-button-confirm"
                :style="{ color: confirmButtonColor }"
                @click="onConfirm"
                v-if="showConfirmButton"
                >{{ confirmButtonText }}</view
              >
            </view>
          </view>
        </view>
      </view>
    </Overlay>
  </root-portal>
</template>

<script lang="ts" setup>
import { Overlay } from '@kye-netc/kye-miniui'
import { DialogTitleIconProps } from './types'
import './index.scss'
import Taro from '@tarojs/taro'
import { openContactBusiness } from '@order-public-sub-public/validate/access'
import plateform from '@kye-netc/plateform'

const props = withDefaults(defineProps<DialogTitleIconProps>(), {
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
})

const emit = defineEmits(['update:show', 'cancel', 'confirm'])

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

const openCallPhone = (phone: string) => {
  plateform.makePhoneCall({
    phoneNumber: phone,
  })
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

const contactBusiness = () => {
  openContactBusiness()
  onCancel()
}

const onOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    emit('update:show', false)
  }
}
</script>
