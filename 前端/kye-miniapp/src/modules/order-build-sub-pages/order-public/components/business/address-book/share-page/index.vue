<template>
  <div class="address-book-share-receive dialog_root_book_share">
    <ky-navbar :leftArrow="true" title="跨越寄件" v-if="isWxMiniApp"></ky-navbar>
    <!-- 页面 -->
    <div class="page">
      <!-- 倒计时 -->
      <!-- 后端返回秒 15替换成后端变量即可 -->
      <ShareCountDown :duration="timeOutEndTime" ref="shareCountDownRef" :waybillDelivery="waybillDelivery" />
      <div class="container" :class="{ 'extra-style': !clearStatus }">
        <!-- 智能识别 -->
        <AddressOcr
          moduleStyle="page"
          :addressType="Address.RECEIVE_ADDRESS_TYPE"
          @getAddressOcrData="getAddressOcrData"
          @discernImgClick="discernImgClick"
          @selectComplete="selectComplete"
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
            :visibleDropdownMenu="visibleDropdownMenu"
            :clearStatus="clearStatus"
            :usePage="pageUseAddress.INVITEADDRESS"
            :isShowWxAddAddress="true"
            :isShowRemind="false"
            @onClear="onClearFn"
            @onFocusPerson="onFocusPerson"
            @onBlurPerson="onBlurPerson"
            @onBlurMobile="onBlurMobile"
            @onFocusMobile="onFocusMobile"
            @onBlurTelephone="onBlurTelephone"
            @onClickArea="onClickArea"
            @onClickMapPosition="onClickMapPosition"
            @onClickDetailAddress="onClickDetailAddress"
            @onBlurCompanyName="onBlurCompanyName"
            @selectSuggest="selectSuggest"
            @onClickContact="onClickContact"
            @onCloseDropdownMenu="closeDropdownMenu"
            @update:person="onInputPerson"
            @update:mobile="onInputMobile"
            @update:telephone="onInputTelephone"
            @update:extension="onInputExtension"
            @onClickAppAddress="onClickAppAddress"
            @update:companyName="onInputCompanyName"
          >
            <!-- 地址提示 -->
            <template #detailAddressTips> {{ detailAddressTips }} </template>
          </AddressUnfold>
        </div>
      </div>

      <!-- 确定 -->
      <div class="address-book-receive-footer" id="isElementShow">
        <div class="footer__wrap">
          <KyButton class="btn confirm" text="提交信息" loading-text="提交信息" :loading="loading" @click="onConfirm" />
        </div>
      </div>
    </div>

    <!-- 省市区选择弹窗 -->
    <AreaAddress ref="areaRef" @onSelectSearchItem="onConfirmAreaAddress" @onConfirm="onConfirmAreaAddress" />

    <DetailAddress
      ref="detailAddressRef"
      :area="area"
      :addressType="Address.RECEIVE"
      @onSelect="toSelectDetailAddress"
      @onConfirmDetailAddress="toSelectDetailAddress"
    />
    <PageCommon pageValidateName="receive" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import Taro, { useUnload, useDidHide, useDidShow } from '@tarojs/taro'
import { useRoute, useRouter } from '@order-public-sub-public/vue-router/index'
import { isWxMiniApp, isWxPcAppletEnv } from '@/public/utils'
import { filterAllSpace } from '@order-public-sub-public/utils'
import { manyValidate } from './hooks/useValidate'
import { allAddressCheckLength } from '@order-public-sub-public/hooks/address/useCommon'

// 组件
import AddressUnfold from '@order-public-sub-public/components/ui/address-unfold/index.vue'
import AreaAddress from '@order-global-package-order-sub/components/business/area-address/index.vue'
import DetailAddress from '@order-global-package-order-sub/components/business/detail-address/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import AddressOcr from '@order-public-sub-public/components/business/address-ocr/index.vue'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'

import { useInitConfig } from './hooks/useInitConfig'
import { getValueOrEmpty } from '@order-public-sub-public/utils'
import { useClear } from './hooks/useClear'
import { debounce } from 'lodash-es'
import { getData, setStoreValue } from './hooks/useUpdateData'
import {
  useArea,
  useCompanyName,
  useDetailAddress,
  useMobile,
  usePerson,
  useSuggestData,
  useTelephone,
} from './hooks/useFields'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'

