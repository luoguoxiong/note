<template>
  <div class="address-book-sender dialog_root_book_sender" id="order-page" @click="clickParent">
    <!-- <ky-navbar :leftArrow="true" :title="title" v-if="isWxMiniApp"></ky-navbar> -->
    <!-- 页面 -->
    <div class="page">
      <!-- <div class="address-book-sender-header font-level4 flex">
        <SvgIcon name="tips-warn" :style="{ fontSize: 16 }"></SvgIcon>
        <div class="ml-8">根据国家法律法规，寄件人姓名须与您提供的实名信息一致</div>
      </div> -->
      <Noticebar leftIcon>根据国家法律法规，寄件人姓名须与您提供的实名信息一致</Noticebar>
      <div class="container" :class="{ 'extra-style': !clearStatus }">
        <!-- 智能识别 -->
        <AddressOcr
          moduleStyle="page"
          :addressType="Address.SENDER_ADDRESS_TYPE"
          @getAddressOcrData="getAddressOcrData"
        />

        <!-- 信息内容 -->
        <div class="container__info padding-style">
          <AddressUnfold
            v-bind="addressProps"
            :person="person"
            :mobile="mobile"
            :telephone="telephone"
            :extension="extension"
            :companyName="companyName"
            :area="area"
            :detailAddress="detailAddress"
            :suggestList="suggestList"
            :selectLabel="selectLabel"
            :visibleDropdownMenu="visibleDropdownMenu"
            :visibleDropdownMenuPosition="visibleDropdownMenuPosition"
            :clearStatus="clearStatus"
            :usePage="pageUseAddress.ADDRESSBOOKSENDER"
            :defaultFlag="defaultFlag"
            :showSetDefault="true"
            @onClear="onClearFn"
            @onFocusPerson="onFocusPerson"
            @onBlurPerson="onBlurPerson"
            @onFocusMobile="onFocusMobile"
            @onBlurMobile="onBlurMobile"
            @onBlurTelephone="onBlurTelephone"
            @onChooseLabel="onChooseLabel"
            @onClickArea="onClickArea"
            @onClickMapPosition="onClickMapPosition"
            @onClickDetailAddress="onClickDetailAddress"
            @onBlurCompanyName="onBlurCompanyName"
            @selectSuggest="onSelectSuggest"
            @onClickContact="onClickContact"
            @onClickAppAddress="onClickAppAddress"
            @onCloseDropdownMenu="closeDropdownMenu"
            @update:person="onInputPerson"
            @update:mobile="onInputMobile"
            @update:telephone="onInputTelephone"
            @update:extension="onInputExtension"
            @update:companyName="onInputCompanyName"
            @onDefaultFlag="onDefaultFlag"
          >
            <!-- 地址提示 -->
            <template #detailAddressTips> {{ detailAddressTips }} </template>
          </AddressUnfold>
        </div>
      </div>

      <!-- 确定 -->
      <div class="address-book-sender-footer" id="isElementShow">
        <div class="footer__wrap">
          <KyReport
            v-if="isShowGoOrder"
            :eventParams="
              exp_express_single_sender_address_book_send_button_v1(parentAddressType as unknown as AddressType)
            "
          ></KyReport>
          <!-- TODO 判断来源: 快速寄件/批量下单 -->
          <KyButton
            v-if="isShowGoOrder"
            class="btn go-order"
            text="保存并寄件"
            plain
            loading-text="保存并寄件"
            loadingType="plain"
            :loading="loadingMap.goOrderLoading"
            @click="onConfirm(LoadingType.去寄件, true)"
          />
          <KyButton
            class="btn confirm"
            text="保存"
            loading-text="保存"
            :loading="loadingMap.confirmLoading"
            @click="onConfirm(LoadingType.保存, true)"
          />
        </div>
      </div>
    </div>

    <!-- 省市区选择弹窗 -->
    <AreaAddress ref="areaRef" @onSelectSearchItem="onConfirmAreaAddress" @onConfirm="onConfirmAreaAddress" />

    <DetailAddress
      ref="detailAddressRef"
      :area="area"
      :addressType="Address.SENDER"
      @onSelect="onSelectDetailAddress"
      @onConfirmDetailAddress="onSelectDetailAddress"
    />
    <PageCommon pageValidateName="sender" />

    <!-- 地址校正温馨提示弹窗 -->
    <AddressCorrectionDialog
      v-model:show="correctionDialogVisible"
      type="sender"
      :currentAddress="currentAddress"
      :suggestedAddress="suggestedAddress"
      @confirm="onCorrectionConfirm"
      @cancel="onCorrectionCancel"
    />
  </div>
