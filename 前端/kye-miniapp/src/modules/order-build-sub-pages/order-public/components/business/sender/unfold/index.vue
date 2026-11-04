<template>
  <!-- :switchVisible="switchVisible" -->
  <div class="sender-unfold" :type="type" :visible="visible">
    <AddressUnfold
      :person="person"
      :mobile="mobile"
      :telephone="telephone"
      :extension="extension"
      :companyName="companyName"
      :area="area"
      :detailAddress="detailAddress"
      :specifyAddress="specifyAddress"
      :locationName="locationName"
      :addressVisibleType="addressVisibleType"
      :suggestList="suggestList"
      :visibleDropdownMenu="visibleDropdownMenu"
      :visibleDropdownMenuPosition="visibleDropdownMenuPosition"
      v-bind="addressProps"
      :usePage="pageUseAddress.SENDERUNFOLD"
      :switchVisible="switchVisible"
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
      @onSwitchAddress="onSwitchAddress"
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
          :addressType="Address.SENDER_ADDRESS_TYPE"
          @getAddressOcrData="getAddressOcrData"
        />
      </template>

      <!-- 限取限派创可贴 -->
      <template #restrictData>
        <LimitRemindBar v-if="limitRemindBarData.show" :restrictData="limitRemindBarData" @on-click="handleClose" />
      </template>

      <!-- 展会和展馆号 -->
      <template #exhibition>
        <Exhibition :type="ModulePageType.寄方" />
      </template>

      <!-- 华强北组件 -->
      <template #projectLocation>
        <ProjectLocation :type="ModulePageType.寄方" />
      </template>

      <!-- 地址提示 -->
      <template #detailAddressTips>
        <detailAddressTips :type="ModulePageType.寄方" moduleStyle="unfold"></detailAddressTips>
      </template>
    </AddressUnfold>

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
      :addressType="Address.SENDER"
      @onSelect="onSelectDetailAddress"
      @onConfirmDetailAddress="onSelectDetailAddress"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'

import { useRouter } from '@order-public-sub-public/vue-router/index'
import { useDidHide, useUnload } from '@tarojs/taro'
import { ModulePageType } from '@order-public-sub-public/components/business/exhibition/hooks/data-config'

// 组件
import AddressUnfold from '@order-public-sub-public/components/ui/address-unfold/index.vue'
import AreaAddress from '@order-global-package-order-sub/components/business/area-address/index.vue'
import DetailAddress from '@order-global-package-order-sub/components/business/detail-address/index.vue'
import SpecifyAddress from '@order-public-sub-public/components/business/specify-address/index.vue'
import AddressOcr from '@order-global-package-order/components/business/address-ocr/index.vue'
import LimitRemindBar from '@order-public-sub-public/components/ui/limit-remind-bar/index.vue'
import Exhibition from '@order-public-sub-public/components/business/exhibition/index.vue'
import ProjectLocation from '@order-public-sub-public/components/business/project-location/index.vue'
import detailAddressTips from '@order-public-sub-public/components/ui/address-block/components/detail-address-tips/index.vue'

// 方法
import useInitConfig from '@order-public-sub-public/hooks/address/sender/useInitConfig'
import { useOcrAddress } from '@order-public-sub-public/hooks/address/sender/useOcrAddress'
import { useMapPosition } from '@order-public-sub-public/hooks/address/sender/useMapPosition'
import { useModuleHotZone } from '@order-public-sub-public/hooks/address/sender/useModuleHotZone'
import {
  usePerson,
  useMobile,
  useTelephone,
  useCompanyName,
  useArea,
  useDetailAddress,
  useSpecifyAddress,
  useSuggestData,
} from '@order-public-sub-public/hooks/address/sender/useFields'
import { setSwitchVisibleData, onSwitchAddress } from '../hooks/index'

// 类型
import { PickModule, AddressConfig, Delivery } from '@order-public-sub-public/types'
import { Address, AddressType, pageUseAddress } from '@order-public-sub-public/constants'
import { ModuleType } from '@order-public-sub-public/constants/global'
import { initData } from '@order-public-sub-public/hooks/address/sender/useUpdateData'
import { useRestrict, restrictDataClear } from '@order-public-sub-public/hooks/address/useCommon'
import { switchVisible } from '../hooks/state'
import { asynrender } from '@order-public-sub-public/hooks/asynrender'
import { useSelectContact } from '@order-public-sub-public/components/business/sender/hooks/selectContact'
import { useStore } from '@order-public-sub-public/store'
import { SET_MAP_POSITION_DELAY } from '@order-public-sub-public/constants/address'
import Taro from '@tarojs/taro'
import { urlContact } from '@/public/utils'

const piniaStore = useStore()

defineProps<PickModule<AddressConfig>>()
const router = useRouter()

// 来源标记
const moduleStyle = { moduleStyle: Address.SENDER }

// 初始化配置数据
const { addressProps, addressVisibleType } = useInitConfig(moduleStyle)

// 取派创可贴
const { limitRemindBarData } = useRestrict(moduleStyle)

// 初始化数据
watch(
  () => piniaStore.order.moduleFormData(ModuleType['寄方信息']) || {},
  (formData) => initData(formData),
  { immediate: true, deep: true },
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

const { selectContact } = useSelectContact(moduleStyle)

// 跳转定位页面
const onClickMapPosition = () => {
  router.push({
    path: '/map-position',
    query: {
      from: 'senderUnfold',
    },
  })
}

// 跳转地址簿页面
const onClickAddressBook = () => {
  Taro.navigateTo({
    url: urlContact('/modules/order-build-sub-pages/order-public/components/business/address-book/page/index', {
      addressType: Address.SENDER_ADDRESS_TYPE,
      pageSource: 'unfold',
    }),
  })
  // router.push({
  //   path: '/address-book',
  //   query: {
  //     addressType: Address.SENDER_ADDRESS_TYPE,
  //     pageSource: 'unfold',
  //   },
  // })
}

const handleClose = () => {
  restrictDataClear()
}

// 定位数据变更切换弹窗
const { setMapPosition } = useMapPosition(moduleStyle)
watch(
  () => piniaStore.extend.senderMapPosition.isSelectItem,
  (flag) => flag && setTimeout(() => setMapPosition(piniaStore.extend.senderMapPosition), SET_MAP_POSITION_DELAY),
  { immediate: false },
)

const switchSendRecvInfoShowVoC = computed(() => piniaStore.globalData.dynamicConfig('switchSendRecvInfoShowVo'))
watch(switchSendRecvInfoShowVoC, () => {
  setSwitchVisibleData()
})

const onClickContact = () => {
  selectContact()
}

onMounted(() => {
  useModuleHotZone()
})

useDidHide(() => {
  // 重置定位地址选中的标识
  piniaStore.extend.updateSenderMapPosition({
    data: {
      isSelectItem: false,
    },
  })
})
useUnload(() => {
  // 重置定位地址选中的标识
  piniaStore.extend.updateSenderMapPosition({
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