// 类型
import { Address, AddressValue, pageUseAddress } from '@order-public-sub-public/constants'
import { getContactData } from '@order-public-sub-public/components/business/receive/hooks/selectContact'
import { closeTippy, removeErrClassByDataValidate } from '@order-public-sub-public/validate/effect/effectBubble'
import ShareCountDown from './components/share-count-down.vue'
import { useMapPosition } from './hooks/useMapPosition'
import { SET_MAP_POSITION_DELAY } from '@order-public-sub-public/constants/address'
import { useStore } from '@order-public-sub-public/store'
import { invitationRoute, submitAddress } from '@order-public-sub-public/apis/share'
import { useSelectAppAddress } from './hooks/selectAppAddress'
import dayjs from 'dayjs'
import { toSubmitReport } from './report'

const router = useRouter()
const route = useRoute()
const piniaStore = useStore()
const { removeValidateKeyByType } = globalUseValidate()

// 倒计时组件
const shareCountDownRef = ref()

const { addressProps } = useInitConfig()

const { getAppAddress } = useSelectAppAddress({
  moduleStyle: '20',
})

// 清空
const { clearStatus, onClear } = useClear()

// 姓名
const { person, onFocusPerson, onBlurPerson, onInputPerson } = usePerson(clearStatus)

// 手机号
const { mobile, onFocusMobile, onBlurMobile, onInputMobile } = useMobile(clearStatus)

// 姓名和手机号联想
const { suggestList, selectSuggest, closeDropdownMenu, visibleDropdownMenu } = useSuggestData()

// 固定电话
const { telephone, extension, onBlurTelephone, onInputTelephone, onInputExtension } = useTelephone()

// 公司名称
const { companyName, onBlurCompanyName, onInputCompanyName } = useCompanyName()

// 省市区 areaRef 需要
const { area, areaRef, onClickArea, onConfirmAreaAddress } = useArea()

// 详细地址 detailAddressRef需要
const { detailAddress, detailAddressRef, onClickDetailAddress, onSelectDetailAddress } = useDetailAddress()

const loading = ref(false)

const toSelectDetailAddress = async (info) => {
  await onSelectDetailAddress(info)
  allFiledKeyValidate()
}

// 智能识别
const getAddressOcrData = async (item: AddressValue) => {
  const data = {
    person: item?.person || person.value,
    mobile: item?.mobile || mobile.value,
    telephone: item?.telephone || telephone.value,
    extension: item?.extension,
    companyName: item?.companyName || companyName.value,
    province: getData.value.province,
    city: getData.value.city,
    county: getData.value.county,
    detailAddress: item?.detailAddress || detailAddress.value,
  }
  console.log(item, 'itemitem')

  if (item?.province) {
    data.province = getValueOrEmpty(item.province)
    data.city = getValueOrEmpty(item.city)
    data.county = getValueOrEmpty(item.county)
  }

  setStoreValue(data)
  allFiledKeyValidate()
}

const isResetData = ref(true)

// 跳转定位页面
const onClickMapPosition = () => {
  isResetData.value = false
  router.push({
    path: '/map-position',
    query: {
      from: 'receiveAddressBook',
    },
  })
}

const discernImgClick = () => {
  closeTippy()
}

const selectComplete = () => {
  console.log('kkkkkkasdfsaf')
  if (!isWxPcAppletEnv) {
    isResetData.value = false
  }
}

const onClickContact = async () => {
  const { isMobile, phone, person } = await getContactData()
  closeTippy()
  if (person) {
    setStoreValue({
      person: person,
    })
    // onInputPerson(person)
    removeErrClassByDataValidate('receive.person')
    // onBlurPerson({ required: true })
  }
  if (!phone) {
    return
  }
  if (isMobile) {
    setStoreValue({
      mobile: phone,
    })
    removeErrClassByDataValidate('receive.telephone')
    return
  }
  setStoreValue({
    telephone: phone,
    extension: '',
  })
  removeErrClassByDataValidate('receive.telephone')
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
  const noRequireList = data.filter((v) => !(v.required || v.value))
  const checkList = data.filter((v) => v.required || v.value)
  nextTick(() => {
    for (let item of noRequireList) {
      removeErrClassByDataValidate(`receive.${item.fieldKey}`)
    }
  })
  return await manyValidate({ data: checkList, originalData: getData.value, needRemoteCheck: true })
}

/**
 * 确定
 */