</template>

<script setup lang="ts">
import KyReport from '@order-public-sub-public/components/base/ky-report/index.vue'

import { ref, watch, computed } from 'vue'
import { useRoute, useRouter, LocationQueryValue } from '@order-public-sub-public/vue-router/index'
import Taro, { useDidHide, useLoad, useUnload, useDidShow } from '@tarojs/taro'
import { useStore } from '@order-public-sub-public/store'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import Noticebar from '@order-public-sub-public/components/base/ky-noticebar/noticebar.vue'

// 组件
import AddressUnfold from '@order-public-sub-public/components/ui/address-unfold/index.vue'
import AreaAddress from '@order-global-package-order-sub/components/business/area-address/index.vue'
import DetailAddress from '@order-global-package-order-sub/components/business/detail-address/index.vue'
import KyButton from '@order-global-package-order-sub/components/base/ky-button/index.vue'
import AddressOcr from '@order-global-package-order-sub/components/business/address-ocr/index.vue'
import AddressCorrectionDialog from '@order-public-sub-public/components/business/address-correction/dialog/index.vue'
// 方法
import { updateAddress } from '@order-public-sub-public/apis/address'
import { useCompleteAddress } from '@order-public-sub-public/components/business/address-correction/hooks/useCompleteAddress'
import { buildCompleteAddressParams } from '@order-public-sub-public/components/business/address-correction/utils'
import useValidate from '@order-public-sub-public/hooks/address/sender/useValidate'
import {
  addressBookAdd,
  allAddressCheckLength,
  hasAddressValue,
  sameAddressNotice,
} from '@order-public-sub-public/hooks/address/useCommon'
import { filterAllSpace, getQueryObject, getValueOrEmpty } from '@order-public-sub-public/utils'
import { globalEventBus } from '@/public/hooks/useEventBus'
import { useInitConfig } from '@order-public-sub-public/components/business/address-book/sender/hooks/useInitConfig'
import {
  getData,
  setStoreValue,
} from '@order-public-sub-public/components/business/address-book/sender/hooks/useUpdateData'
import {
  useArea,
  useLabel,
  useCompanyName,
  useDetailAddress,
  useMobile,
  usePerson,
  useSuggestData,
  useTelephone,
} from './hooks/useFields'
import { useClear } from './hooks/useClear'
import { useMapPosition } from './hooks/useMapPosition'
import { useInit } from './hooks/useInit'
import { addrRepeatPopExpReport, addrRepeatPopClickReport, setDefaultFlagReport } from '../report/index'

// 类型
import {
  Address,
  AddressType,
  AddressValue,
  ModuleStyle,
  ModuleType,
  OrderPageType,
  UpdateAddressStatus,
  pageUseAddress,
} from '@order-public-sub-public/constants'
import { debounce } from 'lodash-es'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'
import { ChangeKeys, Delivery } from '@order-public-sub-public/types'
import useEffect from '@order-public-sub-public/validate'
import { sleep } from '@order-global-package-order-sub/utils/sleep'
import { isInitAddressFlag, isNetworkQueryAddress } from '@order-public-sub-public/hooks/useGlobalVariable'
import {
  clk_express_single_sender_address_book_send_button_v1,
  exp_express_single_sender_address_book_send_button_v1,
  clk_express_sender_control_v1,
} from '../page/report'
import { needResetTabIndex } from '../page/hooks/useCommon'
import { batchSelectList } from '../page/hooks/useState'
import { repeatAddrDialog, SaveAddrRepeatValueEnmu } from '../constants'
import { getContactData } from '@order-public-sub-public/components/business/receive/hooks/selectContact'
import { closeTippy, removeErrClassByDataValidate } from '@order-public-sub-public/validate/effect/effectBubble'
import {
  CompleteNeedFlag,
  CompleteAddressSceneType,
  SET_MAP_POSITION_DELAY,
} from '@order-public-sub-public/constants/address'
import { useSelectAppAddress } from '@order-public-sub-public/components/business/receive/hooks/selectAppAddress'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'

