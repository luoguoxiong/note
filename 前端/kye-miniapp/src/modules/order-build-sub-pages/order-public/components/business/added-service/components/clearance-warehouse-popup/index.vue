<template>
  <div v-if="!isServiceIntroduction">
    <BottomPopup
      :title="title"
      v-model:show="internalState.popupVisible"
      @onClose="handleClose"
      @onConfirm="handleConfirm"
      :loading="loading"
      :showTips="true"
      tipText=""
      tip-icon="desc"
      @onClickTips="onClickTips"
      footerText="确定"
      class="clearance-warehouse-popup"
    >
      <div class="clearance-warehouse-popup-content">
        <div class="popup-content-cell pb-40" v-if="showWarehouseOut">
          <div class="font-level2">{{ subOutTitle }}</div>
          <div class="popup-content-cell-radio py-16 flex items-center font-level2">
            <KyRadio
              type="check"
              v-model="orderWarehouseOut"
              :disabled="props.clearanceWarehouse?.sendCustomerDefaultFlag"
              :radio-props="[{ name: true, text: '同意', disabled: props.clearanceWarehouse?.sendCustomerDefaultFlag }]"
              @click="() => handleWarehouseOutRadio(true)"
            ></KyRadio>
            <KyRadio
              type="check"
              v-model="orderWarehouseOut"
              :disabled="props.clearanceWarehouse?.sendCustomerDefaultFlag"
              :radio-props="[
                { name: false, text: '不同意', disabled: props.clearanceWarehouse?.sendCustomerDefaultFlag },
              ]"
              @click="() => handleWarehouseOutRadio(false)"
            ></KyRadio>
          </div>
          <div class="popup-content-cell-desc flex items-start">
            <div class="icon-tip flex items-start">
              <!--              <SvgIcon name="error-tip" class="font-level2 mr-8"></SvgIcon>-->
            </div>
            <rich-text
              v-if="!isH5FSEnv"
              class="font-level2 tips"
              :nodes="
                orderWarehouseOut
                  ? props.clearanceWarehouse?.sendAgreeRichMsg
                  : props.clearanceWarehouse?.sendDisagreeRichMsg
              "
            ></rich-text>
            <div
              v-else
              class="font-level2 tips"
              v-html="
                orderWarehouseOut
                  ? props.clearanceWarehouse?.sendAgreeRichMsg
                  : props.clearanceWarehouse?.sendDisagreeRichMsg
              "
            ></div>
          </div>
        </div>
        <div class="popup-content-cell pt-40" v-if="showWarehouseIn">
          <div class="font-level2">{{ subInTitle }}</div>
          <div class="popup-content-cell-radio py-16 flex items-center font-level2">
            <KyRadio
              type="check"
              v-model="orderWarehouseIn"
              :disabled="props.clearanceWarehouse?.endCustomerDefaultFlag"
              :radio-props="[{ name: true, text: '同意', disabled: props.clearanceWarehouse?.endCustomerDefaultFlag }]"
              @click="() => handleWarehouseInRadio(true)"
            ></KyRadio>
            <KyRadio
              type="check"
              v-model="orderWarehouseIn"
              :disabled="props.clearanceWarehouse?.endCustomerDefaultFlag"
              :radio-props="[
                { name: false, text: '不同意', disabled: props.clearanceWarehouse?.endCustomerDefaultFlag },
              ]"
              @click="() => handleWarehouseInRadio(false)"
            ></KyRadio>
          </div>
          <div class="popup-content-cell-desc flex items-start">
            <div class="icon_tip flex items-start">
              <!--              <SvgIcon name="error-tip" class="font-level2 mr-8"></SvgIcon>-->
            </div>
            <rich-text
              v-if="!isH5FSEnv"
              class="font-level2 tips"
              :nodes="
                orderWarehouseIn
                  ? props.clearanceWarehouse?.endAgreeRichMsg
                  : props.clearanceWarehouse?.endDisagreeRichMsg
              "
            ></rich-text>
            <div
              v-else
              class="font-level2 tips"
              v-html="
                orderWarehouseIn
                  ? props.clearanceWarehouse?.endAgreeRichMsg
                  : props.clearanceWarehouse?.endDisagreeRichMsg
              "
            ></div>
          </div>
        </div>
      </div>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import KyRadio from '@order-public-sub-public/components/base/ky-radio/index.vue'
