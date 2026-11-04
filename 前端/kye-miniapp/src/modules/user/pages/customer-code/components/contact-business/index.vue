<template>
  <ky-popup :zIndex="zIndex" :show="show" :closeOnClickOverlay="false" position="bottom">
    <view class="cbus">
      <view class="cbus-title">
        <text>联系{{ roleName || '商务' }}</text>
        <view class="cbus-close-wrap" @tap="handleClose">
          <image
            class="cbus-close"
            src="https://ic-img.ky-express.com/netc/20250118_42870395139_!!1737186469837_64_64.png"
          ></image>
        </view>
      </view>
      <view class="cbus-empty" v-if="showType === StutusMap.noBusiness">
        <image
          class="cbus-empty-img"
          src="https://ic-img.ky-express.com/netc/20250118_4287039518_!!1737186875983_280_280.png"
        ></image>
        <view class="cbus-empty-text">暂未匹配到{{ roleName || '商务' }}</view>
        <view class="cbus-empty-desc">
          <view>您可拨打95324联系人工客服咨询，或</view>
          <view>申请专属商务为您匹配专属商务</view>
        </view>
        <view class="cbus-empty-btns">
          <ky-button type="primary" plain @click="toApply">申请专属商务</ky-button>
          <ky-button type="primary" @click="callPhpne('95324')">拨打95324</ky-button>
        </view>
      </view>
      <view class="cbus-qrcode" v-if="showType === StutusMap.showWxQrcode">
        <view class="cbus-qrcode-desc">点击图片保存企业微信二维码至相册，7天内有效</view>
        <image class="cbus-qrcode-img" :src="marketInfo.qrcode" @tap="handlePreviewImage" />
        <view class="cbus-qrcode-btns">
          <ky-button type="primary" size="large" @click="updateShowType(StutusMap.hasBusiness)"
            >获取商务联系方式</ky-button
          >
        </view>
      </view>
      <view class="cbus-form" v-if="showType === StutusMap.hasBusiness">
        <view class="cbus-form-title">将用此电话号码联系{{ roleName || '商务' }}</view>
        <view class="cbus-form-phone" v-if="!isEditPhone">{{ filterPhone(phone) }} </view>
        <view class="cbus-form-edit" @tap="editPhone" v-if="!isEditPhone">
          非本机号请修改
          <image
            class="cbus-form-icon"
            src="https://ic-img.ky-express.com/netc/20241216_21858405369_!!1734342983011_65_65.png"
          />
        </view>
        <view v-if="isEditPhone" class="cbus-form-input">
          <view class="input-wrap">
            <view class="input-popover" v-if="hasError">
              <image
                class="input-popover-arrow"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAQCAYAAAAMJL+VAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAB9SURBVDiNtdS7EYAgEEXRi9iO/WiFUJD2Y+BvRFhWZV+CJPcEzOi45jCYS04TwCwO0FnGAXpgBCajfvDAsl+G1nEgerY3mBsjAYgAB0BD5IynQAvkFs8Bf5BHvAR8QbJxCXiDFOM1QIOIcQ0gIdW4FsghqjhsvwrtYuFb3ArpMhoBGamKoQAAAABJRU5ErkJggg=="
              ></image>
              {{ errorText }}</view
            >
            <ky-input
              v-model="phoneNumber"
              label="手机号"
              placeholder="请输入手机号"
              required
              :maxLength="21"
              :enableNative="isWxMiniApp"
              :enableWxNative="isWxMiniApp"
              id="phone-input"
              clearable
              @input="onInput"
              @blur="blurVerify"
              :is-error="hasError"
              :always-system="!isAmapMiniApp"
              :cursor-spacing="130"
              :focus="true"
              :shouldFocus="true"
            ></ky-input>
          </view>
        </view>
        <view class="cbus-form-btns">
          <ky-button
            size="large"
            plain
            type="primary"
            v-if="marketInfo.qrcode"
            @click="updateShowType(StutusMap.showWxQrcode)"
            >获取商务企业微信</ky-button
          >
          <ky-button type="primary" size="large" @click="toCall">{{
            marketInfo.qrcode || managerInfo?.wechat ? '拨打' : '立即拨打'
          }}</ky-button>
        </view>
      </view>
      <view class="cbus-loading" v-if="showType === StutusMap.loading">
        <ky-loading>加载中...</ky-loading>
      </view>
    </view>
  </ky-popup>