const piniaStore = useStore()

const router = useRouter()
const route = useRoute()
const { removeValidateKeyByType } = globalUseValidate()

enum LoadingType {
  保存 = 'confirmLoading',
  去寄件 = 'goOrderLoading',
}

const curLoadingType = ref<LoadingType>(LoadingType.保存)

const loadingMap = ref<Record<LoadingType, boolean>>({
  confirmLoading: false,
  goOrderLoading: false,
})

// 路由参数
const { addressType, operateType, parentAddressType } = route.query || {}
const { manyValidate } = useValidate()
const { addressProps } = useInitConfig()

// 数据初始化
useInit(addressType as string)

// 清空
const { clearStatus, onClear } = useClear()

// 姓名
const { person, onFocusPerson, onBlurPerson, onInputPerson } = usePerson(clearStatus)

// 手机号
const { mobile, onFocusMobile, onBlurMobile, onInputMobile } = useMobile(clearStatus)

// 姓名和手机号联想
const { suggestList, selectSuggest, closeDropdownMenu, visibleDropdownMenu, visibleDropdownMenuPosition } =
  useSuggestData()

// 固定电话
const { telephone, extension, onBlurTelephone, onInputTelephone, onInputExtension } = useTelephone()

// 公司名称
const { companyName, onBlurCompanyName, onInputCompanyName } = useCompanyName()

// 省市区
const { area, areaRef, onClickArea, onConfirmAreaAddress } = useArea()

// 标签的数据
const { selectLabel, onChooseLabel } = useLabel()

const { getAppAddress } = useSelectAppAddress({ moduleStyle: Address.SENDER_ADDRESS_TYPE })

// 详细地址
const { detailAddress, detailAddressRef, onClickDetailAddress, onSelectDetailAddress } = useDetailAddress()
const curOrderPageType = computed(() => piniaStore.root.getOrderPageType)

const defaultFlag = ref(getData.value.defaultFlag)
const onDefaultFlag = (value: boolean) => {
  defaultFlag.value = !value
  setDefaultFlagReport()
}

const isShowGoOrder = computed(() => {
  const action = route.query?.action
  const pageSource = route.query?.pageSource
  return (
    action !== 'batch-add' &&
    !isNetworkQueryAddress.value &&
    !isInitAddressFlag.value &&
    curOrderPageType.value !== OrderPageType.返程单 &&
    pageSource !== 'receipter'
  )
})

const clickParent = () => {
  if (visibleDropdownMenu.value) {
    closeDropdownMenu()
  }
}

/* 筛选建议 */
const onSelectSuggest = async (item) => {
  delete item.id
  selectSuggest(item)
  await allFiledKeyValidate()
}

// 智能识别
const getAddressOcrData = async (item: AddressValue) => {
  const data = {
    person: item?.person || person.value,
    mobile: item?.mobile || mobile.value,
    telephone: item?.telephone || telephone.value,
    extension: item?.extension || extension.value,
    companyName: item?.companyName || companyName.value,
    province: getData.value.province,
    city: getData.value.city,
    county: getData.value.county,
    detailAddress: detailAddress.value,
  }

  if (hasAddressValue(item)) {
    data.province = getValueOrEmpty(item.province)
    data.city = getValueOrEmpty(item.city)
    data.county = getValueOrEmpty(item.county)
    data.detailAddress = getValueOrEmpty(item.detailAddress)
  }

  // 公司名不可编辑时，去除识别的值
  if (!addressProps.value.companyNameConfig.editable) {
    Reflect.deleteProperty(data, 'companyName')
  }

  setStoreValue(data)
  await allFiledKeyValidate()
}

