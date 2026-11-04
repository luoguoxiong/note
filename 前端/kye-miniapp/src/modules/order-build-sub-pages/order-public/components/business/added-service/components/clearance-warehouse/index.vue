<!-- 报关出入仓 -->
<template>
  <div class="clearance-warehouse" v-if="restrictData">
    <div :class="`clearance-warehouse-${moduleStyle === 'popup' ? 'popup' : 'unfold'}`">
      <div class="clearance-warehouse-cell" v-if="restrictData?.sendAdjustFlag === '10'">
        <div class="flex items-center space-between font-level3">
          <KyRadio
            v-model="orderWarehouseOut"
            :disabled="restrictData?.sendCustomerDefaultFlag"
            :radio-props="[
              { name: true, text: outTitle, labelPosition: 'left', disabled: restrictData?.sendCustomerDefaultFlag },
            ]"
            @click="handleWarehouseOutRadio"
            class="clearance-warehouse-radio"
            selfclass="clearance-warehouse-w-100"
          >
            <!-- <template #icon>
              <image class="ky-button-radio__check_icon" :src="orderWarehouseOut ? iconChecked : iconNoChecked" />
            </template> -->
          </KyRadio>
        </div>
        <div class="clearance-warehouse-cell-tip font-level4 flex">
          <SvgIcon class="mr-8 color-error" name="dollar-reminder-line" />
          <rich-text
            class="tips"
            :nodes="orderWarehouseOut ? restrictData?.sendAgreeRichMsg : restrictData?.sendDisagreeRichMsg"
          ></rich-text>
        </div>
      </div>
      <div class="clearance-warehouse-cell" v-if="restrictData?.endAdjustFlag === '10'">
        <div class="flex items-center space-between font-level3">
          <KyRadio
            v-model="orderWarehouseIn"
            :disabled="restrictData?.endCustomerDefaultFlag"
            :radio-props="[
              { name: true, text: inTitle, labelPosition: 'left', disabled: restrictData?.endCustomerDefaultFlag },
            ]"
            @click="handleWarehouseInRadio"
            class="clearance-warehouse-radio"
            selfclass="clearance-warehouse-w-100"
          >
            <!-- <template #icon>
              <image class="ky-button-radio__check_icon" :src="orderWarehouseIn ? iconChecked : iconNoChecked" />
            </template> -->
          </KyRadio>
        </div>
        <div class="clearance-warehouse-cell-tip font-level4 flex">
          <SvgIcon class="mr-8 color-error" name="dollar-reminder-line" />
          <rich-text
            class="tips"
            :nodes="orderWarehouseIn ? restrictData?.endAgreeRichMsg : restrictData?.endDisagreeRichMsg"
          ></rich-text>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import KyRadio from '@order-public-sub-public/components/base/ky-radio/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { CheckAfterSubmitType, LimitResult } from '@order-public-sub-public/constants'
import { useOrderWarehouseIn, useOrderWarehouseOut } from '../../hooks/useOrderWarehouseState'
import useEffect from '@order-public-sub-public/validate'
import { updateLimitResult } from '@order-public-sub-public/validate/limit'
import { clearanceWarehouseType } from '@order-public-sub-public/constants/clearanceWarehouse'
import { useValidate } from '../../hooks/useValidate'
import { RichText } from '@tarojs/components'
const piniaStore = useStore()

const { remoteCheck } = useEffect()

const props = defineProps<{ moduleStyle: string }>()

const { orderWarehouseIn, setOrderWarehouseIn } = useOrderWarehouseIn()
const { orderWarehouseOut, setOrderWarehouseOut } = useOrderWarehouseOut()

const restrictData = computed(() => {
  const restrictStoreData = piniaStore.globalData.restrictData?.clearanceWarehouse
  return restrictStoreData
})
const { useAddedServiceValidate } = useValidate()
enum WhereHousePopOrPageChangeKey {
  入仓选中 = 'addedService.warehouseIn.checked',
  入仓取消 = 'addedService.warehouseIn.unchecked',
  出仓选中 = 'addedService.warehouseOut.checked',
  出仓取消 = 'addedService.warehouseOut.unchecked',
}

// 入仓、进展标题
const inTitle = computed(() => {
  const { endShowType } = restrictData.value || {}
  if (endShowType) {
    return clearanceWarehouseType[endShowType as keyof typeof clearanceWarehouseType]
  }
  return '入仓服务'
})

// 出仓、出展标题
const outTitle = computed(() => {
  const { sendShowType } = restrictData.value || {}
  if (sendShowType) {
    return clearanceWarehouseType[sendShowType as keyof typeof clearanceWarehouseType]
  }
  return '出仓服务'
})

const iconChecked = 'https://ic-img.ky-express.com/netc/20250619_23043_!!1750302648826_64_64.png'
const iconNoChecked = 'https://ic-img.ky-express.com/netc/20250619_81060_!!1750313799504_64_64.png'

const handleWarehouseOutRadio = async () => {
  if (restrictData.value?.sendCustomerDefaultFlag) return
  setOrderWarehouseOut(!orderWarehouseOut.value)
  // 平铺的时候立即调用 弹窗点击确定才调用上报
  if (props.moduleStyle === 'unfold') {
    try {
      await updateLimitResult({
        type: CheckAfterSubmitType.报关出仓,
        flag: orderWarehouseOut.value ? LimitResult.确认 : LimitResult.拒绝,
        data: restrictData.value,
        isRadio: true,
      })
      // 调接口重新计算费用
      await remoteCheck('addedService')
    } catch (error) {
      console.error(error)
    }
  } else {
    const elementChangeKey = orderWarehouseOut.value
      ? WhereHousePopOrPageChangeKey.出仓选中
      : WhereHousePopOrPageChangeKey.出仓取消
    await useAddedServiceValidate({ field: elementChangeKey })
  }
}

const handleWarehouseInRadio = async () => {
  if (restrictData.value?.endCustomerDefaultFlag) return
  setOrderWarehouseIn(!orderWarehouseIn.value)
  // 平铺的时候立即调用 弹窗点击确定才调用上报
  if (props.moduleStyle === 'unfold') {
    try {
      await updateLimitResult({
        type: CheckAfterSubmitType.报关入仓,
        flag: orderWarehouseIn.value ? LimitResult.确认 : LimitResult.拒绝,
        data: restrictData.value,
        isRadio: true,
      })
      // 调接口重新计算费用
      await remoteCheck('addedService')
    } catch (error) {
      console.error(error)
    }
  } else {
    const elementChangeKey = orderWarehouseIn.value
      ? WhereHousePopOrPageChangeKey.入仓选中
      : WhereHousePopOrPageChangeKey.入仓取消
    await await useAddedServiceValidate({ field: elementChangeKey })
  }
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
