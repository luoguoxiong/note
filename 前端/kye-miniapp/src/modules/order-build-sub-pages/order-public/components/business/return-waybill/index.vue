<template>
  <div
    class="return-waybill"
    :class="{ disabled: disabled }"
    v-if="visible"
    :type="type"
    :visible="dyamincData?.visible"
    v-exposure-report="{
      eventCode: 'exp_express_return_v1',
    }"
  >
    <div class="return-waybill-title flex items-center">
      <div class="font-level3 pr-8">需返程</div>
      <SvgIcon name="return-waybill-order" class="return-waybill-title-icon"></SvgIcon>
      <div class="return-waybill-title-desc font-level4" :class="[switchFlag ? 'color-error' : 'color-assist']">
        {{ switchFlag ? '返程费用由寄件人承担' : '部分货物需要从收货方返回' }}
      </div>
      <KySwitch
        v-model="switchFlag"
        :disabled="switchFlagDisabled"
        @click="checkStatus"
        v-click-report="{
          eventCode: 'clk_express_return_v1',
        }"
        @change="handleChange"
      />
    </div>
    <div
      v-if="switchFlag"
      @click="goOrderBack"
      v-click-report="{
        eventCode: 'clk_express_return_msg_v1',
      }"
      :class="{ disabled: disabled }"
      class="return-waybill-content font-level3 flex items-center"
    >
      <div :style="{ color: '#03050D' }">返程运单信息</div>
      <SvgIcon name="required" class="return-waybill-content-required" v-if="dyamincData?.visible"></SvgIcon>
      <div
        class="return-waybill-content-value"
        id="returnWaybill_returnWaybill"
        data-validate="returnWaybill.returnWaybill"
      >
        <span class="return-waybill-content-value-span" :style="{ color: '#03050D' }" v-if="isShowReturnWaybillInfo">{{
          returnWaybillValue
        }}</span>
        <span class="return-waybill-placeholder" :class="{ 'validate-error': popoverConfig?.content }" v-else
          >请填写</span
        >
      </div>
      <SvgIcon name="order-miniapp-right-arrow" class="return-waybill-content-icon" />
    </div>
    <!-- <div class="return-waybill-restrict font-level4" v-if="plainTips">
      {{ plainTips }}
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, watch, onActivated } from 'vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { useStore } from '@order-public-sub-public/store'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KySwitch from '@order-public-sub-public/components/base/ky-switch/index.vue'
import { ReturnWaybill, Module, OrderInfo, ServiceModeDimension } from '@order-public-sub-public/types'
import { Channel, GoodsTimeFlag, ModuleType, OrderPageType, SwitchEnum } from '@order-public-sub-public/constants'
import { useUpdateOrderStore, useResetReturnWaybillNumber, chearReturnWaybillInfo } from './hooks/useModuleStore'
import { useSwitchFlag, useReturnWaybillValue } from './hooks/useState'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { getQueryObject } from '@order-public-sub-public/utils'
import { useStaticAndDynamicData } from '@order-public-sub-public/hooks/useStaticAndDynamicData'
import { setChannel } from '@order-public-sub-public/configs'
import { omit } from 'lodash-es'
import { showSkeleton } from '@order-public-sub-public/utils/skeleton'
import useEffect from '@order-public-sub-public/validate'
import { moduleFormDataService } from '../service-model/hooks/useModuleHotZone'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
import { orderPageScrollTop } from '@order-public-sub-root-pages/order-single/hooks/useScrollTop'
import { isBackFromOrderBackPage } from '@order-public-sub-root-pages/order-single/hooks/routerStatus'
const piniaStore = useStore()
const router = useRouter()

const { validateObj, removeValidateKey } = globalUseValidate()

const { switchFlag, setSwitchFlag } = useSwitchFlag()
const { returnWaybillValue, setReturnWaybillValue } = useReturnWaybillValue()

const { saveStaticAndWaybillInfo } = useStaticAndDynamicData()

const { remoteCheck } = useEffect()

defineProps<Module>()

const dyamincData = computed(() => piniaStore.globalData.dynamicConfig('returnWaybill') || {})

const isReturnSend = computed(() => {
  const orderPageType = piniaStore.root.getOrderPageType
  return orderPageType === 'order-back'
})

const visible = computed(() => {
  return dyamincData.value?.visible && !isReturnSend.value
})

const moduleFormData = computed(() => piniaStore.order.moduleFormData(ModuleType['需返程']))

const returnWaybillInfo = computed(() => {
  return piniaStore.globalData.getReturnWaybillInfo(OrderPageType.单票) as OrderInfo
})

const isShowReturnWaybillInfo = computed(() => {
  return moduleFormData.value.userConfirm === SwitchEnum.YES && returnWaybillValue.value
})

const popoverConfig = computed(() => {
  return validateObj['returnWaybill.returnWaybill'] || {}
})

