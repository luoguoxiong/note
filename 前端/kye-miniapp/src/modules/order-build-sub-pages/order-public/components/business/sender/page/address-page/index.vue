<template>
  <ky-navbar :leftArrow="true" title="填写寄件人信息" v-if="isWxMiniApp"></ky-navbar>
  <view
    id="order-page"
    class="sender-fill dialog_root_sender 222"
    :class="{ 'order-common-page-100-vh': orderCommonPageVhShow }"
    v-exposure-report="{
      eventCode: 'other_express_sender_perception_v1',
    }"
  >
    <Noticebar leftIcon>根据国家法律法规，寄件人姓名须与您提供的实名信息一致</Noticebar>
    <view class="page">
      <view class="container">
        <AddressOcr
          v-if="addressProps?.addressOcrVisible"
          moduleStyle="page"
          :addressType="Address.SENDER_PAGE"
          @getAddressOcrData="getAddressOcrData"
          :waybillNumber="ocrWaybillNumber"
        />

        <view
          class="container__info"
          :class="{ 'margin-style': addressProps?.addressOcrVisible, 'padding-style': !addressProps.saveAddress }"
        >
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
            :locationName="locationName"
            :addressVisibleType="addressVisibleType"
            :suggestList="suggestList"
            :visibleDropdownMenu="visibleDropdownMenu"
            :visibleDropdownMenuPosition="visibleDropdownMenuPosition"
            :saveAddressFlag="saveAddressFlag"
            :clearStatus="sendClearStatus"
            :showPickup="showPickup.visible || false"
            :usePage="pageUseAddress.SENDERPAGE"
            :disabledAddressItemKey="addressProps.disabledAddressItem?.key"
            @onClear="onClearFn"
            @onFocusPerson="onFocusPerson"
            @onBlurPerson="onBlurPerson"
            @onFocusMobile="onFocusMobile"
            @onBlurMobile="onBlurMobile"
            @onBlurTelephone="onBlurTelephone"
            @onClickArea="onClickArea"
            @onClickMapPosition="onClickMapPosition"
            @onClickDetailAddress="onClickDetailAddress"
            @onClickSpecifyAddress="onClickSpecifyAddress"
            @onClickAddressBook="onClickAddressBook"
            @onBlurCompanyName="onBlurCompanyName"
            @onSaveAddress="onSaveAddress"
            @onClickContact="onClickContact"
            @selectSuggest="selectSuggest"
            @onCloseDropdownMenu="closeDropdownMenu"
            @update:person="onInputPerson"
            @update:mobile="onInputMobile"
            @onFocusTelephone="onFocusTelephone"
            @update:telephone="onInputTelephone"
            @onFocusExtension="onFocusExtension"
            @onBlurExtension="onBlurExtension"
            @update:extension="onInputExtension"
            @update:companyName="onInputCompanyName"
          >
            <template #detailAddressTips> {{ detailAddressTips }}</template>
          </AddressUnfold>
        </view>

        <!-- 最近寄件地址 -->
        <RecentAddress
          v-if="addressProps.recentPickupVisible"
          :companyNameEdit="addressProps.companyNameConfig.editable"
          :addressType="Address.SENDER_ADDRESS_TYPE"
          @onSelect="onSelectRecentAddressFn"
        />
      </view>

      <!-- 确定 -->
      <view class="sender-fill-footer" id="isElementShow">
        <view class="footer__wrap">
          <KyButton text="确定" loading-text="确定" :loading="confirmLoading" @click="onConfirm" />
        </view>
      </view>
    </view>

    <!-- 指定地址弹窗 -->
    <SpecifyAddress
      ref="specifyAddressRef"
      :addressType="AddressType.SENDER"
      :addressVisibleType="addressVisibleType"
      :fieldsConfigType="addressProps.fieldsConfigType"
      :recommendByUserLocation="addressProps.recommendByUserLocation"
      @onSelect="onSelectSpecifyAddress"
    />

    <!-- 省市区选择弹窗 -->
    <AreaAddress ref="areaRef" @onSelectSearchItem="onConfirmAreaAddress" @onConfirm="onConfirmAreaAddress" />

    <!-- 详情地址选择弹窗 -->
    <DetailAddress
      ref="detailAddressRef"
      :area="area"
      :addressType="Address.SENDER"
      @onSelect="onSelectDetailAddress"
      @onConfirmDetailAddress="onSelectDetailAddress"
    />
    <PageCommon pageValidateName="sender" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from '@order-public-sub-public/vue-router/index'
