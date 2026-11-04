<template>
  <div class="sender-fill" id="sender_sender">
    <AddressBlock
      :info="info"
      :required="addressProps.required"
      :disabled="addressProps.disabled"
      :source="addressProps.source"
      :addressVisible="addressProps.addressVisible"
      :headerPlaceholder="addressProps.headerPlaceholder"
      :dataValidate="'sender.sender'"
      :addressVisibleType="addressVisibleType"
      :addressEdit="addressProps.addressEdit"
      :switchVisible="switchVisible"
      @onClick="onJumpSenderPage"
      @onClickAddressBook="onJumpAddressBook"
      @onSwitchAddress="onSwitchAddress"
    >
      <!-- 限取限派创 可贴 -->
      <template #restrictData v-if="asynrender">
        <LimitRemindBar v-if="limitRemindBarData.show" :restrictData="limitRemindBarData" @on-click="handleClose" />

        <PersonNameGuide v-else-if="isShowRealNameGuide"></PersonNameGuide>

        <!-- 地址 提示 -->
        <detailAddressTips :type="ModulePageType.寄方" v-else></detailAddressTips>
      </template>

      <!-- 展会和展馆号 -->
      <template #exhibition v-if="asynrender">
        <Exhibition :type="ModulePageType.寄方" />
      </template>

      <!-- 华强北组件 -->
      <template #projectLocation v-if="asynrender">
        <ProjectLocation />
      </template>
    </AddressBlock>

    <!-- 指定地址弹窗 -->
    <SpecifyAddress
      v-if="asynrender"
      ref="specifyAddressRef"
      :addressType="AddressType.SENDER"
      :addressVisibleType="addressVisibleType"
      :fieldsConfigType="addressProps.fieldsConfigType"
      :recommendByUserLocation="addressProps.recommendByUserLocation"
      @onSelect="onSelectSpecifyAddress"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { useStore } from '@order-public-sub-public/store'

// 组件
import AddressBlock from '@order-public-sub-public/components/ui/address-block/index.vue'
import LimitRemindBar from '@order-public-sub-public/components/ui/limit-remind-bar/index.vue'
import Exhibition from '@order-public-sub-public/components/business/exhibition/index.vue'
import ProjectLocation from '@order-public-sub-public/components/business/project-location/index.vue'
import SpecifyAddress from '@order-public-sub-public/components/business/specify-address/index.vue'
import PersonNameGuide from '@order-public-sub-public/components/ui/person-name-guide/index.vue'
import detailAddressTips from '@order-public-sub-public/components/ui/address-block/components/detail-address-tips/index.vue'

// 方法
import { getValueOrEmpty } from '@order-public-sub-public/utils'
import useInitConfig from '@order-public-sub-public/hooks/address/sender/useInitConfig'
import { useRestrict, useSaveAddress, restrictDataClear } from '@order-public-sub-public/hooks/address/useCommon'
import { useSpecifyAddress } from '@order-public-sub-public/hooks/address/sender/useFields'
import { useModuleHotZone } from '@order-public-sub-public/hooks/address/sender/useModuleHotZone'
import { initData } from '@order-public-sub-public/hooks/address/sender/useUpdateData'
import { setSwitchVisibleData, onSwitchAddress } from '../hooks/index'
import {
  isShowRealNameGuide,
  showRealNameGuide,
  realNameGuide,
} from '@order-public-sub-public/components/ui/person-name-guide/hooks/useState'

// 类型
import { Delivery, SenderDimension } from '@order-public-sub-public/types'
import { ModuleType, Address, AddressType } from '@order-public-sub-public/constants'
import { ModulePageType } from '@order-public-sub-public/components/business/exhibition/hooks/data-config'
import { switchVisible } from '../hooks/state'
import { asynrender } from '@order-public-sub-public/hooks/asynrender'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import Taro from '@tarojs/taro'
import { urlContact } from '@/public/utils'

const piniaStore = useStore()

const router = useRouter()

// 来源标识
const moduleStyle = { moduleStyle: Address.SENDER }

// 初始化配置
const { addressProps, addressVisibleType } = useInitConfig(moduleStyle)

// 取派创可贴
const { limitRemindBarData } = useRestrict(moduleStyle)

// 指定地址
const { specifyAddressRef, onSelectSpecifyAddress, onClickSpecifyAddress } = useSpecifyAddress(moduleStyle)

// 初始化数据
watch(
  () => piniaStore.order.moduleFormData(ModuleType['寄方信息']),
  (formData) => {
    initData(formData ?? {})
  },
  { immediate: true, deep: true },
)

// 获取数据
const info = computed(() => {
  const deliveryInfo = piniaStore.order.moduleFormData(ModuleType['寄方信息']) || {}
  const { person, mobile, telephone, province, city, county, detailAddress, locationName, companyName } =
    deliveryInfo || {}

  const fullAddress = `${getValueOrEmpty(province)}${getValueOrEmpty(city)}${getValueOrEmpty(county)}${getValueOrEmpty(
    detailAddress,
  )}`

  return {
    person: getValueOrEmpty(person),
    mobile: getValueOrEmpty(mobile),
    telephone: getValueOrEmpty(telephone),
    fullAddress,
    locationName: getValueOrEmpty(locationName),
    companyName,
    province,
    city,
    county,
    detailAddress,
  }
})

// 跳转填单页
const onJumpSenderPage = () => {
  // 指定地址场景，组合维护不跳转页面，弹窗选择地址
  const flag = addressProps.value.addressEdit && !addressProps.value.fieldsConfigType
  if (flag) {
    if (specifyAddressRef.value) {
      onClickSpecifyAddress()
    }
    return false
  }
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_sender_box_v1',
    },
    {
      button_name: '寄件人信息框',
    },
  )

  initData(piniaStore.order.moduleFormData(ModuleType['寄方信息']) ?? {})

  router.push({
    path: '/sender-page',
    query: {
      addressType: Address.SENDER_ADDRESS_TYPE,
      pageSource: 'page',
    },
  })
}

/**
 * 跳转寄方地址簿
 */
const onJumpAddressBook = () => {
  Taro.navigateTo({
    url: urlContact('/modules/order-build-sub-pages/order-public/components/business/address-book/page/index', {
      addressType: Address.SENDER_ADDRESS_TYPE,
      pageSource: 'block',
    }),
  })
  // router.push({
  //   path: '/address-book',
  //   query: {
  //     addressType: Address.SENDER_ADDRESS_TYPE,
  //     pageSource: 'block',
  //   },
  // })
}

// 是否保存到地址簿
const { getSaveAddressValue } = useSaveAddress(Address.SENDER_ADDRESS_TYPE)
const getSaveAddressFn = async () => {
  if (addressProps.value?.saveAddress) {
    await getSaveAddressValue()
  }
}

const senderDimensionData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['寄方信息'])
})

const handleClose = () => {
  restrictDataClear()
}

watch(
  () => senderDimensionData.value,
  (newVal) => {
    if (newVal?.realNameGuide) {
      realNameGuide.value = newVal.realNameGuide
      showRealNameGuide.value = true
    }
  },
  {
    immediate: true,
  },
)

const switchSendRecvInfoShowVoC = computed(() => piniaStore.globalData.dynamicConfig('switchSendRecvInfoShowVo'))
watch(switchSendRecvInfoShowVoC, () => {
  setSwitchVisibleData()
})

onMounted(() => {
  getSaveAddressFn()
  useModuleHotZone()
  initData(piniaStore.order.moduleFormData(ModuleType['寄方信息']))
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
