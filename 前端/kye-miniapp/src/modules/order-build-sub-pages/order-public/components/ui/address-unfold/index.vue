<template>
  <div class="address-unfold" @click="handleClickAddressUnFold">
    <!-- 头部 -->
    <Header
      :iconColor="iconColor"
      :iconText="iconText"
      :title="title"
      :source="source"
      :required="required"
      :addressVisible="addressVisible"
      :addressOcrVisible="addressOcrVisible"
      :switchVisible="switchVisible"
      :isShowWxAddAddress="isShowWxAddAddress"
      :isShowContacts="isShowContacts"
      @onClickOcr="onClickOcr"
      @onClickAddressBook="onClickAddressBook"
      @onSwitchAddress="onSwitchAddress"
      @onClickContact="onClickContact"
      @onClickAppAddress="onClickAppAddress"
    />

    <div class="info-container">
      <!-- 智能识别 -->
      <OcrModule v-show="showOcr" :addressVisible="addressVisible" :source="source">
        <template #ocrModule>
          <slot name="addressOcr" />
        </template>
      </OcrModule>

      <!-- 姓名、手机号 -->
      <PersonMobile
        class="border-bottom-style"
        :source="source"
        :person="person"
        :mobile="mobile"
        :personConfig="personConfig"
        :mobileConfig="mobileConfig"
        :telephoneConfig="telephoneConfig"
        :suggestList="suggestList"
        :visibleDropdownMenu="visibleDropdownMenu"
        :visibleDropdownMenuPosition="visibleDropdownMenuPosition"
        :inline="inline"
        :isShowRemind="isShowRemind"
        @onInputPerson="onInputPerson"
        @onFocusPerson="onFocusPerson"
        @onBlurPerson="onBlurPerson"
        @onInputMobile="onInputMobile"
        @onFocusMobile="onFocusMobile"
        @onBlurMobile="onBlurMobile"
        @selectSuggest="selectSuggest"
        @onCloseDropdownMenu="closeDropdownMenu"
      />

      <!-- 固定电话、分机号 -->
      <TelephoneExt
        class="border-bottom-style"
        :source="source"
        :telephone="telephone"
        v-if="isShowTelephone"
        :extension="extension"
        :mobile="mobile"
        :extensionConfig="extensionConfig"
        :telephoneConfig="telephoneConfig"
        :mobileConfig="mobileConfig"
        @onFocusTelephone="onFocusTelephone"
        @onFocusExtension="onFocusExtension"
        @onInputExtension="onInputExtension"
        @onInputTelephone="onInputTelephone"
        @onBlurTelephone="onBlurTelephone"
        @onBlurExtension="onBlurExtension"
        @onBlurFiexdTelephone="onBlurFiexdTelephone"
      />

      <!-- 指定地址 -->
      <SpecifyAddress
        v-if="addressEdit"
        :source="source"
        :specifyAddress="specifyAddress"
        :title="locationName"
        :addressVisibleType="addressVisibleType"
        :dataValidate="addressConfig.dataValidate"
        :usePage="usePage"
        :disabledAddressItemKey="disabledAddressItemKey"
        @onClickSpecifyAddress="onClickSpecifyAddress"
      />

      <template v-if="!addressEdit">
        <!-- 城市/区域 -->
        <Area
          class="border-bottom-style"
          :area="area"
          :addressConfig="addressConfig"
          :usePage="usePage"
          @onClickArea="onClickArea"
        />

        <!-- 详情地址 -->
        <DetailAddress
          class="border-bottom-style"
          :detailAddress="detailAddress"
          :addressConfig="addressConfig"
          :addressDetailLocation="addressDetailLocation"
          :usePage="usePage"
          @onClickDetailAddress="onClickDetailAddress"
          @onClickMapPosition="onClickMapPosition"
        >
          <template #errorTips>
            <slot name="detailAddressTips"></slot>
          </template>
        </DetailAddress>
      </template>

      <!-- 公司简称 -->
      <CompanyName
        class="border-bottom-style"
        :source="source"
        :companyName="companyName"
        :companyNameConfig="companyNameConfig"
        :clearStatus="clearStatus"
        :usePage="usePage"
        @onInputCompanyName="onInputCompanyName"
        @onFocusCompanyName="onFocusCompanyName"
        @onBlurCompanyName="onBlurCompanyName"
      />

      <!-- 地址标签 -->
      <AddressLabelList :value="selectLabel" @change="onChooseLabel" :usePage="usePage" v-if="isShowLabel" />

      <!-- 是否保存到地址簿 -->
      <SaveAddressBook
        class="border-bottom-style"
        :source="source"
        :saveAddress="saveAddress"
        :saveAddressFlag="saveAddressFlag"
        :defaultFlag="defaultFlag"
        :showSetDefault="showSetDefault"
        :clearStatus="clearStatus"
        @onSaveAddress="onSaveAddress"
        @onDefaultFlag="onDefaultFlag"
        @onClear="onClear"
      />

      <!-- 委托取货 -->
      <DelegatePick v-if="showPickup" />

      <!-- 展会展馆号 -->
      <slot name="exhibition" />

      <!-- 地址空间标识 -->
      <slot name="projectLocation" />

      <!-- 收货入口 -->
      <slot name="receiveAddressPortal" />

      <!-- 限取限派 -->
      <slot name="restrictData" />

      <!-- 地址校正提醒 -->
      <slot name="addressCorrectionTip" />
    </div>
  </div>
  <!-- AI推荐 -->
  <slot name="aiAddress" />
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { computed, ref } from 'vue'
import { debounce } from 'lodash-es'

