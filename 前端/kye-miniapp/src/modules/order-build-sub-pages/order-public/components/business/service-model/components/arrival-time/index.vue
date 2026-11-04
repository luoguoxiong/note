<template>
  <div class="arrival-container" v-if="showArrivalTime && arrivalTime">
    <div class="arrival-main">
      <div class="arrival-time flex flex-items-center" @click.stop>
        <SvgIcon name="time" class="time-tip" />
        <div v-html="arrivalTime" class="content-h5"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { computed, ref, onMounted } from 'vue'
import { ServiceModeType, ServiceModeConfig } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { service } from '@order-public-sub-public/components/business/service-model/components/service-list/type'
import { useStore } from '@order-public-sub-public/store'
import useServiceMode from '@order-public-sub-public/components/business/service-model/hooks/useServiceMode'
const piniaStore = useStore()

const showArrivalTime = ref(false)

onMounted(() => {
  initArrivalTime()
})

//初始化预计送达时间
const initArrivalTime = async () => {
  const initPromise = piniaStore.globalData.initDataPromise
  try {
    await initPromise
  } catch (error) {
    console.log('initPromise error', error)
  }
  const { arrivalTimeVisible, defaultValue = '' } = piniaStore.schema.moduleConfigData(ModuleType['服务方式'])
  const { updateServiceMode } = useServiceMode()
  if (defaultValue) {
    updateServiceMode(defaultValue)
  }
  showArrivalTime.value = arrivalTimeVisible
}

//获取服务方式数据
const serviceMode = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['服务方式']) || {}
})
//获取服务方式列表
const serviceTypes = computed<service[]>(() => {
  const { serviceTypes = [] } = serviceMode.value
  return serviceTypes || []
})
//预计送达时间文本
const arrivalTime = computed(() => {
  const { serviceMode } = piniaStore.order.moduleFormData(ModuleType['服务方式']) || {}
  let descriptionH5Text = ''
  const serviceSelect = serviceTypes.value.find((i) => i.serviceTypeCode === serviceMode)
  if (serviceSelect) {
    descriptionH5Text = serviceSelect.descriptionH5Text
  }
  return descriptionH5Text
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
