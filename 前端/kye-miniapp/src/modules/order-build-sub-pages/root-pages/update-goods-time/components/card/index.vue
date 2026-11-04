<template>
  <div class="update-goods-time-card" @click="checkChange">
    <div class="order-header">
      <span>{{ info.waybillNumber }}</span>
      <span @click.stop class="copy-icon-content"><SvgIcon name="copy-black" v-copy="info.waybillNumber" /></span>
    </div>
    <div class="order-body">
      <div class="select-content">
        <KyRadio hideLabel :size="32" class="ky-radio-content" :is-checked="isChecked" />
      </div>
      <!-- 寄件信息 -->
      <div class="info-detail sender-info">
        <div class="addres">{{ info.deliveryCity || '--' }}</div>
        <div class="person">{{ info.deliveryPerson || '--' }}</div>
        <div class="company">{{ info.deliveryCustomerName || '--' }}</div>
      </div>

      <!-- 状态 -->
      <div class="status-info">
        <div class="status">{{ WaybillStatus[info.waybillStatus] || '' }}</div>
        <div class="raw-line"><SvgIcon name="waybill-card-arrow" class="carc_process" /></div>
        <div class="service">{{ info.serviceModeDesc }}</div>
      </div>

      <!-- 收件信息 -->
      <div class="info-detail receive-info">
        <div class="addres">{{ info.pickupCity || '--' }}</div>
        <div class="person">{{ info.pickupPerson || '--' }}</div>
        <div class="company">{{ info.pickupCustomerName || '--' }}</div>
      </div>
    </div>

    <div class="order-footer">
      <div class="goods-time">
        <div>货好时间：</div>
        <div class="time-value">{{ formatTime(info.goodsTime) }}</div>
        <div class="has-updated" v-if="info.goodsTimeChangeFlag === YesOrNoString.YES">已改货好时间</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import vCopy from '@order-public-sub-public/directives/copy'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyRadio from '@order-public-sub-public/components/base/ky-radio-v2/index.vue'
import { GoodsTimeWaybillItem } from '@order-public-sub-public/apis/update-goods-time/type'
import { WaybillStatus, YesOrNoString } from '@order-public-sub-public/constants'
import dayjs from 'dayjs'
const emits = defineEmits(['checkChange'])
const props = defineProps<{ info: GoodsTimeWaybillItem; isChecked: boolean }>()

const checkChange = () => {
  emits('checkChange', props.info)
}

const formatTime = (goodsTime: string) => {
  if (!goodsTime) {
    return '--'
  }
  try {
    return dayjs(Number(goodsTime)).format('YYYY/MM/DD HH:mm')
  } catch (error) {
    return '--'
  }
}
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
