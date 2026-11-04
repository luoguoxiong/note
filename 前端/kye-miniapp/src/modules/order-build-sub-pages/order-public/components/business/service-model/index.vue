<template>
  <div
    class="service-map row-item need-short-bottom-line"
    :class="{ disabled: moduleDisabled }"
    v-exposure-report="{
      eventCode: 'exp_express_single_severice_v1',
      regionCode: 'send_info',
    }"
  >
    <HotZone :moduleType="ModuleType['服务方式']"></HotZone>
    <KyCell
      id="serviceMode_serviceMode"
      data-validate="serviceMode.serviceMode"
      title="服务方式"
      placeholder="请选择"
      :no-bg-disabled="moduleDisabled"
      required
      @click="switchServicePopup(true)"
      class="service-mode-cell"
      v-click-report="{
        eventCode: 'clk_express_service_v1',
      }"
    >
      <template #value v-if="serviceTypeName">
        <div class="time-tips">
          <div class="time-tips-font-600">{{ serviceTypeName }}</div>
        </div>
      </template>
      <template #extra v-if="serviceTypeName">
        <div class="service-mode-tips">
          <div v-if="isShowTimeTips && timeTips" class="tip-flex" v-html="timeTips"></div>
        </div>
      </template>
    </KyCell>
    <ServicePopup
      v-if="asynrender"
      :show="showServicePopup"
      @onClose="switchServicePopup(false)"
      @selectService="selectService"
    ></ServicePopup>
  </div>
</template>

<script setup lang="ts">
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import HotZone from '@order-public-sub-public/components/business/hot-zone/index.vue'
import ServicePopup from './components/service-popup/index.vue'
import { computed, ref, onMounted, watch, onActivated } from 'vue'
import { ServiceModeType, ServiceModeConfig } from '@order-public-sub-public/types'
import { Channel, ModuleType, OrderPageType, YesOrNoString } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
import { service } from '@order-public-sub-public/components/business/service-model/components/service-list/type'
import useServiceMode from '@order-public-sub-public/components/business/service-model/hooks/useServiceMode'
import { useModuleHotZone } from './hooks/useModuleHotZone'
import useEmit from '@order-public-sub-public/components/business/service-model/hooks/useEmit'
import { isEqual, debounce } from 'lodash-es'
import { effectBubble } from '@order-public-sub-public/validate/effect/effectBubble'
import useValidate from '@order-public-sub-public/components/business/service-model/hooks/useValidate'
import { currentElementsChange } from '@order-public-sub-root-pages/order-batch/hooks/useBatchSingleProcess'
import { getChannel } from '@order-public-sub-public/configs'
import { reportServicePerception } from '@order-public-sub-public/components/business/service-model/report'
import { asynrender } from '@order-public-sub-public/hooks/asynrender'
const piniaStore = useStore()
const { validateField } = useValidate()
const channel = getChannel()
// const props = defineProps<ServiceModeConfig>()
const props = defineProps<{ disabled?: boolean }>()

const showServicePopup = ref(false)
const { updateServiceMode } = useServiceMode()

import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
const { removeValidateKey } = globalUseValidate()
useModuleHotZone()
const initSuccess = ref(false)

onMounted(() => {
  initService()

  // TODO - 暂时注释掉,这里会清空服务方式,导致下次自动调用process服务方式为空
  // serviceListUpdate()
})

//获取服务方式数据
const serviceMode = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['服务方式']) || {}
})
//获取服务方式列表
const serviceTypes = computed<service[]>(() => {
  const { serviceTypes = [] } = serviceMode.value
  return serviceTypes || []
})

/**
 * 显示提示与条件：服务方式列表仅有一个可用
 */
const isShowTimeTips = computed(() => {
  const serviceList = serviceTypes.value?.filter((i) => i.restrictFlag === YesOrNoString.NO)
  return serviceList?.length === 1
})

