<template>
  <view>调试api</view>
  <view class="app-api-lists">
    <view class="cell-item">
      <ky-button type="primary">插件注册(默认启用)</ky-button>
      <ky-button type="primary" @click="handleMySyncFunc">同步方法调用</ky-button>
      <ky-button type="primary" @click="handleMyASyncFunc">异步方法调用</ky-button>
      <ky-button type="primary" @click="handleAndroidMyAsyncFunc">异步支付调用</ky-button>
      <ky-button type="primary" @click="handeMyMessage">注册AppDelegate并监听消息</ky-button>
    </view>
    <view class="cell-item">
      <ky-button type="primary" @click="handleWxAppPay">唤起v3微信支付</ky-button>
      <ky-button type="primary" @click="handleWxAppPay2">唤起v3微信支付 params2</ky-button>
    </view>
    <view class="cell-item">
      <ky-button type="primary" @click="handleAppAliPay">唤起跳转-app支付宝支付</ky-button>
      <ky-button type="primary" @click="handleAppAliPay2">唤起跳转-app支付宝-安卓支付</ky-button>
      <ky-button type="primary" @click="handleAppAliPay3">唤起-app支付宝-直接唤起支付</ky-button>
    </view>
    <view class="cell-item">
      <ky-button type="primary" @click="handleAppUnifyPay">唤起-app银联支付</ky-button>
      <ky-button type="primary" @click="handleGoFreight">跳转预存运费</ky-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { AppPlugin } from '@public/appPlugins'
import { isWeixinAppSync } from '@public/config'
import { useWeixinPayTest } from '@modules/app-plugin/pages/test/hooks/useWeixinPayTest'

/* 同步方法调用 */
const handleMySyncFunc = () => {
  if (AppPlugin.push.mySyncFunc) {
    const result = AppPlugin.push.mySyncFunc({ a: 'hello', b: [1, 2] })
    console.log('【app插件】method: mySyncFunc result: ', result)
  }
}
/* 异步方法调用 */
const handleMyASyncFunc = async () => {
  if (AppPlugin.push.myAsyncFuncwithCallback) {
    const result = await AppPlugin.push.myAsyncFuncwithCallback({ a: 'hello', b: [1, 2] })
    console.log('【app插件】method: myAsyncFuncwithCallback result: ', result)
  }
}

const handeMyMessageListener = (data) => {
  console.log('监听插件消息通知', data)
}
/* 消息监听 */
const handeMyMessage = () => {
  if (AppPlugin.push.onMessage) {
    AppPlugin.push.onMessage(handeMyMessageListener)
  }
}

const {
  handleWxAppPay,
  handleWxAppPay2,
  handleAppAliPay,
  handleAppAliPay2,
  handleAppAliPay3,
  handleAppUnifyPay,
  handleGoFreight,
  handleAndroidMyAsyncFunc,
} = useWeixinPayTest()

onMounted(() => {
  const isWeixinApp = isWeixinAppSync() || false
  if (isWeixinApp) {
    AppPlugin.push.register()
  }
})
</script>
<style lang="scss">
.app-api-lists {
  padding: 24px;
  .cell-item {
    padding-bottom: 30px;
  }
  .ky-button + .ky-button {
    margin-top: 20px;
  }
}
</style>