// 跳转定位页面
const onClickMapPosition = debounce(() => {
  Taro.navigateTo({
    url: `/modules/order-build-sub-pages/order-public/components/business/map-position/page/index?from=senderAddressBook`,
  })
}, 500)

//  是否需要隐藏保存二次弹窗的逻辑
const isHideRepeatPop = computed(() => {
  // 如果是批量下单 需要隐藏
  const action = route.query?.action
  return action === 'batch-add'
})

const confirmButtonText = computed(() => {
  // 如果是从个人中心地址簿进来的
  return isInitAddressFlag.value ? '我知道了' : '去下单'
})

/**
 * 新增地址簿数据
 */
const onSaveToAddressBook = async (isFirst: boolean) => {
  try {
    const onlyMdRepeatValue = isFirst ? SaveAddrRepeatValueEnmu.弹层不保存地址 : SaveAddrRepeatValueEnmu.不弹层保存地址
    const params = {
      person: person.value,
      mobile: filterAllSpace(mobile.value),
      telephone: telephone.value,
      extension: extension.value,
      companyName: companyName.value,
      province: getData.value.province,
      city: getData.value.city,
      county: getData.value.county,
      detailAddress: detailAddress.value,
      addressLabelCode: selectLabel.value || undefined,
      onlyMdRepeatValue,
      defaultFlag: defaultFlag.value,
    }
    const data = await addressBookAdd({
      addressType: Address.SENDER_ADDRESS_TYPE,
      params: params,
      toast: true,
      isFirst,
    })

    let isShowToast = true

    // onlyMdRepeatFlag 为true表示有重复地址 需要弹窗
    if (data && data.onlyMdRepeatFlag && isFirst) {
      addrRepeatPopExpReport()
      let bool = await repeatAddrDialog({
        confirmButtonText: confirmButtonText.value,
      })
      addrRepeatPopClickReport(bool ? confirmButtonText.value : '继续保存')
      // true 去下单； false 继续保存
      // // 如果点击的是下单并寄件 两个按钮都要跳转到下单
      if (!bool) {
        onSaveToAddressBook(false)
        return
      } else {
        // 如果是从个人中心地址簿进来的 文案是我知道了，不能跳转到下单页面
        if (isInitAddressFlag.value) return
        // 如果点击的是去下单，需要跳转到下单页
        curLoadingType.value = LoadingType.去寄件
        isShowToast = false
      }
    }

    // isShowToast && showToast('新增成功')

    // 存刚刚新增的标识
    if (data?.id) {
      piniaStore.extend.updateSenderAddressBookJustAddedFlag({ data: data.id })
      isShowToast && (await sleep(500))
      await goBack(params)
    }
  } catch (error) {
    console.log('error===>', error)
  }
}

// const setBatchReceiveAddress = async (params: Partial<AddressValue>) => {
//   const { waybillNumber = '', pageSource = '' } = getQueryObject()
//   const { remoteCheck } = useEffect()
//   await remoteCheck('receive', { receive: params }, undefined, undefined, undefined, pageSource, waybillNumber)
//   const receiveData = piniaStore.order.moduleFormData(ModuleType['收方信息'], waybillNumber) || ''
//   piniaStore.order.updateOrderByType({
//     type: ModuleType['收方信息'],
//     data: { ...receiveData, ...params },
//     waybillNumber,
//   })
// }

/**
 * @description 通过 globalEventBus 触发新事件，主包监听方收到后仅执行 setAddressBookEditValue 写回 store
 * 内部根据 parentAddressType（进入地址簿时入口的地址类型）判断寄/收，与主包 useUpdateFunc 的 addressType 映射逻辑保持一致
 * 进入来源（editFrom）决定事件名：page=独立填写页（address-page）走 *AddressBookEditConfirm；order/缺省=订单页（block/unfold）走 *AddressBookOrderEditConfirm，
 * 两场景拆分事件名，避免页面栈中订单页组件与独立填写页同时存活时重复响应
 * @param data 编辑的地址数据
 */