//当前服务方式
const currentService = computed(() => {
  const { serviceMode } = piniaStore.order.moduleFormData(ModuleType['服务方式']) || {}
  const service = serviceTypes.value.find((i) => i.serviceTypeCode === serviceMode)
  if (!service) {
    return {
      serviceTypeCode: '',
      restrictFlag: '',
      serviceTypeName: '',
      descriptionH5Text: '',
    }
  }
  return service
})

const timeTips = computed(() => {
  const originTips = currentService.value?.descriptionH5Text || ''
  return originTips
    .replace(/<br.+\/>/, '')
    .replace('font-size: 4vw;', '')
    .replace(/span/g, 'text')
})

//初始化默认的服务方式
const initService = () => {
  const { defaultValue = '' } = piniaStore.schema.moduleConfigData(ModuleType['服务方式'])
  console.log('默认的服务方式', defaultValue)
  if (defaultValue) {
    updateServiceMode(defaultValue)
  }
  initSuccess.value = true
}

//服务方式列表变动
const serviceListUpdate = async () => {
  if (!initSuccess.value) {
    return
  }
  const serviceList = serviceTypes.value
  const serviceValue = currentService.value
  let currentServiceValue = ''
  if (serviceValue) {
    currentServiceValue = serviceValue.serviceTypeCode
  }
  //有效的服务方式
  const hasValid = serviceList.find((i) => i.serviceTypeCode === serviceValue.serviceTypeCode)
  if (!hasValid) {
    currentServiceValue = ''
  }
  const validList = serviceTypes.value.filter((i) => i.restrictFlag === '20')
  const onlyValid = validList.length === 1
  const orderPageType = piniaStore.root.getOrderPageType
  const isElementsChangeWaybill =
    orderPageType === OrderPageType.批量寄单票 && currentElementsChange.value.includes('waybill')
  // 批量寄单票场景，如果点下单校验改变了服务方式列表，不要触发仅有一条赋值
  if (onlyValid && !isElementsChangeWaybill) {
    currentServiceValue = validList[0].serviceTypeCode
  }
  if (!currentServiceValue || currentServiceValue !== serviceValue.serviceTypeCode) {
    updateServiceMode(currentServiceValue)
  }
  if (currentServiceValue) {
    const isServiceModeValid = await validateField('serviceMode')
    effectBubble([isServiceModeValid])
  }
}

//更新服务方式节流
const serviceListUpdateHandle = debounce(() => {
  serviceListUpdate()
}, 300)
//更新store的服务方式
const selectService = (value: string, estimateArriveTime: { arriveTime: string; prescriptionSource: string }) => {
  const { emitServiceModel } = useEmit()
  const { serviceModeChange } = useServiceMode()
  serviceModeChange(value, estimateArriveTime)
  emitServiceModel(value)
  switchServicePopup(false)
}

const dynamicConfig = computed(() => {
  return piniaStore.globalData.dynamicConfig('serviceMode')
})

const moduleDisabled = computed(() => {
  if ([Channel.运单审核, Channel.调价审核].includes(channel)) {
    if (dynamicConfig.value) {
      return dynamicConfig.value.disabled
    } else {
      return props.disabled
    }
  } else {
    return false
  }
})

// 禁用逻辑,当面板打开时,返回了禁用,导致面板无法关闭,临时方案,禁用了关闭面板
watch(
  () => moduleDisabled.value,
  () => {
    if (moduleDisabled.value) {
      switchServicePopup(false)
    }
  },
)

//服务方式外显值
const serviceTypeName = computed(() => {
  const serviceSelect = currentService.value
  return serviceSelect.serviceTypeName || ''
})

//切换服务方式面板
const switchServicePopup = (flag: boolean) => {
  showServicePopup.value = flag
  if (flag) {
    reportServicePerception()
  }
}

//监听服务方式只有一个可选的时候，自动选择
watch(
  serviceTypes,
  (newVal, oldVal) => {
    if (!isEqual(newVal, oldVal)) {
      serviceListUpdateHandle()
    }
  },
  {
    deep: true,
  },
)

onActivated(() => {
  if (currentService.value.serviceTypeCode) {
    removeValidateKey('serviceMode')
  }
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
