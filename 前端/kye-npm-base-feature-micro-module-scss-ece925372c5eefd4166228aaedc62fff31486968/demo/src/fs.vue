<template>
  <div class="native">
    <Button class="button" type="primary" @click="reload">刷新</Button>

    <Button class="button" type="primary" @click="saveImageToPhotosAlbum"
      >saveImageToPhotosAlbum</Button
    >

    <Button class="button" type="primary" @click="chooseImage"
      >chooseImage</Button
    >

    <Button class="button" type="primary" @click="scanQRCode"
      >scanQRCode</Button
    >

    <Button class="button" type="primary" @click="getLocation"
      >getLocation</Button
    >

    <Button class="button" type="primary" @click="navigateTo"
      >navigateTo</Button
    >

    <Button class="button" type="primary" @click="previewImage"
      >previewImage</Button
    >

    <Button class="button" type="primary" @click="postMessage"
      >postMessage</Button
    >

    <Button class="button" type="primary" @click="openLocation"
      >openLocation</Button
    >
    <Button class="button" type="primary" @click="openWebview"
      >openWebview</Button
    >

    <Button class="button" type="primary" @click="getClipboardData"
      >App getClipboardData</Button
    >

    <Button class="button" type="primary" @click="navigateBack"
      >navigateBack</Button
    >
  </div>
</template>

<script setup lang="ts">
import { Button } from 'vant'
import { isAppBrowse, isWxApplet, isAliPayClient } from '@kye-netc/utils'
import { native } from './native'

const reload = () => {
  location.reload()
}

const saveImageToPhotosAlbum = async () => {
  try {
    await native.saveImageToPhotosAlbum(
      'https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png',
    )
  } catch (error) {
    console.error('error', error.code)
  }
}

const chooseImage = async () => {
  try {
    const result = await native.chooseImage({
      count: 4,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    })
    console.error(result)
  } catch (error) {
    console.error('error', error.code)
  }
}

const scanQRCode = async () => {
  try {
    const result = await native.scanQRCode({ needResult: 1 })
    console.log(result)
  } catch (error) {
    console.error('error', error)
  }
}

const previewImage = async () => {
  await native.previewImage({
    urls: [
      'https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png',
      'https://ic-img.ky-express.com/netc/20250308_66270395148_!!1741419273649_112_112.png',
    ],
    current:
      'https://ic-img.ky-express.com/netc/20250308_66270395148_!!1741419273649_112_112.png',
  })
}

const postMessage = () => {
  native.postMessage({
    title: '分享标题',
    imageUrl: 'https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png',
    contentType: 1,
  })
}

const getLocation = async () => {
  try {
    const res = await native.getLocation({
      type: 'wgs84',
    })
    console.log(JSON.stringify(res))
  } catch (error) {
    console.error(error.code)
  }
}

const openLocation = async () => {
  // 假设深圳市的经纬度是：经度 114.057865，纬度 22.543993
  const latitude = 22.543993
  const longitude = 114.057865
  await native.openLocation({
    latitude,
    longitude,
    scale: 14, // 缩放比例，范围5~18，默认为14
    name: '深圳市', // 位置名
    address: '深圳市', // 地址的详细说明
  })
}

const openWebview = async () => {
  await native.openWebview({ needLogin: false, url: location.href })
}

const getClipboardData = async () => {
  try {
    const res = await native.getClipboardData({ necessary: true })
    console.log(res)
  } catch (error) {
    console.log(error.code)
  }
}

const navigateTo = () => {
  native.navigateTo({ url: '/modules/user/pages/login/index' })
}

const navigateBack = async () => {
  await native.navigateBack()
}
</script>
<style scoped>
.button {
  width: 100%;
  margin-bottom: 20px;
}
.native {
  padding: 20px;
}
</style>