const getReturnWaybillValue = () => {
  if (!returnWaybillInfo.value) return
  const resultList: string[] = []
  // 货好时间
  const goodsTime =
    returnWaybillInfo.value?.goodsTime?.goodsTime ||
    (Number(returnWaybillInfo.value?.goodsTime?.goodsTimeFlag || '') === GoodsTimeFlag.NOW ? '签收立即返' : '')
  if (goodsTime) {
    resultList.push(goodsTime)
  }

  // 服务方式
  const serviceMode = returnWaybillInfo.value?.serviceMode?.serviceMode
  const serviceModeList = piniaStore.schema.moduleDimensionData(ModuleType['服务方式'], OrderPageType.返程单)
  const curServiceName =
    serviceModeList?.serviceTypes?.find((item) => item.serviceTypeCode === serviceMode)?.serviceTypeName || ''
  if (curServiceName) {
    resultList.push(curServiceName)
  }
  // 货好时间/服务方式/
  if (resultList.length > 0) {
    setReturnWaybillValue(resultList.filter((item) => item).join('/'))
  } else {
    setReturnWaybillValue('')
  }
}

const disableItem = computed(() => {
  const disableItem = piniaStore.globalData.returnEditDisableInfo('returnWaybill', 'returnWaybill') || {}
  return disableItem
})

watch(
  () => disableItem.value,
  () => {
    if (disableItem?.value?.key) {
      setSwitchFlag(false)
      useUpdateOrderStore({ switchFlag: false })
    }
  },
)

//服务方式请求完成后，重新显示返程单的信息

watch(
  () => piniaStore.globalData.processLoading,
  (value) => {
    const checkResultList = piniaStore.globalData.checkResultList
    let isError = false
    if (checkResultList && checkResultList.length > 0) {
      checkResultList.forEach((item) => {
        if (item.key === 'returnWaybill.returnWaybill' && item.showType === 1) {
          isError = true
        }
      })
    }
    if (isError) {
      setReturnWaybillValue('')

      // 清空返程单服务方式和时间
      chearReturnWaybillInfo()
      return
    }
    if (value === false && !isReturnSend.value) {
      getReturnWaybillValue()
    }
  },
)

const switchFlagDisabled = computed(() => {
  return dyamincData.value?.disabled || !!disableItem.value.key || !moduleFormDataService.value.serviceMode
})

// 校验当前状态，并提示原因
const checkStatus = () => {
  if (disableItem.value.key) {
    setSwitchFlag(false)
    showToast(disableItem.value?.tips || '不可修改')
  } else if (!moduleFormDataService.value.serviceMode) {
    // 新增场景 没有服务方式时不能使用往返寄
    setSwitchFlag(false)
    showToast('使用往返寄功能，请先选择服务方式')
  }
}

const handleChange = async (value: boolean) => {
  setSwitchFlag(value)
  // 操作开关将清空返程单数据,这里将状态改为不显示
  useUpdateOrderStore({ switchFlag: value, userConfirm: SwitchEnum.NO })
  if (!value) {
    setReturnWaybillValue('')
    useResetReturnWaybillNumber()
  }

  // 调过程中接口
  await remoteCheck('returnWaybill', {
    returnWaybill: { switchFlag: value },
  })
}

/**
 * @description 跳转返程页面
 */
const goOrderBack = async () => {
  showSkeleton()

  try {
    // 进入返程单需要等待process完成
    const processPromise = piniaStore.globalData.processPromise
    if (processPromise) {
      await processPromise
    }
  } catch (error) {
    console.log(error, '正常通过')
  }

  setChannel(Channel.返程单)

  const query = getQueryObject()
  orderPageScrollTop.value = 0
  router.push({
    name: 'order-back',
    query: {
      ...omit(query, ['configId', 'versionId']),
      channel: Channel.返程单,
    },
  })
  isBackFromOrderBackPage.value = true
  nextTick(() => {
    piniaStore.globalData.setGoWaybillNumber({ waybillNumber: piniaStore.order.waybillNumber })
    piniaStore.globalData.setCurrentWaybillNumber({
      waybillNumber: piniaStore.order.waybillNumber,
    })

    // 剔除返程单校验结果
    const checkResultList = piniaStore.globalData.checkResultList || []
    const filterCheckResultList = checkResultList.filter((item) => item.key !== 'returnWaybill.returnWaybill')
    piniaStore.globalData.setCheckResultList({
      checkResultList: filterCheckResultList,
    })
    saveStaticAndWaybillInfo()
  })
}

onActivated(() => {
  getReturnWaybillValue()
})

watch(moduleFormData, () => {
  if (moduleFormData.value) {
    setSwitchFlag(moduleFormData.value?.switchFlag)
  }
})

watch(
  returnWaybillInfo.value,
  () => {
    getReturnWaybillValue()
  },
  { immediate: true },
)

watch(
  () => disableItem.value,
  () => {
    if (disableItem?.value?.key) {
      setSwitchFlag(false)
      useUpdateOrderStore({ switchFlag: false })
    }
  },
)
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
