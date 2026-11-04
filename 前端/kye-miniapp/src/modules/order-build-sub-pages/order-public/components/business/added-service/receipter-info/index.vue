<template>
  <div class="receipter-info-box dialog_root_book_receipter">
    <!-- 页面 -->
    <div class="page">
      <!-- 倒计时 -->
      <div class="container" :class="{ 'extra-style': !clearStatus }">
        <!-- 智能识别 -->
        <AddressOcr
          moduleStyle="page"
          :addressType="Address.RECEIPTER_ADDRESS_TYPE"
          @getAddressOcrData="getAddressOcrData"
          @discernImgClick="discernImgClick"
        />

        <!-- 信息内容 -->
        <div class="container__info padding-style">
          <AddressUnfold
            v-bind="addressProps"
            :addressVisible="true"
            :isShowTelephone="false"
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
            :usePage="pageUseAddress.ADDRESSBOOKRECEIVE"
            :isShowWxAddAddress="true"
            :isHideLabel="true"
            :isShowRemind="false"
            :isShowContacts="!isWxAppEnv"
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
            @onClickAddressBook="onClickAddressBook"
          >
            <!-- 地址提示 -->
            <template #detailAddressTips> {{ detailAddressTips }} </template>
          </AddressUnfold>
        </div>

        <div class="all-save-addr">
          <div>后续回单原件都返回该地址</div>
          <ky-switch
            size="medium"
            inactive-color="#ebedf5"
            active-color="#8365F6"
            :model-value="defaultSwitch"
            @change="toChagneDefaultSwitch"
          />
        </div>
      </div>

      <!-- 确定 -->
      <div class="address-book-receive-footer" id="isElementShow">
        <div class="footer__wrap">
          <KyButton class="btn cancal" text="暂不需要" loading-text="暂不需要" :loading="loading" @click="toBack" />
          <KyButton class="btn confirm" text="确定" loading-text="确定" :loading="loading" @click="onConfirm" />
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
    <PageCommon pageValidateName="addedService.receipter" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted } from 'vue'
import Taro, { useUnload, useDidHide } from '@tarojs/taro'
import { useRouter, useRoute } from '@order-public-sub-public/vue-router/index'
import { filterAllSpace } from '@order-public-sub-public/utils'
import { manyValidate } from './hooks/useValidate'
import { allAddressCheckLength } from '@order-public-sub-public/hooks/address/useCommon'

// 组件
import AddressUnfold from '@order-public-sub-public/components/ui/address-unfold/index.vue'
import AreaAddress from '@order-global-package-order-sub/components/business/area-address/index.vue'
import DetailAddress from '@order-global-package-order-sub/components/business/detail-address/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import AddressOcr from '@order-global-package-order-sub/components/business/address-ocr/index.vue'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'
import KySwitch from '@order-public-sub-public/components/base/ky-switch/index.vue'

import { useInitConfig } from './hooks/useInitConfig'
import { getValueOrEmpty } from '@order-public-sub-public/utils'
import { useClear } from './hooks/useClear'
import { getData, setStoreValue } from './hooks/useUpdateData'
import {
  useArea,
  useCompanyName,
  useDetailAddress,
  useMobile,
  usePerson,
  useSuggestData,
  useTelephone,
  useDefaultSwitch,
} from './hooks/useFields'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'

// 类型
import { Address, AddressValue, pageUseAddress } from '@order-public-sub-public/constants'
import { getContactData } from '@order-public-sub-public/components/business/receive/hooks/selectContact'
import { closeTippy, removeErrClassByDataValidate } from '@order-public-sub-public/validate/effect/effectBubble'
import useEffect from '@order-public-sub-public/validate'
import { useMapPosition } from './hooks/useMapPosition'
import { SET_MAP_POSITION_DELAY } from '@order-public-sub-public/constants/address'
import { useStore } from '@order-public-sub-public/store'
import { useSelectAppAddress } from './hooks/selectAppAddress'
import { receiptReturnButtonCLK } from './report'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { showDialog } from '@kye-netc/kye-miniui'
import { saveReceiptAddress } from '@/modules/order-build-sub-pages/order-public/apis/added-service'
import { $native as native } from '@order-public-sub-public/utils'
import { globalEventBus } from '@/public/hooks/useEventBus'
import { receiptBackAddr as receiptBackAddrGloble } from '@/public/hooks/useReceipterBack'
import { isWxAppEnv, urlContact } from '@/public/utils'
import { sleep } from '@order-public-sub-public/utils/sleep'

