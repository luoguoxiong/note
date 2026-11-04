<template>
  <div class="pickup-mode-content" @click="toastDisabledTips">
    <HotZone :moduleType="ModuleType['寄件方式']"></HotZone>
    <KyCell
      id="pickupMode_pickupMode"
      data-validate="pickupMode.pickupMode"
      :value="pickupMode"
      label=""
      :title="title"
      :required="required"
      :no-bg-disabled="disabled || !!disabledTips"
      @click="clickHandel"
      v-click-report="{
        eventCode: 'clk_express_pay_v1',
      }"
      placeholder="请选择"
    >
      <template #extra v-if="showSelfDeliveryInfo || showWarningText">
        <Tips />
      </template>
    </KyCell>
    <BottomPopup @onClose="closePopup" :showFooter="false" v-model:show="popupVisible" :title="title" v-if="asynrender">
      <Pickupmodelist @onClickField="onSelectField" />
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import HotZone from '@order-public-sub-public/components/business/hot-zone/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import Pickupmodelist from '@order-public-sub-public/components/business/pickup-mode/components/pickup-mode-list/index.vue'
import Tips from '@order-public-sub-public/components/business/pickup-mode/components/tips/index.vue'
import { ModuleType } from '@order-public-sub-public/constants'

import { PickupMode, pickupModeItem, PickupType } from '@order-public-sub-public/types'
import { computed, ref } from 'vue'
import {
  title,
  required,
  pickupMpdeLabelMap,
} from '@order-public-sub-public/components/business/pickup-mode/hooks/state'
import { updateOrder } from '../hooks/useUpdate'
import useEffect from '@order-public-sub-public/validate'
import { useModuleHotZone } from '../hooks/useModuleHotZone'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { asynrender } from '@order-public-sub-public/hooks/asynrender'
import { warningText } from '@order-public-sub-public/components/business/pickup-mode/hooks/state'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
defineProps<{
  disabled?: boolean
}>()
const { remoteCheck } = useEffect()

useModuleHotZone()

/**
 * 优先级:
 *  1. selfDeliveryInfo 修改运单-服务点自寄信息
 *  2. warningText 自寄提示
 */
const showWarningText = computed(() => {
  return warningText.value && !orderFormData.value?.selfDeliveryInfo?.dispatchCustomerDeliveryAddr
})

const showSelfDeliveryInfo = computed(() => {
  return (
    orderFormData.value?.pickupMode === PickupType.服务点自寄 &&
    orderFormData.value.selfDeliveryInfo?.dispatchCustomerDeliveryAddr
  )
})

const orderFormData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['寄件方式'])
})

const dynamicConfigInfo = computed(() => {
  return piniaStore.globalData.dynamicConfig('pickupModeExtraInfo')
})

const disabledTips = computed(() => {
  const disabledInfo = dynamicConfigInfo.value?.disabledInfos?.find((item) => item.key === 'pickupMode')
  return disabledInfo?.tips
})
const popupVisible = ref(false)

// 取/存
const pickupMode = computed({
  get: () => {
    const type = orderFormData.value?.pickupMode
    if (!type) return ''
    return pickupMpdeLabelMap[type] || ''
  },
  set: (val) => {
    updateOrder({ data: { ...orderFormData.value, pickupMode: val as PickupType } })
  },
})

const clickHandel = () => {
  popupVisible.value = true
}

const toastDisabledTips = () => {
  if (disabledTips.value) {
    showToast(disabledTips.value)
  }
}

const onSelectField = (item: pickupModeItem) => {
  if (item.name !== pickupMode.value) {
    pickupMode.value = item.type
    remoteCheck('pickupMode')
  }
  closePopup()
}

const closePopup = () => {
  popupVisible.value = false
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
