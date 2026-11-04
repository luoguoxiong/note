<template>
  <view class="mine-header">
    <view
      class="header-avatar"
      :style="{
        backgroundImage: `url(${urlContact(themeConfig.config.mine_avatar_background, { id: network.randowKey })})`,
      }"
      @click="onJumpUserSetting"
    >
      <ky-lazy-image
        :delay="500"
        class="user-icon"
        mode="aspectFill"
        fallbackSrc="https://ic-img.ky-express.com/netc/20251121_85958_!!1763698337365_236_236.png"
        :key="userName"
        :src="avatarUrl"
      />
    </view>
    <view class="real-name-verify-content" v-if="isLogin" @click="toRealName">
      <ky-lazy-image :delay="500" class="mine-real-name-verify" :src="flagImage"></ky-lazy-image>
    </view>
    <view class="header-info" @click="onJumpLoginPage">
      <view class="header-info-top">
        <view class="header-info-top-text">{{ isLogin ? userName : '登录/注册' }}</view>
        <view class="header-info-top-opt">
          <view v-if="isOldCustomer" class="opt-icon-call" @click.stop="contactBusiness">
            <ky-lazy-image
              :delay="500"
              class="header-info-top-call"
              src="https://ic-img.ky-express.com/netc/20251121_96781_!!1763706759696_48_48.gif"
            />
          </view>
          <view class="opt-icon-setting" @click.stop="toSettingpage">
            <ky-lazy-image
              :delay="500"
              class="header-info-top-setting"
              src="https://ic-img.ky-express.com/netc/20251204_440_!!1764822611980_96_96.png"
            />
          </view>
          <view class="opt-tip" v-if="isShowTip && isLogin && !isH5FSEnv" @click.stop="closePsdTip">
            <!-- <view class="opt-tip__triangle-icon"></view> -->
            <view class="opt-tip__text">可点击前往设置登录密码啦~</view>
            <ky-lazy-image
              :delay="500"
              class="opt-tip__close-icon"
              src="https://ic-img.ky-express.com/netc/20250705_1215_!!1751697728234_64_64.png"
            />
          </view>
        </view>
      </view>
      <view class="header-info-bottom" @click="CustomerClick">
        <template v-if="isLogin">
          <view class="header-info-bottom__bg">
            <ky-text
              :class="[
                'header-info-bottom__text',
                customerNameText === '未绑定客户编码' || customerNameText === '需切换客户编码' ? 'gray' : '',
              ]"
              >{{ customerNameText }}</ky-text
            >
            <ky-button size="small" class="header-info-bottom-tag">
              <view class="header-info-bottom-tag-content">
                {{ relationAuthText }}
                <ky-lazy-image
                  :delay="500"
                  class="header-info-bottom-tag-arrow"
                  src="https://ic-img.ky-express.com/netc/20260204_6608_!!1770188964029_56_56.png"
                />
              </view>
            </ky-button>
          </view>
        </template>
        <template v-else> 点击登录享受更多精彩 </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { navigateTo } from '@tarojs/taro'
import { ref, computed, watch } from 'vue'
import { report_clk_home_login_button, report_clk_home_mine_mine_button } from '@/layout/report/mine'
import { isH5FSEnv, isWxAppEnv, phoneEncrypted, report_CLK_event } from '@/public/utils'
import kyeNavigate from '@/public/utils/native/navigate'
import { useLogin, useUserInfo } from '@/public/hooks'
import { urlContact } from '@/public/utils'
import { navigateWithParams } from '@/layout/pages/home/hooks'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import { useThemeStore } from '@/store/theme'
import { useNetworkStore } from '@/store/useNetworkStore'
import useMineCustomer from '../../hooks/useMineCustomer'
import { RealNameResp } from '../../api/types'
import { useMergeUserInfo } from '../../hooks/useMergeUserInfo'
import './index.scss'

const props = defineProps<{
  flagImage: string | undefined
  realName?: RealNameResp
  newCustomerFlag: boolean
  isOldCustomer: boolean
  isShowPsdTip: boolean
}>()