const { effectBubble } = useEffect()

const router = useRouter()
const route = useRoute()
const piniaStore = useStore()
const { removeValidateKeyByType } = globalUseValidate()

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

const { defaultSwitch, onChangeDefaultSwitch } = useDefaultSwitch()

const loading = ref(false)

const toChagneDefaultSwitch = (val) => {
  onChangeDefaultSwitch(val)
  showToast(val ? '已开启' : '已关闭')
  receiptReturnButtonCLK(val ? '开启默认返单' : '关闭默认返单')
}

const toSelectDetailAddress = async (info) => {
  await onSelectDetailAddress(info)
  allFiledKeyValidate()
}

// 智能识别
const getAddressOcrData = async (item: AddressValue) => {
  const data = {
    person: item?.person || person.value,
    mobile: item?.mobile || mobile.value,
    // telephone: item?.telephone || telephone.value,
    // extension: item?.extension,
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

// 跳转定位页面
const onClickMapPosition = () => {
  router.push({
    path: '/map-position',
    query: {
      from: 'receipter',
    },
  })
}

const discernImgClick = () => {
  closeTippy()
}

const onClickContact = async () => {
  const { isMobile, phone, person } = await getContactData()
  closeTippy()
  if (person) {
    setStoreValue({
      person: person,
    })
    // onInputPerson(person)
    removeErrClassByDataValidate('addedService.receipter.person')
    // onBlurPerson({ required: true })
  }
  if (!phone) {
    return
  }
  if (isMobile) {
    setStoreValue({
      mobile: phone,
    })
    removeErrClassByDataValidate('addedService.receipter.telephone')
    return
  }
  setStoreValue({
    telephone: phone,
    extension: '',
  })
  removeErrClassByDataValidate('addedService.receipter.telephone')
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
    // {
    //   required: addressProps.value.telephoneConfig.required,
    //   value: telephone.value,
    //   fieldKey: 'telephone',
    // },
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
      removeErrClassByDataValidate(`addedService.receipter.${item.fieldKey}`)
    }
  })
  return await manyValidate({ data: checkList, originalData: getData.value, needRemoteCheck: false })
}

const getAddressInfo = computed(() => {
  return {
    person: getValueOrEmpty(person.value),
    mobile: filterAllSpace(getValueOrEmpty(mobile.value)),
    companyName: getValueOrEmpty(companyName.value),
    province: getValueOrEmpty(getData.value.province),
    city: getValueOrEmpty(getData.value.city),
    county: getValueOrEmpty(getData.value.county),
    detailAddress: getValueOrEmpty(detailAddress.value),
  }
})

const toSaveAddress = async (isCheck: boolean) => {
  // 提交信息接口 TODO
  const source = (await native.getSource()).source
  const params = {
    source,
    checkAddressInfo: isCheck,
    defaultSwitch: defaultSwitch.value,
    addressInfo: getAddressInfo.value,
  }
  return await saveReceiptAddress(params)
}

/**
 * 确定
 */
