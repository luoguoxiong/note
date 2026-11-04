<template>
  <view
    id="exp-payment"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_fee_payment_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        region_code: 'waybill_todo_list',
        pay_type: paymentInfo ? paymentInfo.payMode : '',
      },
    }"
  >
    <view v-if="paymentInfo">
      <view class="payment-item" @tap="handleNavigateToDetail2">
        <view class="payment-item__header">
          <template v-if="paymentInfo.payMode !== '月结'">
            <text
              class="payment-item__header__order"
              @tap.stop="
                () => {
                  copyText(paymentInfo?.waybillNumber)
                  report_CLK_event('clk_homepage_fee_payment_copy_v1', {
                    page_code: 'page_homepage_v1',
                    region_code: 'waybill_todo_list',
                    pay_type: paymentInfo?.payMode,
                  })
                }
              "
            >
              {{ paymentInfo.waybillNumber || '--' }}
            </text>
            <ky-lazy-image
              :delay="500"
              @tap.stop="
                () => {
                  copyText(paymentInfo?.waybillNumber)
                  report_CLK_event('clk_homepage_fee_payment_copy_v1', {
                    page_code: 'page_homepage_v1',
                    region_code: 'waybill_todo_list',
                    pay_type: paymentInfo?.payMode,
                  })
                }
              "
              class="payment-item__header__copy"
              src="https://ic-img.ky-express.com/netc/20250707_29173_!!1751854611555_56_56.png"
              mode="aspectFit"
            />
          </template>
          <template v-else>
            <text class="payment-item__header__order">{{
              dayjs(paymentInfo.orgInMonth).format('YYYY年MM月') || '--'
            }}</text>
            <ky-tag size="3" plain text-color="#FF9300" border-color="#ffd194">月结</ky-tag>
          </template>
        </view>
        <view :class="['payment-item__content', { ['payment-item__content--month']: paymentInfo.payMode === '月结' }]">
          <template v-if="paymentInfo.payMode !== '月结'">
            <view class="payment-item__info">
              <view class="payment-item__info__customer">
                <text>{{ paymentInfo.deliveryCity || '--' }}</text>
                <text>{{ paymentInfo.sender || '--' }}</text>
              </view>
              <view class="payment-item__info__type">
                <ky-lazy-image
                  :delay="500"
                  mode="aspectFit"
                  src="https://ic-img.ky-express.com/netc/20250707_88029_!!1751854741175_276_24.png"
                />
                <view>{{ paymentInfo.serviceMethod || '--' }}</view>
              </view>
              <view class="payment-item__info__customer">
                <text>{{ paymentInfo.pickupCity || '--' }}</text>
                <text>{{ paymentInfo.receiver || '--' }}</text>
              </view>
            </view>
            <view class="payment-item__content-form">
              <view class="payment-item__content-form__item">
                <text>寄件时间：</text>
                <text>{{ formatterDateTime(paymentInfo.deliveryTime) || '--' }}</text>
              </view>
            </view>
          </template>
          <template v-else>
            <view class="payment-item__month_field">
              <view>账单总金额：</view>
              <view><text>￥</text>{{ formatAmount(paymentInfo.netReceiptsAmt) || '--' }}</view>
            </view>
            <view class="payment-item__month_field">
              <view>运单总票数：</view>
              <view>{{ paymentInfo.waybillCount || '--' }}</view>
            </view>
          </template>
        </view>
        <view class="payment-item__footer">
          <text>待支付：</text>
          <text class="payment-item__price">
            <text class="payment-item__price-unit">￥</text>{{ formatAmount(paymentInfo.unPaidAmt) || '--' }}
          </text>
          <ky-button style="margin-left: auto" type="primary" size="small" @tap.stop="handleNavigateToDetail" plain
            >去支付</ky-button
          >
        </view>
      </view>
      <load-more @load-more="handleNavigateToList" />
    </view>
    <ky-empty v-else description="暂无数据" />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useHomeStore } from '../../../store'
import { copyText } from '@/public/utils/copy'
import { formatterDateTime } from '../formatter'
import { openURL } from '@/modules/webview/utils'

import dayjs from 'dayjs'
import LoadMore from '../load-more.vue'

import './index.scss'
import { formatAmount, report_CLK_event } from '@/public/utils'
import { useExposureReport } from '@/public/hooks/useExposureReport'

defineOptions({ name: 'payment-item' })

useExposureReport(['exp-payment'])

const homeStore = useHomeStore()

const paymentInfo = computed(() => {
  return homeStore.data.paymentInfo.itemDetail
})

const handleNavigateToList = () => {
  report_CLK_event('clk_homepage_fee_payment_view_more_v1', {
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    pay_type: paymentInfo.value?.payMode,
  })
  openURL(paymentInfo.value?.moreDirectUrl!, { needLogin: true })
}

const handleNavigateToDetail = () => {
  report_CLK_event('clk_homepage_fee_payment_pay_v1', {
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    pay_type: paymentInfo.value?.payMode,
    button_name: '去支付',
  })
  openURL(paymentInfo.value?.directUrl!, { needLogin: true })
}

const handleNavigateToDetail2 = () => {
  report_CLK_event('clk_homepage_fee_payment_pay_v1', {
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    pay_type: paymentInfo.value?.payMode,
    button_name: '卡片',
  })

  openURL(paymentInfo.value?.directUrl!, { needLogin: true })
}
</script>