import Taro, { useDidHide, useUnload } from '@tarojs/taro'
import { debounce } from 'lodash-es'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'

// 组件
import AddressUnfold from '@order-public-sub-public/components/ui/address-unfold/index.vue'
import AreaAddress from '@order-global-package-order-sub/components/business/area-address/index.vue'
import DetailAddress from '@order-global-package-order-sub/components/business/detail-address/index.vue'
import SpecifyAddress from '@order-public-sub-public/components/business/specify-address/index.vue'
import RecentAddress from '@order-global-package-order-sub/components/business/recent-address/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import AddressOcr from '@order-global-package-order/components/business/address-ocr/index.vue'
import Noticebar from '@order-public-sub-public/components/base/ky-noticebar/noticebar.vue'

// 方法
import useInitConfig from '@order-public-sub-public/hooks/address/sender/useInitConfig'
import useValidate from '@order-public-sub-public/hooks/address/sender/useValidate'
import {
  addressBookAdd,
  allAddressCheckLength,
  useSaveAddress,
  orderCommonPageVhShow,
} from '@order-public-sub-public/hooks/address/useCommon'
import { filterAllSpace } from '@order-public-sub-public/utils'
import { useTriggerEvents } from '@order-public-sub-public/hooks/useTriggerEvents'
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
import { useClear } from '@order-public-sub-public/hooks/address/sender/useClear'
import { useOcrAddress } from '@order-public-sub-public/hooks/address/sender/useOcrAddress'
import { useRecentAddress } from '@order-public-sub-public/hooks/address/sender/useRecentAddress'
import { useMapPosition } from '@order-public-sub-public/hooks/address/sender/useMapPosition'
import { getData } from '@order-public-sub-public/hooks/address/sender/useUpdateData'
import { updateEffectPage } from '@order-public-sub-public/validate/utils'
import { showRealNameGuide } from '@order-public-sub-public/components/ui/person-name-guide/hooks/useState'
import { isWxMiniApp, urlContact } from '@/public/utils'
import { SET_MAP_POSITION_DELAY } from '@order-public-sub-public/constants/address'

// 类型
import {
  ModuleType,
  Address,
  AddressType,
  pageUseAddress,
  processCacheStrategy,
  OrderPageType,
} from '@order-public-sub-public/constants'
import {
  clk_express_sender_information_control_v1,
  clk_express_single_choise_v1,
} from '../../../address-book/page/report'
import { Module } from '@order-public-sub-public/types'
import { SaveAddrRepeatValueEnmu } from '@order-public-sub-public/components/business/address-book/constants'
import { useSelectContact } from '@order-public-sub-public/components/business/sender/hooks/selectContact'
import { useStore } from '@order-public-sub-public/store'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

const piniaStore = useStore()
const route = useRoute()
const router = useRouter()

// 来源标记
const moduleStyle = { moduleStyle: Address.SENDER_PAGE }

// 初始化
const { addressProps, addressVisibleType } = useInitConfig(moduleStyle)

// 校验
const { manyValidate } = useValidate()

// 通知
const { trigger } = useTriggerEvents()

// 清空
const { clearStatus, onClear } = useClear(moduleStyle)

