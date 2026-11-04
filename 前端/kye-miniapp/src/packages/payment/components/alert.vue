<template>
  <view class="alert-box">
    <view :class="`alert ${show ? 'alert-show' : ''}`">
      <view class="alert-inner">
        <view class="content">
          <view>
            <view class="content_title">{{ title }}</view>
          </view>
          <view class="content_text">{{ content }}</view>
          <view class="footer_btn">
            <button class="footer_btn__cancel clear_button" @tap="handleCancel">
              {{ cancelButtonText }}
            </button>
            <button v-if="showShare" open-type="share" class="footer_btn__confirm clear_button" @tap="handleConfirm">
              {{ confirmButtonText }}
            </button>
            <button v-else class="footer_btn__confirm clear_button" @tap="handleConfirm">
              {{ confirmButtonText }}
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import './alert.scss'

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ShareAlert',
  options: {
    addGlobalClass: true,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    confirmButtonText: {
      type: String,
      default: '确认',
    },
    cancelButtonText: {
      type: String,
      default: '取消',
    },
    showShare: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['cancel', 'confirm'],
  setup(props, { emit }) {
    const handleCancel = () => {
      emit('cancel')
    }

    const handleConfirm = () => {
      emit('confirm')
    }

    return {
      handleCancel,
      handleConfirm,
    }
  },
})
</script>
