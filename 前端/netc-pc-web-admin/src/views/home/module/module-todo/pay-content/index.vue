<template>
  <div id="pay">
    <div class="pay-title">{{ title }}</div>
    <div class="pay-info-wrap">
      <slot></slot>
    </div>
    <div class="pay-money">
      <div class="center">
        待支付：
        <span class="money">{{ data?.unPaidAmt }}</span>
      </div>
      <KButton
        type="primary"
        id="home-btn"
        class="pay-button-hot-zone"
        @click.stop="toPay"
        style="width: 76px; margin-right: 0"
      >
        去支付
      </KButton>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { HomePagePaymentVO } from '@/apis/home/types'
import { useLinkTo } from '@/hooks'
import { KButton } from '@netc-design-pc/ui'
interface PayContentProps {
  title: string
  data: HomePagePaymentVO
}

const { linkToPay } = useLinkTo()
const props = defineProps<PayContentProps>()

const toPay = () => {
  linkToPay(encodeURIComponent(props.data.directUrl))
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_fee_payment_todo_pay_v1',
    },
    {
      region_code: 'fee_payment_todo',
      pay_type: props.data?.billType === 0 ? '账单' : '现结',
    }
  )
}
</script>
<style lang="scss" scoped>
#pay {
  position: relative;
  width: 100%;
  height: 254px;
  padding: 12px 16px 16px;
  background: transparent;
  border-radius: 8px;
  box-sizing: border-box;
}
.pay-title {
  font-size: 15px;
  font-weight: 600;
  color: #24262b;
  height: 22px;
  line-height: 22px;
}
.pay-info-wrap {
  position: absolute;
  /* 设计稿：内容区起点 = 12(上边距) + 22(标题) + 12(间距) */
  top: 46px;
  left: 40px;
  right: 40px;
}
.pay-money {
  position: absolute;
  right: 40px;
  bottom: 26px;
  left: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 35px;
  font-size: 13px;
  font-weight: normal;
  line-height: 20px;
  color: #686b75;
  vertical-align: middle;
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  span.money {
    font-size: 24px;
    font-weight: 600;
    color: #f73f31;
  }
}

// 月结和散客共用该按钮：按设计标注扩大透明热区，不改变按钮的视觉尺寸与位置。
.pay-button-hot-zone {
  position: relative;
}

.pay-button-hot-zone::before {
  position: absolute;
  content: '';
  top: -3px;
  right: -17px;
  bottom: -3px;
  left: 8px;
}
</style>
