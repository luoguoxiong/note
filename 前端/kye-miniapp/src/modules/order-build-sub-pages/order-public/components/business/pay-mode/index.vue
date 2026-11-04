<template>
  <div class="pay-mode" v-if="visible" :visible="visible">
    <div class="edit-return-waybill" v-if="disableItem.key" @click="handleMask"></div>
    <HotZone :moduleType="ModuleType['付款方式']"></HotZone>
    <div class="pay-mode-content">
      <KyCell
        id="payMode_payMode"
        data-validate="payMode.payMode"
        :required="true && orderPageType !== OrderPageType.批量寄"
        title="付款方式"
        :value="payMode"
        isLink
        :no-bg-disabled="moduleDisabled || !!disableItem.key"
        label=""
        @click="clickHandel"
        placeholder="请选择"
      >
      </KyCell>
    </div>
    <BottomPopup
      v-model:visible="popVisible"
      :moduleList="payMendList"
      :unifiedInfoSwitcher="unifiedInfoSwitcher"
      v-if="asynrender"
    />
  </div>
</template>

<script setup lang="ts">
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import BottomPopup from './popup/popup-bottom/index.vue'
import HotZone from '@order-public-sub-public/components/business/hot-zone/index.vue'
import { ref, watchEffect, computed } from 'vue'
import { PayModeDimension, PayModeType } from '@order-public-sub-public/types'
import { PayModeObj } from './type'
import { Channel, ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { useModuleHotZone } from './hooks/useModuleHotZone'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { asynrender } from '@order-public-sub-public/hooks/asynrender'
import { usePopVisible } from './hooks/useState'
import { cloneDeep } from 'lodash-es'
import { getChannel } from '@order-public-sub-public/configs'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
interface Props {
  /**批量寄-是否开启了寄件信息统一 */
  unifiedInfoSwitcher?: boolean
  disabled?: boolean
}
const channel = getChannel()
const props = defineProps<Props>()

const visible = ref(true)
const { popVisible, setPopVisible } = usePopVisible()

const dynamicConfig = computed(() => {
  return piniaStore.globalData.dynamicConfig('payMode')
})

// 模块禁用逻辑(审核详情页)
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

const payMendList = computed(() => {
  const payMethodList = piniaStore.schema.moduleDimensionData(ModuleType['付款方式'])?.payMethodList

  let filterList = cloneDeep(payMethodList)
  if (props.unifiedInfoSwitcher) {
    // 开启寄件信息统一，只保留寄方付选项
    filterList = filterList?.filter((item) => item.name === 'senderPay')
  }
  return filterList || []
})

const disableItem = computed(() => {
  const disableItem = piniaStore.globalData.returnEditDisableInfo('payModeExtraInfo', 'payMode') || {}
  return disableItem
})

// 这里处理的原因是配置曾不返回显隐，当所有方式都不可选时，隐藏当前模块
const setVisiable = () => {
  if (!payMendList.value?.length) {
    visible.value = true
  } else {
    visible.value = payMendList.value.filter((item) => item.visible === true).length > 0
  }
}

const payMode = ref('')

const clickHandel = () => {
  // popVisible.value = true
  // #444525 禁用时无法修改并提示
  // if (disableItem.value?.key) {
  //   handleMask()
  //   return
  // }
  setPopVisible(true)
}

useModuleHotZone()

watchEffect(() => {
  setVisiable()
})

watchEffect(() => {
  // 外显名称转译
  const payModeData = piniaStore.order.moduleFormData(ModuleType.付款方式)
  if (payModeData?.payMode) {
    payMode.value = PayModeObj[payModeData.payMode]
  } else {
    payMode.value = ''
  }
})

const handleMask = () => {
  showToast(disableItem.value?.tips || '不可修改')
}

const orderPageType = piniaStore.root.getOrderPageType
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
