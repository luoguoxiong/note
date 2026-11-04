<template>
  <DialogMasker
    :show="show"
    :title="title"
    :className="className"
    :closeable="closeable"
    :beforeClose="beforeClose"
    :showCancelButton="false"
    :showConfirmButton="false"
    :renderClassName="true"
  >
    <template #default>
      <div class="select-address-list">
        <div class="ocr-original-address" v-if="originalAddress">
          <div class="ocr-original-address-title">根据您的信息：</div>
          <div class="ocr-original-address-content">
            {{ originalAddress }}
          </div>
        </div>
        <div class="ky-address-multiple-dialog-tips">
          识别到多个地区有相同的地址，<text class="ky-address-multiple-dialog-tips-text">请确认后选择:</text>
        </div>
        <div
          class="ky-address-multiple-dialog-list"
          v-for="(item, index) in list"
          :key="index"
          @click="selectAddressFun(item)"
        >
          <view class="ky-address-multiple-dialog-item">
            <text v-show="item.province">{{ item.province }}</text>
            <text v-show="item.city"> / {{ item.city }}</text>
            <text v-show="item.district"> / {{ item.district }}</text>
          </view>

          <view class="ky-address-multiple-dialog-footer">
            {{ item.address }}
          </view>
        </div>
      </div>
    </template>
  </DialogMasker>
</template>

<script setup lang="ts">
import DialogMasker from '../../../../ui/dialog-masker/index.vue'
import { AiAddrAnalysis } from '../../../../../types/address'
import { joinAt } from '../../../../../utils/address'
import { closeDialog } from '../../../../../hooks/useShowToast'
import { clk_selectModel_choose_address } from '../../../../../report/index'

interface propsData {
  show: boolean
  title?: string
  list: AiAddrAnalysis[]
  recognitionType: string
  closeable?: boolean
  className?: string
  beforeClose?: (action: string) => void | Promise<boolean>
  /** 原始识别地址文本（替代原 useOriginalAddress 共享 ref） */
  originalAddress?: string
}
const emit = defineEmits(['selectAddress'])
const props = defineProps<propsData>()

const selectAddressFun = (item: AiAddrAnalysis) => {
  emit('selectAddress', item)
  clk_selectModel_choose_address(props.recognitionType, `${fullAddress(item)}`)
  closeDialog()
}
const fullAddress = (v: AiAddrAnalysis, i?: number) => {
  return `地址${i || i === 0 ? i + 1 : ''}：${joinAt(v, [
    'telephone',
    'telPhone',
    'mobile',
    'mobilePhone',
    'name',
    'province',
    'city',
    'district',
    'address',
    'company',
  ])}`
}
</script>

<style lang="scss">
@import './index.scss';
</style>
