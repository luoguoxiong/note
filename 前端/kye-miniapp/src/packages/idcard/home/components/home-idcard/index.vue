<template>
  <view class="home-idcard">
    <IdcardBaseInfo :baseInfo="baseInfo">
      <view class="home-idcard-footer">
        <view class="contact-btn" @click="handleCallPhone">
          <image
            class="contact-item-img"
            src="https://ic-img.ky-express.com/netc/20250206_78466301196_!!1738835096863_80_80.png"
          />
          <text class="contact-item">拨打电话</text>
        </view>
        <view class="contact-btn" @click="handleContact">
          <image
            class="contact-item-img"
            src="https://ic-img.ky-express.com/netc/20250206_51066301179_!!1738835096861_80_80.png"
          />
          <text class="contact-item">企业微信</text>
        </view>
      </view>
    </IdcardBaseInfo>

    <!-- 弹窗 -->
    <ky-popup
      :show="show"
      safe-area-inset-bottom
      position="bottom"
      :is-border-radius="true"
      @click-overlay="handleClickClosePopup"
      class="home-idcard-phone-popup"
      :class="`${!isPhonePopupMode && qrCodeLink ? 'home-idcard-popup-content_wechat_mode_spacing' : ''}`"
    >
      <!-- 头部信息 -->
      <view class="header">
        <view class="title"> {{ isPhonePopupMode ? '拨打电话' : '企业微信' }} </view>
        <!-- 关闭按钮 -->
        <image
          @tap="handleClickClosePopup"
          class="closeIcon"
          src="https://ic-img.ky-express.com/default/20250813_2964_!!1755087285512_32_32.svg+xml"
        />
      </view>
      <!-- 中间内容 -->
      <view
        :class="`home-idcard-popup-content ${isPhonePopupMode ? 'home-idcard-popup-content_phone_mode' : 'home-idcard-popup-content_wechat_mode'}`"
      >
        <!-- 拨打手机号 -->
        <view v-if="isPhonePopupMode" class="contact-phone">
          <view class="contact-phone-item contact-phone-text">将用此手机号码联系销售</view>

          <!-- 纯展示 -->
          <view v-if="show && showPruePhoneText" class="contact-phone-item prue-phone-text">
            <text class="phone-text" @tap="handleEditShowInputVal">{{ pruePhone }}</text>
            <image
              class="edit-icon"
              @tap="handleEditShowInputVal"
              src="https://ic-img.ky-express.com/netc/20250307_4856630113_!!1741336449982_96_96.png"
            />
          </view>
          <!-- 输入框 -->
          <view v-if="show && showInputVal" class="contact-phone-item contact-phone-item-inputValue">
            <ky-input
              v-if="show && showInputVal"
              class="contact-phone-inputValue__input"
              type="number"
              clearable
              :maxlength="11"
              placeholder="请输入手机号码"
              v-model="phone"
              placeholder-style="font-size: 28rpx; color: #888EA6;font-weight: normal;line-height: 36rpx;"
              always-embed
              cursor-spacing="100rpx"
              @change="handlePhoneChange"
            />
          </view>
          <view class="contact-phone-item phone-btn-warp">
            <ky-button class="contact-phone-call" @click="getCallPhone">拨打</ky-button>
          </view>
        </view>
        <!-- 企业微信 -->
        <view
          v-if="!isPhonePopupMode"
          class="contact-shangwu-warp"
          :class="contactShangwuWarpClass"
          @click="handleDownLoadWechatImg"
        >
          <template v-if="qrCodeLink && !isPC">
            <view class="contact-shangwu">
              <view class="shangwu-text" v-if="isIOSComputed">点击二维码保存到本地</view>
              <view class="shangwu-text" v-else>长按将二维码保存到本地</view>
              <Image class="shangwu-img" :show-menu-by-longpress="true" :src="qrCodeLink" />
            </view>
          </template>
          <template v-if="qrCodeLink && isPC">
            <view class="contact-shangwu">
              <view class="shangwu-text">点击下方二维码将二维码保存到本地</view>
              <image class="shangwu-img" :src="qrCodeLink" />
            </view>
          </template>
          <template v-if="!qrCodeLink">
            <view class="noQrcode-link-warp">
              <view class="noQrcode-link-content">
                <image
                  class="noQrcode-link-img"
                  src="https://ic-img.ky-express.com/netc/20250224_30266301134_!!1740363204371_424_423.png"
                />
                <text class="noQrcode-link-text">销售未开通企业微信，可电话联系销售</text>
              </view>
              <view class="noQrcode-link-contact-phone-item noQrcode-link-phone-btn-warp">
                <ky-button class="noQrcode-link-contact-phone-call" @click="handlePhoneContact">电话联系</ky-button>
              </view>
            </view>
          </template>
        </view>
      </view>
    </ky-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps, watch } from 'vue'
