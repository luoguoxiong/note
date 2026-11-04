<template>
  <ky-navbar :leftArrow="true" title="填写收件人信息" v-if="isWxMiniApp"></ky-navbar>
  <div
    class="receive-fill dialog_root_receive"
    :class="{ 'order-common-page-100-vh': orderCommonPageVhShow }"
    id="order-page"
    v-exposure-report="{
      eventCode: 'other_express_receiver_perception_v1',
    }"
  >
    <div class="page">
      <div class="container">
        <!-- 智能识别 -->
        <AddressOcr
          v-if="addressProps?.addressOcrVisible"
          moduleStyle="page"
          :addressType="Address.RECEIVE_PAGE"
          :waybillNumber="routeWaybillNumber"
          @getAddressOcrData="getAddressOcrData"
        />

        <div
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
            :addressVisibleType="addressVisibleType"
            :locationName="locationName"
            :suggestList="suggestList"
            :visibleDropdownMenu="visibleDropdownMenu"
            :visibleDropdownMenuPosition="visibleDropdownMenuPosition"
            :saveAddressFlag="saveAddressFlag"
            :clearStatus="clearStatus"
            :usePage="pageUseAddress.RECEIVEPAGE"
            @onClickMapPosition="onClickMapPosition"
            @onClear="onClearFn"
            @onFocusPerson="onFocusPerson"
            @onBlurPerson="onBlurPerson"
            @onFocusMobile="onFocusMobile"
            @onBlurMobile="onBlurMobile"
            @onBlurTelephone="onBlurTelephone"
            @onClickArea="onClickArea"
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
            @onClickAppAddress="onClickAppAddress"
          >
            <template #detailAddressTips>
              {{ detailAddressTips }}
            </template>
          </AddressUnfold>
        </div>

        <!-- 最近收件地址 -->
        <RecentAddress
          v-if="addressProps?.recentPickupVisible"
          title="最近收件地址"
          :companyNameEdit="addressProps.companyNameConfig.editable"
          :addressType="Address.RECEIVE_ADDRESS_TYPE"
          @onSelect="onSelectRecentAddressFn"
        />
      </div>

      <!-- 确定 -->
      <div class="receive-fill-footer" id="isElementShow">
        <div class="footer__wrap">
          <KyButton text="确定" loading-text="确定" :loading="confirmLoading" @click="onConfirm" />
        </div>
      </div>
    </div>

    <!-- 指定地址弹窗 -->
    <SpecifyAddress
      ref="specifyAddressRef"
      :addressType="AddressType.RECEIVE"
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
      :addressType="Address.RECEIVE"
      :waybillNumber="routeWaybillNumber"
      @onSelect="onSelectDetailAddress"
      @onConfirmDetailAddress="onSelectDetailAddress"
    />
    <PageCommon pageValidateName="receive" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from '@order-public-sub-public/vue-router/index'
import { useStore } from '@order-public-sub-public/store'
import { debounce } from 'lodash-es'
import Taro, { useDidHide, useUnload } from '@tarojs/taro'

// 组件
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'
import AddressUnfold from '@order-public-sub-public/components/ui/address-unfold/index.vue'
import AreaAddress from '@order-global-package-order-sub/components/business/area-address/index.vue'
import DetailAddress from '@order-global-package-order-sub/components/business/detail-address/index.vue'
import SpecifyAddress from '@order-public-sub-public/components/business/specify-address/index.vue'
import RecentAddress from '@order-global-package-order-sub/components/business/recent-address/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import AddressOcr from '@order-global-package-order/components/business/address-ocr/index.vue'
import { SaveAddrRepeatValueEnmu } from '@order-public-sub-public/components/business/address-book/constants'

