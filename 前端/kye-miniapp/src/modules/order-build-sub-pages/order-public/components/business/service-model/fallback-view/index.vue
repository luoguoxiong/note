<template>
  <div class="service-map row-item need-short-bottom-line">
    <KyCell title="服务方式" placeholder="请选择" required class="service-mode-cell">
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
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import { service } from '../components/service-list/type'
import { ModuleType, ServiceModeType, YesOrNoString } from '@order-public-sub-public/constants'

import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
const piniaStore = useStore()

//服务方式外显值
const serviceTypeName = computed(() => {
  const serviceSelect = currentService.value
  return serviceSelect.serviceTypeName || ''
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

const timeTips = computed(() => {
  const originTips = currentService.value?.descriptionH5Text || ''
  return originTips.replace(/<br.+\/>/, '').replace('font-size: 4vw;', '')
})

//获取服务方式数据
const serviceMode = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['服务方式']) || {}
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
</script>
<style lang="scss" scoped>
@import '../index.scss';
</style>