import { callSalePhone, getQrCodeImg } from '@/packages/idcard/api/index'
import type { getSaleQrCodeAPITypes } from '@/packages/idcard/api/types/index'
import Taro, { useDidShow } from '@tarojs/taro'
import { saveRemoteImage } from '../../../utils/saveImage'
// 组件
import IdcardBaseInfo from '../idcard-base/index.vue'
import { trackEvent } from './report'
import { isPC, isIphoneV2, isAndroid, isQw, ua } from '@/packages/idcard/utils/idcard-device'
import { useUserInfo } from '@/public/hooks'
import { isWxPcAppletEnv } from '@/public/utils'
import plateform from '@kye-netc/plateform'

const PopopPhone = 'phone'
const props = defineProps({
  code: String,
  baseInfo: Object,
  isInnerEmployee: Boolean,
  innerEmployInfo: Object,
  isSales: Boolean,
})

const { userInfo } = useUserInfo()

const isLogin = computed(() => !!userInfo.value?.phone)

const defaultWechatImg = 'https://ic-img.ky-express.com/netc/20250206_90166301118_!!1738842674316_364_356.png'
const defaultPhone = '95324'

const show = ref(false)
const phone = ref(userInfo.value?.phone)
const popupMode = ref(PopopPhone)
const wexinQrcode = ref(defaultWechatImg)
const showPruePhoneText = ref(false)
const showInputVal = ref(false)

const isInnerEmpoee = computed(() => props.isInnerEmployee)

const contactShangwuWarpClass = computed(() => (isQw ? 'contact-shangwu-warp_QW' : ''))

const formatPhoneNumber = (phoneNumber) => {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '')
  if (cleaned.length !== 11) {
    return phoneNumber
  }
  return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')
}

const pruePhone = computed(() => {
  if (userInfo.value?.phone) {
    return formatPhoneNumber(userInfo.value?.phone)
  }
  return '请输入号码'
})

const setPopupMode = (val: string) => {
  popupMode.value = val
}

const handleEditShowInputVal = () => {
  showPruePhoneText.value = false
  showInputVal.value = true
  phone.value = userInfo.value?.phone
}

const beforeCheck = () => {
  if (!isLogin.value) {
    Taro.navigateTo({ url: '/modules/user/pages/login/index' })
    return false
  }
  if (isInnerEmpoee.value) {
    Taro.showToast({
      title: '内部员工不可操作',
      icon: 'none',
    })
    return false
  }

  if (props.isSales) {
    Taro.showToast({
      title: '内部员工不可操作',
      icon: 'none',
    })
    return false
  }
  return true
}

const handleCallPhone = () => {
  if (isWxPcAppletEnv) {
    Taro.showToast({
      title: '该设备暂不支持该操作',
      icon: 'none',
    })
    return
  }
  if (beforeCheck()) {
    trackEvent('clk_page_business_card_homepage_make_phone_call', '拨打电话', {
      button_name: '拨打电话',
      page_name: 'page_business_card_homepage',
      sales_id: props.baseInfo?.hrUserId,
    })
    setPopupMode(PopopPhone)
    show.value = true
    showPruePhoneText.value = true
    showInputVal.value = false
    phone.value = userInfo.value?.phone
  }
}

