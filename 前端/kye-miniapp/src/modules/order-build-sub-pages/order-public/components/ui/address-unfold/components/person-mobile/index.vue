<template>
  <view
    v-if="personConfig.visible || mobileConfig.visible"
    class="address-unfold-person-mobile"
    :class="{ 'address-unfold-person-mobile--inline': inline }"
  >
    <ky-field
      v-if="personConfig.visible"
      class="person"
      clearable
      :placeholder="personPlaceholder"
      :style="personConfig.style"
      :modelValue="person"
      :disabled="!personConfig.editable"
      :data-validate="personConfig.dataValidate"
      :formatter="personConfig.format"
      :maxlength="personConfig.maxlength"
      :requiredTag="true"
      :isError="false"
      :enableWxNative="true"
      :inputDebounce="isWxPcAppletEnv ? 0 : cutPlatformInputDebounceTime"
      :clearDisplaySpace="true"
      :adjust-position="false"
      :hold-keyboard="false"
      @onInput="onInputPerson"
      @onFocus="onFocusPerson"
      @onBlur="onBlurPerson"
      @onClear="onClearPerson"
    >
    </ky-field>
    <div class="mobile-container" v-if="mobileConfig.visible">
      <ky-field
        v-keyboard
        :class="['mobile', { 'mobile-dashed-box': isAllNoRequire }]"
        :placeholder="getPlaceHolder()"
        type="number"
        v-model="mobileInput"
        :enableWxNative="true"
        :inputDebounce="cutPlatformInputDebounceTime"
        enableWxNativeFormatter="true"
        :clearDisplaySpace="true"
        :enableNative="true"
        :adjust-position="false"
        :hold-keyboard="false"
        :always-system="true"
        :shouldFocus="true"
        :style="mobileConfig.style"
        :disabled="!mobileConfig.editable"
        :data-validate="mobileConfig.dataValidate"
        :maxlength="mobileConfig.maxlength"
        :requiredTag="isReceivePhoneRequired()"
        @onInput="toOnInputMobile"
        @onFocus="onFocusMobile"
        @onConfirm="hideKeyboard"
        @onBlur="onBlurMobile"
        ref="mobileInputRef0"
        :cursor="mobileCursor"
      />
      <!--  分隔线  -->
      <div v-show="isShowExtMobile && !isSenderSence" class="line"></div>
      <ky-field
        v-show="isShowExtMobile && !isSenderSence"
        v-keyboard
        :class="['extTelphone', { 'mobile-dashed-box': isAllNoRequire }]"
        placeholder="分机号"
        type="number"
        v-model="extMobileInput"
        :enableWxNative="true"
        :inputDebounce="cutPlatformInputDebounceTime"
        :enableWxNativeFormatter="true"
        :clearDisplaySpace="true"
        :adjust-position="false"
        :enableNative="true"
        :always-system="true"
        :shouldFocus="true"
        :hold-keyboard="false"
        :style="mobileConfig.style"
        :disabled="!mobileConfig.editable"
        :maxlength="4"
        @onInput="onInputExtMobile"
        @onFocus="onFocusExtMobile"
        @onBlur="onBlurExtMobile"
        ref="mobileInputRef"
        :cursor="cursor"
        @onConfirm="hideKeyboard"
      />
    </div>

    <!-- 联想 -->
    <view>
      <DropdownMenu
        v-if="isShowRemind"
        :visibleDropdownMenuPosition="visibleDropdownMenuPosition"
        :person="person"
        :mobile="mobile"
        :suggestList="suggestList"
        :visible="visibleDropdownMenu"
        :source="source"
        @selectSuggest="selectSuggest"
        @onCloseDropdownMenu="closeDropdownMenu"
        id="exp_express_sender_addassociation_v1"
        :exposure-report="exp_express_sender_addassociation_v1()"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { useOrderExposureReport } from '@order-public-sub-public/report/exposureReport'

