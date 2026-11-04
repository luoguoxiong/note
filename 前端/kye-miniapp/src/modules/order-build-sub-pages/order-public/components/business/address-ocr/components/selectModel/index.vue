<template>
  <DialogMasker
    :show="show"
    :title="title"
    :className="className"
    :showCancelButton="false"
    :showConfirmButton="false"
    :closeable="closeable"
    :beforeClose="beforeClose"
    :renderClassName="true"
  >
    <template #default>
      <div class="select-address-list">
        <div class="ocr-original-address" v-if="useOriginalAddress">
          <div class="ocr-original-address-title">根据您的信息：</div>
          <div class="ocr-original-address-content">
            {{ useOriginalAddress }}
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
import DialogMasker from '@order-public-sub-public/components/business/limit-custom/dialog-masker/index.vue'
import { AiAddrAnalysis } from '@order-public-sub-public/apis/address/types'
import { useOriginalAddress } from '@order-public-sub-public/hooks/address/useCommon'
import { joinAt } from '@order-public-sub-public/utils'
import { closeDialog } from '@order-public-sub-public/hooks/useShowToast'
import { DialogMaskerProps } from '@order-public-sub-public/components/business/limit-custom/dialog-masker/types'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

interface propsData extends DialogMaskerProps {
  list: AiAddrAnalysis[]
  recognitionType: string
}
const emit = defineEmits(['selectAddress'])
const props = defineProps<propsData>()

const selectAddressFun = (item: AiAddrAnalysis) => {
  emit('selectAddress', item)
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_fill_Multiple_open_button_v1',
      regionCode: 'sender_box',
    },
    {
      recognition_type: props.recognitionType,
      recognition_msg: `${fullAddress(item)}`,
    },
  )
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
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