// import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { ClearanceWarehouse } from '@order-public-sub-public/types'
import { CheckAfterSubmitType, LimitResult, OrderPageType } from '@order-public-sub-public/constants'
import { updateWarehouse } from '@order-public-sub-public/validate/limit'
import { clearanceExposureReport, clk_express_single_declaration_increment_v1 } from './report/index'
import { useOrderWarehouseIn, useOrderWarehouseOut } from '../../hooks/useOrderWarehouseState'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

import { remoteBatchSingleCheck } from '@order-public-sub-root-pages/order-batch/hooks/useBatchSingleProcess'
import { clearanceWarehouseTypeName } from '@order-public-sub-public/constants/clearanceWarehouse'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { clkClearanceWarehouse, submitClearanceWarehouse } from '@order-public-sub-public/validate/report'
interface InternalState {
  popupVisible: boolean
}
export interface warehouseProps {
  clearanceWarehouse: ClearanceWarehouse
  cancel?: () => void
  submit?: (submit: boolean) => void
}
const props = defineProps<warehouseProps>()
const loading = ref(false)

//
const router = useRouter()

const internalState: InternalState = reactive({
  popupVisible: true,
})

const { orderWarehouseIn, setOrderWarehouseIn } = useOrderWarehouseIn()
const { orderWarehouseOut, setOrderWarehouseOut } = useOrderWarehouseOut()
const warehouseInvalue = ref(false)
const warehouseOutvalue = ref(false)

onMounted(() => {
  if (showWarehouseOut.value && props.clearanceWarehouse?.sendConfirmResult === 10) {
    setOrderWarehouseOut(true)
    warehouseOutvalue.value = true
  }
  if (showWarehouseIn.value && props.clearanceWarehouse?.endConfirmResult === 10) {
    setOrderWarehouseIn(true)
    warehouseInvalue.value = true
  }
  clearanceExposureReport(showWarehouseOut.value, showWarehouseIn.value)
})
//显示出仓
const showWarehouseOut = computed(() => {
  return props.clearanceWarehouse.sendAdjustFlag === '10' && props.clearanceWarehouse?.sendConfirmResult !== 30
})
//显示入仓
const showWarehouseIn = computed(() => {
  return props.clearanceWarehouse.endAdjustFlag === '10' && props.clearanceWarehouse?.endConfirmResult !== 30
})

const subInTitle = computed(() => {
  const name =
    clearanceWarehouseTypeName[props.clearanceWarehouse.endShowType as keyof typeof clearanceWarehouseTypeName] ||
    '入仓'
  return `是否同意${name}服务`
})

const subOutTitle = computed(() => {
  const name =
    clearanceWarehouseTypeName[props.clearanceWarehouse.sendShowType as keyof typeof clearanceWarehouseTypeName] ||
    '出仓'
  return `是否同意${name}服务`
})

const handleWarehouseOutRadio = (value: boolean) => {
  if (props.clearanceWarehouse?.sendCustomerDefaultFlag) return
  setOrderWarehouseOut(value)
  clkClearanceWarehouse(value, '出仓功能', showWarehouseOut.value, showWarehouseIn.value)
}

const handleWarehouseInRadio = (value: boolean) => {
  if (props.clearanceWarehouse?.endCustomerDefaultFlag) return
  setOrderWarehouseIn(value)
  clkClearanceWarehouse(value, '入仓功能', showWarehouseOut.value, showWarehouseIn.value)
}

