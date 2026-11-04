<template>
  <view
    id="exp-vipshop"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_vipshop_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        region_code: 'waybill_todo_list',
      },
    }"
  >
    <view v-if="thirdOrderInfo">
      <view class="third-order-item" @tap="handleNavigateToDetail">
        <view class="third-order-item__header">
          <text style="margin-right: 8px">批次号</text>
          <text @tap.stop="handleCopyBatchNo" class="third-order-item__header__order">
            {{ thirdOrderInfo.vipBatchNo || '--' }}
          </text>
          <ky-lazy-image
            :delay="500"
            v-if="thirdOrderInfo.vipBatchNo"
            @tap.stop="handleCopyBatchNo"
            class="third-order-item__header__copy"
            src="https://ic-img.ky-express.com/netc/20250707_29173_!!1751854611555_56_56.png"
            mode="aspectFit"
          />

          <view class="third-order-item__tag third-order-item__header__right">
            {{ thirdOrderInfo.qrCodeState === 0 ? '待确认' : '已确认' }}
          </view>
        </view>
        <view class="third-order-item__content">
          <view class="third-order-item__customer">
            <text>{{ thirdOrderInfo.startCity || '--' }}</text>
          </view>
          <ky-lazy-image
            :delay="500"
            class="third-order-item__type"
            src="https://ic-img.ky-express.com/netc/20250707_15674_!!1751858156872_128_24.png"
          />
          <view class="third-order-item__customer">
            <text>{{ thirdOrderInfo.vipWarehouse || '--' }}</text>
          </view>
        </view>
        <view class="third-order-item__footer">
          <text>
            共
            <text style="font-weight: 600">{{ thirdOrderInfo.waybillCount || 0 }}</text>
            票
          </text>
          <ky-button type="primary" plain size="small" @tap.stop="handleShowQRCode">查看二维码</ky-button>
        </view>
      </view>
      <load-more
        @load-more="
          report_wrapper(handleNavigateToList, [
            'clk_homepage_vipshop_view_more_v1',
            'CLK',
            {
              page_code: 'page_homepage_v1',
              region_code: 'waybill_todo_list',
            },
          ])()
        "
      />
    </view>
    <ky-empty v-else description="暂无数据" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHomeStore } from '../../../store'
import { copyText } from '@public/utils/copy'
import { navigateWithParams } from '../../../hooks'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import LoadMore from '../load-more.vue'

import './index.scss'
import { report_wrapper } from '@/public/utils'
import { useExposureReport } from '@/public/hooks/useExposureReport'

defineOptions({ name: 'third-order-item' })

useExposureReport(['exp-vipshop'])

const store = useHomeStore()

const thirdOrderInfo = computed(() => {
  return store.data.thirdOrderInfo?.itemDetail
})

const handleNavigateToList = () => {
  navigateWithParams(ApplicationCodeMap['唯品会订单-查看列表'])
}

const handleNavigateToDetail = report_wrapper(() => {
  navigateWithParams(ApplicationCodeMap['唯品会订单-查看详情'], {
    batchNo: thirdOrderInfo.value?.batchNo,
  })
}, ['clk_homepage_vipshop_card_v1', 'CLK', { page_code: 'page_homepage_v1', region_code: 'waybill_todo_list' }])

const handleShowQRCode = report_wrapper(() => {
  navigateWithParams(ApplicationCodeMap['唯品会订单-查看详情'], {
    batchNo: thirdOrderInfo.value?.batchNo,
    showQrCode: true,
  })
}, ['clk_homepage_vipshop_code_v1', 'CLK', { page_code: 'page_homepage_v1', region_code: 'waybill_todo_list' }])

const handleCopyBatchNo = report_wrapper(() => {
  copyText(thirdOrderInfo.value?.vipBatchNo || '')
}, ['clk_homepage_vipshop_copy_v1', 'CLK', { page_code: 'page_homepage_v1', region_code: 'waybill_todo_list' }])
</script>