const handleContact = () => {
  if (isInnerEmpoee.value) {
    Taro.showToast({
      title: '内部员工不可操作',
      icon: 'none',
    })
    return false
  }
  try {
    trackEvent('clk_page_business_card_homepage_get_enterprise_micro', '企业微信', {
      button_name: '企业微信',
      page_name: 'page_business_card_homepage',
      sales_id: props.baseInfo?.hrUserId,
    })
  } catch (error) {
    console.log('联系商务 报错', error)
  }

  setPopupMode('shangwu')
  show.value = true
}

const handleClickClosePopup = () => {
  show.value = false
}

const handlePhoneChange = (val) => {
  phone.value = val.detail.value
}

const getCallPhone = async () => {
  try {
    let paramsPhone = userInfo.value?.phone
    if (showInputVal.value) {
      if (!phone.value) {
        Taro.showToast({
          title: '请输入正确手机号码',
          icon: 'none',
        })
        return
      }
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(phone.value)) {
        Taro.showToast({
          title: '请输入正确手机号码',
          icon: 'none',
        })
        return
      }
      paramsPhone = phone.value
    }

    if (isPC) {
      Taro.showToast({
        title: '请使用移动设备进行拨号',
        icon: 'none',
      })
      return
    }

    let { data: res } = await callSalePhone({
      code: props.code,
      mobile: paramsPhone,
    })
    if (res) {
      show.value = false
      let virtualMobile = res.virtualMobile
      plateform.makePhoneCall({ phoneNumber: virtualMobile || defaultPhone })
      return
    }
  } catch (error) {
    console.log('获取虚拟号码失败: ', error)
  }
}

const qrCodeLink = computed(() => wexinQrcode.value || defaultWechatImg || '')

const isPhonePopupMode = computed(() => popupMode.value === PopopPhone)

const getQRcode = async () => {
  try {
    let paramsTemp = {
      code: props.code,
    }
    let { data: res }: getSaleQrCodeAPITypes.GetSaleQrCodeResponse = await getQrCodeImg(
      paramsTemp as getSaleQrCodeAPITypes.GetSaleQrCodeRequest,
    )
    if (res) {
      wexinQrcode.value = res.qrCodeUrl
    }
  } catch (error) {
    console.log('error>>>', error)
  }
}

const isIOSComputed = computed(
  () => (ua.includes('appleWebKit') || ua.includes('Mac OS X')) && isQw && qrCodeLink.value,
)

const handleDownLoadWechatImg = async () => {
  console.log('安卓：： isAndroid ', isAndroid, 'qrCodeLink.value ', qrCodeLink.value)
  try {
    if (isPC && qrCodeLink.value) {
      await saveRemoteImage(qrCodeLink.value)
      return
    }
    // ios的长按
    const isIOS = ua.includes('appleWebKit') || ua.includes('Mac OS X')
    console.log('🚀 ~666isIOS:', isIOS)

    console.log('isQwv ', isQw, '566633 22222 isIOS > 111111', isIOS)
    console.log('qrCodeLink.value >>>>>>> ', qrCodeLink.value)
    console.log('是ios机型', isIOS)
    if (isQw && qrCodeLink.value && isIOS) {
      await saveRemoteImage(qrCodeLink.value)
      return
    }
  } catch (error) {
    console.log('点击保存失败', error)
  }
}

const handlePhoneContact = () => {
  if (beforeCheck()) {
    setPopupMode(PopopPhone)
    show.value = true
    showPruePhoneText.value = true
    showInputVal.value = false
    phone.value = userInfo.value?.phone
  }
}

const emits = defineEmits(['updateShow'])

watch(
  () => show.value,
  (val) => {
    console.log('监听popup展示', val)
    emits('updateShow', val)
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  setTimeout(() => {
    getQRcode()
  }, 500)
})
</script>

<style lang="scss">
@import './index.scss';
</style>