import { computed, onMounted, ref, watch } from 'vue'
// 组件
import KyField from '@order-public-sub-public/components/base/ky-field/index.vue'
import DropdownMenu from '@order-public-sub-public/components/ui/address-unfold/components/dropdown-menu/index.vue'
// import { Address } from '@order-public-sub-public/constants'
import { PreciseQuery } from '@order-public-sub-public/apis/address/types'
import vKeyboard from '@order-public-sub-public/directives/keyboard'
import { isDesktopMiniprogram } from '@order-public-sub-public/utils/native'
import { useAddressSuggest } from '@order-public-sub-public/report/addressBook'
import { Address } from '@order-public-sub-public/constants'
import { exp_express_sender_addassociation_v1 } from '@order-public-sub-public/components/ui/address-unfold/hooks/report'
import { debounce } from 'lodash-es'
import { getEnvConfig } from '@/public/config'
import {
  isWxPcAppletEnv,
  isWxAppIosEnv,
  isWxAppOhosEnv,
  isWxAppAndroidEnv,
  isAliMiniApp,
  isAmapMiniApp,
  isH5FSEnv,
} from '@/public/utils'
import { AddressUnfoldFrom } from '../../../../business/added-service/types'
import Taro from '@tarojs/taro'

const props = defineProps({
  visibleDropdownMenu: {
    type: Boolean,
    default: false,
  },
  visibleDropdownMenuPosition: {
    type: String,
    default: 'person',
  },
  source: {
    type: String,
    default: '',
  },
  suggestList: {
    type: Array,
    default: () => [],
  },
  person: {
    type: String,
    default: '',
  },
  mobile: {
    type: String,
    default: '',
  },
  telephone: {
    type: String,
    default: '',
  },
  isShowRemind: {
    type: Boolean,
    default: true,
  },
  personConfig: {
    type: Object,
    default: () => {
      return {
        style: '',
        visible: false,
        editable: false,
        required: false,
        defaultValue: '',
        dataValidate: '',
        maxlength: '',
      }
    },
  },
  mobileConfig: {
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
        maxlength: '',
      }
    },
  },
  telephoneConfig: {
    type: Object,
    default: () => {
      return {
        style: '',
        visible: false,
        editable: false,
        required: false,
        defaultValue: '',
        dataValidate: '',
        maxlength: '',
      }
    },
  },
  /** 姓名和手机号是否在同一行（并排）展示 */
  inline: {
    type: Boolean,
    default: false,
  },
})
useOrderExposureReport(['exp_express_sender_addassociation_v1'])

const isMobileFocus = ref(false)
const isMobileFocusNew = ref(false)

const personPlaceholder = computed(() => {
  // return props.source === Address.SENDER || props.source === Address.SENDER_ADDRESS_BOOK_PAGE ? '真实姓名' : '姓名'
  return '真实姓名'
})

const emit = defineEmits([
  'onInputPerson',
  'onFocusPerson',
  'onBlurPerson',
  'onInputMobile',
  'onFocusMobile',
  'onBlurMobile',
  'selectSuggest',
  'onCloseDropdownMenu',
  'onClearPerson',
])

const isShowExtMobile = ref(props.mobile?.split('-')[1] ? true : false)

const mobileInputRef = ref()
const mobileInputRef0 = ref()

const mobileInput = ref(props.mobile?.split('-')?.[0] || '')
const extMobileInput = ref(props.mobile?.split('-')?.[1] || '')

const onInputExtMobile = debounce((newValue: string) => {
  extMobileInput.value = newValue
  // 这里需要考虑newValue为空的情况
  if (!newValue) {
    emit('onInputMobile', mobileInput.value)
  } else {
    emit('onInputMobile', `${mobileInput.value}-${extMobileInput.value}`)
  }
  if (newValue.length === 0) {
    setTimeout(() => {
      mobileInputRef.value?.fieldRef?.inputRef?.blur()
    }, 100)
  }
}, 100)

const onBlurExtMobile = () => {
  cursor.value = extMobileInput.value?.length
  cursorSpacing.value = extMobileInput.value?.length
  // setTimeout(() => {
  //   if (!isMobileFocusNew.value && (isWxAppAndroidEnv || isWxAppIosEnv || isWxAppOhosEnv)) {
  //     handleBlurKeepExtMobile()
  //   }
  // }, 1000)
}

const cursor = ref(props.mobile?.split('-')?.[1]?.length || 0)
const cursorSpacing = ref(props.mobile?.split('-')?.[1]?.length || 0)
const onFocusExtMobile = () => {
  isMobileFocusNew.value = false
  setTimeout(() => {
    cursor.value = extMobileInput.value?.length
    cursorSpacing.value = extMobileInput.value?.length
  }, 50)
}