const emits = defineEmits(['show-contact-business', 'customerClick'])
const { userInfo } = useUserInfo()
const { isLogin } = useLogin()
/* 绑码信息 */
const { relationAuthText, customerNameText, customerInfo } = useMineCustomer()
const { RealNameAuthFlag } = useMergeUserInfo()
const { themeConfig } = useThemeStore()
const network = useNetworkStore()

const userName = computed(() => {
  if (userInfo.value?.userName) {
    return userInfo.value.userName
  }
  return userInfo.value?.phone ? phoneEncrypted(userInfo?.value.phone) : ''
})

const avatarUrl = computed(() => {
  if (!isLogin.value) {
    return 'https://ic-img.ky-express.com/netc/20251203_41092_!!1764724367216_236_236.png'
  }
  if (userInfo.value?.headUrl) {
    return userInfo.value.headUrl
  }
  if (userInfo.value?.sex === 1) {
    return 'https://ic-img.ky-express.com/netc/20251121_90143_!!1763698418360_236_236.png'
  }
  if (userInfo.value?.sex === 2) {
    return 'https://ic-img.ky-express.com/netc/20251121_4860_!!1763698418364_236_236.png'
  }
  return 'https://ic-img.ky-express.com/netc/20251203_41092_!!1764724367216_236_236.png'
})

const isShowTip = ref(false)
// 是否展示设置密码提示
watch(
  () => props.isShowPsdTip,
  (val) => {
    console.log(val)
    if (val) {
      setTimeout(() => {
        isShowTip.value = true
      }, 1000)
    }
  },
  { immediate: true },
)

/* 跳转个人设置 */
const onJumpUserSetting = () => {
  kyeNavigate.navigateBefore(
    'navigateTo',
    { url: '/modules/user/pages/user-setting/index', needLogin: true },
    { needNewUserGuide: true, express_type: '个人设置' },
  )
  report_clk_home_mine_mine_button('头像')
}

const onJumpLoginPage = () => {
  if (isLogin.value) {
    return
  }
  navigateTo({ url: '/modules/user/pages/login/index?delta=2&needNewUserGuide=true&express_type=我的' })

  report_clk_home_login_button('登录/注册')
}

const contactBusiness = () => {
  report_CLK_event('clk_home_mine_business', {
    page_code: 'page_home_mine',
    region_code: 'top_information',
    button_name: '联系商务',
  })
  emits('show-contact-business')
}

const toSettingpage = () => {
  report_CLK_event('clk_home_mine_setting', {
    page_code: 'page_home_mine',
    region_code: 'top_information',
    button_name: '设置',
  })
  closePsdTip()
  // 小程序进入设置页面 必须登录needLogin:true
  kyeNavigate.navigateTo(
    {
      url: '/modules/setting/pages/index/index',
      needLogin: !isLogin.value && !isWxAppEnv,
    },
    {
      needNewUserGuide: true,
    },
  )
  if (!isLogin.value && !isWxAppEnv) {
    report_clk_home_login_button('登录')
  }
}

const toRealName = () => {
  console.log('customerInfo.value', customerInfo.value)
  report_CLK_event('clk_home_mine_mine_button', {
    page_code: 'page_home_mine',
    region_code: 'top_information',
    button_name: '实名认证',
  })
  const jump =
    (customerInfo.value.customerShortName &&
      props.realName?.headImgRealNameTagVO?.authFlag !== RealNameAuthFlag.HAS_VERIFY) ||
    (!customerInfo.value.customerShortName &&
      props.realName?.headImgRealNameTagVO?.authFlag !== RealNameAuthFlag.PERSON_VERIFY)
  if (jump) {
    navigateWithParams(ApplicationCodeMap['实名认证'])
  }
}

const CustomerClick = () => {
  if (isLogin.value) {
    // handleCustomerClick()
    report_clk_home_mine_mine_button('点击绑码')
    emits('customerClick')
  }
}

const closePsdTip = () => {
  isShowTip.value = false
  Taro.removeStorageSync('is_show_psd_setting_tip')
}
</script>
