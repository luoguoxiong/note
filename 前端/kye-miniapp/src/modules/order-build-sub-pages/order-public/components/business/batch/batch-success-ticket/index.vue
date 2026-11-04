<template>
  <!-- 运单号 -->
  <div class="batchSuccessTicket_container">
    <div class="header">
      <span>运单号</span>
      <span>{{ waybillNumber }}</span>
      <SvgIcon name="copy-black" v-copy="waybillNumber"></SvgIcon>
    </div>

    <div class="content">
      <!-- :data="data" -->
      <waybillInfo :data="waybillInfoData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import waybillInfo from './components/waybill-info/index'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import vCopy from '@order-public-sub-public/directives/copy'

const props = defineProps({
  data: {
    type: Object,
    request: true,
    default: () => ({}),
  },
})

const waybillNumber = computed(() => props.data.orderNumber)

const waybillInfoData = ref({
  waybillPickup: {
    city: '深圳市',
    person: 'xxxxx',
    companyName: 'cccccccccc',
  },
  waybillDelivery: {
    city: '深圳市',
    person: 'xxxxx',
    companyName: 'cccccccccc',
  },
  goodsType: '江西赣南酸枣糕好吃酸枣糕好…',
  actualWeight: '20000kg',
  count: '2000件',
})
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