</template>
<script lang="ts" setup>
import Taro, { useDidHide } from '@tarojs/taro'
import './index.scss'
import { getMarketVirtualContact, getApplyVirtualContact } from './api'
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { useApplication } from '@/public/utils/application/useApplication'
import { ApplicationCodeMap, defaultChannelCode } from '@/public/utils/application/constants'
import { getEnvConfig } from '@public/constants'
import plateform from '@kye-netc/plateform'
import { debounce } from 'lodash-es'
import { isAliMiniApp, isAmapMiniApp, isWxMiniApp } from '@/public/utils'

const { navigateApplicationWithCode } = useApplication()

useDidHide(() => {
  const hideNeedClose = props.hideNeedClose
  if (hideNeedClose) {
    emit('update:show', false)
  }
})

onUnmounted(() => {
  const hideNeedClose = props.hideNeedClose
  if (hideNeedClose) {
    emit('update:show', false)
  }
})

const props = withDefaults(
  defineProps<{
    show: boolean
    phone: string
    roleName?: string
    hideNeedClose?: boolean
    customerCode?: string
    scene?: string
    zIndex?: number
    showType?: 'phone' | 'qrcode'
    managerInfo?: Object
  }>(),
  {
    show: false,
    hideNeedClose: true,
    showType: 'phone',
    managerInfo: {}
  },
)

const phoneError = ref()

enum StutusMap {
  'loading' = -1,
  'noBusiness' = 0,
  'hasBusiness' = 1,
  'showWxQrcode' = 2,
}

const showType = ref<StutusMap>(-1)

const isEditPhone = ref(false)

const hasError = ref(false)

const errorText = ref('')

const phoneNumber = ref('')

const tempPhone = ref('')

const marketInfo = ref({
  name: '',
  qrcode: '',
  virtualPhone: '',
})

const getChannel = () => {
  if (isWxMiniApp) {
    return 'wechat'
  } else if (isAmapMiniApp) {
    return 'amap'
  } else if (isAliMiniApp) {
    return 'alipay'
  } else {
    return 'lark'
  }
}

watch(
  () => [props.show],
  () => {
    if (props.show && !props.phone) {
      showType.value = StutusMap.noBusiness
      return
    }
    if (props.show && props.phone && !props.managerInfo?.role) {
      isEditPhone.value = false
      showType.value = StutusMap.loading
      hasError.value = false
      phoneNumber.value = props.phone
      getMarketVirtualContact({
        userInputMobile: props.phone,
        channel: getChannel(),
        customerCode: props.customerCode,
        scene: props.scene || '',
      })
        .then((res: any) => {
          marketInfo.value = res.data
          if (props.showType === 'qrcode' && marketInfo.value.qrcode) {
            showType.value = StutusMap.showWxQrcode
          } else {
            showType.value = StutusMap.hasBusiness
          }
        })
        .catch((err) => {
          if (err && err.code === 50067) {
            showType.value = StutusMap.noBusiness
          } else {
            emit('update:show', false)
            return
          }
        })
    } else {
      console.log('phoneError', phoneError.value)
      phoneError.value?.closePopover()
    }
    if (props.show && props.managerInfo?.role) {
      isEditPhone.value = false
      showType.value = StutusMap.loading
      hasError.value = false
      phoneNumber.value = props.phone
      if (props.managerInfo?.wechat) {
        showType.value = StutusMap.showWxQrcode
      } else {
        showType.value = StutusMap.hasBusiness
      }
    }
  },
  {
    immediate: true,
  },
)

const emit = defineEmits(['update:show', 'change', 'toCall', 'editPhone', 'callError'])

