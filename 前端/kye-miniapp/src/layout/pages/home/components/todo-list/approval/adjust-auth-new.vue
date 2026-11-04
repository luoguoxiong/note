<template>
  <view
    id="adjust-auth-ex"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_price_adjustment_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        event_name: '移动端新版首页_待办事项_调价审核_曝光',
        region_code: 'waybill_todo_list',
        region_name: '待办事项_调价审核',
      },
    }"
  >
    <view v-if="adjustPriceInfo">
      <view class="todo-adjust-auth" @tap="toLookDetail('卡片', adjustPriceInfo.adjustPriceId)">
        <view class="todo-adjust-auth__header">
          <text class="todo-adjust-auth__header__order">
            {{ adjustPriceInfo.adjustTitle || '--' }}
          </text>
          <view class="todo-adjust-auth__header__right">
            <text @click.stop="toLookDetail('查看详情', adjustPriceInfo.adjustPriceId)">查看详情</text>
            <ky-lazy-image
              :delay="500"
              src="https://ic-img.ky-express.com/netc/20250707_91976_!!1751871192393_48_48.png"
            />
          </view>
        </view>
        <view class="todo-adjust-auth__content">
          <view class="todo-adjust-auth__info">
            <view class="item">
              <text class="label">付款公司：</text>
              <text>
                {{ adjustPriceInfo.paymentCustomerName || '--' }}（{{ adjustPriceInfo.paymentCustomerCode }}）
              </text>
            </view>
            <view class="item">
              <text class="label">运单号：</text>
              <text>
                {{ adjustPriceInfo.lastWaybillNumber || '--' }}
              </text>
              <text v-if="adjustPriceInfo.totalWaybillCount">等{{ adjustPriceInfo.totalWaybillCount }}票</text>
            </view>
            <view class="item">
              <text class="label">预估调价：</text>
              <text class="money">{{ estimatedAdjustAmountFormat }} </text>
              <text class="tips">（具体以实际为准）</text>
            </view>
          </view>
          <view class="todo-adjust-auth__footer">
            <ky-button
              class="w-132"
              size="small"
              plain
              @click.stop="toLookDetail('不同意', adjustPriceInfo.adjustPriceId)"
            >
              不同意
            </ky-button>
            <ky-button
              class="w-120"
              size="small"
              plain
              type="primary"
              @click.stop="toLookDetail('同意', adjustPriceInfo.adjustPriceId)"
            >
              同意
            </ky-button>
          </view>
        </view>
      </view>
      <load-more @load-more="toLookMore" />
    </view>
    <ky-empty v-else description="暂无数据" />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useHomeStore } from '../../../store'
import { reportPriceClick, reportPriceMoreClick } from '../../../report'
import './adjust-auth-new.scss'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import { openURL } from '@/modules/webview/utils'
import { getEnvConfig } from '@/public/config'
import { navigateWithParams } from '../../../hooks'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import LoadMore from '../load-more.vue'

useExposureReport(['adjust-auth-ex'])

const store = useHomeStore()

const adjustPriceInfo = computed(() => {
  console.log(111, store.data.todoList.adjustPriceApproval?.itemDetail)
  return store.data.todoList.adjustPriceApproval?.itemDetail
})

const estimatedAdjustAmountFormat = computed(() => {
  if (Number(adjustPriceInfo.value?.estimatedAdjustAmount)) {
    return `￥${adjustPriceInfo.value?.estimatedAdjustAmount}`
  }
  return adjustPriceInfo.value?.estimatedAdjustAmount
})

const toLookDetail = (type: string, id: number) => {
  reportPriceClick(type)
  toDetail(`${id}`)
}

const toDetail = (id: string) => {
  console.log(id)
  const { isProd } = getEnvConfig()
  const url = isProd
    ? `https://ic-h5.kye-erp.com/order-config/index.html#/price-adjustment-review?batchId=${id}&auditStatus=10`
    : `https://ic-h5-uat.kye-erp.com/order-config/index.html#/price-adjustment-review?batchId=${id}&auditStatus=10`
  openURL(url, { needLogin: true })
}

const toLookMore = () => {
  reportPriceMoreClick()
  navigateWithParams(ApplicationCodeMap['首页-调价审核-列表'], { tab: 2 })
}
</script>
