<template>
  <ky-overlay :show="show" position="center">
    <view
      class="confirm-dialog"
      id="privacy-phone-confirm-dialog"
      :exposure-report="{
        eventCode: 'exp_page_number_protection_Start',
        otherParams: { page_code: 'page_number_protection' },
      }"
    >
      <view class="confirm-dialog__title">确定开启吗？</view>
      <view class="confirm-dialog__content">
        <view>开启后，别人将无法使用当前手机号寄件</view>
        <view class="confirm-dialog__extra" @click="handleToggleAllowSameCustomer">
          <ky-checkbox :icon-size="15" type="check" :model-value="allowBind"></ky-checkbox>
          <view>
            <text class="confirm-dialog__extra-bold">允许绑定同客户编码的手机号，</text>
            使用当前手机号寄件
          </view>
        </view>
      </view>

      <view class="confirm-dialog__footer">
        <view class="confirm-dialog__footer-cancel" @click="handleCancel">取消</view>
        <view class="confirm-dialog__footer-confirm" @click="handleConfirm">确定</view>
      </view>
    </view>
  </ky-overlay>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import './index.scss'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import { report_CLK_event, report_wrapper } from '@/public/utils'

defineOptions({ name: 'ConfirmDialog' })
const props = defineProps<{ show: boolean }>()

useExposureReport(['privacy-phone-confirm-dialog'])

const emits = defineEmits<{
  (_e: 'update:show', _value: boolean): void
  (_e: 'next', _allow: boolean): void
}>()

const allowBind = ref(true)

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      allowBind.value = true
    }
  },
)

const handleToggleAllowSameCustomer = () => {
  allowBind.value = !allowBind.value

  report_CLK_event('clk_number_protection_start_button', {
    page_code: 'page_number_protection',
    button_name: allowBind.value ? '勾选允许' : '取消勾选',
  })
}

const handleCancel = report_wrapper(() => {
  emits('update:show', false)
}, ['clk_number_protection_start_button', 'CLK', { page_code: 'page_number_protection', button_name: '取消' }])

const handleConfirm = report_wrapper(() => {
  emits('next', allowBind.value)
  emits('update:show', false)
}, ['clk_number_protection_start_button', 'CLK', { page_code: 'page_number_protection', button_name: '确定' }])
</script>
