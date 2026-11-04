<template>
  <PayContent title="最新未结清账单(元)" :data="data">
    <div class="payment-metrics">
      <div class="metric">
        <span class="metric-label">月结账单：</span>
        <strong class="metric-value">{{ dayjs(data.orgInMonth).format('YYYY 年 MM 月') }}</strong>
      </div>
      <div class="metric">
        <span class="metric-label">账单总金额：</span>
        <strong class="metric-value">{{ data.netReceiptsAmt }}</strong>
      </div>
      <div class="metric">
        <span class="metric-label">运单总票数：</span>
        <strong class="metric-value">{{ data.waybillCount }}</strong>
      </div>
    </div>
  </PayContent>
</template>
<script lang="ts" setup>
import dayjs from 'dayjs'
import PayContent from '../pay-content/index.vue'
import { HomePagePaymentVO } from '@/apis/home/types'
interface PayMonthProps {
  data: HomePagePaymentVO
}
defineProps<PayMonthProps>()
</script>
<style lang="scss" scoped>
.payment-metrics {
  display: grid;
  width: 100%;
  height: 96px;
  grid-template-columns: 1.05fr 1fr 0.78fr;
}
.metric {
  display: flex;
  overflow: hidden;
  padding-top: 26px;
  gap: 10px;
  flex-direction: column;
}
.metric-label {
  font-size: 13px;
  white-space: nowrap;
  color: #7c7984;
  line-height: 18px;
}
.metric-value {
  overflow: hidden;
  font-size: 19px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #28272d;
  line-height: 26px;
}
</style>
