<template>
  <div class="receive-unfold" :type="type" :visible="visible">
    <AddressUnfold
      v-bind="addressProps"
      :person="person"
      :mobile="mobile"
      :telephone="telephone"
      :extension="extension"
      :companyName="companyName"
      :area="area"
      :detailAddress="detailAddress"
      :specifyAddress="specifyAddress"
      :addressVisibleType="addressVisibleType"
      :locationName="locationName"
      :suggestList="suggestList"
      :visibleDropdownMenu="visibleDropdownMenu"
      :visibleDropdownMenuPosition="visibleDropdownMenuPosition"
      :usePage="pageUseAddress.RECEIVEUNFOLD"
      @onBlurPerson="onBlurPerson"
      @onFocusPerson="onFocusPerson"
      @onFocusMobile="onFocusMobile"
      @onBlurMobile="onBlurMobile"
      @onBlurTelephone="onBlurTelephone"
      @onBlurExtension="onBlurExtension"
      @onClickArea="onClickArea"
      @onClickMapPosition="onClickMapPosition"
      @onClickDetailAddress="onClickDetailAddress"
      @onClickSpecifyAddress="onClickSpecifyAddress"
      @onClickAddressBook="onClickAddressBook"
      @onClickContact="onClickContact"
      @onBlurCompanyName="onBlurCompanyName"
      @selectSuggest="selectSuggest"
      @onCloseDropdownMenu="closeDropdownMenu"
      @update:person="onInputPerson"
      @update:mobile="onInputMobile"
      @update:telephone="onInputTelephone"
      @update:extension="onInputExtension"
      @update:companyName="onInputCompanyName"
    >
      <!-- 地址智能识别 -->
      <template #addressOcr>
        <AddressOcr
          moduleStyle="unfold"
          :addressType="Address.RECEIVE_ADDRESS_TYPE"
          @getAddressOcrData="getAddressOcrData"
        />
      </template>

      <!-- AI 地址推荐 -->
      <template #aiAddress>
        <AiAddressRecommend :receiveAiInfoVoList="aiAddressRecommendList" @onSelect="onSelectAiAddressRecommend" />
      </template>

      <!-- 限取限派创可贴 -->
      <template #restrictData>
        <LimitRemindBar v-if="limitRemindBarData.show" :restrictData="limitRemindBarData" @on-close="handleClose" />
      </template>

      <!-- 展会和展馆号 -->
      <template #exhibition>
        <Exhibition :type="ModulePageType.收方" :isUnfold="isUnfold" />
      </template>

      <!-- 地址提示 -->
      <template #detailAddressTips>
        <detailAddressTips :type="ModulePageType.收方" moduleStyle="unfold"></detailAddressTips>
      </template>
    </AddressUnfold>

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

    <!-- 省市区选择弹窗 -->
    <AreaAddress
      v-if="asynrender"
      ref="areaRef"
      @onSelectSearchItem="onConfirmAreaAddress"
      @onConfirm="onConfirmAreaAddress"
    />

    <!-- 详情地址选择弹窗 -->
    <DetailAddress
      v-if="asynrender"
      ref="detailAddressRef"
      :area="area"
      :addressType="Address.RECEIVE"
      @onSelect="onSelectDetailAddress"
      @onConfirmDetailAddress="onSelectDetailAddress"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useRouter } from '@order-public-sub-public/vue-router/index'

import Exhibition from '@order-public-sub-public/components/business/exhibition/index.vue'
import { ModulePageType } from '@order-public-sub-public/components/business/exhibition/hooks/data-config'

// 组件
import AddressUnfold from '@order-public-sub-public/components/ui/address-unfold/index.vue'
import AreaAddress from '@order-global-package-order-sub/components/business/area-address/index.vue'
import DetailAddress from '@order-global-package-order-sub/components/business/detail-address/index.vue'
import SpecifyAddress from '@order-public-sub-public/components/business/specify-address/index.vue'
import AiAddressRecommend from '@order-public-sub-public/components/ui/ai-address-recommend/index.vue'
import AddressOcr from '@order-global-package-order/components/business/address-ocr/index.vue'
import LimitRemindBar from '@order-public-sub-public/components/ui/limit-remind-bar/index.vue'
import detailAddressTips from '@order-public-sub-public/components/ui/address-block/components/detail-address-tips/index.vue'
import { asynrender } from '@order-public-sub-public/hooks/asynrender'
import { useMapPosition } from '@order-public-sub-public/hooks/address/receive/useMapPosition'
import { useDidHide, useUnload } from '@tarojs/taro'
import { SET_MAP_POSITION_DELAY } from '@order-public-sub-public/constants/address'

