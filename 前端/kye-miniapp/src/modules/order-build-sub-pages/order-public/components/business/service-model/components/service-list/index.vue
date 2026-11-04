<template>
  <view class="service-list">
    <Skeleton v-if="loading" />
    <view
      v-else
      class="service-item"
      :class="{
        active: activeIndex === index,
        valid_item: item.restrictFlag !== YesOrNoString.YES,
        disabled: item.restrictFlag === YesOrNoString.YES,
      }"
      v-for="(item, index) in serviceList"
      :key="item.serviceTypeCode"
      @click="selectService(index)"
      v-click-report="{
        eventCode: 'clk_express_service_content_v1',
        otherParams: () => {
          return {
            button_name: item.serviceTypeName,
          }
        },
      }"
      v-exposure-report="{
        eventCode: 'exp_express_service_list_v1',
        otherParams: () => ({
          service_name: item.serviceTypeName,
          service_desc: item.descriptionH5Text,
          service_cost: item.estimateFee,
          service_status: item.restrictFlag,
        }),
      }"
    >
      <view class="invalid" v-if="item.restrictFlag === YesOrNoString.YES">
        <view class="title">{{ item.serviceTypeName }}</view>
        <view class="intro flex">
          <view class="msg" v-if="item.iconInfo">
            <view class="msg_container" v-html="item.iconInfo.message"></view>
            <view
              v-exposure-report="{
                eventCode: 'exp_express_service_topup_v1',
              }"
              v-click-report="{
                eventCode: 'clk_express_service_topup_v1',
              }"
              class="depositButton"
              v-if="item.storageFlag"
              @click.stop="goDeposit"
            >
              去充值<SvgIcon name="arrow-right-blue-line" />
            </view>

            <view
              v-if="item.canModifyTimeFlag"
              v-exposure-report="{
                eventCode: 'exp_express_service_topup_v1',
              }"
              v-click-report="{
                eventCode: 'clk_express_service_topup_v1',
              }"
              class="depositButton"
              @click.stop="goEditGoodsTime(item.serviceTypeName)"
            >
              修改货好时间<SvgIcon name="arrow-right-blue-line" />
            </view>
          </view>

          <view
            class="button flex-items-center"
            v-if="item.iconInfo.restrictType === YesOrNoString.NO"
            v-exposure-report="{
              eventCode: 'exp_express_service_goodsdesc_v1',
            }"
            v-click-report="{
              eventCode: 'clk_express_service_goodsdesc_v1',
            }"
            @click.stop="openContraband"
          >
            违禁品说明<SvgIcon name="tip-blue" />
          </view>
        </view>
        <view class="invalid-reason flex flex-items-center" v-if="item.iconInfo">
          <SvgIcon class="icon-disabled-class" name="icon-disabled"></SvgIcon>
          {{ item.iconInfo.titleName }}
        </view>
      </view>
      <view class="valid flex" v-else>
        <view class="left" :class="{ row: item.estimateFeeShowFlag !== YesOrNoString.YES }">
          <view class="title">
            {{ item.serviceTypeName }}
            <view class="doubleIntegral" v-if="item.doubleIntegral && !doubleIntegralAllFlag"></view>
          </view>
          <view class="date" v-if="item.descriptionH5Text" v-html="item.descriptionH5Text"></view>
        </view>
        <view class="right" v-if="item.estimateFeeShowFlag === YesOrNoString.YES">
          <view class="estimate">预估运费</view>
          <view class="money" v-if="item.estimateFee">
            <text>￥</text>{{ handleMoneyAmountShow(item.estimateFee) }}<text class="estimate-tip">起</text>
          </view>
          <view class="money" v-else>暂无报价</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import {
  computed,
  // getCurrentInstance
} from 'vue'
import { serviceProps } from '@order-public-sub-public/components/business/service-model/components/service-list/type'
import Skeleton from './../skeleton/index.vue'
import { YesOrNoString } from '@order-public-sub-public/constants'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { getPrepaidFreightUrl, handleMoneyAmountShow } from '@order-public-sub-public/utils'
import { selectServiceReport } from '@order-public-sub-public/components/business/service-model/components/service-popup/report/index'
import { useToast } from '@public/hooks/useToast'
import { openURL } from '@/modules/webview/utils'
const { showToast } = useToast()
const router = useRouter()

const props = withDefaults(defineProps<serviceProps>(), {
  serviceList: () => [],
  loading: false,
})
const emit = defineEmits(['selectService', 'goEditGoodsTime'])

//是否全部命中双倍积分
const doubleIntegralAllFlag = computed(() => {
  return props.serviceList && props.serviceList.length && props.serviceList.every((v) => v.doubleIntegral)
})
//当前选中的index
const activeIndex = computed(() => {
  if (!props.activeServiceCode) {
    return -1
  }
  return props.serviceList.findIndex((i) => {
    if ('serviceTypeCode' in i && i?.serviceTypeCode) {
      return i.serviceTypeCode === props.activeServiceCode && i.restrictFlag !== YesOrNoString.YES
    }
    return false
  })
})
//选择服务方式
const selectService = (index: number) => {
  const service = props.serviceList[index]
  const { restrictFlag, iconInfo } = service
  const invalidService = restrictFlag === YesOrNoString.YES
  if (invalidService) {
    selectServiceReport(service.serviceTypeName, iconInfo.message)
    return showToast({
      title: iconInfo.message,
      icon: 'none',
    })
  }
  emit('selectService', service)
}

//打开违禁品说明
const openContraband = () => {
  router.push({
    path: '/air-contraband',
    query: {
      type: 'consignment',
    },
  })
}

//跳转充值
const goDeposit = () => {
  const url = getPrepaidFreightUrl()
  openURL(url, {
    needLogin: true,
    type: 'redirectTo',
  })
}
// M6038

const goEditGoodsTime = (name: string) => {
  emit('goEditGoodsTime', name)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