const emitAddressBookConfirm = (data: any): boolean => {
  const flag = parentAddressType === Address.SENDER_ADDRESS_TYPE
  // 参考列表页：返单/运费时效来源走专用事件，由本函数自行跨两层返回（编辑页 → 列表页 → 来源页）
  if (route.query.pageSource === 'receipter') {
    globalEventBus.emit('ReceipterAddressBookEvent', {
      ...data,
    })
    router.back(2)
    return true
  }
  if (route.query.pageSource === 'freight-time') {
    globalEventBus.emit('FreightTimeAddressBookEvent', {
      ...data,
      addressType: parentAddressType,
    })
    router.back(2)
    return true
  }
  const isFromAddressPage = route.query?.editFrom === 'page'
  // 事件名拼接场景后缀（orderPageType：order=去程单 / order-back=返程单），与主包监听方同源，避免页面栈中共存页面的重复响应
  const eventName =
    (isFromAddressPage
      ? flag
        ? 'SenderAddressBookEditConfirm'
        : 'ReceiveAddressBookEditConfirm'
      : flag
        ? 'SenderAddressBookOrderEditConfirm'
        : 'ReceiveAddressBookOrderEditConfirm') + `_${curOrderPageType.value}`
  globalEventBus.emit(eventName, {
    addressType: flag ? AddressType.SENDER : AddressType.RECEIVE,
    moduleStyle: flag ? Address.SENDER : Address.RECEIVE,
    item: data,
  })
  return false
}

const setReceiveAddress = async (params: Partial<AddressValue>) => {
  const receiveData = {
    ...piniaStore.order.moduleFormData(ModuleType['收方信息']),
    ...params,
  }
  // 参考主包逻辑：返回前先执行一次过程中校验（ModuleStyle.跳转 + 强制不缓存）
  const { remoteCheck } = useEffect()
  await remoteCheck('receive' as ChangeKeys, { receive: receiveData }, ModuleStyle.跳转)
  return emitAddressBookConfirm(receiveData)
}

const setSenderAddress = async (params: Partial<AddressValue>) => {
  const senderData = {
    ...piniaStore.order.moduleFormData(ModuleType['寄方信息']),
    ...params,
  }
  // 参考主包逻辑：返回前先执行一次过程中校验（ModuleStyle.跳转 + 强制不缓存）
  const { remoteCheck } = useEffect()
  await remoteCheck('sender' as ChangeKeys, { sender: senderData }, ModuleStyle.跳转)
  return emitAddressBookConfirm(senderData)
}

const hasReset = ref(false)
const goBack = async (params: Partial<Delivery>) => {
  if (hasReset.value) return
  if (curLoadingType.value === LoadingType.保存) {
    hasReset.value = true
    router.back()
    return
  }

  // 根据parentAddressType区分来源是寄件还是收件，地址数据通过 globalEventBus 交给主包监听方写回 store，页面返回由本页自行处理
  // 返单/运费时效来源已在 emitAddressBookConfirm 内 emit 并自行返回，此处跳过后续 back
  if (parentAddressType === Address.SENDER_ADDRESS_TYPE) {
    if (await setSenderAddress(params)) return
  }

  if (parentAddressType === Address.RECEIVE_ADDRESS_TYPE) {
    if (await setReceiveAddress(params)) return
  }

  const { bookPageFrome } = route.query
  const historyIndex = bookPageFrome === 'edit' ? 3 : 2
  hasReset.value = true
  router.back(historyIndex)
  needResetTabIndex.value = true
}

useLoad(() => {
  hasReset.value = false
  // 从首页或者填单页进来，需要重置tabs下标
  if (operateType === 'add') {
    Taro.setNavigationBarTitle({ title: '新增寄件地址' })
  } else {
    Taro.setNavigationBarTitle({ title: '编辑寄件地址' })
  }
})
const updateDocumentTitle = () => {
  if (operateType === 'add') {
    document.title = '新增寄件地址'
  } else {
    document.title = '编辑寄件地址'
  }
}
useDidShow(() => {
  updateDocumentTitle()
})
/**
 * @description 地址编辑重复时，使用该地址下单处理函数
 * @param data
 */