// 姓名
const { person, onFocusPerson, onBlurPerson, onInputPerson } = usePerson({ ...moduleStyle, clearStatus: clearStatus })

// 手机号
const { mobile, onFocusMobile, onBlurMobile, onInputMobile } = useMobile({ ...moduleStyle, clearStatus: clearStatus })

// 姓名和手机号联想
const { suggestList, selectSuggest, closeDropdownMenu, visibleDropdownMenu, visibleDropdownMenuPosition } =
  useSuggestData(moduleStyle)

// 固定电话和分机号
const {
  telephone,
  extension,
  onBlurTelephone,
  onFocusTelephone,
  onInputTelephone,
  onFocusExtension,
  onBlurExtension,
  onInputExtension,
} = useTelephone(moduleStyle)

// 公司名称
const { companyName, onBlurCompanyName, onInputCompanyName } = useCompanyName(moduleStyle)

// 省市区
const { area, province, city, county, onClickArea, areaRef, onConfirmAreaAddress } = useArea(moduleStyle)

// 详情地址
const { detailAddress, detailAddressRef, onClickDetailAddress, onSelectDetailAddress } = useDetailAddress(moduleStyle)

// 指定地址
const { locationName, specifyAddress, specifyAddressRef, onSelectSpecifyAddress, onClickSpecifyAddress } =
  useSpecifyAddress(moduleStyle)

// 智能识别
const { getAddressOcrData } = useOcrAddress(moduleStyle)

// 选中最近地址
const { onSelectRecentAddress } = useRecentAddress(moduleStyle)

// 是否保存到地址簿标识
const saveAddressFlag = computed(() => piniaStore.extend.senderSaveAddressFlag())
const { saveAddressValue } = useSaveAddress(Address.SENDER_ADDRESS_TYPE)
const onSaveAddress = async (value: boolean) => {
  clk_express_sender_information_control_v1('sender', '保存到地址簿')
  saveAddressValue({ enable: !value })
}
const { selectContact } = useSelectContact(moduleStyle, clearStatus)
const onClickContact = () => {
  selectContact()
}

//显示委托取货
const showPickup = computed(() => {
  return piniaStore.schema.moduleConfigData(ModuleType['取货资料'], true)
})

const sendClearStatus = computed(() => {
  const orderPageType = piniaStore.root.getOrderPageType
  return clearStatus.value && orderPageType !== OrderPageType.返程单
})

const onSelectRecentAddressFn = (item) => {
  onSelectRecentAddress(item)
  Taro.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })
}

const ocrWaybillNumber = computed(() => {
  const orderPageType = piniaStore.root.getOrderPageType
  if (orderPageType === OrderPageType.批量寄) {
    return piniaStore.order.batchWaybillInfoList?.[0]?.waybillNumber
  } else {
    return ''
  }
})
// 跳转定位页面
const onClickMapPosition = () => {
  clk_express_sender_information_control_v1('sender', '定位')
  router.push({
    path: '/map-position',
    query: {
      from: 'senderPage',
    },
  })
}

// 跳转地址簿页面
const onClickAddressBook = () => {
  clk_express_single_choise_v1('sender.sender', 'methods')
  Taro.navigateTo({
    url: urlContact('/modules/order-build-sub-pages/order-public/components/business/address-book/page/index', {
      addressType: Address.SENDER_ADDRESS_TYPE,
      pageSource: 'page',
      bookPageFrome: 'edit', // 地址簿页面来源edit: 寄件信息编辑页
      cacheStrategy: processCacheStrategy.强制不缓存,
    }),
  })
  // router.push({
  //   path: '/address-book',
  //   query: {
  //     addressType: Address.SENDER_ADDRESS_TYPE,
  //     pageSource: 'page',
  //     bookPageFrome: 'edit', // 地址簿页面来源edit: 寄件信息编辑页
  //     cacheStrategy: processCacheStrategy.强制不缓存,
  //   },
  // })
}

