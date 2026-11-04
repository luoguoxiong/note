<template>
  <div class="receive-fill" id="receive_receive">
    <!-- 块 -->
    <AddressBlock
      iconText="收"
      iconColor="#8365F6"
      headerText="收件人信息"
      :headerPlaceholder="addressProps.headerPlaceholder"
      data-validate="receive.receive"
      :info="info"
      :required="addressProps.required"
      :source="addressProps.source"
      :addressVisible="addressProps.addressVisible"
      :addressEdit="addressProps.addressEdit"
      :addressVisibleType="addressVisibleType"
      @onClick="onJumpReceivePage"
      @onClickAddressBook="onJumpAddressBook"
    >
      <!-- 限取限派创可贴 -->
      <template #restrictData v-if="asynrender">
        <LimitRemindBar v-if="limitRemindBarData.show" :restrictData="limitRemindBarData" @on-close="handleClose" />

        <!-- 地址提示 -->
        <detailAddressTips :type="ModulePageType.收方" v-else></detailAddressTips>
      </template>

      <!-- AI 地址推荐 -->
      <template #aiAddress v-if="asynrender">
        <AiAddressRecommend :receiveAiInfoVoList="aiAddressRecommendList" @onSelect="onSelectAiAddressRecommend" />
      </template>

      <!-- 展会和展馆号 -->
      <template #exhibition v-if="asynrender">
        <Exhibition :type="ModulePageType.收方" />
      </template>
    </AddressBlock>

    <!-- 指定地址弹窗 -->
    <SpecifyAddress
      v-if="asynrender"
      ref="specifyAddressRef"
      :addressType="AddressType.RECEIVE"
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
import AiAddressRecommend from '@order-public-sub-public/components/ui/ai-address-recommend/index.vue'
import LimitRemindBar from '@order-public-sub-public/components/ui/limit-remind-bar/index.vue'
import SpecifyAddress from '@order-public-sub-public/components/business/specify-address/index.vue'
import Exhibition from '@order-public-sub-public/components/business/exhibition/index.vue'
import detailAddressTips from '@order-public-sub-public/components/ui/address-block/components/detail-address-tips/index.vue'

// 方法
import { getValueOrEmpty } from '@order-public-sub-public/utils'
import { useRestrict, useSaveAddress, restrictDataClear } from '@order-public-sub-public/hooks/address/useCommon'
import useInitConfig from '@order-public-sub-public/hooks/address/receive/useInitConfig'
import { useModuleHotZone } from '@order-public-sub-public/hooks/address/receive/useModuleHotZone'
import { initData } from '@order-public-sub-public/hooks/address/receive/useUpdateData'
import { useAiAddressRecommend, useSpecifyAddress } from '@order-public-sub-public/hooks/address/receive/useFields'

// 类型
import { PickUp } from '@order-public-sub-public/types'
import { ModuleType, Address, AddressType } from '@order-public-sub-public/constants'
import { ModulePageType } from '@order-public-sub-public/components/business/exhibition/hooks/data-config'
import { asynrender, timeFlag } from '@order-public-sub-public/hooks/asynrender'
import Taro from '@tarojs/taro'
import { urlContact } from '@/public/utils'

const piniaStore = useStore()

const router = useRouter()

// 来源标识
const moduleStyle = { moduleStyle: Address.RECEIVE }

// 初始化数据
const { addressProps, addressVisibleType } = useInitConfig(moduleStyle)

// 取派创可贴
const { limitRemindBarData } = useRestrict(moduleStyle)

// AI地址推荐
const { aiAddressRecommendList, onSelectAiAddressRecommend } = useAiAddressRecommend()

// 指定地址
const { specifyAddressRef, onSelectSpecifyAddress, onClickSpecifyAddress } = useSpecifyAddress(moduleStyle)
// const headerPlaceholder = `<span style="color: #8365F6">点击</span><span>此处填写，支持智能填写、图片识别</span>`
// 初始化数据
watch(
  () => piniaStore.order.moduleFormData(ModuleType['收方信息']),
  (formData) => initData(formData),
  { immediate: false },
)

// 跳转填单页
const onJumpReceivePage = () => {
  // window.$umpOtherReport('CLK', {
  //   eventCode: 'clk_express_receiver_box_v1',
  // })
  // 指定地址场景，组合维护不跳转页面，弹窗选择地址
  const flag = addressProps.value.addressEdit && !addressProps.value.fieldsConfigType
  if (flag) {
    if (specifyAddressRef.value) {
      onClickSpecifyAddress()
    }
    return false
  }

  initData(piniaStore.order.moduleFormData(ModuleType['收方信息']))

  router.push({
    path: '/receive-page',
    query: {
      addressType: Address.RECEIVE_ADDRESS_TYPE,
      pageSource: 'page',
    },
  })
}

/**
 * 跳转收方地址簿
 */
const onJumpAddressBook = () => {
  // window.$umpOtherReport('CLK', {
  //   eventCode: 'clk_express_receiver_box_v1',
  // })
  Taro.navigateTo({
    url: urlContact('/modules/order-build-sub-pages/order-public/components/business/address-book/page/index', {
      addressType: Address.RECEIVE_ADDRESS_TYPE,
      pageSource: 'block',
    }),
  })
  // router.push({
  //   path: '/address-book',
  //   query: {
  //     addressType: Address.RECEIVE_ADDRESS_TYPE,
  //     pageSource: 'block',
  //   },
  // })
}

// 获取数据
const info = computed(() => {
  const deliveryInfo = piniaStore.order.moduleFormData(ModuleType['收方信息']) || {}
  const { person, mobile, province, city, county, detailAddress, locationName, extension, companyName } = deliveryInfo
  let { telephone } = deliveryInfo
  const fullAddress = `${getValueOrEmpty(province)}${getValueOrEmpty(city)}${getValueOrEmpty(county)}${getValueOrEmpty(
    detailAddress,
  )}`

  if (extension && telephone) {
    telephone = `${telephone}-${extension}`
  }

  return {
    person: getValueOrEmpty(person),
    mobile: getValueOrEmpty(mobile),
    telephone: getValueOrEmpty(telephone),
    locationName: getValueOrEmpty(locationName),
    companyName,
    fullAddress,
    province,
    city,
    county,
    detailAddress,
  }
})

// 是否保存到地址簿
const { getSaveAddressValue } = useSaveAddress(Address.RECEIVE_ADDRESS_TYPE)
const getSaveAddressFn = async () => {
  if (addressProps.value?.saveAddress) {
    await getSaveAddressValue()
  }
}

const handleClose = () => {
  restrictDataClear()
}

onMounted(() => {
  getSaveAddressFn()
  useModuleHotZone()
  console.log('缓存收件', Date.now() - timeFlag.value)
  initData(piniaStore.order.moduleFormData(ModuleType['收方信息']))
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
