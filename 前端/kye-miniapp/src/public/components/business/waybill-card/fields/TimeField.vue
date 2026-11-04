<template>
  <view v-if="show" class="waybill-card-extra-info">
    <view class="waybill-card-extra-info-label">{{ timeInfo.name }}</view>
    <view class="waybill-card-extra-info-content" @click.stop>
      <text class="black-color" :class="{ mr4: showModifyGoodsTime, mr8: !showModifyGoodsTime }">{{ timeInfo.time }}</text>
      <text
        class="w-time-edit mr8"
        v-if="showModifyGoodsTime"
        @tap="handleModifyGoodsTime"
      >
        修改
      </text>
      <ky-tag
        class="waybill-card__tag"
        v-if="showGoodsTimeChange"
        size="3"
        bgColor="#F0FFF7"
        borderColor="#7DE3B7"
        textColor="#00C58C"
        >已改货好时间</ky-tag
      >
      <TimeTagsField v-if="showTags" :waybillData="waybillData" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Taro from '@tarojs/taro'
import { formatTime, report_CLK_event } from '@/public/utils'
import TimeTagsField from './TimeTagsField.vue'
import { isFieldVisible } from './visibility'
import type { FieldProps } from './types'

interface Props extends FieldProps {}

const props = defineProps<Props>()

const baseInfo = computed(() => props.waybillData?.waybill?.baseInfo)
const functionInfo = computed(() => props.waybillData?.functionInfo)

/** 是否显示（根据 code 和状态判断） */
const show = computed(() => isFieldVisible(props.code, props.waybillData, props.activeStatusTab))

/** 时间信息（根据 code 决定显示什么时间） */
const timeInfo = computed(() => {
  switch (props.code) {
    case 'goodsTime':
      return {
        name: '货好时间：',
        time: formatTime(baseInfo.value?.goodsTime),
      }
    case 'deliveryTime':
      return {
        name: '寄件时间：',
        time: formatTime(baseInfo.value?.deliveryTime),
      }
    case 'receiveTime':
      return {
        name: '签收时间：',
        time: formatTime(baseInfo.value?.receiveTime),
      }
    case 'creationDate':
      return {
        name: '创建时间：',
        time: formatTime(baseInfo.value?.creationDate),
      }
    default:
      return {
        name: props.name,
        time: '--',
      }
  }
})
/** 是否显示已改货好时间标签 */
const showGoodsTimeChange = computed(() => {
  const showTags = ['goodsTime', 'deliveryTime', 'receiveTime']
  return !!functionInfo.value?.goodsTimeChangeFlag?.showStatus && showTags.includes(props.code)
})
/** 是否显示修改货好时间按钮（只有 goodsTime 字段显示） */
const showModifyGoodsTime = computed(() => {
  return props.code === 'goodsTime' && functionInfo.value?.canModifyGoodsTime?.showStatus
})

/** 处理修改货好时间 */
const handleModifyGoodsTime = () => {
  const info = baseInfo.value
  if (!info?.waybillNumber) return

  const query: Record<string, string | number | undefined> = {
    type: 'edit',
    waybillNo: info.waybillNumber,
    orderNo: info.orderNumber,
    sourcePage: 'waybillSearch',
    sourceAction: 'editGoodTime',
    channel: 60,
    configId: info.configId,
    configVersion: info.configVersion,
    openGoodsTime: '1',
    onlyModule: 'goodsTime,serviceMode',
  }
  const queryString = Object.keys(query)
    .map((key) => `${key}=${query[key] === undefined ? null : query[key]}`)
    .join('&')

  report_CLK_event('clk_order_search_card_change_button_v1')
  Taro.navigateTo({
    url: `/modules/order-build/pages/order/index?${queryString}`,
  })
}
</script>
