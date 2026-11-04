<!--
  CRM 营销 — 积分中心订阅引导（签到提醒）
-->
<template>
  <view class="points-center-subscribe">
    <ky-navbar v-if="isWxMiniApp" :leftArrow="true" title="积分中心" />
    <view class="points-center-subscribe__body">
      <view class="points-center-subscribe__hero">
        <image class="points-center-subscribe__hero-img" :src="heroImg" mode="widthFix" />
      </view>
      <view class="points-center-subscribe__text">
        <view>订阅后，我们将每日提醒您完成签到，</view>
        <view>不错过每一分积分</view>
      </view>
      <view class="points-center-subscribe__actions">
        <ky-button
          class="points-center-subscribe__btn-main"
          type="primary"
          size="large"
          block
          @tap.stop="onSubscribe"
        >
          立即订阅
        </ky-button>
        <view class="points-center-subscribe__btn-skip" @tap="onSkip">暂不订阅</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro, { useLoad } from '@tarojs/taro'
import { isWxMiniApp } from '@public/utils'
import { useUserInfo } from '@/public/hooks'
import heroImg from '../../assets/points-center-hero.png'
import { DEFAULT_POINTS_SUBSCRIBE_TMPL_IDS } from './config'
import { parseTmplIdsFromQuery } from './parseTmplIds'
import { updateSignStatus } from './apis'

defineOptions({ name: 'PointsCenterSubscribe' })

const { userInfo } = useUserInfo()

/** 优先为外部路径参数，其次 config 兜底 */
const tmplIds = ref<string[]>([])
/** 路由传入的手机号，无则取登录用户手机号 */
const mobileFromQuery = ref<string>('')
const subscribing = ref(false)

const resolveMobile = () => (mobileFromQuery.value || userInfo.value?.phone || '').trim()

useLoad((query: Record<string, string | undefined>) => {
  const fromQuery = parseTmplIdsFromQuery(query)
  const rawMobile = query.mobile || ''
  try {
    mobileFromQuery.value = rawMobile ? decodeURIComponent(rawMobile) : ''
  } catch {
    mobileFromQuery.value = rawMobile
  }
  tmplIds.value = fromQuery.length ? fromQuery : [...DEFAULT_POINTS_SUBSCRIBE_TMPL_IDS]
})

const resolveTmplIds = () => tmplIds.value

/** 微信订阅结果：部分机型返回字段与主调 tmplIds 一致 */
function isTemplateAccepted(result: Record<string, string> | undefined, id: string) {
  const v = result?.[id]
  return v === 'accept' || v === 'acceptWithForcePush'
}

function toastTextOnly(title: string) {
  Taro.showToast({ icon: 'none', title: String(title).slice(0, 48) })
}

/** 安卓/小米等机型 fail 里 errMsg 可能很长，禁止把原始对象当作 title */
function formatSubscribeFail(err: unknown): string {
  if (err == null || typeof err !== 'object') {
    return '订阅未完成，请稍后重试'
  }
  const e = err as { errCode?: number; errno?: number; errMsg?: string }
  const code = e.errCode ?? e.errno
  if (code === 20004) {
    return '请先在设置中开启订阅消息'
  }
  const msg = String(e.errMsg || '')
  if (/cancel|取消/i.test(msg)) {
    return '已取消订阅'
  }
  if (!msg || msg.length > 120) {
    return '订阅未完成，请稍后重试'
  }
  return msg
}

const onSubscribe = () => {
  if (subscribing.value) {
    return
  }
  const ids = resolveTmplIds()
  if (!ids.length) {
    toastTextOnly('请从外部传入 tmplIds（多个用英文逗号分隔）')
    return
  }
  subscribing.value = true
  // 各端类型差异，微信端仅需 tmplIds；用 @tap 触发以兼容部分安卓机手势校验
  Taro.requestSubscribeMessage({
    tmplIds: ids,
    entityIds: ids,
    complete: () => {
      subscribing.value = false
    },
    success: async (result: Record<string, string>) => {
      const subscribed = ids.length > 0 && ids.every((id) => isTemplateAccepted(result, id))
      if (!subscribed) {
        toastTextOnly('请先在设置-通知中开启接收活动状态通知')
        return
      }
      const status = subscribed ? 10 : 20
      const mobile = resolveMobile()
      if (mobile) {
        await updateSignStatus({ mobile, channel: '20', status })
      }
      if (subscribed) {
        toastTextOnly('订阅成功')
        setTimeout(() => {
          goBack()
        }, 2000)
      } else {
        toastTextOnly('未完成全部订阅，将无法收到签到提醒')
        setTimeout(() => {
          goBack()
        }, 2000)
      }
    },
    fail: (err: unknown) => {
      const title = formatSubscribeFail(err)
      toastTextOnly(title)
      setTimeout(() => {
        goBack()
      }, 2000)
    },
  } as any)
}

const onSkip = async () => {
  const mobile = resolveMobile()
  if (mobile) {
    try {
      await updateSignStatus({ mobile, channel: '20', status: '20' })
    } catch (e) {
      console.error('updateSignStatus', e)
    }
  }
  // Taro.showToast({ icon: 'none', title: '取消订阅成功' })
  goBack()
}

const goBack = () => {
  Taro.navigateBack({
    fail: () => {
      Taro.switchTab({ url: '/layout/pages/home/index' })
    },
  })
}
</script>

<style lang="scss">
@import './index.scss';
</style>