const toSetIsShowExtMobile = (value) => {
  if (isSenderSence.value) return
  isShowExtMobile.value = value
}

const { platformInputDebounceTime } = getEnvConfig()

const toFormatValue = (value: string) => {
  if (!props.mobileConfig.format) return value
  return props.mobileConfig.format(value, props.mobileConfig?.maxlength)
}

const mobileCursor = ref(props.mobile?.split('-')?.[0]?.length || 20)
const mobileCursorSpacing = ref(props.mobile?.split('-')?.[0]?.length || 20)
const onFocusMobile = () => {
  // 只有电脑小程序才需要延迟处理blur，正常不需要
  console.log('kkkkkkkkkasfdasf111')
  // 500ms 延迟是组件库 blur有延迟
  isMobileFocus.value = true
  isMobileFocusNew.value = true
  emit('onFocusMobile')
  // 光标定位到最后一位
  setTimeout(() => {
    mobileCursor.value = mobileInput.value?.length
    mobileCursorSpacing.value = mobileInput.value?.length
  }, 50)
}

// 姓名
const onInputPerson = debounce((value: string) => {
  console.log(value, 'onInputPerson执行力一次')
  let formatValue = value
  emit('onInputPerson', formatValue)
}, platformInputDebounceTime)

const onFocusPerson = () => {
  // 如果是微信小程序延迟触发focus
  if (!isDesktopMiniprogram) {
    emit('onFocusPerson')
  } else {
    setTimeout(() => {
      emit('onFocusPerson')
    }, 0)
  }
}

const onBlurPerson = debounce(() => {
  console.log('onBlurPerson执行力一次')
  emit('onBlurPerson')
}, platformInputDebounceTime)

const onClearPerson = () => {}

const toFoucsFixedMobile = () => {
  if (isSenderSence.value) return
  if (extMobileInput.value.length < 4) {
    cursor.value = extMobileInput.value?.length
    isMobileFocusNew.value = false
    setTimeout(() => {
      mobileInputRef.value?.fieldRef?.inputRef?.focus()
    }, 20)
  } else {
    cursor.value = extMobileInput.value?.length
    if (isAliMiniApp || isAmapMiniApp) {
      Taro.hideKeyboard() // 主动收起键盘
    } else {
      mobileInputRef0.value?.fieldRef?.inputRef?.blur()
    }
  }
}

const hideKeyboard = (value: string) => {
  // 阿里系的点击完成不能关闭键盘 需要手动关闭
  if (isAliMiniApp || isAmapMiniApp) {
    Taro.hideKeyboard() // 主动收起键盘
  }
}

/** 对手机号值应用 props.format */
const formatMobileValue = (value: string) => {
  if (!props.mobileConfig.format) return value
  return props.mobileConfig.format(value, props.mobileConfig?.maxlength)
}

const cutPlatformInputDebounceTime = computed(() => {
  if (isWxPcAppletEnv || isH5FSEnv || isAliMiniApp || isAmapMiniApp) {
    return 100
  }
  if (platformInputDebounceTime === 800) {
    return 500
  }
  if (platformInputDebounceTime < 300) {
    return platformInputDebounceTime
  }
  return platformInputDebounceTime - 200
})

// 手机号
// const toOnInputMobile = debounce((value: string) => {
//   onInputMobileFormatter(value)
// }, cutPlatformInputDebounceTime.value)

const toOnInputMobile = (value: string) => {
  mobileInput.value = value || ''
  setTimeout(() => {
    console.log('kkkkkkkkkasdfasf', isMobileFocusNew.value, '我执行力 toOnInputMobile')
    console.log(!isMobileFocusNew.value, value.replace(/\s/g, ''), mobileInput.value.replace(/\s/g, ''), '哈哈哈')
    if (value === props.mobile.split('-')?.[0]) return
    const formatValue = formatMobileValue(value)
    console.log(value, 'dddddddddddsfsdf', formatValue)
    // let formatValue = lastFormatValue?.replace(/\s/g, '') || ''
    mobileInput.value = formatValue.split('-')?.[0] || ''
    extMobileInput.value = formatValue?.split('-')[1] || ''
    // 如果去除空格后长度小于11，说明是11位手机号
    emit('onInputMobile', formatValue || '')
    toSetIsShowExtMobile(formatValue.includes('-'))
    // 如果有第二个输入框
    if (isShowExtMobile.value) {
      toFoucsFixedMobile()
    }
  }, 50)
}

