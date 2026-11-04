<template>
  <PayContent title="最新待支付运单(元)" :data="data">
    <div class="waybill-wrap">
      <div class="waybill-count">
        运单号：<span @click="copyText(data.waybillNumber)">{{ data.waybillNumber }}</span>
        <img
          class="copy-img"
          @click="copyText(data.waybillNumber)"
          src="https://ic-img.ky-express.com/netc/20240515_80270395142_!!1715763805847_27_27.png"
          alt=""
        />
      </div>
      <div class="waybill-time">寄件时间：{{ dayjs(Number(data.deliveryTime)).format('YYYY/MM/DD HH:mm') }}</div>
    </div>
    <div class="address-info">
      <div class="address">
        <div class="address-name">{{ data.deliveryCity }}</div>
        <div class="address-user">{{ data.sender }}</div>
      </div>
      <div class="line">
        <img src="https://ic-img.ky-express.com/netc/20240430_14170395116_!!1714449505293_140_7.png" alt="" />
        <div class="waybill-type">{{ data.serviceMethod }}</div>
      </div>
      <div class="address get">
        <div class="address-name">{{ data.pickupCity }}</div>
        <div class="address-user">{{ data.receiver }}</div>
      </div>
    </div>
  </PayContent>
</template>
<script lang="ts" setup>
import { HomePagePaymentVO } from '@/apis/home/types'
import PayContent from '../pay-content/index.vue'
import { useCopyText } from '@/hooks'
import dayjs from 'dayjs'
const { copyText } = useCopyText()
interface PayIndividualProps {
  data: HomePagePaymentVO
}
defineProps<PayIndividualProps>()
</script>
<style lang="scss" scoped>
.waybill-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 设计稿：44px 渐变条，上圆角 6，向两侧扩展到距卡片 16px，文字距卡片 40px */
  margin: 0 -24px;
  padding: 12px 24px;
  font-size: 12px;
  color: #24262b;
  // background: linear-gradient(90deg, #ffffff 0%, #fbfbff 100%);
  background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(251, 251, 255, 1) 100%);
  border-radius: 6px 6px 0 0;
  .waybill-count {
    color: #24262b;
    font-size: 12px;
    line-height: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    span {
      font-size: 13px;
      font-weight: 400;
      line-height: 20px;
      color: #24262b;
    }
    .copy-img {
      width: 14px;
      height: 14px;
      margin-left: 4px;
    }
  }
  .waybill-time {
    display: flex;
    align-items: center;
    height: 18px;
    font-size: 12px;
    line-height: 18px;
    color: #8c8f99;
  }
}
.address-info {
  display: flex;
  /* 设计稿：地址区带 1px 边框（运单号条无边框） */
  padding: 22px 0;
  // border: 1px solid #e6e8ed;
}
.address {
  flex: 1;
}
.line {
  width: 140px;
  img {
    width: 100%;
  }
}
.address-name {
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  color: #24262b;
}
.address-user {
  margin-top: 4px;
  font-size: 13px;
  line-height: 20px;
  color: #8c8f99;
}
.address.get {
  text-align: right;
}
.waybill-type {
  margin-top: 8px;
  font-size: 13px;
  line-height: 20px;
  text-align: center;
  color: #24262b;
}
</style>
