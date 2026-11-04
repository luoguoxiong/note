<template>
  <view class="message-subscription-home">
    <view class="message-subscription-home-title">建议您开通订阅以下通知, 可及时接收跨越相关提醒</view>
    <view class="message-subscription-home-main" @tap="openSetting">
      <view class="message-subscription-home-main-left">
        <view class="message-subscription-home-main-left-title">微信授权设置</view>
        <view class="message-subscription-home-main-left-tip">建议您开通订阅通知, 可及时接收跨越相关提醒</view>
      </view>
      <view class="message-subscription-home-main-right">
        <view v-if="loadSuccess" class="message-subscription-home-main-right-text">
          {{ mainSwitch ? ' ' : '待开启' }}
        </view>
        <image
          class="message-subscription-home-main-right-icon"
          src="https://ic-img.ky-express.com/netc/20251104_13967_!!1762226632202_51_51.png"
        />
      </view>
    </view>
    <view v-if="!loadSuccess" class="message-subscription-home-loading">
      <ky-loading>加载中</ky-loading>
    </view>
    <view v-else>
      <view class="message-subscription-home-subscribed" v-show="acceptedList.length">
        <view class="message-subscription-home-subscribed-text">以下通知已订阅, 点击续收可增加提醒</view>
      </view>
      <view class="message-subscription-home-subscribed-content" v-show="acceptedList.length">
        <view v-for="item in acceptedList" :key="item.key" class="message-subscription-home-subscribed-content-item">
          <view class="message-subscription-home-subscribed-content-item-left">
            <view class="message-subscription-home-subscribed-content-item-left-name">
              <view class="text">{{ item.name }}</view>
            </view>
            <view class="message-subscription-home-subscribed-content-item-left-desc">{{ item.templateNotice }}</view>
          </view>
          <view class="message-subscription-home-subscribed-content-item-right">
            <ky-button
              class="message-subscription-home-subscribed-content-item-right-btn"
              @tap="handleSubscribe(item, true)"
            >
              续收+1
            </ky-button>
          </view>
        </view>
      </view>
      <view
        class="message-subscription-home-subscribed-content-more"
        v-show="messageList.filter((item) => item.selected).length > 3 && unacceptedList.length"
        @tap="showMore = !showMore"
      >
        <view class="message-subscription-home-subscribed-content-more-text">
          {{ `${showMore ? '收起' : '查看'}全部订阅` }}
        </view>
        <image
          class="message-subscription-home-subscribed-content-more-icon"
          :src="
            showMore
              ? 'https://ic-img.ky-express.com/netc/20251106_5381_!!1762398976355_48_48.png'
              : 'https://ic-img.ky-express.com/netc/20251106_68786_!!1762398965231_48_48.png'
          "
        />
      </view>
      <view class="message-subscription-home-subscribed" v-show="unacceptedList.length">
        <view class="message-subscription-home-subscribed-text">以下通知未订阅, 点击开启可接收提醒</view>
      </view>
      <view class="message-subscription-home-subscribed-content" v-show="unacceptedList.length">
        <view v-for="item in unacceptedList" :key="item.key" class="message-subscription-home-subscribed-content-item">
          <view class="message-subscription-home-subscribed-content-item-left">
            <view class="message-subscription-home-subscribed-content-item-left-name">
              <view class="text">{{ item.name }}</view>
            </view>
            <view class="message-subscription-home-subscribed-content-item-left-desc">{{ item.templateNotice }}</view>
          </view>
          <view class="message-subscription-home-subscribed-content-item-right">
            <ky-switch v-model="item.showSelected" @change="handleSubscribe(item)"></ky-switch>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidHide, useDidShow } from '@tarojs/taro'
import { computed, ref } from 'vue'
import { MessageSubscriptionItem } from './types'
// @ts-ignore
import { showDialog } from '@ky-miniui-lib/ky-miniui-lib'
import { getTemplateList } from '../api/index'

const mainSwitch = ref<boolean>(false)
const messageList = ref<MessageSubscriptionItem[]>([])
const showMore = ref<boolean>(false)
const loadSuccess = ref<boolean>(false)

const acceptedList = computed(() => {
  const acceptedList = messageList.value.filter((item) => item.selected)
  if (showMore.value || unacceptedList.value.length === 0) {
    return acceptedList
  }
  return acceptedList.slice(0, 3)
})

const unacceptedList = computed(() => {
  return messageList.value.filter((item) => !item.selected)
})

useDidShow(async () => {
  await queryTemplateList()
  Taro.getSetting({
    withSubscriptions: true,
    success: function (res) {
      loadSuccess.value = true
      console.log('res >>> ', res)
      mainSwitch.value = res.subscriptionsSetting.mainSwitch
      if (!res.subscriptionsSetting.mainSwitch) {
        messageList.value.forEach((item) => {
          item.selected = false
          item.showSelected = false
        })
        return
      }
      const accepted = res.subscriptionsSetting.itemSettings
      Object.entries(accepted).forEach(([key, value]) => {
        messageList.value.forEach((item) => {
          if (item.key === key) {
            item.selected = value === 'accept' || value === 'acceptWithForcePush'
            item.showSelected = value === 'accept' || value === 'acceptWithForcePush'
          }
        })
      })
    },
  })
})

useDidHide(() => {
  loadSuccess.value = false
})

const queryTemplateList = async () => {
  try {
    const res = await getTemplateList({ type: 0 })
    console.log('res >>> ', res)
    messageList.value = res.data.map((item) => ({
      key: item.templateId,
      name: item.title,
      templateNotice: item.templateNotice,
      selected: false,
      showSelected: false,
    }))
  } catch (error) {
    console.log('error >>> ', error)
  }
}

const openSetting = () => {
  Taro.openSetting({
    withSubscriptions: true,
    success: function (res) {
      console.log('res >>> ', res)
    },
  })
}

const handleSubscribe = (item: MessageSubscriptionItem, selected: boolean = false) => {
  // item.selected = selected
  Taro.requestSubscribeMessage({
    tmplIds: [item.key],
    entityIds: [item.key],
    success: async function (res) {
      console.log('res >>> ', res)
      if (res[item.key] === 'accept') {
        Taro.showToast({
          title: '订阅成功',
          icon: 'none',
          duration: 2000,
        })
        if (!selected) {
          item.showSelected = true
          item.selected = true
        }
      } else {
        if (!selected) {
          item.showSelected = false
          item.selected = false
        }
        handleOpenSetting(item.name)
      }
    },
    fail: async function (fail) {
      console.log('fail >>> ', fail)
      if (fail.errCode === 20004) {
        handleOpenSetting(item.name)
      }
      if (!selected) {
        item.showSelected = false
        item.selected = false
      }
    },
  })
}

const handleOpenSetting = async (name: string) => {
  await showDialog({
    parentClassName: 'message-subscription-home',
    title: '订阅失败',
    message: `您已经取消了订阅，将无法收到${name}`,
    showCancelButton: true,
    confirmButtonText: '重新开启',
    cancelButtonText: '错过就错过',
    confirm: () => openSetting(),
    cancel: () => console.log('取消'),
  })
}
</script>

<style lang="scss">
@import './index.scss';
</style>
