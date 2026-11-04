<template>
  <div class="map-position">
    <LocationNet @onConfirm="onConfirm" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { useRoute, useRouter } from '@order-public-sub-public/vue-router/index'
// 组件
import LocationNet from '@order-public-sub-public/components/business/map-position/components/location-net/index.vue'
// 方法
import { getValueOrEmpty } from '@order-public-sub-public/utils'
// 类型
import { ItemSelect } from '../types'

import { reportPerception } from '@order-public-sub-public/reportUmp/util/index'
import { useStore } from '@order-public-sub-public/store'

import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import Taro from '@tarojs/taro'
const piniaStore = useStore()

defineOptions({
  name: 'map-position',
})

const route = useRoute()
const router = useRouter()
console.log(route.query)
const { from } = route.query || {}

/**
 * 选中的地址
 * @param item
 */
const onConfirm = (item: ItemSelect) => {
  const data = {
    province: getValueOrEmpty(item?.province),
    city: getValueOrEmpty(item?.city),
    county: getValueOrEmpty(item?.county) || getValueOrEmpty(item?.district),
    detailAddress: `${getValueOrEmpty(item?.detailAddress) || getValueOrEmpty(item?.address)}${getValueOrEmpty(
      item?.title,
    )}`,
    isSelectItem: true,
  }
  // 寄件平铺
  if (from === 'senderUnfold') {
    piniaStore.extend.updateSenderMapPosition({ data })
  }

  // 寄件填单页
  if (from === 'senderPage') {
    // other_express_sender_information_control_v1('sender', '定位')
    piniaStore.extend.updateSenderMapPosition({ data })
  }

  // 收件平铺
  if (from === 'receiveUnfold') {
    piniaStore.extend.updateReceiveMapPosition({ data })
  }

  if (from === 'receivePage') {
    // other_express_sender_information_control_v1('receive', '定位')
    piniaStore.extend.updateReceiveMapPosition({ data })
  }

  // 寄方地址簿
  if (from === 'senderAddressBook') {
    piniaStore.extend.updateSenderAddressBookMapPosition({ data })
  }

  // 收方地址簿
  if (from === 'receiveAddressBook') {
    piniaStore.extend.updateReceiveAddressBookMapPosition({ data })
  }

  // 回单原件返单信息
  if (from === 'receipter') {
    piniaStore.extend.updateReceipterMapPosition({ data })
  }

  // freight-time 寄件/收件定位
  if (from === 'freightSenderPage' || from === 'freightReceiverPage') {
    Taro.eventCenter.trigger('freightMapPositionData', data)
  }

  router.back()
}

// 感知埋点
const reportUtils = () => {
  // 寄方地址簿
  if (['senderPage', 'senderAddressBook'].includes(from as string)) {
    umpOtherReport('OTHER', {
      eventCode: 'other_express_sender_position_perception_v1',
    })
  }
}
onMounted(() => {
  reportUtils()
})
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
