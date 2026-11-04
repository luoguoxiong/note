<template>
  <view class="scan-code">
    <view v-if="!isLoading" class="scan-code__wrapper">
      <view class="scan-code__content">
        <image
          class="scan-code__bgImage"
          :src="
            isQrCodeValid && isBindSuc
              ? 'https://ic-img.ky-express.com/netc/20221228_4596384140_!!1672216606059_1356_516.png'
              : 'https://ic-img.ky-express.com/netc/20221228_56163841470_!!1672216599969_1356_516.png'
          "
        />
        <view v-if="isQrCodeValid && isBindSuc && userInfo.customerShortName" class="scan-code__box">
          <view class="scan-code__login-account">您的登录账号</view>
          <view class="scan-code__phoneNumber">{{ filterPhone() }}</view>
          <view
            v-if="userInfo.customerCode && userInfo.customerCode !== customerCode"
            class="scan-code__textWrap t_a_c f_w_400 f_s_32 scan-code__texts"
          >
            由
            <text class="c_333 f_w_600 m_l_12 m_r_24">{{ userInfo.customerShortName }}</text>
            换绑为
            <text class="c_333 f_s_32 f_w_600 m_l_24">{{ userInfo.customerShortName }}</text>
          </view>
          <view v-else class="scan-code__textWrap t_a_c f_w_400 f_s_32 scan-code__text">
            已成功绑定
            <text class="c_333 f_w_600 m_l_24">{{ userInfo.customerShortName }}</text>
          </view>
        </view>
        <view v-else class="scan-code__failWrap">
          <image
            class="qrImage"
            src="https://ic-img.ky-express.com/netc/20221224_726384143_!!1671870917440_656_656.png"
          />
          <view class="vaildText" :class="{ alignCenter: !userInfo.customerShortName }">二维码已失效</view>
          <view class="contactText">
            {{
              userInfo.customerShortName
                ? `您当前已绑定【${userInfo.customerShortName}】可以点击去寄件或联系商务重新获取二维码`
                : '可联系商务重新获取'
            }}
          </view>
        </view>
      </view>
      <view v-if="!userInfo.customerShortName" class="scan-code__footer">
        <view class="scan-code__btn" @tap="toContact">联系商务</view>
      </view>
      <view v-else class="scan-code__footer pd60">
        <view class="scan-code__btn" @tap="handleGoHome">去寄件</view>
        <view v-if="!isQrCodeValid || (isQrCodeValid && !isBindSuc)" class="contactBtn" @tap="toContact">
          <image
            class="phoneIcon"
            src="https://ic-img.ky-express.com/netc/20221210_84763841458_!!1670643995829_144_144.png"
          />
          联系商务
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { ref } from 'vue'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { useUserInfo } from '@/public/hooks'
import { getBindCustomerVirtualMobile } from '../api'
import './index.scss'
import kyeNavigate from '@/public/utils/native/navigate'

defineOptions({ name: 'ScanCode' })

const router = useRouter()

const isLoading = ref(true)
const isBindSuc = ref(false)
const isQrCodeValid = ref(false)
const virtualContactPhone = ref('')
const customerCode = ref('')

const { autoLoginHook } = useAutoLogin()
const { userInfo } = useUserInfo()

useDidShow(async () => {
  if (userInfo.value.phone) {
    Taro.showLoading({ mask: true, title: '加载中...' })
    isLoading.value = true
    await handleInvalidQrCode(router.params.appletId)
  } else {
    autoLoginHook({ needLogin: true })
  }
})

async function handleInvalidQrCode(appletId) {
  getVirtualContactPhone(appletId)
  isQrCodeValid.value = false
  Taro.hideLoading()
  isLoading.value = false
}

function getVirtualContactPhone(appletId) {
  getBindCustomerVirtualMobile({ appletId }, { hideToast: true })
    .then(({ data }) => {
      virtualContactPhone.value = data?.virtualPhone || '95324'
    })
    .catch(() => {
      virtualContactPhone.value = '95324'
    })
}

function toContact() {
  Taro.makePhoneCall({ phoneNumber: virtualContactPhone.value })
}

function filterPhone() {
  let phone = userInfo.value.phone
  return phone ? phone.substring(0, 3) + ' ' + phone.substring(3, 7) + ' ' + phone.substring(7) : ''
}

function handleGoHome() {
  kyeNavigate.navigateBefore('navigateTo', {
    url: '/modules/order-build/pages/order/index',
  })
}
</script>