// 组件
import Header from '@order-public-sub-public/components/ui/address-unfold/components/header/index.vue'
import PersonMobile from '@order-public-sub-public/components/ui/address-unfold/components/person-mobile/index.vue'
import TelephoneExt from '@order-public-sub-public/components/ui/address-unfold/components/telephone-ext/index.vue'
import SpecifyAddress from '@order-public-sub-public/components/ui/address-unfold/components/specify-address/index.vue'
import Area from '@order-public-sub-public/components/ui/address-unfold/components/area/index.vue'
import DetailAddress from '@order-public-sub-public/components/ui/address-unfold/components/detail-address/index.vue'
import CompanyName from '@order-public-sub-public/components/ui/address-unfold/components/company-name/index.vue'
import OcrModule from '@order-public-sub-public/components/ui/address-unfold/components/ocr-module/index.vue'
import SaveAddressBook from '@order-public-sub-public/components/ui/address-unfold/components/save-address-book/index.vue'
import AddressLabelList from '@order-public-sub-public/components/ui/address-unfold/components/address-label-list/index.vue'
import DelegatePick from '@order-public-sub-public/components/ui/address-unfold/components/delegate-pick/index.vue'
import { AddressValue, pageUseAddress } from '@order-public-sub-public/constants'
import { isWechatEnv } from '@/public/utils'
import { currentPopueType } from '@order-public-sub-public/hooks/address/sender/state'

interface PropsType {
  style?: string
  visible?: boolean
  editable?: boolean
  required?: boolean
  defaultValue?: string | unknown
  maxLength?: number
  dataValidate?: string
  disabled?: boolean
  specifyAddressDataValidate?: string
  showSetDefault?: boolean
  isShowWxAddAddress?: boolean
}