// 方法
import { useRestrict, restrictDataClear } from '@order-public-sub-public/hooks/address/useCommon'
import useInitConfig from '@order-public-sub-public/hooks/address/receive/useInitConfig'
import {
  usePerson,
  useMobile,
  useTelephone,
  useCompanyName,
  useArea,
  useDetailAddress,
  useSpecifyAddress,
  useSuggestData,
  useAiAddressRecommend,
} from '@order-public-sub-public/hooks/address/receive/useFields'
import { useOcrAddress } from '@order-public-sub-public/hooks/address/receive/useOcrAddress'
import { useModuleHotZone } from '@order-public-sub-public/hooks/address/receive/useModuleHotZone'
import { initData } from '@order-public-sub-public/hooks/address/receive/useUpdateData'

// 类型
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants/global'
import { Address, AddressType, pageUseAddress } from '@order-public-sub-public/constants'
import { AddressConfig, PickModule, PickUp } from '@order-public-sub-public/types'
import { useSelectContact } from '@order-public-sub-public/components/business/receive/hooks/selectContact'
import { useStore } from '@order-public-sub-public/store'
import Taro from '@tarojs/taro'
import { urlContact } from '@/public/utils'

const piniaStore = useStore()

const props = defineProps<PickModule<AddressConfig>>()
const isUnfold = computed(() => props.moduleStyle === 'unfold')

const router = useRouter()

// 来源标识
const moduleStyle = { moduleStyle: Address.RECEIVE }

// 初始化数据
const { addressProps, addressVisibleType } = useInitConfig(moduleStyle)

// 取派创可贴
const { limitRemindBarData } = useRestrict(moduleStyle)

// 初始化数据赋值
watch(
  () => piniaStore.order.moduleFormData(ModuleType['收方信息']) || {},
  (formData) => {
    const orderPageType = piniaStore.root.getOrderPageType
    if (orderPageType !== OrderPageType.返程单) {
      initData(formData)
    }
  },
  { immediate: false },
)

// 姓名
const { person, onFocusPerson, onBlurPerson, onInputPerson } = usePerson(moduleStyle)

// 手机号
const { mobile, onFocusMobile, onBlurMobile, onInputMobile } = useMobile(moduleStyle)

// 姓名和手机号联想
const { suggestList, selectSuggest, closeDropdownMenu, visibleDropdownMenu, visibleDropdownMenuPosition } =
  useSuggestData(moduleStyle)

// 固定电话和分机号
const { telephone, extension, onBlurTelephone, onInputTelephone, onInputExtension, onBlurExtension } =
  useTelephone(moduleStyle)

// 公司名称
const { companyName, onBlurCompanyName, onInputCompanyName } = useCompanyName(moduleStyle)

// 省市区
const { area, onClickArea, areaRef, onConfirmAreaAddress } = useArea(moduleStyle)

// 详情地址
const { detailAddress, detailAddressRef, onClickDetailAddress, onSelectDetailAddress } = useDetailAddress(moduleStyle)

// 指定地址
const { locationName, specifyAddress, specifyAddressRef, onSelectSpecifyAddress, onClickSpecifyAddress } =
  useSpecifyAddress(moduleStyle)

// 智能识别
const { getAddressOcrData } = useOcrAddress(moduleStyle)

// AI地址推荐
const { aiAddressRecommendList, onSelectAiAddressRecommend } = useAiAddressRecommend()

const { selectContact } = useSelectContact(moduleStyle)

// 跳转定位页面
const onClickMapPosition = () => {
  router.push({
    path: '/map-position',
    query: {
      from: 'receiveUnfold',
    },
  })
}

// 跳转地址簿页面
const onClickAddressBook = () => {
  Taro.navigateTo({
    url: urlContact('/modules/order-build-sub-pages/order-public/components/business/address-book/page/index', {
      addressType: Address.RECEIVE_ADDRESS_TYPE,
      pageSource: 'unfold',
    }),
  })
  // router.push({
  //   path: '/address-book',
  //   query: {
  //     addressType: Address.RECEIVE_ADDRESS_TYPE,
  //     pageSource: 'unfold',
  //   },
  // })
}

const onClickContact = () => {
  selectContact()
}

const handleClose = () => {
  restrictDataClear()
}

onMounted(() => {
  useModuleHotZone()
})

// 设置定位数据
const { setMapPosition } = useMapPosition(moduleStyle)
watch(
  () => piniaStore.extend.receiveMapPosition.isSelectItem,
  (flag) => {
    flag && setTimeout(() => setMapPosition(piniaStore.extend.receiveMapPosition), SET_MAP_POSITION_DELAY)
  },
  { immediate: true },
)

useDidHide(() => {
  // 重置定位地址选中的标识
  piniaStore.extend.updateReceiveMapPosition({
    data: {
      isSelectItem: false,
    },
  })
})

useUnload(() => {
  // 重置定位地址选中的标识
  piniaStore.extend.updateReceiveMapPosition({
    data: {
      isSelectItem: false,
    },
  })
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