const handleClose = () => {
  emit('update:show', false)
  emit('change', false)
}

const toApply = () => {
  const { areaCode, menuCode } = ApplicationCodeMap['绑码组件']
  navigateApplicationWithCode({
    areaCode,
    menuCode,
  })
}

const editPhone = () => {
  emit('editPhone')
  isEditPhone.value = true
}

const callPhpne = async (phone: string) => {
  emit('toCall')
  await plateform.makePhoneCall({ phoneNumber: phone })
}

const handlePreviewImage = async () => {
  await plateform.saveImageToPhotosAlbum(marketInfo.value.qrcode)
}

const updateShowType = (type: StutusMap) => {
  showType.value = type
}

const filterPhone = (phone: string) => (phone ? phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3') : '')

const threeAreaCode = (str) => {
  const area = ['400', '800', '010', '022', '024', '021', '025', '027', '020', '028', '029', '023']
  return area.some((i) => str.startsWith(i))
}

const onInput = (event) => {
  if (hasError.value) {
    hasError.value = false
  }
  let val = event
  console.log('onInput', val, tempPhone.value)
  // 区号与座机号间无 -
  if (
    val.startsWith('0') &&
    !threeAreaCode(val) &&
    (val.match(/-/g) || []).length === 0 &&
    val.length >= 4 &&
    tempPhone.value.length < val.length
  ) {
    val = val.slice(0, 4) + '-' + val.slice(4)
  }
  // 400和800客服热线与座机号间无 -
  if (
    threeAreaCode(val) &&
    (val.match(/-/g) || []).length === 0 &&
    val.length >= 3 &&
    tempPhone.value.length < val.length
  ) {
    val = val.slice(0, 3) + '-' + val.slice(3)
  }
  // 限制输入一个 -
  if ((val.match(/-/g) || []).length > 1 && val.slice(-1) === '-') {
    val = val.slice(0, -1)
  }
  nextTick(() => {
    tempPhone.value = val
    phoneNumber.value = val
  })
}

const blurVerify = () => {
  phoneError.value && phoneError.value.closePopover()
  verifyValue(phoneNumber.value)
}

const verifyValue = (value) => {
  errorText.value = ''
  hasError.value = false
  const inputPhone = value
  if (!validatePhone(inputPhone)) {
    setTimeout(() => {
      phoneError.value.showPopover('phone-input', {
        location: 'top-start',
        theme: 'dark',
      })
    }, 100)
    hasError.value = true
    errorText.value = inputPhone
      ? inputPhone.startsWith('1')
        ? '请输入正确的手机号'
        : '请输入正确的手机号'
      : '请输入手机号'
    return true
  } else {
    phoneError.value && phoneError.value.closePopover()
    return false
  }
}
/* debounce 用于处理气泡导致键盘抖动 */
const debounceverifyValue = debounce(verifyValue, 100)

const toCall = async () => {
  const { isPc } = getEnvConfig()
  if (isPc) {
    Taro.showToast({
      title: '当前登录设备，暂不支持该功能',
      icon: 'none',
    })
    return
  }
  if (props.managerInfo?.role) {
    getManagerContact()
    return
  }
  try {
    if (verifyValue(phoneNumber.value)) return
    const res = await getMarketVirtualContact({
      userInputMobile: phoneNumber.value.replace(/\D/g, ''),
      channel: getChannel(),
      customerCode: props.customerCode,
      scene: props.scene || '',
    })
    if (res.data.isNeedAuthenticate) {
      navigateApplicationWithCode(ApplicationCodeMap['联系商务-虚拟号实名认证'])
      return
    }
    emit('toCall')
    plateform.makePhoneCall({ phoneNumber: res.data.virtualPhone })
  } catch (error) {
    console.log(error, 'error-点击拨打异常了')
    emit('update:show', false)
    emit('callError')
    Taro.showToast({
      title: '系统繁忙,请稍后重试',
      icon: 'none',
    })
  }
}

// 虚拟号获取当前可联系的管理员
const getManagerContact = () => {
  if (verifyValue(phoneNumber.value) && isEditPhone.value) return
  getApplyVirtualContact({
    outPhone: phoneNumber.value || props.phone,
    from: 10,
    customer: props.managerInfo.customerCode,
    needVerifyAuthName: true,
  }).then((res) => {
    if (res?.data?.needRealName) {
      navigateApplicationWithCode(ApplicationCodeMap['联系商务-虚拟号实名认证'])
      return 
    }
    const { isPc } = getEnvConfig()
    if (isPc) {
      Taro.showToast({
        title: '当前登录设备，暂不支持该功能',
        icon: 'none',
      })
      return
    }
    emit('toCall')
    plateform.makePhoneCall({ phoneNumber: res.data.virtualNum })
  }).catch((error) => {
    Taro.showToast({
      title: error,
      icon: 'none',
    })
  })
}

/**
 * 校验手机号
 * @param {string} value - 用户输入的电话号码
 * @returns {boolean} 是否合法
 */
 const validatePhone = (value) => {
  if (!value) return false

  // 去除所有空格
  let str = value.replace(/\s+/g, '')

  // 1. 先校验手机号（11位，1开头）
  const mobileReg = /^1[3-9]\d{9}$/
  if (mobileReg.test(str)) {
    return true
  } else {
    return false
  }

  return true
}

/**
 * 校验手机号或座机号
 * @param {string} value - 用户输入的电话号码
 * @returns {boolean} 是否合法
 */
const validatePhoneOrLandline = (value) => {
  if (!value) return false

  // 去除所有空格
  let str = value.replace(/\s+/g, '')

  // 1. 先校验手机号（11位，1开头）
  const mobileReg = /^1[3-9]\d{9}$/
  if (mobileReg.test(str)) {
    return true
  }

  // 2. 校验 400/800 客服热线、三位数区号
  // 支持：4001234567、400-1234567、8001234567、800-1234567
  const hotlineReg = /^(400|800)(-)?\d{5,10}$/
  if (hotlineReg.test(str)) {
    // 检查总长度是否 <= 21
    const digitsOnly = str.replace(/-/g, '')
    if (digitsOnly.length <= 21) {
      return true
    }
  }

  // 3. 处理座机号（含区号）
  let hasHyphen = str.includes('-')
  let areaCode = ''
  let phoneNumber = ''

  if (hasHyphen) {
    // 3.1 带横杠的情况：必须只有1个横杠
    if ((str.match(/-/g) || []).length !== 1) {
      return false
    }
    const parts = str.split('-')
    if (parts.length !== 2) return false
    areaCode = parts[0]
    phoneNumber = parts[1]

    // 区号必须以0开头，3-4位数字
    if (!/^0\d{2,3}$/.test(areaCode)) {
      return false
    }
    // 座机号必须是7-8位数字
    if (!/^\d{7,8}$/.test(phoneNumber)) {
      return false
    }
  } else {
    // 3.2 不带横杠：尝试自动分割区号
    if (!/^\d+$/.test(str)) {
      return false // 必须全是数字
    }

    // 如果以0开头，且长度 >= 10（3位区号+7位号码）或 >=11（4位区号+7位）
    if (str.startsWith('0')) {
      // 尝试按4位区号分割（优先）
      if (str.length >= 11 && str.length <= 12) {
        areaCode = str.slice(0, 4)
        phoneNumber = str.slice(4)
      }
      // 尝试按3位区号分割
      else if (str.length >= 10 && str.length <= 11) {
        areaCode = str.slice(0, 3)
        phoneNumber = str.slice(3)
      } else {
        return false // 长度不符合
      }

      // 验证区号和号码
      if (!/^0\d{2,3}$/.test(areaCode)) return false
      if (!/^\d{7,8}$/.test(phoneNumber)) return false
    } else {
      // 不以0开头：视为无区号座机号（7-8位）
      if (/^\d{7,8}$/.test(str) && !str.startsWith('1')) {
        return true
      } else {
        return false
      }
    }
  }

  return true
}
</script>
