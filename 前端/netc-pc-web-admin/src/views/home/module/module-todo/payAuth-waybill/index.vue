<template>
  <PayContent title="运单申请" :total="data.waybillCount" :deliverCount="deliverCount" :data="data">
    <div class="waybill-info">
      <span>{{ data.applyCustomerName }}</span>
      <img src="https://ic-img.ky-express.com/netc/20240430_14170395116_!!1714449505293_140_7.png" alt="" />
      <span class="align-right" v-show="data.recipientCustomerName">{{ data.recipientCustomerName }}</span>
      <span class="align-right" style="color: #686b75" v-show="!data.recipientCustomerName">暂无收件公司</span>
    </div>
    <div class="waybill-desc">
      该笔运费申请由【{{ data.payCustomerName }}】付款，预估总费用：
      <ButtonLoadingIcon v-show="isFetch" :src="LOADING_IMG" :size="15" :mr="0" />
      <KButton v-show="!isFetch && estimateCost === ''" text size="small" class="to-look" @click.stop="lookPay(data)"
        >点击查看</KButton
      >

      <span class="money" v-show="estimateCost">{{ estimateCost }}元</span>
      ，请审批
    </div>
  </PayContent>
</template>

<script setup lang="ts">
import { PayAuthListVO } from '@/apis/home/types'
import PayContent from '../payAuth-content/index.vue'
import { KButton } from '@netc-design-pc/ui'
import ButtonLoadingIcon from '@/components/button-loading-icon/index.vue'
import { getEstimateCost, getDeliverCount } from '@/apis/home'
import { onMounted, ref } from 'vue'
import { parentMessageSend } from '@/utils/appBridge'

const LOADING_IMG = 'https://ic-img.ky-express.com/netc/20240508_95570395148_!!1715157423511_15_15.png'

const estimateCost = ref('')
const isFetch = ref(false)
const deliverCount = ref(0)

interface PayAuthWaubillProps {
  data: PayAuthListVO
  isActive: boolean
}

const lookPay = async ({ batchNo }: PayAuthListVO) => {
  try {
    isFetch.value = true
    const { data } = await getEstimateCost(batchNo)
    if (data?.estimateCost) {
      estimateCost.value = data.estimateCost
    } else {
      parentMessageSend({
        message: '未知错误',
        type: 'error',
      })
    }
    isFetch.value = false
  } catch (error) {
    isFetch.value = false
  }
}

const props = defineProps<PayAuthWaubillProps>()

onMounted(async () => {
  const { data } = await getDeliverCount(props.data.batchNo)
  deliverCount.value = data.number
})
</script>
<style lang="scss" scoped>
.waybill-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    font-size: 15px;
    font-weight: 600;
    line-height: 22px;
    color: #24262b;
    flex: 1;
  }
  .align-right {
    text-align: right;
  }
  img {
    width: 140px;
  }
}
.waybill-desc {
  padding-top: 10px;
  font-size: 12px;
  line-height: 14px;
  color: #24262b;
  display: flex;
  align-items: center;
  .to-look {
    &.k-button {
      height: auto;
      min-height: 0;
      padding: 0;
      font-size: 12px;
    }
  }
  span.money {
    color: #f73f31;
  }
}
</style>
