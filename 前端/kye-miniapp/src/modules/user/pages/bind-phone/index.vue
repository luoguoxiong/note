<template>
  <ky-container class="bind-phone" v-bind="pageOptions">
    <view class="bind-phone__header">
      <view class="bind-phone__header-text">
        {{ pageOptions.navBarOptions.title }}
      </view>
    </view>

    <view class="bind-phone__content">
      <view>
        <view class="bind-phone__content-card">
          <view class="bind-phone__content-text">请确认微信跨越寄件小程序登录手机号</view>
          <view class="bind-phone__content-phone">{{ router.params.phone }}</view>
        </view>
        <ky-button class="bind-phone__button" type="primary" @click="handleWechatBind">
          <template #icon>
            <image
              src="https://ic-img.ky-express.com/netc/20221108_85421882324_!!1667891040905_96_96.png"
              alt="微信一键绑定"
            />
          </template>
          微信一键绑定
        </ky-button>
        <view class="bind-phone__content-tips">
          绑定后APP默认登录小程序手机号
          <view class="bind-phone__content-link" @click="handleChangePhone">更换登录手机号</view>
        </view>
      </view>
    </view>
    <Captcha ref="captchaRef" />
  </ky-container>
</template>

<script setup lang="ts">
import Taro, { useRouter } from '@tarojs/taro'
import Captcha from '@public/components/base/captcha/index.vue'
import { ref, onMounted } from 'vue'
import { useLoginPublicParmas } from '@modules/user/pages/login/components/phone-login/hooks'
import { api } from './api'
import { getEnvConfig } from '@/public/config'
import { useLogin } from '../login/hooks/login'
import {
  reportBindPhoneUv,
  reporMineSettingBindClick,
  reportMineSettingBindOther
} from '../../report/phone.ts'
import { ThirdAuthorizedLoginData } from '../../apis/login/types'
import './index.scss'
import { withCaptchaRequest } from '@/public/components/base/captcha/utils'

defineOptions({ name: 'bind-phone' })

const router = useRouter()

const captchaRef = ref()

const pageOptions = ref({
  navBarOptions: { showPlatList: ['wx'], title: '绑定手机号码' },
})

const handleChangePhone = () => {
  reporMineSettingBindClick('更换登录手机号')
  Taro.redirectTo({
    url:
      '/modules/user/pages/change-phone/index?wxCode=' +
      (router.params.wxCode || '') +
      '&phone=' +
      (router.params.phone || ''),
  })
}

const { successHandler, successNavigateBack } = useLogin()

const { deviceType, deviceCode, systemVersion, version } = useLoginPublicParmas()

const handleWechatBind = async () => {
  reporMineSettingBindClick('微信一键绑定')
  const env = getEnvConfig()
  const bindRequest = () => {
    return api('web.login.weChat.authorizedLoginByRisk', {
      deviceId: Taro.getStorageSync('app_device_id') || '',
      wxCode: router.params.wxCode!,
      authorizedType: 2,
      from: env.from,
      phone: router.params.phone!,
      smsCode: '',
      deviceCode,
      version,
      deviceType,
      systemVersion,
    })
  }
  const res = await withCaptchaRequest(bindRequest, captchaRef.value, { phone: router.params.phone })()

  if (res.code === 0) {
    successHandler(res.data as unknown as ThirdAuthorizedLoginData)
    successNavigateBack(res.data as unknown as ThirdAuthorizedLoginData)
    reportMineSettingBindOther('成功')
  }
}

onMounted(() => reportBindPhoneUv())
</script>
