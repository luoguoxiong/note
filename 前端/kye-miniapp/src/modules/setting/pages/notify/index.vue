<template>
  <ky-container v-bind="pageOptions" class="notify-setting">
    <ky-cell @click="() => Taro.openAppAuthorizeSetting({})">
      <template #title>
        <view class="notify-title">
          <view>接收消息通知</view>
          <view>开启后，手机可接收跨越速运APP系统消息通知</view>
        </view>
      </template>
      <template #value>
        <ky-switch :modelValue="enableNotification" />
      </template>
    </ky-cell>
  </ky-container>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import './index.scss'
import Taro, { useDidShow } from '@tarojs/taro'

defineOptions({
  name: 'AccountSetting',
})

const pageOptions = ref({
  navBarOptions: { showPlatList: ['wx'], title: '系统消息通知' },
})
const enableNotification = ref<boolean>(Taro.getAppAuthorizeSetting()['notificationAuthorized'] === 'authorized')

useDidShow(() => {
  // ios 设置后慢半拍
  // 一个半拍
  setTimeout(() => {
    const authSetting = Taro.getAppAuthorizeSetting()
    enableNotification.value =
      authSetting['notificationAuthorized'] === 'authorized' ||
      authSetting['notificationAlertAuthorized'] === 'authorized' ||
      authSetting['notificationBadgeAuthorized'] === 'authorized' ||
      authSetting['notificationSoundAuthorized'] === 'authorized'
  }, 800)
})
</script>
