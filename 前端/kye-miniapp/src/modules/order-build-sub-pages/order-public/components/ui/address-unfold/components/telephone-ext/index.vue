<template>
  <div class="address-unfold-telephone-ext" v-if="telephoneConfig.visible">
    <div class="telephone-container">
      <ky-field
        class="telephone"
        :placeholder="getPlaceHolder(telephoneConfig.required)"
        type="number"
        :modelValue="telephoneInput"
        :disabled="!telephoneConfig.editable"
        :data-validate="telephoneConfig.dataValidate"
        :required-tag="telephoneConfig.required && !isFromReceiveAddressBook()"
        :enableWxNative="true"
        :enableWxNativeFormatter="true"
        :clearDisplaySpace="true"
        :adjust-position="false"
        :enableNative="true"
        :always-system="true"
        :hold-keyboard="!!isWechatNotAppEnv"
        :inputDebounce="cutPlatformInputDebounceTime"
        :maxlength="telephoneMaxlength"
        :formatter="formatTelephone"
        @onFocus="onFocusTelephone"
        @onBlur="onBlurTelephone"
        @onInput="toOnInputTelephone"
        v-keyboard
        ref="telephoneRef1"
        :cursor="telephoneCursor"
        @onConfirm="hideKeyboard"
      />
      <div v-show="isShowFiexdPhone" class="line"></div>
      <ky-field
        v-show="isShowFiexdPhone"
        class="fiexdPhone"
        placeholder="固定电话"
        type="number"
        :modelValue="fiexdTelephone"
        :data-validate="telephoneConfig.dataValidate"
        :disabled="!telephoneConfig.editable"
        :enableWxNative="true"
        :enableWxNativeFormatter="true"
        :clearDisplaySpace="true"
        :adjust-position="false"
        :enableNative="true"
        :always-system="true"
        :shouldFocus="true"
        :hold-keyboard="!!isWechatNotAppEnv"
        :inputDebounce="cutPlatformInputDebounceTime"
        :maxlength="fiexdTelephoneLength"
        :formatter="formatFiexdTelephone"
        @onFocus="onFocusFiexdTelephone"
        @onBlur="onBlurFiexdTelephone"
        @onInput="onInputFiexdTelephone"
        v-keyboard
        ref="fiexdPhoneRef"
        :cursor="cursor"
        @onConfirm="hideKeyboard"
      />
    </div>

    <div class="line"></div>
    <ky-field
      class="ext"
      placeholder="分机号"
      type="number"
      :modelValue="extension"
      :maxlength="extensionConfig.maxlength"
      :formatter="extensionConfig.format"
      :disabled="!telephoneConfig.editable"
      :enableWxNative="true"
      :enableWxNativeFormatter="true"
      :clearDisplaySpace="true"
      :adjust-position="false"
      :enableNative="true"
      :always-system="true"
      :shouldFocus="true"
      :hold-keyboard="!!isWechatNotAppEnv"
      :inputDebounce="isWxPcAppletEnv ? 0 : 600"
      @onFocus="onFocusExtension"
      @onInput="onInputExtension"
      @onBlur="onBlurExtension"
      v-keyboard
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
// 组件
import KyField from '@order-public-sub-public/components/base/ky-field/index.vue'
// 方法
import { areaCodeMatch, formatMobile } from '@order-public-sub-public/utils'
import getCityTelephoneCodes from '@order-public-sub-public/utils/cityTelephoneCodes'
import { Address } from '@order-public-sub-public/constants'
import vKeyboard from '@order-public-sub-public/directives/keyboard'
import { debounce } from 'lodash-es'
import { getEnvConfig } from '@/public/config'
import { isWechatNotAppEnv, isAliMiniApp, isWxPcAppletEnv, isH5FSEnv, isAmapMiniApp } from '@/public/utils'
import Taro from '@tarojs/taro'

const { platformInputDebounceTime } = getEnvConfig()