const handleSameAddress = async (
  data: Partial<Delivery> & { addressType: LocationQueryValue | LocationQueryValue[] },
) => {
  try {
    await sameAddressNotice()
    // 数据写回交给主包监听方处理，本页自行返回；返单/运费时效来源已在 emit 内自行返回
    if (emitAddressBookConfirm(data)) return
    router.back(2)
  } catch (error) {
    if (error === false) {
      router.back()
    }
  }
}

/**
 * 编辑地址簿数据
 */
const addressBookEdit = async (isFirst: boolean) => {
  try {
    let onlyMdRepeatValue
    if (!isHideRepeatPop.value) {
      onlyMdRepeatValue = isFirst ? SaveAddrRepeatValueEnmu.弹层不保存地址 : SaveAddrRepeatValueEnmu.不弹层保存地址
    }
    const params = {
      addressType,
      id: getData.value.id,
      person: person.value,
      mobile: filterAllSpace(mobile.value),
      telephone: telephone.value,
      extension: extension.value,
      companyName: companyName.value,
      province: getData.value.province,
      city: getData.value.city,
      county: getData.value.county,
      detailAddress: getData.value.detailAddress,
      labelCode: selectLabel.value || undefined,
      remark: getData.value.remark || '',
      onlyMdRepeatValue,
      defaultFlag: defaultFlag.value,
    }
    const { data } = await updateAddress(params)
    if (data?.status === UpdateAddressStatus.重复地址) {
      params.addressType = parentAddressType
      await handleSameAddress(params)
    } else {
      let isShowToast = true
      if (data?.status === UpdateAddressStatus.公司地址簿已存在 && !isHideRepeatPop.value) {
        addrRepeatPopExpReport()
        let bool = await repeatAddrDialog({
          confirmButtonText: confirmButtonText.value,
        })
        addrRepeatPopClickReport(bool ? confirmButtonText.value : '继续保存')
        // true 去下单； false 继续保存
        // // 如果点击的是下单并寄件 两个按钮都要跳转到下单
        if (!bool) {
          addressBookEdit(false)
          return
        } else {
          if (isInitAddressFlag.value) return
          // 如果点击的是去下单，需要跳转到下单页
          curLoadingType.value = LoadingType.去寄件
          isShowToast = false
        }
      }
      isShowToast && showToast('保存成功')
      const index = batchSelectList.value.findIndex((item) => item.id === params.id)
      if (index !== -1) {
        batchSelectList.value[index] = { ...batchSelectList.value[index], ...params }
      }
      isShowToast && (await sleep(500))
      await goBack(params)
    }
  } catch (error) {
    console.log(error)
  }
}