// 方法
import useValidate from '@order-public-sub-public/hooks/address/receive/useValidate'
import useInitConfig from '@order-public-sub-public/hooks/address/receive/useInitConfig'
import {
  addressBookAdd,
  allAddressCheckLength,
  useSaveAddress,
  orderCommonPageVhShow,
  updateCommonDisabledScroll,
} from '@order-public-sub-public/hooks/address/useCommon'
import { filterAllSpace, getQueryObject } from '@order-public-sub-public/utils'
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
} from '@order-public-sub-public/hooks/address/receive/useFields'
import { useOcrAddress } from '@order-public-sub-public/hooks/address/receive/useOcrAddress'
import { useClear } from '@order-public-sub-public/hooks/address/receive/useClear'
import { useRecentAddress } from '@order-public-sub-public/hooks/address/receive/useRecentAddress'
import { getData } from '@order-public-sub-public/hooks/address/receive/useUpdateData'
import { updateEffectPage } from '@order-public-sub-public/validate/utils'
import useEffect from '@order-public-sub-public/validate'
import { isWxMiniApp, urlContact } from '@/public/utils'
import { useMapPosition } from '@order-public-sub-public/hooks/address/receive/useMapPosition'
import { SET_MAP_POSITION_DELAY } from '@order-public-sub-public/constants/address'

// 类型
import {
  ModuleType,
  Address,
  AddressType,
  pageUseAddress,
  processCacheStrategy,
  SelfSignType,
  CheckBeforeEnterType,
  OrderPageType,
} from '@order-public-sub-public/constants'
import { OrderInfo, SelfSign } from '@order-public-sub-public/types'
import { addReceive } from '../../../batch/batch-add-receive/hooks/utils'
import { clk_express_sender_information_control_v1 } from '../../../address-book/page/report'
import { useSelectContact } from '@order-public-sub-public/components/business/receive/hooks/selectContact'
import { useSelectAppAddress } from '../../hooks/selectAppAddress'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { urlContact } from '@/public/utils'

const piniaStore = useStore()

const router = useRouter()
const route = useRoute()

const { /*remoteCheck,*/ effectBubble } = useEffect()

// 来源标识
const moduleStyle = { moduleStyle: Address.RECEIVE_PAGE }

const { getAppAddress } = useSelectAppAddress(moduleStyle)

// 初始化数据
const { addressProps, addressVisibleType } = useInitConfig(moduleStyle)

// 校验
const { manyValidate } = useValidate()

// 通知
const { trigger } = useTriggerEvents()

// 清空
const { clearStatus, onClear } = useClear(moduleStyle)

// 姓名
const { person, onFocusPerson, onBlurPerson, onInputPerson } = usePerson({
  ...moduleStyle,
  clearStatus: clearStatus,
})

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

const { selectContact } = useSelectContact(moduleStyle)

// 是否保存到地址簿标识
const saveAddressFlag = computed(() => piniaStore.extend.receiveSaveAddressFlag())

const routeWaybillNumber = computed(() => {
  return ''
  // return  router.currentRoute.value.query.waybillNumber as string
})

const onSelectRecentAddressFn = (item) => {
  onSelectRecentAddress(item)
  Taro.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })
}

const { saveAddressValue } = useSaveAddress(Address.RECEIVE_ADDRESS_TYPE)
const onSaveAddress = async (value: boolean) => {
  clk_express_sender_information_control_v1('receive', '保存到地址簿')
  saveAddressValue({ enable: !value })
}

//打开通讯录
const onClickContact = () => {
  selectContact()
}

// 跳转地址簿页面
const onClickAddressBook = () => {
  Taro.navigateTo({
    url: urlContact('/modules/order-build-sub-pages/order-public/components/business/address-book/page/index', {
      addressType: Address.RECEIVE_ADDRESS_TYPE,
      pageSource: 'page',
      cacheStrategy: processCacheStrategy.强制不缓存,
      waybillNumber: route.query?.waybillNumber,
      bookPageFrome: 'edit', // 地址簿页面来源edit: 寄件信息编辑页
    }),
  })
  // router.push({
  //   path: '/address-book',
  //   query: {
  //     addressType: Address.RECEIVE_ADDRESS_TYPE,
  //     pageSource: 'page',
  //     cacheStrategy: processCacheStrategy.强制不缓存,
  //     waybillNumber: route.query?.waybillNumber,
  //     bookPageFrome: 'edit', // 地址簿页面来源edit: 寄件信息编辑页
  //   },
  // })
}