const props = defineProps({
  showPickup: {
    type: Boolean,
    default: false,
  },
  visibleDropdownMenu: {
    type: Boolean,
    default: false,
  },
  visibleDropdownMenuPosition: {
    type: String,
    default: 'person',
  },
  /** 姓名和手机号是否并排展示 */
  inline: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  addressVisibleType: {
    type: String,
    default: '',
  },
  clearStatus: {
    type: Boolean,
    default: false,
  },
  locationName: {
    type: String,
    default: '',
  },
  addressEdit: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    default: '',
  },
  ocrMessage: {
    type: String,
    default: '',
  },
  iconColor: {
    type: String,
    default: '#03050D',
  },
  iconText: {
    type: String,
    default: '寄',
  },
  title: {
    type: String,
    default: '寄件人信息',
  },
  saveAddress: {
    type: Boolean,
    default: false,
  },
  addressDetailLocation: {
    type: Boolean,
    default: false,
  },
  addressVisible: {
    type: Boolean,
    default: false,
  },
  addressOcrVisible: {
    type: Boolean,
    default: false,
  },
  fieldsConfigType: {
    type: Boolean,
    default: true,
  },
  person: {
    type: String,
    default: '',
  },
  mobile: {
    type: String,
    default: '',
  },
  // 是否展示固话
  isShowTelephone: {
    type: Boolean,
    default: true,
  },
  telephone: {
    type: String,
    default: '',
  },
  extension: {
    type: String,
    default: '',
  },
  companyName: {
    type: String,
    default: '',
  },
  isShowContacts: {
    type: Boolean,
    default: true,
  },
  personConfig: {
    type: Object as () => PropsType,
    default: () => ({
      style: '',
      visible: false,
      editable: false,
      required: false,
      defaultValue: '',
      dataValidate: '',
      maxLength: 20,
    }),
  },
  mobileConfig: {
    type: Object as () => PropsType,
    default: () => ({
      style: '',
      visible: false,
      editable: false,
      required: false,
      defaultValue: '',
      dataValidate: '',
      maxlength: 11,
    }),
  },
  telephoneConfig: {
    type: Object as () => PropsType,
    default: () => {
      return {
        style: '',
        visible: false,
        editable: false,
        required: false,
        defaultValue: '',
        dataValidate: '',
        maxlength: 21,
      }
    },
  },
  addressConfig: {
    type: Object as () => PropsType,
    default: () => {
      return {
        style: '',
        visible: false,
        editable: false,
        required: false,
        defaultValue: '',
        dataValidate: '',
        specifyAddressDataValidate: '',
      }
    },
  },
  extensionConfig: {
    type: Object,
    default: () => {
      return {
        maxlength: 8,
      }
    },
  },
  companyNameConfig: {
    type: Object,
    default: () => {
      return {
        name: '',
        label: '',
        style: '',
        visible: false,
        editable: false,
        required: false,
        defaultValue: '',
        regex: '',
        dataValidate: '',
        maxlength: 32,
      }
    },
  },
  area: {
    type: Array,
    default: () => [],
  },
  detailAddress: {
    type: String,
    default: '',
  },
  specifyAddress: {
    type: String,
    default: '',
  },
  selectLabel: {
    type: String,
    default: '',
  },
  suggestList: {
    type: Array,
    default: () => [],
  },
  saveAddressFlag: {
    type: Boolean,
    default: false,
  },
  switchVisible: {
    type: Boolean,
    default: false,
  },
  usePage: {
    // 是页面来源
    type: String,
    default: '',
  },
  disabledAddressItemKey: {
    type: String,
    default: '',
  },
  defaultFlag: {
    type: Boolean,
    default: false,
  },
  showSetDefault: {
    type: Boolean,
    default: false,
  },
  isShowWxAddAddress: {
    type: Boolean,
    default: false,
  },
  isShowRemind: {
    type: Boolean,
    default: true,
  },
  isHideLabel: {
    type: Boolean,
    default: false,
  },
})

const showOcr = ref(false)

const emit = defineEmits([
  'update:person',
  'onInputMobile',
  'onFocusPerson',
  'onBlurPerson',
  'update:mobile',
  'onFocusMobile',
  'onBlurMobile',
  'update:telephone',
  'onFocusTelephone',
  'onBlurTelephone',
  'onFocusExtension',
  'onBlurExtension',
  'onBlurFiexdTelephone',
  'update:extension',
  'update:companyName',
  'onFocusCompanyName',
  'onBlurCompanyName',
  'onClickAddressBook',
  'onClickArea',
  'onClickMapPosition',
  'onClickDetailAddress',
  'onClickSpecifyAddress',
  'onClear',
  'onClickImg',
  'onChooseLabel',
  'onClickIdentify',
  'update:ocrMessage',
  'selectSuggest',
  'onCloseDropdownMenu',
  'onSaveAddress',
  'onSwitchAddress',
  'onDefaultFlag',
  'onClickContact',
  'onClickAppAddress',
])

// 保存到地址簿
const onSaveAddress = (value: boolean) => {
  emit('onSaveAddress', value)
}

const onDefaultFlag = (value: boolean) => {
  emit('onDefaultFlag', value)
}

const isShowLabel = computed(() => {
  if (props.isHideLabel) {
    return false
  }
  return (
    props.usePage === pageUseAddress.ADDRESSBOOKSENDER ||
    props.usePage === pageUseAddress.SENDERUNFOLD ||
    props.usePage === pageUseAddress.ADDRESSBOOKRECEIVE ||
    props.usePage === pageUseAddress.RECEIVEUNFOLD
  )
})