// 校验必填项的所有字段
const allFiledKeyValidate = async () => {
  const data = [
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
  // 如果没有手机号 并且没有固话 则加一个手机号的校验: 二选一的提示。文案提示则是又后面rule去控制
  // 存在手机号必填 但是没写的提示 所以必填文案有2种形式
  return await manyValidate({ data, originalData: getData.value, needRemoteCheck: true })
}

const onClickContact = async () => {
  const { isMobile, phone, person } = await getContactData()
  closeTippy()
  if (person) {
    onInputPerson(person)
    removeErrClassByDataValidate('sender.person')
    onBlurPerson({ required: true })
  }
  if (!phone) {
    return
  }
  if (isMobile) {
    onInputMobile(phone)
    removeErrClassByDataValidate('sender.mobile')
    return
  }
  onInputTelephone(phone)
  onInputExtension('')
  removeErrClassByDataValidate('sender.telephone')
}

//选择微信的收获地址
const onClickAppAddress = async () => {
  const data = await getAppAddress()
  if (!data) return
  getAddressOcrData(data)
}
/**
 * 确定
 */
const onConfirm = debounce(async (loadingType: LoadingType, isFirst: boolean) => {
  if (loadingMap.value.goOrderLoading || loadingMap.value.confirmLoading) return

  curLoadingType.value = loadingType || LoadingType.保存
  const address = `${area.value?.join('')}${detailAddress.value}`
  const { parentAddressType } = route.query || {}
  if (loadingType === LoadingType.去寄件 && parentAddressType) {
    clk_express_single_sender_address_book_send_button_v1(parentAddressType as unknown as AddressType)
  } else if (loadingType === LoadingType.保存) {
    clk_express_sender_control_v1(AddressType.SENDER)
  }
  try {
    loadingMap.value[curLoadingType.value] = true
    const res = await allFiledKeyValidate()
    if (res) {
      // 地址长度需满足11位，不满足返回 false
      const flag = await allAddressCheckLength({ address })

      if (flag) {
        // 保存前地址完善校正检查：needFlag=10 时弹出完善地址弹窗并阻断后续流程
        await onAddressCorrectionCheck()
        if (operateType === 'add') {
          // 新增地址簿
          await onSaveToAddressBook(isFirst)
        }
        if (operateType === 'edit') {
          // 编辑地址簿
          await addressBookEdit(isFirst)
        }
      }
    }
  } catch (error) {
    console.log('error===>', error)
  } finally {
    loadingMap.value[curLoadingType.value] = false
  }
}, 500)

// 定位数据变更切换弹窗
const { setMapPosition } = useMapPosition()
watch(
  () => piniaStore.extend.senderMapPosition.isSelectItem,
  (flag) => flag && setTimeout(() => setMapPosition(piniaStore.extend.senderMapPosition), SET_MAP_POSITION_DELAY),
  { immediate: true },
)

watch(
  () => piniaStore.extend.senderAddressBookMapPosition.isSelectItem,
  (flag) =>
    flag && setTimeout(() => setMapPosition(piniaStore.extend.senderAddressBookMapPosition), SET_MAP_POSITION_DELAY),
  { immediate: true },
)

useUnload(() => {
  // 重置定位地址选中的标识 // UPDATE_SENDER_ADDRESS_BOOK_MAP_POSITION
  piniaStore.extend.updateSenderAddressBookMapPosition({
    data: {
      isSelectItem: false,
    },
  })
  removeValidateKeyByType('sender')
})

useDidHide(() => {
  // 重置定位地址选中的标识 // UPDATE_SENDER_ADDRESS_BOOK_MAP_POSITION
  piniaStore.extend.updateSenderAddressBookMapPosition({
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
  onClear()
  detailAddressTips.value = ''
}

// 地址完善校正公共流程
const {
  dialogVisible: correctionDialogVisible,
  currentAddress,
  suggestedAddress,
  trigger: triggerAddressCorrection,
  onDialogConfirm: onCorrectionConfirm,
  onDialogCancel: onCorrectionCancel,
} = useCompleteAddress({
  shouldPopup: (res) => res.needFlag === CompleteNeedFlag['需要弹窗'],
  buildParams: () =>
    buildCompleteAddressParams({
      side: 'sender',
      sceneType: CompleteAddressSceneType.地址簿,
      // 新增没有 id 传空，编辑传当前地址 id
      addressId: operateType === 'edit' ? getData.value.id : '',
      source: { ...getData.value, detailAddress: detailAddress.value },
    }),
  onConfirm: (suggested, { close }) => {
    // 确定修改：回填地址后关闭弹窗，自动继续后续保存流程
    // 不在此 showToast：hook 收尾的 closeToast（Taro.hideLoading）会关掉与 loading 共用原生提示框的 toast，导致提示一闪而过
    setStoreValue({
      province: suggested.province || getData.value.province,
      city: suggested.city || getData.value.city,
      county: suggested.county || getData.value.county,
      detailAddress: suggested.detailAddress || detailAddress.value,
    })
    close()
  },
})

/**
 * 保存前地址完善校正检查：needFlag=10 时弹出完善地址弹窗并阻断后续流程
 * 暂不修改：继续后续流程；确定修改：更新页面数据并提示后继续后续流程
 */
const onAddressCorrectionCheck = () => triggerAddressCorrection()
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
