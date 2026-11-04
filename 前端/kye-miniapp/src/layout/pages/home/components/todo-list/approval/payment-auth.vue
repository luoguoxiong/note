<template>
  <view
    id="payment-auth-ex"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_payment_authorization_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        event_name: '移动端新版首页_待办事项_付款授权_曝光',
        region_code: 'waybill_todo_list',
        region_name: '待办事项_付款授权',
      },
    }"
  >
    <view v-if="paymentApproval">
      <view class="todo-payment-auth" @tap="handleNavigateToDetail">
        <view class="todo-payment-auth__header">
          <ky-lazy-image
            :delay="500"
            src="https://ic-img.ky-express.com/netc/20250707_67195_!!1751869747366_80_80.png"
            mode="aspectFit"
          />
          {{ titleTextMap[paymentApproval.authType || '30'] }}
          <text class="todo-payment-auth__header__sub" v-if="paymentApproval.waybillCount">
            (共{{ paymentApproval.waybillCount || 0 }}票)
          </text>
          <text class="todo-payment-auth__header__right">{{ paymentApproval.applyDate || '--' }}</text>
        </view>
        <view class="todo-payment-auth__content">
          <view class="todo-payment-auth__info">
            <view class="todo-payment-auth__info__flow" v-if="Number(paymentApproval.authType) === 30">
              <text>{{ paymentApproval.applyCustomerName || '--' }}</text>
              <ky-lazy-image
                :delay="500"
                mode="aspectFit"
                src="https://ic-img.ky-express.com/netc/20250707_57522_!!1751859388938_276_24.png"
              />
              <text v-if="paymentApproval.recipientCustomerName">
                {{ paymentApproval.recipientCustomerName || '--' }}
              </text>
              <text v-else style="color: #888ea6">暂无收件公司</text>
            </view>
            <view v-if="Number(paymentApproval.authType) !== 30" class="todo-payment-auth__info__desc" @tap.stop>
              【{{ paymentApproval.applyCustomerName || '--' }}】寄出的所有运单，由【{{
                paymentApproval.payCustomerName || '--'
              }}】付款 ，请审批
            </view>
            <view v-else class="todo-payment-auth__info__desc" @tap.stop>
              该笔运费申请由【{{ paymentApproval.payCustomerName || '--' }}】付款，预估总费用：
              <EstimateCost :batch-no="paymentApproval.batchNo" @click="reportPayAuthCostClick">
                <template #value="{ value }">
                  <text style="color: #ff706d; font-weight: 600">{{ value }}元</text>
                </template>
              </EstimateCost>
              ，请审批
            </view>
          </view>
          <view class="todo-payment-auth__form">
            <view class="todo-payment-auth__form__item">
              <text>申请人：</text>
              <text>
                {{ paymentApproval.applyName || '--' }}
                <text v-if="paymentApproval.applyMobile && paymentApproval.applyMobile !== paymentApproval.applyName">
                  ({{ paymentApproval.applyMobile }})
                </text>
              </text>
            </view>
            <view class="todo-payment-auth__form__item">
              <text>申请公司：</text>
              <text>
                {{ paymentApproval.applyCustomerName || '--' }}
                <text v-if="paymentApproval.applyCustomerCode">({{ paymentApproval.applyCustomerCode }})</text>
              </text>
            </view>
            <view class="todo-payment-auth__form__item ellipsis" v-if="Number(paymentApproval.authType) === 30">
              <view>
                服务方式
                <ky-lazy-image
                  :delay="500"
                  @tap.stop="Taro.showToast({ title: '包含单据内全部运单的服务方式', icon: 'none' })"
                  mode="aspectFit"
                  src="https://ic-img.ky-express.com/netc/20250707_22193_!!1751869775094_48_48.png"
                />：
              </view>
              <text>{{ paymentApproval.serviceModesDesc || '--' }}</text>
            </view>
          </view>
          <view class="todo-payment-auth__alert" v-if="Number(deliverCount) > 0">
            有{{ deliverCount }}票运单派送中，请及时审批
          </view>
        </view>
        <view class="todo-payment-auth__footer" @tap.stop>
          <ky-button class="mr-16" size="small" plain @tap="handleReject">拒绝付款</ky-button>
          <ky-button size="small" type="primary" plain @tap="handleAgree">同意付款</ky-button>
        </view>
      </view>
      <load-more @load-more="handleNavigateToList" />
    </view>
    <ky-empty v-else description="暂无数据" />
  </view>
</template>

<script lang="ts" setup>
import Taro from '@tarojs/taro'
import { computed, ref, watch } from 'vue'
import { PaymentApproval } from '../types'
import { useHomeStore } from '../../../store'
import { getDeliverCount } from '../../../apis'
import EstimateCost from '../../estimate-cost/index.vue'
import LoadMore from '../load-more.vue'

import './payment-auth.scss'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import { navigateWithParams } from '../../../hooks'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import {
  reportPayAuthClick,
  reportPayAuthClickMore,
  reportPayAuthCostClick,
  reportPayAuthDetailClick,
} from '../../../report'

useExposureReport(['payment-auth-ex'])

defineProps<{ approval?: PaymentApproval }>()

const titleTextMap = {
  10: '公司申请',
  20: '个人申请',
  30: '运单申请',
}

const store = useHomeStore()

const paymentApproval = computed(() => {
  return store.data.todoList.paymentApproval?.itemDetail
})

const deliverCount = ref(0)

watch(
  paymentApproval,
  async () => {
    const batchNo = paymentApproval.value?.batchNo
    const authType = paymentApproval.value?.authType

    if (!batchNo || Number(authType) !== 30) return

    const { data } = await getDeliverCount({ batchNo })
    deliverCount.value = data.number || 0
  },
  { immediate: true },
)

const handleNavigateToList = () => {
  reportPayAuthClickMore()
  navigateWithParams(ApplicationCodeMap['首页-付款授权'])
}

const handleNavigateToDetail = () => {
  reportPayAuthDetailClick()
  navigateWithParams(
    ApplicationCodeMap['首页-付款授权'],
    { id: paymentApproval.value?.id, requestSource: 10 },
    '#/approve-detail/' + paymentApproval.value?.id,
  )
}

const handleReject = () => {
  reportPayAuthClick('拒绝')
  navigateWithParams(
    ApplicationCodeMap['首页-付款授权'],
    {
      operateType: 2,
      id: paymentApproval.value?.id,
      requestSource: 10,
    },
    '#/approve-detail/' + paymentApproval.value?.id,
  )
}

const handleAgree = () => {
  reportPayAuthClick('同意')
  navigateWithParams(
    ApplicationCodeMap['首页-付款授权'],
    {
      operateType: 1,
      id: paymentApproval.value?.id,
      requestSource: 10,
    },
    '#/approve-detail/' + paymentApproval.value?.id,
  )
}
</script>