// 校验必填项的所有字段
const allFiledKeyValidate = async () => {
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
  return await manyValidate({ data: params, originalData: getData(), needRemoteCheck: true })
}

// 保存到地址簿
const onSaveToAddressBook = () => {
  if (saveAddressFlag.value) {
    addressBookAdd({
      addressType: Address.RECEIVE_ADDRESS_TYPE,
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

  // 校验本人签收时不允许输入虚拟手机号
  const selfSign = piniaStore.order.moduleFormData(ModuleType.本人签收)?.selfSignFlag === SelfSignType.YES
  if (selfSign && mobile.value && !/^(1[3|4|5|6|7|8|9][0-9]\d{8})$/.test(filterAllSpace(mobile.value))) {
    const validateResult = [{ passed: false, key: 'receive.mobile', content: '使用本人签收需填写真实收件人手机' }]
    await effectBubble(validateResult)
  }

  try {
    confirmLoading.value = true
    const res = await allFiledKeyValidate()
    if (res) {
      umpOtherReport(
        'CLK',
        { eventCode: 'clk_express_receiver_control_v1' },
        { button_name: '确定', request_result: '成功', failure_reason: '' },
      )
      umpOtherReport(
        'OTHER',
        { eventCode: 'exp_other_express_single_received_address_v1' },
        { request_result: '成功', failure_reason: '' },
      )

      // 地址长度需满足11位，不满足返回 false
      const flag = await allAddressCheckLength({ address })

      if (flag) {
        const data = { ...getData(), mobile: filterAllSpace(mobile.value), telephone: filterAllSpace(telephone.value) }
        const query = getQueryObject()
        const orderPageType = piniaStore.root.getOrderPageType
        // 批量识别粘贴板设为收件信息场景
        if (orderPageType === OrderPageType.批量寄 && query?.from === CheckBeforeEnterType.识别粘贴板) {
          await addReceive([{ receive: data } as OrderInfo])
        } else {
          const waybillNumber = piniaStore.root.getCurrentWaybillNumber || ''
          piniaStore.order.updateOrderByType({
            type: ModuleType['收方信息'],
            data,
            waybillNumber,
          })
        }

        router.back()

        // 通知
        trigger(ModuleType['收方信息'], data)

        // 清空副作用标红
        updateEffectPage('order', 'receive')

        // 保存到地址簿
        onSaveToAddressBook()

        // 为了解决气泡插入的问题 特写
        // setTimeout(async () => {
        //   await remoteCheck(`receive.appAgain` as ChangeKeys, { receive: data })
        // }, 1000)
      }
    }
  } catch (error) {
    console.log('error===>', error)
  } finally {
    confirmLoading.value = false
  }
}, 300)

const detailAddressTips = ref()

/**
 * @description: 清空数据和提示语
 * @return {*}
 */
const onClearFn = () => {
  clk_express_sender_information_control_v1('receive', '清空')
  if (confirmLoading.value) {
    console.log('保存数据中，不允许删除数据')
    return
  }

  onClear()
  detailAddressTips.value = ''
}

// 跳转定位页面
const onClickMapPosition = () => {
  clk_express_sender_information_control_v1('receive', '定位')
  router.push({
    path: '/map-position',
    query: {
      from: 'receivePage',
    },
  })
}

// // 设置定位数据
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

const onClickAppAddress = async () => {
  const data = await getAppAddress()
  if (!data) return
  getAddressOcrData(data)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
