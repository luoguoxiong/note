<template>
  <div class="invited-success">
    <!-- <ky-navbar :leftArrow="true" title="跨越寄件" v-if="isWxMiniApp"></ky-navbar> -->
    <div class="icon-wrap">
      <img class="icon" src="https://ic-img.ky-express.com/netc/20260116_7926_!!1768556210599_240_198.png" />
    </div>
    <div class="text">已提交</div>
    <div class="msg-container">
      <div class="left">
        <SvgIcon class="icon" name="icon-receiver" />
      </div>
      <div>
        <div class="name-mobile">
          <span class="name">{{ receiveInfo?.person }}</span>
          <span class="mobile" v-if="receiveInfo.mobile">
            {{ receiveInfo.mobile }}
          </span>
        </div>
        <div class="tele" v-if="receiveInfo.phone">
          <span>{{ receiveInfo?.phone }}</span>
        </div>
        <div class="com-name">{{ receiveInfo?.customerName }}</div>
        <div class="detail">{{ getFullAddress(receiveInfo) }}</div>
      </div>
    </div>
    <div class="btn">
      <ky-button
        class="button-footer"
        @click="toShare"
        type="primary"
        :open-type="isWxAppEnv ? '' : 'share'"
        size="normal"
        text="通知寄件人下单"
      ></ky-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isWxMiniApp } from '@/public/utils'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { closeToast, showLoadingToast } from '@order-public-sub-public/hooks/useShowToast'
import { useRoute } from '@order-public-sub-public/vue-router/index'
import { invitationRoute } from '@order-public-sub-public/apis/share/index'
import { onMounted, ref } from 'vue'
import { PickUp } from '@order-public-sub-public/types'
import { isWxAppIosEnv, isWxAppAndroidEnv, isWxAppOhosEnv, isWxAppEnv } from '@/public/utils'
import { useShareAppMessage } from '@tarojs/taro'
import { appWxShare } from '@public/utils/appWxShare'
import { toShareToOrderReport } from '../report'
const route = useRoute()

const receiveInfo = ref<any>({})

onMounted(async () => {
  try {
    showLoadingToast({
      title: '加载中',
      duration: 0,
      forbidClick: true,
    })
    const { inviteCode } = (route.query as { inviteCode: string }) || { inviteCode: '' }
    const res = await invitationRoute({
      inviteCode,
    })
    const { waybillList } = res.data ?? {}
    if (waybillList?.length) {
      receiveInfo.value = waybillList?.[0]?.waybillPickup
    }
  } catch (error) {
  } finally {
    closeToast()
  }
})

const getFullAddress = (waybillInfo: PickUp) => {
  const { province, city, district, detailAddress } = waybillInfo || {}
  return (province || '') + (city || '') + (district || '') + (detailAddress || '')
}

const toShare = async () => {
  toShareToOrderReport()
  if (!(isWxAppIosEnv || isWxAppAndroidEnv || isWxAppOhosEnv)) {
    return
  }
  const { inviteCode } = (route.query as { inviteCode: string }) || { inviteCode: '' }
  await appWxShare({
    title: '我已填写地址，可以下单',
    path: '/modules/order-build-sub-pages/pages/share-send/share/index?inviteCode=' + inviteCode,
    imagePath: 'https://ic-img.ky-express.com/netc/20260204_13231_!!1770203234779_450_360.png',
  })
}

useShareAppMessage(() => {
  const { inviteCode } = (route.query as { inviteCode: string }) || { inviteCode: '' }
  return {
    title: '我已填写地址，可以下单',
    path: 'modules/order-build-sub-pages/pages/share-send/share/index?inviteCode=' + inviteCode,
    imageUrl: 'https://ic-img.ky-express.com/netc/20260204_13231_!!1770203234779_450_360.png',
  }
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
