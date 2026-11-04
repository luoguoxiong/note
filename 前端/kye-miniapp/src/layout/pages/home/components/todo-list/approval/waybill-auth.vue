<template>
  <view
    id="waybill-auth-ex"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_waybill_approval_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        event_name: '移动端新版首页_待办事项_运单审批_曝光',
        region_code: 'waybill_todo_list',
        region_name: '待办事项_运单审批',
      },
    }"
  >
    <view v-if="waybillInfo">
      <view class="todo-waybill-auth" @tap="handleNavigateToDetail">
        <view class="todo-waybill-auth__header">
          <text class="todo-waybill-auth__header__order" @tap.stop="copyText(waybillInfo.waybillNumber)">
            {{ waybillInfo.waybillNumber || '--' }}
          </text>
          <ky-lazy-image
            :delay="500"
            v-if="waybillInfo.waybillNumber"
            @tap.stop="copyText(waybillInfo.waybillNumber)"
            class="todo-waybill-auth__header__copy"
            src="https://ic-img.ky-express.com/netc/20250707_29173_!!1751854611555_56_56.png"
          />
          <view class="todo-waybill-auth__header__right" @tap.stop="reportClick">
            <text>查看详情</text>
            <ky-lazy-image
              :delay="500"
              src="https://ic-img.ky-express.com/netc/20250707_91976_!!1751871192393_48_48.png"
            />
          </view>
        </view>
        <view class="todo-waybill-auth__content">
          <view class="todo-waybill-auth__info">
            <view class="todo-waybill-auth__info__customer">
              <text>{{ waybillInfo.sendCustomer || '--' }}</text>
              <text>{{ waybillInfo.sendName || '--' }}</text>
              <text>{{ waybillInfo.sendCity || '--' }}</text>
            </view>
            <view class="todo-waybill-auth__info__type">
              <view></view>
              <ky-lazy-image
                :delay="500"
                mode="aspectFit"
                src="https://ic-img.ky-express.com/netc/20250707_57522_!!1751859388938_276_24.png"
              />
              <view>{{ formmtterServiceMode(waybillInfo.serviceMode) || '' }}</view>
            </view>
            <view class="todo-waybill-auth__info__customer">
              <text>{{ waybillInfo.receiveCustomer || '--' }}</text>
              <text>{{ waybillInfo.receiveName || '--' }}</text>
              <text>{{ waybillInfo.receiveCity || '--' }}</text>
            </view>
          </view>
          <view class="todo-waybill-auth__form">
            <view class="todo-waybill-auth__form__item">
              <text>货好时间：</text>
              <text>{{ formatterDateTime(waybillInfo.goodTime) || '--' }}</text>
            </view>
            <view class="todo-waybill-auth__form__item">
              <text>预估费用：</text>
              <view class="todo-waybill-auth__form__item__cost">
                <!-- <EstimateCost :value="waybillInfo.forecastCost" :custom-request="handleRequestCost"> -->
                <EstimateCost :custom-request="handleRequestCost" @click="reportApprovalCostClick">
                  <template #value="{ value }">
                    {{ value || '0.00' }}元
                    <ky-lazy-image
                      :delay="500"
                      mode="aspectFit"
                      src="https://ic-img.ky-express.com/netc/20250707_22193_!!1751869775094_48_48.png"
                      @tap.stop="
                        Taro.showToast({ title: '预估费用为下单时预估费用，实际金额以详情页为准', icon: 'none' })
                      "
                    />
                  </template>
                </EstimateCost>
              </view>
            </view>
            <view class="todo-waybill-auth__form__item">
              <text>下单人：</text>
              <text>{{
                [waybillInfo.placeOrderName, waybillInfo.placeOrderPhone].filter(Boolean).join('/') || '--'
              }}</text>
            </view>
            <view class="todo-waybill-auth__form__item">
              <text>部门名称：</text>
              <text>{{ waybillInfo.departmentName || '--' }}</text>
            </view>
          </view>
        </view>
        <view class="todo-waybill-auth__footer">
          <ky-button class="mr-16" size="small" @tap.stop="handleReject" plain>拒绝</ky-button>
          <ky-button type="primary" size="small" @tap.stop="handleAgree" plain>同意</ky-button>
        </view>
      </view>

      <load-more @load-more="handleNavigateToList" />
    </view>
    <ky-empty v-else description="暂无数据" />
  </view>
</template>

<script lang="ts" setup>
import Taro from '@tarojs/taro'
import { computed } from 'vue'
import { useHomeStore } from '../../../store'
import { copyText } from '@/public/utils/copy'
import { useUserInfo } from '@/public/hooks'
import { navigateWithParams } from '../../../hooks'
import { formatterDateTime, formmtterServiceMode } from '../formatter'

import EstimateCost from '../../estimate-cost/index.vue'
import LoadMore from '../load-more.vue'

import * as Apis from '../../../apis'
import './waybill-auth.scss'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import {
  reportApproavalClick,
  reportApproavalDetailClick,
  reportApprovalClickMore,
  reportApprovalCostClick,
} from '../../../report'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import { useCommonDataHook } from '@public/storage/hooks/useCommonHook'

useExposureReport(['waybill-auth-ex'])

const store = useHomeStore()

const waybillInfo = computed(() => {
  return store.data.todoList.waybillApproval?.itemDetail
})

const { userInfo } = useUserInfo()
const { customerCode } = useCommonDataHook()
const handleRequestCost = async () => {
  const { data } = await Apis.getWaybillDraftBatchEstimateCost({
    type: 20,
    customerCode: customerCode?.value!,
    mobile: userInfo.value.phone,
    waybillNumbers: [waybillInfo.value?.waybillNumber!],
  })

  return data?.[0].amountAfterDiscount || '0.00'
}

const reportClick = () => {
  reportApproavalDetailClick('查看详情')
  navigateWithParams(
    ApplicationCodeMap['首页-权限审批'],
    { waybillNumber: waybillInfo.value?.waybillNumber, operateType: 1 },
    '#/waybill-approval-detail',
  )
}

const handleNavigateToDetail = () => {
  reportApproavalDetailClick('卡片')
  navigateWithParams(
    ApplicationCodeMap['首页-权限审批'],
    { waybillNumber: waybillInfo.value?.waybillNumber },
    '#/waybill-approval-detail',
  )
}

const handleNavigateToList = () => {
  reportApprovalClickMore()
  navigateWithParams(ApplicationCodeMap['首页-权限审批'], {
    tab: 30,
  })
}

const handleAgree = () => {
  // navigateWithParams(ApplicationCodeMap['首页-权限审批'], {
  //   tab: 30,
  //   id: waybillInfo.value?.id,
  //   operateType: 1,
  // })
  reportApproavalClick('同意')
  navigateWithParams(
    ApplicationCodeMap['首页-权限审批'],
    { waybillNumber: waybillInfo.value?.waybillNumber, operateType: 1 },
    '#/waybill-approval-detail',
  )
}

const handleReject = () => {
  // navigateWithParams(ApplicationCodeMap['首页-权限审批'], {
  //   tab: 30,
  //   id: waybillInfo.value?.id,
  //   operateType: 2,
  // })
  reportApproavalClick('拒绝')
  navigateWithParams(
    ApplicationCodeMap['首页-权限审批'],
    { waybillNumber: waybillInfo.value?.waybillNumber, operateType: 2 },
    '#/waybill-approval-detail',
  )
}
</script>
