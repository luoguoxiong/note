<template>
  <div class="share-page">
    <!-- <ky-navbar :leftArrow="true" title="跨越寄件" v-if="isWxMiniApp"></ky-navbar> -->
    <NoToken v-if="!isLogin || !isTokenAlive" />
    <!-- 登录失效 -->
    <KyEmpty :type="EmptyTypeEnum.CUSTOM" v-if="!isTokenAlive || !isLogin" :custom-config="customConfig">
      <KyButton @click="login" size="small" class="login-btn" text="登录"></KyButton>
    </KyEmpty>
    <!-- 超时或者非本人快递 -->
    <KyEmpty :type="EmptyTypeEnum.CUSTOM" v-else-if="noPermission" :custom-config="customConfigComp"> </KyEmpty>
    <!-- 没有inviteCode情况 -->
    <KyEmpty :type="EmptyTypeEnum.CUSTOM" v-else-if="noInviteCode" :custom-config="noInviteCodeConfig"> </KyEmpty>
    <!-- 网络错 误 -->
    <KyEmpty :type="EmptyTypeEnum.CUSTOM" v-else-if="hasError" :custom-config="customNetWorkConfig">
      <KyButton @click="getInvitationRoute" size="small" class="login-btn" text="刷新"></KyButton>
    </KyEmpty>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { closeToast, showLoadingToast } from '@order-public-sub-public/hooks/useShowToast'
import NoToken from '@order-public-sub-public/components/business/no-token/index.vue'
import { EmptyTypeEnum } from '@order-public-sub-public/constants'
import { EMPTY_CONFIGS } from '@order-public-sub-public/components/ui/ky-empty/config'
import { useStore } from '@order-public-sub-public/store'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import { useLogin } from '@/public/hooks'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import { invitationRoute } from '@order-public-sub-public/apis/share/index'
import { Channel } from '@order-public-sub-public/constants'
// import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { getQueryObject } from '@order-public-sub-public/utils'

const { isLogin } = useLogin()
// const { autoLoginHook } = useAutoLogin()

const piniaStore = useStore()
const isTokenAlive = computed(() => piniaStore.root.getIsTokenAlive)
const hasError = ref(false)
const noInviteCode = ref(false)

// 超时或者非本人快递
const noPermission = ref('') // timeOutCancel , notSelfSubmit

// 登录失效配置
const customConfig = {
  image: EMPTY_CONFIGS.network.image,
  description: '用户信息已失效，请重新登录',
}

const noInviteCodeConfig = {
  image: EMPTY_CONFIGS.network.image,
  description: '系统异常',
}

// 超时配置
const customTimeoutConfig = {
  image: EMPTY_CONFIGS.timeout.image,
  description: EMPTY_CONFIGS.timeout.description,
}

// 非本人快递配置
const customNopermissionConfig = {
  image: EMPTY_CONFIGS.nopermission.image,
  description: EMPTY_CONFIGS.nopermission.description,
}

const customConfigComp = computed(() => {
  if (noPermission.value === 'timeOutCancel') {
    return customTimeoutConfig
  } else if (noPermission.value === 'notSelfSubmit') {
    return customNopermissionConfig
  }
})

// 网络异常配置
const customNetWorkConfig = {
  image: EMPTY_CONFIGS.network.image,
  description: '网络异常，请刷新重试',
}

const login = () => {
  Taro.navigateTo({
    url: '/modules/user/pages/login/index',
  })
}

// 获取路由信息
const getInvitationRoute = async () => {
  try {
    const { inviteCode, isBack } = getQueryObject() ?? {}
    if (!inviteCode) {
      noInviteCode.value = true
      return
    }
    const shouldBack = isBack === '1'
    console.log(shouldBack, 'shouldBackshouldBack')
    showLoadingToast({
      title: '加载中',
      duration: 0,
      forbidClick: true,
    })
    const res = await invitationRoute({
      inviteCode,
    })
    const data = res?.data || {}
    hasError.value = false

    // 非本人快递 或者超时
    if (data?.routePage === 'refresh') {
      hasError.value = true
      return
    }
    if (data?.routePage === 'timeOutCancel' || data?.routePage === 'notSelfSubmit' || data?.role === '30') {
      noPermission.value = data?.routePage
      return
    }
    // 邀请人
    if (data?.role === '10') {
      if (data?.routePage === 'initBackFill') {
        const url = `/modules/order-build/pages/order/index?textCode=${inviteCode}&channel=${Channel.邀请寄}`
        shouldBack
          ? Taro.redirectTo({
              url,
            })
          : Taro.reLaunch({
              url,
            })
      } else if (data?.routePage === 'submitSuccess') {
        const url = `/modules/order-build-sub-pages/pages/share-send/invite-success/index?inviteCode=${inviteCode}`
        shouldBack
          ? Taro.redirectTo({
              url,
            })
          : Taro.reLaunch({
              url,
            })
      }
    } else if (data?.role === '20') {
      // 被邀请人
      if (data?.routePage === 'canFill') {
        Taro.reLaunch({
          url: `/modules/order-build-sub-pages/order-public/components/business/address-book/share-page/index?inviteCode=${inviteCode}`,
        })
      } else if (data?.routePage === 'submitSuccess') {
        Taro.reLaunch({
          url: `/modules/order-build-sub-pages/pages/share-send/invited-success/index?inviteCode=${inviteCode}`,
        })
      }
    }
  } catch (error) {
    hasError.value = true
  } finally {
    closeToast()
    // 一段时间停留在当前页面则 报错, 不报错是空页面
    if (!noPermission.value && !isTokenAlive.value && !isLogin.value) {
      setTimeout(() => {
        hasError.value = true
      }, 3000)
    }
  }
}
useDidShow(async () => {
  // try {
  //   await autoLoginHook({ needLogin: true })
  // } catch (error) {
  //   console.log(error)
  // }
  // 获取路由信息
  getInvitationRoute()
})
</script>

<style lang="scss">
@import './index.scss';
</style>