const onConfirm = async () => {
  toSubmitReport()
  // 埋点TODO
  try {
    loading.value = true
    // 获取倒计时组件剩余时间
    const noRest = shareCountDownRef.value?.isFinished
    const { inviteCode = '' } = route.query || {}
    const showKyDialogParams = {
      message: '提交失败，链接已失效，可联系寄件人重新分享填写链接',
      title: '温馨提示',
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: '我知道了',
      zIndex: 1000,
    }
    if (noRest) {
      await showKyDialog(showKyDialogParams)
      onClearFn()
      // TODO 跳到超时页面
      Taro.reLaunch({
        url: `/modules/order-build-sub-pages/pages/share-send/share/index?inviteCode=${inviteCode}`,
      })
    } else {
      const res = await allFiledKeyValidate()
      if (res) {
        const address = `${area.value?.join('')}${detailAddress.value}`
        // 地址长度需满足11位，不满足返回 false
        const flag = await allAddressCheckLength({ address })
        if (flag) {
          // 提交信息接口 TODO
          const obj = {
            inviteCode,
            addressList: [
              {
                person: getValueOrEmpty(person.value),
                mobile: filterAllSpace(getValueOrEmpty(mobile.value)),
                telephone: filterAllSpace(getValueOrEmpty(telephone.value)),
                extension: getValueOrEmpty(extension.value),
                companyName: getValueOrEmpty(companyName.value),
                province: getValueOrEmpty(getData.value.province),
                city: getValueOrEmpty(getData.value.city),
                county: getValueOrEmpty(getData.value.county),
                detailAddress: getValueOrEmpty(detailAddress.value),
              },
            ],
          }
          const submitRes = await submitAddress(obj)
          const { checkResultList, status } = submitRes?.data
          console.log(checkResultList, status, 'checkResultList, status', submitRes)
          onClearFn()
          // status为true并且checklist中没有数据
          if (status && !checkResultList?.length) {
            // 跳转到成功页 TODO
            Taro.reLaunch({
              url: `/modules/order-build-sub-pages/pages/share-send/invited-success/index?inviteCode=${inviteCode}`,
            })
          } else {
            if (checkResultList?.length) {
              const { content } = checkResultList[0] ?? {
                content: '下单失败，运单已超时，系统已自动取消',
              }
              const showKyDialogParams = {
                message: content,
                title: '温馨提示',
                showCancelButton: false,
                showConfirmButton: true,
                confirmButtonText: '我知道了',
                zIndex: 1000,
              }
              await showKyDialog(showKyDialogParams)
              Taro.reLaunch({
                url: '/modules/order-build-sub-pages/pages/share-send/share/index?inviteCode=' + inviteCode,
              })
            }
          }
        }
      }
    }
  } catch (error) {
  } finally {
    loading.value = false
  }
}

const detailAddressTips = ref()

/**
 * @description: 清空数据和提示语
 * @return {*}
 */
const onClearFn = () => {
  onClear()
  detailAddressTips.value = ''
}

// 设置定位数据
const { setMapPosition } = useMapPosition()
watch(
  () => piniaStore.extend.receiveMapPosition.isSelectItem,
  (flag) => {
    flag && setTimeout(() => setMapPosition(piniaStore.extend.receiveMapPosition), SET_MAP_POSITION_DELAY)
  },
  { immediate: true },
)

watch(
  () => piniaStore.extend.receiveAddressBookMapPosition.isSelectItem,
  (flag) => {
    flag && setTimeout(() => setMapPosition(piniaStore.extend.receiveAddressBookMapPosition), SET_MAP_POSITION_DELAY)
  },
  { immediate: true },
)

useUnload(() => {
  // 重置定位地址选中的标识
  piniaStore.extend.updateReceiveAddressBookMapPosition({
    data: {
      isSelectItem: false,
    },
  })
  removeValidateKeyByType('receive')
})
useDidHide(() => {
  // 重置定位地址选中的标识
  piniaStore.extend.updateReceiveAddressBookMapPosition({
    data: {
      isSelectItem: false,
    },
  })
})

useDidShow(() => {
  isResetData.value && onClearFn()
  isResetData.value = true
})

const onClickAppAddress = async () => {
  if (!isWxPcAppletEnv) {
    isResetData.value = false
  }
  const data = await getAppAddress()
  if (!data) return
  getAddressOcrData(data)
  allFiledKeyValidate()
}

const timeOutEndTime = ref(0)
const waybillDelivery = ref<any>({})
const getInviteRouteInfo = async () => {
  const { inviteCode } = route.query ?? {}
  const res = await invitationRoute({ inviteCode: inviteCode! as string })
  const time = res?.data?.timeOutEndTime ?? 0
  waybillDelivery.value = res?.data?.waybillList?.[0]?.waybillDelivery
  timeOutEndTime.value = dayjs().add(time, 'millisecond').valueOf()
}

onMounted(() => {
  getInviteRouteInfo()
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
