<template>
  <view class="user-qr-code">
    <image :src="src" class="img"></image>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { generateQrCode } from '../api/index'

defineOptions({ name: 'UserQrCode' })

// 响应式状态
const src = ref('')

const formatImg = (bodyData) => {
  /// 获取到base64Data
  var base64Data = bodyData
  /// 通过微信小程序自带方法将base64转为二进制去除特殊符号，再转回base64
  base64Data = Taro.arrayBufferToBase64(Taro.base64ToArrayBuffer(base64Data))
  /// 拼接请求头，data格式可以为image/png或者image/jpeg等，看需求
  const base64ImgUrl = 'data:image/png;base64,' + base64Data
  /// 刷新数据
  return base64ImgUrl
}

// 组件挂载后执行
onMounted(async () => {
  try {
    const res = await generateQrCode({
      pageUrl: '/modules/user/pages/qrcode/index',
      scene: '100326',
      width: 480,
    })
    src.value = formatImg(res.data.base64)
  } catch (error) {
    console.error('生成二维码失败:', error)
  }
})
</script>

<style lang="scss">
.user-qr-code {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  .img {
    width: 480px;
    height: 480px;
  }
}
</style>
