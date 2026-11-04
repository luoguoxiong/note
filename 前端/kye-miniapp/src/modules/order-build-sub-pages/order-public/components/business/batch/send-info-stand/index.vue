<template>
  <div v-if="visible" class="send-info-stand" type="SendeInfoStand" :visible="visible">
    <div
      class="send-info-stand-head flex items-center font-level3 space-between"
      :class="unifiedInfoSwitcher ? 'bottom-line' : ''"
      v-hotZone="{
        moduleType: ModuleType['本次寄件信息统一'],
        visible: hotZoneVisible,
        validateCallback: validateCallback,
      }"
    >
      <span>本次寄件信息统一</span>
      <KySwitch size="15px" v-model="unifiedInfoSwitcher" active-color="#8365F6" @change="handleSwitchChange" />
    </div>
    <div v-if="unifiedInfoSwitcher">
      <div class="send-info-stand-body">
        <PayMode v-bind="payModeModuleData" :unifiedInfoSwitcher="unifiedInfoSwitcher"></PayMode>
      </div>
      <div class="send-info-stand-body">
        <ProductInfoComponents v-bind="productInfoModuleData"></ProductInfoComponents>
      </div>
      <div class="send-info-stand-body">
        <AddedServiceComponents v-bind="addedServiceModuleData"></AddedServiceComponents>
      </div>
      <div class="send-info-stand-body">
        <WaybillRemarkComponents v-bind="waybillRemarkModuleData"></WaybillRemarkComponents>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import PayMode from '../../pay-mode/index.vue'
import ProductInfoComponents from '../../product-info/index.vue'
import AddedServiceComponents from '../../added-service/index.vue'
import WaybillRemarkComponents from '../../waybill-remark/index.vue'
import KySwitch from '@order-public-sub-public/components/base/ky-switch/index.vue'
import { ModuleStyle, ModuleType } from '@order-public-sub-public/constants'
import {
  PickModule,
  PayModeConfig,
  ProductInfoConfig,
  AddedServiceConfig,
  WaybillRemarkConfig,
  ProductInfo,
  PayModeType,
  AddedService,
  WaybillRemark,
} from '@order-public-sub-public/types'
import { useUnifiedInfoSwitcher } from './hooks/useState'
import { useHotZone } from '@order-public-sub-public/hooks/useHotZone'
import { closeUnifiedInfoSwitcher } from '@order-public-sub-public/apis/batch/index'
import { waybillInfo } from '@order-public-sub-public/configs/initData'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { cloneDeep, isEqual } from 'lodash-es'
import { ModuleFormType } from '@order-public-sub-public/store/types'
import { copyModuleData } from './hooks/state'
import { copyModuleDataType } from './type'
import useEffect from '@order-public-sub-public/validate'
import { clearAllErrClass } from '@order-public-sub-public/validate/effect/effectBubble'

const { validateCallback, hotZoneVisible } = useHotZone(ModuleType['本次寄件信息统一'])
const { remoteCheck } = useEffect()

// 本次寄件信息统一显示走配置
const visible = computed(() => piniaStore.globalData.dynamicConfig('unifiedInfoSwitcher', null)?.visible || false)

const { unifiedInfoSwitcher, setUnifiedInfoSwitcher } = useUnifiedInfoSwitcher()

const payModeModuleData = piniaStore.schema.moduleConfigData(ModuleType['付款方式'], true) as PickModule<PayModeConfig>

// 固定为popup
const productInfoModuleData = computed(() => {
  const config = piniaStore.schema.moduleConfigData(ModuleType['货物信息'], true) as PickModule<ProductInfoConfig>

  return { ...config }
})
// 固定为popup
const addedServiceModuleData = computed(() => {
  const config = piniaStore.schema.moduleConfigData(ModuleType['增值服务'], true) as PickModule<AddedServiceConfig>

  let fieldsConfig = config?.config?.fieldsConfig?.filter((config) => config.name !== 'dispatchNotice')

  config.moduleStyle = ModuleStyle.弹窗

  if (!fieldsConfig) {
    return { ...config }
  } else {
    return {
      ...config,
      config: {
        ...config.config,
        fieldsConfig,
      },
    }
  }
})

const waybillRemarkModuleData = piniaStore.schema.moduleConfigData(
  ModuleType['运单备注'],
  true,
) as PickModule<WaybillRemarkConfig>

const handleSwitchChange = async (value: boolean) => {
  if (!value) {
    if (isModuleSame()) return await setUnifiedInfoSwitcher(value)
    showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      message: () =>
        h('div', [
          '关闭后将',
          h('span', { style: { color: '#ff706d' } }, '清空所有'),
          '收件人的寄件信息，确定要关闭吗？',
        ]),
      cancelButtonText: '取消',
      confirmButtonText: '确定',
      showCancelButton: true,
      allowHtml: false,
    })
      .then(async () => {
        setUnifiedInfoSwitcher(value)
        try {
          await closeUnifiedInfoSwitcher()
          const resetPayMode = waybillInfo.payMode as PayModeType
          const resetProductInfo = waybillInfo.productInfo as ProductInfo
          const resetAddedService = waybillInfo.addedService as AddedService
          const resetWaybillRemark = waybillInfo.waybillRemark as WaybillRemark
          piniaStore.order.updateOrderByType({ type: ModuleType['付款方式'], data: resetPayMode })
          piniaStore.order.updateOrderByType({ type: ModuleType['货物信息'], data: resetProductInfo })
          piniaStore.order.updateOrderByType({ type: ModuleType['增值服务'], data: resetAddedService })
          piniaStore.order.updateOrderByType({ type: ModuleType['运单备注'], data: resetWaybillRemark })
          await remoteCheck('unifiedInfoSwitcher')
        } catch (error) {
          console.error(error)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  } else {
    clearAllErrClass()
    setUnifiedInfoSwitcher(value)

    // 备份初始数据用于后面对比
    if (!Object.keys(copyModuleData.value).length) {
      copyModuleData.value = {
        [ModuleType['付款方式']]: cloneDeep(piniaStore.order.moduleFormData(ModuleType['付款方式'])),
        [ModuleType['货物信息']]: cloneDeep(piniaStore.order.moduleFormData(ModuleType['货物信息'])),
        [ModuleType['增值服务']]: cloneDeep(piniaStore.order.moduleFormData(ModuleType['增值服务'])),
        [ModuleType['运单备注']]: cloneDeep(piniaStore.order.moduleFormData(ModuleType['运单备注'])),
      }
    }
  }
}

// 更改数据对比
const isModuleSame = () => {
  let result = true
  for (const key in copyModuleData.value) {
    const currenKeyModuleData = piniaStore.order.moduleFormData(key as Capitalize<ModuleFormType>)
    if (!isEqual(currenKeyModuleData, copyModuleData.value[key as keyof copyModuleDataType])) {
      result = false
      break
    }
  }
  return result
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