// 智能识别
const onClickOcr = () => {
  showOcr.value = !showOcr.value
  // 'SENDERUNFOLD' = 'sender-unfold', //寄件平铺
  // 'RECEIVEUNFOLD' = 'receive-unfold', //收件平铺
  // 'SENDERPAGE' = 'sender-page', //跳转寄件
  // 'RECEIVEPAGE' = 'receive-page', //跳转收件
  // 'ADDRESSBOOKSENDER' = 'address-book-sender', //地址簿寄件
  // 'ADDRESSBOOKRECEIVE' = 'address-book-receive', //地址簿收件
  const list = [
    pageUseAddress.ADDRESSBOOKRECEIVE,
    pageUseAddress.RECEIVEPAGE,
    pageUseAddress.RECEIVEUNFOLD,
    pageUseAddress.INVITEADDRESS,
  ]
  if (list.includes(props.usePage as pageUseAddress)) {
    currentPopueType.value = 'receive'
  } else {
    currentPopueType.value = 'sender'
  }
}

// 姓名
const onInputPerson = (value: string) => {
  emit('update:person', value)
}

const onFocusPerson = () => {
  emit('onFocusPerson')
}

const onBlurPerson = debounce(() => {
  emit('onBlurPerson', { required: props.personConfig.required })
}, 100)

// 手机号
const onInputMobile = (value: string) => {
  emit('update:mobile', value)
}
const onFocusMobile = () => {
  emit('onFocusMobile')
}
const onBlurMobile = debounce(() => {
  emit('onBlurMobile', { required: props.mobileConfig.required, value: props.mobile })
}, 100)

// 固定电话
const onInputTelephone = (value: string) => {
  emit('update:telephone', value)
}

// 分机号
const onInputExtension = (value: string) => {
  emit('update:extension', value)
}

const onFocusExtension = (value: string) => {
  emit('onFocusExtension', value)
}

const onFocusTelephone = (value: string) => {
  emit('onFocusTelephone', value)
}

const onBlurTelephone = debounce(() => {
  emit('onBlurTelephone', { required: props.telephoneConfig.required })
}, 100)

const onBlurExtension = () => emit('onBlurExtension')

const onBlurFiexdTelephone = debounce(() => {
  emit('onBlurFiexdTelephone', { required: props.telephoneConfig.required })
}, 100)

// 公司
const onInputCompanyName = (value: string) => {
  emit('update:companyName', value)
}
const onFocusCompanyName = () => {
  emit('onFocusCompanyName')
}
const onBlurCompanyName = debounce(() => {
  emit('onBlurCompanyName', { required: props.companyNameConfig.required })
}, 100)

const onChooseLabel = (value: string) => {
  emit('onChooseLabel', value)
}

// 选择省市区
const onClickArea = () => {
  emit('onClickArea')
  // 处理-微信input未失焦-键盘未收起
  if (isWechatEnv) {
    Taro.hideKeyboard()
  }
}

// 选择详情地址
const onClickDetailAddress = () => {
  emit('onClickDetailAddress')
  if (isWechatEnv) {
    Taro.hideKeyboard()
  }
}

// 跳转到定位
const onClickMapPosition = () => {
  emit('onClickMapPosition')
  if (isWechatEnv) {
    Taro.hideKeyboard()
  }
}

// 指定地址
const onClickSpecifyAddress = () => {
  emit('onClickSpecifyAddress')
  if (isWechatEnv) {
    Taro.hideKeyboard()
  }
}

/**
 * 点击地址簿
 */
const onClickAddressBook = () => {
  emit('onClickAddressBook')
}

/**
 * 点击通讯录
 */
const onClickContact = () => {
  emit('onClickContact')
}

/**
 * 点击切换地址
 */
const onSwitchAddress = () => {
  emit('onSwitchAddress')
}

/**
 * 清空
 */
const onClear = () => {
  emit('onClear')
}
const selectSuggest = (value: AddressValue) => {
  emit('selectSuggest', value)
}

const closeDropdownMenu = () => {
  emit('onCloseDropdownMenu')
  //   window.$umpOtherReport(
  //   'CLK',
  //   {
  //     eventCode: 'clk_express_association_close_v1',
  //   },
  //   {
  //     recognition_type: '',
  //   }
  // )
}

const handleClickAddressUnFold = () => {
  if (props.visibleDropdownMenu) {
    closeDropdownMenu()
  }
}

/**
 * 点击微信收获地址
 */
const onClickAppAddress = () => {
  emit('onClickAppAddress')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