const props = defineProps({
  source: {
    type: String,
    default: '',
  },
  telephone: {
    type: String,
    default: '',
  },
  extension: {
    type: String,
    default: '',
  },
  extensionConfig: {
    type: Object,
    default: () => {
      return {
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
  mobile: {
    type: String,
    default: '',
  },
})

//
const cutPlatformInputDebounceTime = computed(() => {
  if (isAliMiniApp || isAmapMiniApp) {
    return 300
  }
  if (isWxPcAppletEnv || isH5FSEnv) {
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

// 是否是寄方
const sender = computed(() => {
  return Boolean(
    props.source === Address.SENDER ||
    props.source === Address.SENDER_PAGE ||
    props.source === Address.SENDER_ADDRESS_BOOK_PAGE,
  )
})

// const telephoneLocal = ref(props.telephone)

// 主输入框的值
const telephoneInput = ref(props.telephone?.split('-')?.[0] || '')
// 固定电话
const fiexdTelephone = ref(props.telephone?.split('-')?.[1] || '')
const fiexdPhoneRef = ref()

const isShowFiexdPhone = ref(props.telephone?.split('-')[1] ? true : false)

const fiexdTelephoneLength = computed(() => {
  // 如果是 400 800 就是10位
  return ['400', '800'].includes(telephoneInput.value) ? 10 : 8
})

// watch(
//   () => props.telephone,
//   (newValue) => {
//     const split = trySplitAreaCode(newValue)
//     console.log(newValue, 'newValueisShowFiexdPhone', split)
//     if (split) {
//       isShowFiexdPhone.value = true
//       setTelephoneMaxlength()
//     } else {
//       isShowFiexdPhone.value = false
//     }
//   },
//   {
//     // immediate: true,
//   },
// )

// const telephoneInput = computed({
//   get() {
//     const telephone = formatTelephone(props.telephone)
//     return telephone?.split('-')?.[0] || ''
//   },
//   set(newValue) {
//     // 如果没有展示固定电话第二个输入框
//     console.log('kkkkkkkkkkkasdfadsf', newValue)
//     if (!isShowFiexdPhone.value) {
//       emit('onInputTelephone', newValue)
//       return
//     }
//     if (newValue || fiexdTelephone.value) {
//       emit('onInputTelephone', `${newValue}-${fiexdTelephone.value}`)
//     }
//   },
// })

// const fiexdTelephone = computed({
//   get() {
//     return props.telephone?.split('-')[1] || ''
//   },
//   set(newValue) {
//     console.log(newValue, 'onInputTelephonenewValue', `${telephoneInput.value}-${newValue}`)
//     emit('onInputTelephone', `${telephoneInput.value}-${newValue}`)
//   },
// })

// 注：固定电话输入框支持输入手机号:18688888888、带区号的分机号：0755-28689966、不带区号的分机号86251465
const telephoneMaxlength = ref(13)
const phoneRegular = /^(13[0-9]|14[57]|15[0-35-9]|16[6]|17[0135678]|18[0-9]|19[89])$/
const code = getCityTelephoneCodes()
const formatTelephone = (value: string) => {
  // 中文清空
  value = value.replace(/[\u4e00-\u9fa5]/gi, '')
  if (value.length > telephoneMaxlength.value) {
    return formatTelephone(value.slice(0, telephoneMaxlength.value))
  }
  let str = value
  if (isShowFiexdPhone.value) {
    return str
  }
  // 是否是区号
  if (sender.value) {
    if (value.startsWith('0') || value.startsWith('400') || value.startsWith('800')) {
      str = areaCodeMatch(str, code)
    }
  } else {
    if (value.startsWith('0') || value.startsWith('400') || value.startsWith('800')) {
      str = areaCodeMatch(str, code)
    } else if (phoneRegular.test(value.slice(0, 3))) {
      str = formatMobile(str, 11)
    }
  }
  console.log(str, 'dddddddddddddddddd', formatMobile(str, 11))
  return str
}

// fiexdPhone 字段格式化：仅保留数字，限制最大长度
const formatFiexdTelephone = (value: string) => {
  value = value.replace(/\D/g, '')
  const maxLen = telephoneInput.value === '400' || telephoneInput.value === '800' ? 10 : 8
  if (value.length > maxLen) {
    value = value.slice(0, maxLen)
  }
  return value
}

// 尝试从输入值中拆分区号和固定电话号码
const trySplitAreaCode = (value: string) => {
  const sanitized = value.replace(/\D/g, '')

  // 400/800 特殊处理
  if (sanitized.startsWith('400') || sanitized.startsWith('800')) {
    const matched = sanitized.startsWith('400') ? '400' : '800'
    let remaining = sanitized.slice(3)
    return { areaCode: matched, remaining, areaCodeLength: matched.length }
  }

  // 区号检测 (以0开头)，按长度降序匹配避免短码误匹配
  if (sanitized.startsWith('0') && code) {
    const codes = code.split('|').sort((a, b) => b.length - a.length)
    for (const areaCodeItem of codes) {
      if (sanitized.startsWith(areaCodeItem)) {
        let remaining = sanitized.slice(areaCodeItem.length)
        return { areaCode: areaCodeItem, remaining, areaCodeLength: areaCodeItem.length }
      }
    }
  }
  return null
}

const emit = defineEmits([
  'onFocusTelephone',
  'onInputTelephone',
  'onBlurTelephone',
  'onFocusExtension',
  'onInputExtension',
  'onBlurExtension',
  'onBlurFiexdTelephone',
])

const telephoneComp = computed(() => props.telephone)

const toBlurFiexdTelephone = () => {
  const pages = Taro.getCurrentPages()
  const currentPage = pages[pages.length - 1]
  let pageName = currentPage?.$taroPath || ''
  if (pageName?.indexOf('modules/order-build/pages/order/index') !== -1) {
    emit('onBlurFiexdTelephone')
  }
}

// 根据不同的规则设置最大长度
watch(telephoneComp, (value) => {
  telephoneMaxlength.value = 13
  const split = trySplitAreaCode(value ?? '')
  isShowFiexdPhone.value = !!split
  if (sender.value) {
    if (value.startsWith('400') || value.startsWith('800')) {
      telephoneMaxlength.value = 14
    } else if (value.startsWith('0') || !value) {
      telephoneMaxlength.value = 13
    } else {
      telephoneMaxlength.value = 8
    }
  } else {
    if (value.startsWith('400') || value.startsWith('800')) {
      telephoneMaxlength.value = 14
    } else if (value.startsWith('0') || !value) {
      telephoneMaxlength.value = 13
    } else if (phoneRegular.test(value.slice(0, 3))) {
      telephoneMaxlength.value = 11
    } else {
      telephoneMaxlength.value = 8
    }
  }
  if (isShowFiexdPhone.value && split) {
    telephoneMaxlength.value = split?.areaCodeLength || 4
  }
  // 需要等telephoneMaxlength生效后赋值，不然有问题，组件库的长度限制
  setTimeout(() => {
    const formatValue = formatTelephone(value)
    telephoneInput.value = formatValue.split('-')?.[0]
    fiexdTelephone.value = value.split('-')?.[1]
    console.log(value, 'kkkkkkkkkkkkkkkkkkkkkkk2', fiexdTelephone.value, telephoneMaxlength.value)
    // 原有基础上加一个条件
    !isShowFiexdPhone.value && emit('onInputTelephone', formatValue)
  })
})

const setTelephoneMaxlength = () => {
  if (isShowFiexdPhone.value) {
    const split = trySplitAreaCode(telephoneInput.value)
    telephoneMaxlength.value = split?.areaCodeLength || 4
  }
}

const telephoneCursor = ref(props.telephone?.split('-')?.[0]?.length || 0)
const telephoneCursorSpacing = ref(props.telephone?.split('-')?.[0]?.length || 0)
const cursor = ref(props.telephone?.split('-')?.[1]?.length || 0)
const cursorSpacing = ref(props.telephone?.split('-')?.[1]?.length || 0)
const onFocusTelephone = (value: string) => {
  emit('onFocusTelephone', value)
  // 需要自动聚焦到最后一个
  setTimeout(() => {
    telephoneCursor.value = telephoneInput.value?.length
    telephoneCursorSpacing.value = telephoneInput.value?.length
  }, 50)
}

const onFocusFiexdTelephone = (value: string) => {
  setTimeout(() => {
    cursor.value = fiexdTelephone.value?.length
    cursorSpacing.value = fiexdTelephone.value?.length
  }, 50)
}

const onFocusExtension = (value: string) => {
  emit('onFocusExtension', value)
}

let timer: any = null
const toOnInputTelephone = async (value: string) => {
  const split = trySplitAreaCode(value)
  console.log(split, 'split', value)
  if (split && split.areaCode === value && telephoneInput.value === split.areaCode) return
  if (split) {
    // 匹配到区号：拆分为区号和固定电话
    isShowFiexdPhone.value = true
    telephoneInput.value = split.areaCode
    telephoneMaxlength.value = split.areaCodeLength
    console.log(telephoneInput.value, 'telephoneInput.value', isShowFiexdPhone.value)
    timer = setTimeout(() => {
      fiexdTelephone.value = split.remaining
    })
    emit('onInputTelephone', `${split.areaCode}-${split.remaining}`)

    if (split.remaining?.length < 7) {
      cursor.value = split.remaining?.length
      await nextTick()
      setTimeout(
        () => {
          fiexdPhoneRef?.value?.fieldRef?.inputRef?.focus()
        },
        isAliMiniApp || isAmapMiniApp ? 200 : 50,
      )
    } else {
      if (isAliMiniApp || isAmapMiniApp) {
        Taro.hideKeyboard() // 主动收起键盘
      } else {
        telephoneRef1?.value?.fieldRef?.inputRef?.blur()
      }
      toBlurFiexdTelephone()
    }
  } else {
    // 未匹配区号：作为普通号码处理
    isShowFiexdPhone.value = false
    fiexdTelephone.value = ''
    telephoneInput.value = formatTelephone(value)
    emit('onInputTelephone', formatTelephone(value))
  }
}

const hideKeyboard = (value: string) => {
  if (isAliMiniApp || isAmapMiniApp) {
    Taro.hideKeyboard() // 主动收起键盘
  }
}

const onInputFiexdTelephone = (value: string) => {
  value = value.replace(/[\u4e00-\u9fa5]/gi, '')
  fiexdTelephone.value = formatFiexdTelephone(value)
  // 这里需要考虑newValue为空的情况
  if (!value) {
    emit('onInputTelephone', telephoneInput.value)
  } else {
    emit('onInputTelephone', `${telephoneInput.value}-${value}`)
  }
  if (timer) clearTimeout(timer)
}

const onBlurTelephone = debounce(() => {
  telephoneCursor.value = telephoneInput.value?.length
  telephoneCursorSpacing.value = telephoneInput.value?.length
  !isShowFiexdPhone.value && emit('onBlurTelephone')
}, platformInputDebounceTime)

const onBlurFiexdTelephone = debounce(() => {
  cursor.value = fiexdTelephone.value?.length
  cursorSpacing.value = fiexdTelephone.value?.length
  // emit('onBlurFiexdTelephone')
  toBlurFiexdTelephone()
}, platformInputDebounceTime)

/* 区号匹配后自动聚焦到 fiexdPhone 输入框 */
watch(
  isShowFiexdPhone,
  (val) => {
    console.log(val, 'isShowFiexdPhone')
    if (val) {
      setTelephoneMaxlength()
    }
  },
  {
    immediate: true,
  },
)

/* 支付宝-固话maxlength长度处理 start */
const telephoneRef1 = ref()

const onInputExtension = debounce((value: string) => {
  let formatValue = value
  if (props.extensionConfig.format) {
    formatValue = props.extensionConfig.format(value)
  }
  emit('onInputExtension', formatValue)
}, platformInputDebounceTime)

const onBlurExtension = () => emit('onBlurExtension')

// 判断来自收方地址簿
const isFromReceiveAddressBook = () => {
  return [Address.RECEIVE_ADDRESS_BOOK_PAGE].includes(props.source as Address)
}

const getPlaceHolder = (required: boolean) => {
  let placeholder = '固定电话'
  // 来自地址簿，展示固定文案
  if (isFromReceiveAddressBook()) return placeholder
  const { required: mobileRequired } = props.mobileConfig
  if (!required && mobileRequired) {
    placeholder = '固定电话(选填)'
  }
  return placeholder
}

// 组件销毁后，清除定时器
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
