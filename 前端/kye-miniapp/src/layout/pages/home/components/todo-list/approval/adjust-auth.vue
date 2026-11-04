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
      <view class="todo-adjust-auth" @tap="handleAgree">
        <view class="todo-adjust-auth__header">
          <text @tap.stop="copyWaybill(adjustPriceWaybill.waybillNumber)" class="todo-adjust-auth__header__order">
            {{ adjustPriceWaybill.waybillNumber || '--' }}
          </text>
          <ky-lazy-image
            :delay="500"
            v-if="adjustPriceWaybill.waybillNumber"
            @tap.stop="copyWaybill(adjustPriceWaybill.waybillNumber)"
            class="todo-adjust-auth__header__copy"
            src="https://ic-img.ky-express.com/netc/20250707_29173_!!1751854611555_56_56.png"
          />
          <view class="todo-adjust-auth__header__right" @click.stop="toLookDetail">
            <text>查看详情</text>
            <ky-lazy-image
              :delay="500"
              src="https://ic-img.ky-express.com/netc/20250707_91976_!!1751871192393_48_48.png"
            />
          </view>
        </view>
        <view class="todo-adjust-auth__content">
          <view class="todo-adjust-auth__info">
            <view class="todo-adjust-auth__info__customer" v-if="hasCity">
              <text>{{ adjustPriceWaybill.sender.city || '--' }}</text>
              <text>{{ adjustPriceWaybill.sender.person || '--' }}</text>
              <text>{{ adjustPriceWaybill.sender.companyName || '--' }}</text>
            </view>
            <view class="todo-adjust-auth__info__customer" v-else>
              <text>{{ adjustPriceWaybill.sender.companyName || '--' }}</text>
              <text>{{ adjustPriceWaybill.sender.person || '--' }}</text>
              <text>{{ adjustPriceWaybill.sender.detailAddress || '--' }}</text>
            </view>
            <view class="todo-adjust-auth__info__type">
              <view style="color: #00c58c">
                <text v-if="Number(adjustPriceWaybill.status) === 10">可下单</text>
              </view>
              <ky-lazy-image
                :delay="500"
                mode="aspectFit"
                src="https://ic-img.ky-express.com/netc/20250707_5822_!!1751871570383_276_24.png"
              />
              <view>{{ formmtterServiceMode(adjustPriceWaybill.serviceMode?.serviceMode) || '--' }}</view>
            </view>
            <view class="todo-adjust-auth__info__customer" v-if="hasCity">
              <text>{{ adjustPriceWaybill.receive.city || '--' }}</text>
              <text>{{ adjustPriceWaybill.receive.person || '--' }}</text>
              <text>{{ adjustPriceWaybill.receive.companyName || '--' }}</text>
            </view>
            <view class="todo-adjust-auth__info__customer" v-else>
              <text>{{ adjustPriceWaybill.receive.companyName || '--' }}</text>
              <text>{{ adjustPriceWaybill.receive.person || '--' }}</text>
              <text>{{ adjustPriceWaybill.receive.detailAddress || '--' }}</text>
            </view>
          </view>
          <view class="todo-adjust-auth__form">
            <view class="todo-adjust-auth__form__item">
              <text>下单时间：</text>
              <text>{{ formatterDateTime(adjustPriceWaybill.orderTime) || '--' }}</text>
            </view>
          </view>
        </view>
        <view class="todo-adjust-auth__footer">
          <ky-button size="small" plain type="primary" @click.stop="handToOrder">确认下单</ky-button>
        </view>
      </view>
      <load-more @load-more="handleLoadMore" />
    </view>
    <ky-empty v-else description="暂无数据" />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useHomeStore } from '../../../store'
import { copyText } from '@/public/utils/copy'
import { formatterDateTime, formmtterServiceMode } from '../formatter'
import { AdjustPriceWaybill } from '../types'
import LoadMore from '../load-more.vue'

import './adjust-auth.scss'
import { navigateWithParams } from '../../../hooks'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import Taro from '@tarojs/taro'
import { urlContact } from '@/public/utils'
import { reportPirceCopyClick, reportPriceClick, reportPriceMoreClick } from '../../../report'
import { useExposureReport } from '@/public/hooks/useExposureReport'

useExposureReport(['adjust-auth-ex'])

const store = useHomeStore()
const adjustPriceInfo = computed(() => {
  return store.data.todoList.adjustPriceApproval?.itemDetail
})

const adjustPriceWaybill = computed(() => {
  return adjustPriceInfo.value?.waybillInfoItem || ({ sender: {}, receive: {} } as AdjustPriceWaybill)
})

/**
 * TODO 临时兼容一版，避免发包
 */
const hasCity = computed(() => {
  return adjustPriceWaybill.value.sender.city && adjustPriceWaybill.value.receive.city
})

const handleLoadMore = () => {
  reportPriceMoreClick()
  navigateWithParams(ApplicationCodeMap['首页-调价审核-列表'], { tab: 2 })
}

const toDetail = () => {
  Taro.navigateTo({
    url: urlContact('/modules/order-build/pages/order/index', {
      type: 'edit',
      waybillNo: adjustPriceWaybill.value.waybillNumber,
      sourcePage: 'home',
      sourceAction: 'AdjustReviewHome',
      channel: 170,
    }),
  })
}

const handleAgree = () => {
  reportPriceClick('卡片')
  toDetail()
}

const copyWaybill = (waybillNumber: string) => {
  copyText(waybillNumber)
  reportPirceCopyClick()
}

const toLookDetail = () => {
  reportPriceClick('查看详情')
  toDetail()
}

const handToOrder = () => {
  reportPriceClick('确认下单')
  toDetail()
}
</script>