// 校验必填项的所有字段
const allFiledKeyValidate = async (needRemoteCheck = true) => {
  const params = [
    {
      required: addressProps.value.personConfig.required,
      value: person.value,
      fieldKey: 'person',
    },
    {
      required: addressProps.value.mobileConfig.required,
      value: filterAllSpace(mobile.value),
      fieldKey: 'mobile',
    },
    {
      required: addressProps.value.telephoneConfig.required,
      value: telephone.value,
      fieldKey: 'telephone',
    },
    {
      required: addressProps.value.companyNameConfig.required,
      value: companyName.value,
      fieldKey: 'companyName',
    },
    {
      required: addressProps.value.addressConfig.required,
      value: area.value,
      fieldKey: 'address',
    },
    {
      required: addressProps.value.addressConfig.required,
      value: detailAddress.value,
      fieldKey: 'detailAddress',
    },
  ].filter((i) => i.required || i.value)
  return await manyValidate({ data: params, originalData: getData(), needRemoteCheck: needRemoteCheck })
}

// 保存到地址簿
const onSaveToAddressBook = () => {
  if (saveAddressFlag.value) {
    addressBookAdd({
      addressType: Address.SENDER_ADDRESS_TYPE,
      params: {
        person: person.value,
        mobile: mobile.value,
        companyName: companyName.value,
        province: province.value,
        city: city.value,
        county: county.value,
        detailAddress: detailAddress.value,
        telephone: telephone.value,
        extension: extension.value,
        onlyMdRepeatValue: SaveAddrRepeatValueEnmu.不弹层不保存地址,
      },
    })
  }
}

/**
 * 确定
 */
const confirmLoading = ref(false)
const onConfirm = debounce(async () => {
  const address = `${area.value?.join('')}${detailAddress.value}`

  try {
    // 回填前先关闭实名认证
    showRealNameGuide.value = false

    confirmLoading.value = true
    const res = await allFiledKeyValidate()
    if (res) {
      umpOtherReport(
        'CLK',
        { eventCode: 'clk_express_sender_control_v1' },
        { button_name: '确定', request_result: '成功', failure_reason: '' },
      )
      umpOtherReport(
        'OTHER',
        { eventCode: 'exp_other_express_single_sender_address_v1' },
        { request_result: '成功', failure_reason: '' },
      )
      // 地址长度需满足11位，不满足返回 false
      const flag = await allAddressCheckLength({ address })

      if (flag) {
        const data = { ...getData(), mobile: filterAllSpace(mobile.value) }
        piniaStore.order.updateOrderByType({ type: ModuleType['寄方信息'], data })

        if (route.query?.isValid) {
          router.back(2)
        } else {
          router.back()
        }

        // 通知
        trigger(ModuleType['寄方信息'], data)

        // 清空副作用标红
        updateEffectPage('order', 'sender')

        // 保存到地址簿
        onSaveToAddressBook()
      }
    }
  } catch (error) {
    console.log('error===>', error)
  } finally {
    confirmLoading.value = false
  }
}, 500)

const initCheck = () => {
  if (!person.value) {
    return
  }
  allFiledKeyValidate(false)
}

onMounted(() => {
  initCheck()
})
// 设置定位数据
const { setMapPosition } = useMapPosition(moduleStyle)
watch(
  () => piniaStore.extend.senderMapPosition.isSelectItem,
  (flag) => flag && setTimeout(() => setMapPosition(piniaStore.extend.senderMapPosition), SET_MAP_POSITION_DELAY),
  { immediate: true },
)

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

const detailAddressTips = ref()

/**
 * @description: 清空数据和提示语
 * @return {*}
 */
const onClearFn = () => {
  clk_express_sender_information_control_v1('sender', '清空')
  if (confirmLoading.value) {
    console.log('保存数据中，不允许删除数据')
    return
  }

  onClear()
  detailAddressTips.value = ''
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
