<template>
  <div v-if="visible" class="row-item" :class="{ disabled: disabled }" :visible="visible">
    <KyCell
      v-if="visible"
      data-validate="dispatchInformation.deliveryData"
      id="dispatchInformation_deliveryData"
      :title="title"
      :no-bg-disabled="disabled"
      :placeholder="placeholder"
      :large-value="true"
      :value="dispatchName"
      @click="openDispatch"
      :visible="visible"
      :required="deliveryRequired"
      :exposure-report="{
        eventCode: 'exp_express_Delivery_v1',
        otherParams: { button_name: '派货资料' },
      }"
      class="dispatch_information"
    >
      <template #extra>
        <div class="cell_tip" v-if="dispatchInformationDimension.blockTips">
          {{ dispatchInformationDimension.blockTips }}
          <KyReport
            eventCode="exp_express_dispatch_desc_v1"
            :otherParams="{ content: dispatchInformationDimension.blockTips }"
          ></KyReport>
        </div>
        <div class="cell_tip cell_tip_right" v-if="deliveryDataCheckResult" v-html="deliveryDataCheckResult"></div>
      </template>
    </KyCell>
  </div>
</template>

<script lang="ts" setup>
import { useOrderExposureReport } from '@order-public-sub-public/report/exposureReport'

import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { dispatchProps } from '@order-public-sub-public/components/business/dispatch-information/types/types'
import {
  DispatchInformation,
  DispatchInformationConfig,
  DispatchInformationDimension,
  AddedService,
} from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import { useCheckResultTips } from '@order-public-sub-public/components/business/added-service/hooks/useCheckResultTips'
import { clk_express_Delivery_v1 } from './report'
import KyReport from '@order-public-sub-public/components/base/ky-report/index.vue'
const piniaStore = useStore()
const router = useRouter()
const { deliveryDataCheckResult, clearDeliveryDataCheckResult } = useCheckResultTips()

withDefaults(defineProps<dispatchProps>(), {
  placeholder: '添加派货信息、派货资料',
  title: '派货信息',
})
useOrderExposureReport(['dispatchInformation_deliveryData'])

const addServiceInfo = computed(() => {
  return piniaStore.order.moduleFormData<AddedService>(ModuleType['增值服务']) || {}
})

//外显值
const dispatchName = computed(() => {
  const { uploadNum } = dispatchInformationDimension.value
  const data = piniaStore.order.moduleFormData(ModuleType['派货资料']) || {}
  const num = data?.uploadNum || uploadNum
  let valueList: (undefined | string)[] = []
  if (num) {
    valueList.push(`已上传${num}份文件`)
  }
  const { appointNumber, purchaseNumber, appointWareHouse } = data
  valueList = valueList.concat([appointNumber, purchaseNumber, appointWareHouse]).filter((i) => i)
  // 从增值服务中获取是否填写了预约时间
  const notification = addServiceInfo.value?.notification?.notification || {}
  const goodsControl = addServiceInfo.value?.goodsControl || ''
  if (goodsControl === '50' && notification?.timeType && (notification?.startTime || notification?.endTime)) {
    valueList.push('已指定预约时间')
  }
  if (valueList.length === 0) {
    return ''
  }
  return valueList.join('/')
})
//过程中组件数据
const dispatchInformationDimension = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['派货资料']) || {}
})
//跳转派货资料
const openDispatch = () => {
  clk_express_Delivery_v1()
  clearDeliveryDataCheckResult()
  router.push({
    path: '/dispatch-information',
  })
}

const deliveryRequired = computed(() => {
  return piniaStore.schema.moduleConfigData(ModuleType['派货资料'])?.fieldsConfig?.[0]?.required
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