// pc端需要实时
const blurMobileTime = isWxPcAppletEnv ? 200 : 400

const onBlurMobile = () => {
  isMobileFocusNew.value = false
  mobileCursor.value = mobileInput.value?.length
  mobileCursorSpacing.value = mobileInput.value?.length
  setTimeout(() => {
    emit('onBlurMobile')
    isMobileFocus.value = false
  }, blurMobileTime)
}

const selectSuggest = (value: PreciseQuery) => {
  emit('selectSuggest', value)
  // 立即blur处理避免联想面板重复弹起
  emit('onBlurMobile')
  emit('onBlurPerson')
  useAddressSuggest(value.id)
}

const closeDropdownMenu = () => {
  emit('onCloseDropdownMenu')
}

// 判断来自收方地址簿
const isFromReceiveAddressBook = () => {
  return [Address.RECEIVE_ADDRESS_BOOK_PAGE].includes(props.source as Address)
}

// 是否是二选一 文案是二选一的时候
const isAllNoRequire = computed(() => {
  const { required, dataValidate, from } = props.mobileConfig
  const { required: telephoneRequired } = props.telephoneConfig
  if (from === AddressUnfoldFrom.返单) {
    return false
  }
  if (isFromReceiveAddressBook()) {
    return true
  }
  // 收方根据配置来显示文案
  if (dataValidate.includes('receive') && !telephoneRequired) {
    return true
  }

  console.log(required, telephoneRequired, 'required, telephoneRequired')
  return !required && !telephoneRequired
})

const isReceivePhoneRequired = () => {
  const { required, from } = props.mobileConfig
  if (from === AddressUnfoldFrom.返单) {
    return true
  }
  // 来源是地址簿，收方固定不添加必填标识
  if (isFromReceiveAddressBook()) {
    return true
  }

  // 手机号和固话都是非必填，二选一时显示必填标识
  if (isAllNoRequire.value) {
    return true
  }
  // 收方根据配置来-排除地址簿
  if ([Address.RECEIVE, Address.RECEIVE_PAGE].includes(props.source as Address)) {
    return !!required
  }
  return true
}

// 是否是寄方相关的场景
const isSenderSence = computed(() => {
  return [Address.SENDER_ADDRESS_BOOK_PAGE, Address.SENDER_PAGE, Address.SENDER].includes(props.source as Address)
})

const getPlaceHolder = () => {
  let placeholder = '手机号'
  const { dataValidate, required, from } = props.mobileConfig
  const { required: telephoneRequired } = props.telephoneConfig
  if (from === AddressUnfoldFrom.返单) {
    placeholder = '手机号'
    return placeholder
  }
  // 来源是收方地址簿，不添加必填标识
  if (isFromReceiveAddressBook()) {
    placeholder = '手机号（手机/固话二选一）'
    return placeholder
  }
  // 收方根据配置来显示文案
  if (dataValidate.includes('receive')) {
    if (required) return placeholder
    if (!telephoneRequired) {
      // 固话和手机号都是非必填，需要显示二选一文案
      placeholder = '手机号（手机/固话二选一）'
    } else {
      // 固话必填，手机号非必填
      placeholder = '手机号(选填)'
    }
  }
  // 寄方固定显示
  return placeholder
}

watch(
  () => props.mobile,
  async (newValue) => {
    console.log(newValue, 'senderaaa newValue')

    let formatValue = newValue
    let mobileValue = ''

    formatValue = toFormatValue(newValue) || ''
    mobileValue = formatValue?.split('-')[0] || ''

    // 如果进来的寄件方式的，并且是带有分机号的，需要修改mobile的值，删除分机号
    if (isSenderSence.value && newValue?.includes('-')) {
      formatValue = formatValue?.split('-')[0] || ''
      // 更新mobile
      emit('onInputMobile', formatValue)
      return
    }
    console.log(formatValue, '---', mobileValue, 'senderaaa formatValue1111')
    toSetIsShowExtMobile(formatValue?.includes('-') || false)
    mobileInput.value = mobileValue
    extMobileInput.value = formatValue?.split('-')[1] || ''
    console.log(mobileInput.value, extMobileInput.value, 'senderaaa mobileInput.value, extMobileInput.value')
  },
  {
    immediate: true,
  },
)
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