const handleConfirm = async () => {
  loading.value = true
  const result = []
  if (showWarehouseOut.value) {
    result.push({
      adjustBackType: CheckAfterSubmitType.报关出仓,
      adjustResult: orderWarehouseOut.value ? LimitResult.确认 : LimitResult.拒绝,
      adjustRespId: props.clearanceWarehouse.adjustRespId,
    })
  }
  if (showWarehouseIn.value) {
    result.push({
      adjustBackType: CheckAfterSubmitType.报关入仓,
      adjustResult: orderWarehouseIn.value ? LimitResult.确认 : LimitResult.拒绝,
      adjustRespId: props.clearanceWarehouse.adjustRespId,
    })
  }
  await updateWarehouse(result)
  let allResult = true
  if (showWarehouseOut.value) {
    allResult = orderWarehouseOut.value
  }
  if (showWarehouseIn.value) {
    allResult = orderWarehouseIn.value
  }

  // 批量寄修改单条命中报关出入仓后需要调用过程中刷新管控数据
  const orderPageType = piniaStore.root.getOrderPageType
  if (orderPageType === OrderPageType.批量寄单票) {
    const orderInfo = piniaStore.order.orderState

    //调用过程中接口更新
    // await remoteBatchSingleCheck('waybill.confirm.restrict', orderInfo, undefined, [], {
    //   cacheStrategy: '10',
    // })
    await remoteBatchSingleCheck({
      key: 'waybill.confirm.restrict',
      temporaryData: orderInfo,
      extraParams: { cacheStrategy: '10' },
    })
  }
  clkClearanceWarehouse('确定', '弹窗功能', showWarehouseOut.value, showWarehouseIn.value)
  submitClearanceWarehouse(showWarehouseOut.value, showWarehouseIn.value)
  loading.value = false
  props.submit?.(allResult)
}
const handleClose = () => {
  internalState.popupVisible = false
  orderWarehouseOut.value = warehouseOutvalue.value
  orderWarehouseIn.value = warehouseInvalue.value

  const result = []
  if (showWarehouseOut.value) {
    result.push({
      adjustBackType: CheckAfterSubmitType.报关出仓,
      adjustResult: LimitResult.取消,
      adjustRespId: props.clearanceWarehouse.adjustRespId,
    })
  }
  if (showWarehouseIn.value) {
    result.push({
      adjustBackType: CheckAfterSubmitType.报关入仓,
      adjustResult: LimitResult.取消,
      adjustRespId: props.clearanceWarehouse.adjustRespId,
    })
  }
  clkClearanceWarehouse('关闭', '弹窗功能', showWarehouseOut.value, showWarehouseIn.value)
  updateWarehouse(result)
  props.cancel?.()
}

const title = computed(() => {
  const { sendShowType, endShowType } = props.clearanceWarehouse || {}
  const inTitle = clearanceWarehouseTypeName[endShowType as keyof typeof clearanceWarehouseTypeName] || '入仓'
  const outTitle = clearanceWarehouseTypeName[sendShowType as keyof typeof clearanceWarehouseTypeName] || '出仓'

  // 判断进出展，还是出入仓
  const is = sendShowType === '40' || endShowType === '30'

  if (showWarehouseOut.value && showWarehouseIn.value) {
    return `${outTitle}/${inTitle}${is ? '服务' : '收费'}提醒`
  }

  if (showWarehouseOut.value) {
    return `${outTitle}${is ? '服务' : '收费'}提醒`
  }

  if (showWarehouseIn.value) {
    return `${inTitle}${is ? '服务' : '收费'}提醒`
  }

  return ''
})
// clearanceWarehousePopup组件是插入到body下的index层级较高，跳转报关出入仓没有关闭popup，导致层级不对
const isServiceIntroduction = computed(() => router.currentRoute.value?.name === 'order-service-introduction')
const onClickTips = () => {
  clk_express_single_declaration_increment_v1(showWarehouseOut.value, showWarehouseIn.value)
  router.push({
    path: '/order-service-introduction',
    query: {
      type: 'declare-customs',
    },
  })
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
</style>
<style lang="scss">
@import './index.scss';
</style>
