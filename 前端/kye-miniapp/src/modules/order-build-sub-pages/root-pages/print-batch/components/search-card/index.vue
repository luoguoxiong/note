<template>
  <div class="search-card">
    <div class="search-card-head">
      <span>运单号</span>
      <span class="no">{{ item.waybillNumber }}</span>
      <SvgIcon name="copy-black" v-copy="item.waybillNumber"></SvgIcon>
    </div>
    <div class="search-card-content">
      <div class="check">
        <slot name="icon"></slot>
      </div>
      <div class="content">
        <div class="content-message">
          <span class="area">{{ formatValue(item.deliveryCity) }}</span>
          <span class="name">{{ formatValue(item.deliveryPerson) }}</span>
          <span class="address">{{ formatValue(item.deliveryCustomerName) }}</span>
        </div>
        <div class="content-status">
          <span class="text">{{ statusObj.desc }}</span>
          <img :src="statusObj.img" alt="" class="transport-icon" />
          <span class="text">{{ item.serviceModeDesc }}</span>
        </div>
        <div class="content-message">
          <span class="area">{{ formatValue(item.pickupCity) }}</span>
          <span class="name">{{ formatValue(item.pickupPerson) }}</span>
          <span class="address">{{ formatValue(item.pickupCustomerName) }}</span>
        </div>
      </div>
    </div>
    <div class="search-card-bottom" v-if="searchTabActiveId !== 10">
      <div class="row">
        <span class="label">{{ item.waybillStatusDesc }}：</span>
        <span class="value">{{ item.routeDescription }}</span>
      </div>
      <div class="row">
        <span class="label">货好时间：</span>
        <span class="value">{{ item.goodsTime && formatTime(item.goodsTime) }}</span>
        <div v-if="item.printNumber" class="tag-info">已打印{{ item.printNumber }}次</div>
      </div>
    </div>
    <div class="search-card-bottom" v-else>
      <div class="row">
        <span class="label">创建时间：</span>
        <span class="value">{{ item.creationDate && formatTime(item.creationDate) }}</span>
        <div v-if="item.printNumber" class="tag-info">已打印{{ item.printNumber }}次</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { ListItem } from '@order-public-sub-root-pages/print-batch/hooks/type'
import dayjs from 'dayjs'
import vCopy from '@order-public-sub-public/directives/copy'

import { computed } from 'vue'

const IconTransportDoing = 'https://ic-img.ky-express.com/netc/20250710_80484_!!1752148858289_207_21.png'
const IconTransportDone = 'https://ic-img.ky-express.com/netc/20250710_16565_!!1752148915690_207_21.png'
const IconTransportError = 'https://ic-img.ky-express.com/netc/20250710_48285_!!1752148927031_207_21.png'
const IconTransportNo = 'https://ic-img.ky-express.com/netc/20250710_4710_!!1752148937515_207_21.png'

interface searchCardProps {
  item: ListItem
  searchTabActiveId?: number
}
const props = defineProps<searchCardProps>()

const formatTime = (goodsTime: string) => {
  return dayjs(Number(goodsTime)).format('YYYY/MM/DD HH:mm')
}

const formatValue = (value: string) => {
  if (value?.length > 5) {
    return value.slice(0, 5) + '...'
  } else {
    return value
  }
}

const statusObj = computed(() => {
  let obj = {
    desc: '',
    img: '',
  }
  const { routeStepDesc, routeStep } = props.item?.newExteriorRouteInfo || {}
  const { waybillStatusDesc, applyStatus } = props.item || {}
  obj.desc = routeStepDesc || waybillStatusDesc
  switch (routeStep) {
    case 0:
    case 10:
    case 20:
    case 30:
    case 90:
      obj.img = IconTransportNo
      break
    case 70:
      obj.desc = '派送异常'
      obj.img = IconTransportError
      break
    case 80:
      obj.desc = waybillStatusDesc
      obj.img = IconTransportDone
      break
    default:
      obj.img = IconTransportDoing
  }
  if (!routeStep) {
    obj.img = IconTransportNo
  }

  if (applyStatus === 10) {
    obj.desc = '变更中'
  }
  return obj
})
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