const onConfirm = async () => {
  receiptReturnButtonCLK('确定')
  await sleep(700)
  // 埋点TODO
  try {
    loading.value = true
    // 获取倒计时组件剩余时间
    const res = await allFiledKeyValidate()
    if (res) {
      const address = `${area.value?.join('')}${detailAddress.value}`
      // 地址长度需满足11位，不满足返回 false
      const flag = await allAddressCheckLength({ address })
      if (flag) {
        const submitRes = await toSaveAddress(true)
        const { checkResultList, status } = submitRes?.data ?? {}
        if (checkResultList && checkResultList.length && !status) {
          effectBubble(checkResultList)
          return
        }
        globalEventBus.emit('ReceipterEvent', {
          ...getAddressInfo.value,
        })
        onChangeDefaultSwitch(false)
        await onClearFn()
        Taro.navigateBack()
      }
    }
  } catch (error) {
  } finally {
    loading.value = false
  }
}

// 暂不需要
const toBack = async () => {
  receiptReturnButtonCLK('暂不需要')
  closeTippy()
  const { person, mobile, detailAddress, province, county, city, companyName } = getData.value
  const params = {
    person,
    mobile,
    detailAddress,
    province,
    county,
    city,
    companyName,
  }
  const bool = Object.keys(params).every((key) => !params[key])
  console.log(bool)
  // 没有填写任何信息
  if (bool) {
    onChangeDefaultSwitch(false)
    onClearFn()
    await toSaveAddress(false)
    globalEventBus.emit('ReceipterEvent', {
      ...getAddressInfo.value,
    })
    Taro.navigateBack()
    return
  }
  showDialog({
    parentClassName: 'receipter-info-box',
    title: '温馨提示',
    message: '您确定不需要当前回单返回地址吗？内容将被清空',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    showCancelButton: true,
    showConfirmButton: true,
  })
    .then(async () => {
      console.log('确定')
      onChangeDefaultSwitch(false)
      onClearFn()
      await toSaveAddress(false)
      globalEventBus.emit('ReceipterEvent', {
        ...getAddressInfo.value,
      })
      Taro.navigateBack()
    })
    .catch(() => {
      console.log('cancel')
    })
}

const onClickAddressBook = () => {
  Taro.navigateTo({
    url: urlContact('/modules/order-build-sub-pages/order-public/components/business/address-book/page/index', {
      addressType: Address.RECEIVE_ADDRESS_TYPE,
      pageSource: 'receipter',
    }),
  })
  // router.push({
  //   path: '/address-book',
  //   query: {
  //     addressType: Address.RECEIVE_ADDRESS_TYPE,
  //     pageSource: 'receipter',
  //   },
  // })
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
  () => piniaStore.extend.receipterMapPosition?.isSelectItem,
  (flag) => {
    flag &&
      setTimeout(() => {
        setMapPosition(piniaStore.extend.receipterMapPosition, () => {
          allFiledKeyValidate()
        })
      }, SET_MAP_POSITION_DELAY)
  },
  { immediate: true },
)

useUnload(() => {
  // 重置定位地址选中的标识
  piniaStore.extend.updateReceipterMapPosition({
    data: {
      isSelectItem: false,
    },
  })
  removeValidateKeyByType('addedService.receipter')
  globalEventBus.off('ReceipterAddressBookEvent', setAddressBookInfo)
})
useDidHide(() => {
  // 重置定位地址选中的标识
  piniaStore.extend.updateReceipterMapPosition({
    data: {
      isSelectItem: false,
    },
  })
})

const onClickAppAddress = async () => {
  const data = await getAppAddress()
  if (!data) return
  getAddressOcrData(data)
  allFiledKeyValidate()
}

const setAddressBookInfo = (data) => {
  setStoreValue(data)
  allFiledKeyValidate()
}

onMounted(() => {
  console.log(receiptBackAddrGloble.value, 'mountedddddd')
  // 先清空之前的数据
  onClearFn()
  onChangeDefaultSwitch(false)
  // 然后再赋值
  setStoreValue({
    ...receiptBackAddrGloble.value,
  })
  onChangeDefaultSwitch(route.query?.defaultSwitch === 'true')
  // 地址簿选完地址回填
  globalEventBus.on('ReceipterAddressBookEvent', setAddressBookInfo)
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
