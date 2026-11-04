<template>
  <view>
    <CompressImage ref="compressCanvas" />
  </view>
</template>
<script setup lang="ts">
import Taro, { useRouter } from '@tarojs/taro'
import CompressImage from './compress-image.vue'
import { downloadFile } from '../utils'
import { isWeixinAppSync } from '@/public/config'
import { ref } from 'vue'

defineOptions({ name: 'NativeShare' })

let { params } = useRouter() as any

params = params || {}

for (const key in params) {
  if (Object.prototype.hasOwnProperty.call(params, key)) {
    const element = params[key]
    params[key] = decodeURIComponent(element as string)
  }
}

type ShareType = 'ShareImage' | 'ShareMiniApp' | 'ShareWebPage'

interface ShareImage {
  imagePath: string
  thumbPath?: string
  /** 发送的目标场景,0=分享到会话,1=分享到朋友圈，2=分享到收藏 */
  scene: 0 | 1 | 2
  /** 启动小程序username（小程序的原始id，gh_xxx） */
  entranceMiniProgramUsername: string
  /**启动小程路径；  */
  entranceMiniProgramPath: string
}

interface ShareMiniApp {
  userName: string
  path: string
  title?: string
  imagePath: string
  webpageUrl: string
  withShareTicket: boolean
  miniprogramType: 0 | 1 | 2
  scene: number
}

interface ShareWebPage {
  title: string
  description: string
  thumbPath: string
  webpageUrl: string
  scene: 0 | 1 | 2
}
const shareType = params.type as ShareType

let shareInfo: ShareImage | ShareMiniApp | ShareWebPage

try {
  shareInfo = JSON.parse(params.shareInfo) as ShareImage | ShareMiniApp | ShareWebPage
} catch {
  shareInfo = JSON.parse(decodeURIComponent(params.shareInfo)) as ShareImage | ShareMiniApp | ShareWebPage
}

async function ensureWechatInstalled() {
  if (isWeixinAppSync()) {
    const res = await new Promise((success, fail) => wx.miniapp.hasWechatInstall({ success, fail })).catch(() => ({
      hasWechatInstall: false,
    }))
    if (res.hasWechatInstall) return

    Taro.showModal({
      title: '温馨提示',
      content: '您的手机还没装微信哦，装好就能愉快使用啦',
      confirmText: '我知道了',
      confirmColor: '#8365F6',
      showCancel: false,
      success() {
        Taro.navigateBack()
      },
      fail() {
        Taro.navigateBack()
      },
    })
    throw new Error('微信未安装')
  }
}

const compressCanvas = ref<InstanceType<typeof CompressImage>>()

const shareImage = async (msg: ShareImage) => {
  console.error('shareImage', msg)
  await ensureWechatInstalled()
  let imagePath = await downloadFile(msg.imagePath)
  // let thumbPath = await downloadFile(
  //   'https://ic-img.ky-express.com/netc/20250609_7897039519_!!1749434735235_176_176.png',
  // )
  let thumbPath = await downloadFile(msg.imagePath)
  const res2 = await compressCanvas.value!.compressImage(thumbPath, 30)
  thumbPath = res2.tempFilePath
  wx.miniapp.shareImageMessage({
    ...msg,
    imagePath: imagePath,
    thumbPath: thumbPath,
    success: (res) => {
      console.error(res)
    },
    fail: (res) => {
      console.error(res)
    },
  })
  Taro.navigateBack()
}

const shareMiniApp = async (msg: ShareMiniApp) => {
  try {
    await ensureWechatInstalled()
    const imagePath = await downloadFile(msg.imagePath)
    const res = await compressCanvas.value!.compressImage(imagePath, 120)

    msg.imagePath = res.tempFilePath

    wx.miniapp.shareMiniProgramMessage({
      ...msg,
      success: (res) => {
        console.error(res)
      },
      fail: (res) => {
        console.error(res)
      },
    })
    Taro.navigateBack()
  } catch (error) {
    console.error(error)
  }
}

const shareWebPage = async (msg: ShareWebPage) => {
  await ensureWechatInstalled()
  const imagePath = await downloadFile(msg.thumbPath)
  const res = await compressCanvas.value!.compressImage(imagePath, 30)
  msg.thumbPath = res.tempFilePath
  wx.miniapp.shareWebPageMessage({
    ...msg,
    success: (res) => {
      console.error(res)
    },
    fail: (res) => {
      console.error(res)
    },
  })
  Taro.navigateBack()
}

const share = async () => {
  switch (shareType) {
    case 'ShareImage':
      await shareImage(shareInfo as ShareImage)
      break
    case 'ShareMiniApp':
      await shareMiniApp({
        ...shareInfo,
        webpageUrl: (shareInfo as ShareMiniApp).webpageUrl || 'https://m.ky-express.com',
      } as ShareMiniApp)
      break
    case 'ShareWebPage':
      await shareWebPage(shareInfo as ShareWebPage)
      break
  }
}

share()
</script>
