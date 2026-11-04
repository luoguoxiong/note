<template>
  <view class="invite-poster__container">
    <view v-if="loading" class="loading-content">
      <ky-loading textSize="3" size="large">加载中</ky-loading>
    </view>
    <view v-else class="poster">
      <image :src="'data:image/png;base64,' + base64ImgSrc"></image>
    </view>
    <!-- 底部 -->
    <view class="footer">
      <view class="tips">{{ shareTips }}</view>
      <view class="operator-list">
        <view class="operator-item" @click="saveImg">
          <view class="img">
            <image src="https://ic-img.ky-express.com/netc/20230802_92063869259_!!1690943362699_160_160.png"></image>
          </view>
          <view>保存到相册</view>
        </view>
        <view class="operator-item" @click="shareImg">
          <view class="img">
            <image src="https://ic-img.ky-express.com/netc/20230802_42863869299_!!1690943361098_160_160.png"></image>
          </view>
          <view>分享到微信</view>
        </view>
      </view>
    </view>
    <!-- 压缩图片 -->
    <CompressImage ref="compressCanvas" />
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro'
import { computed, reactive, ref } from 'vue'
import { isWechatEnv, isWxAppEnv } from '@/public/utils'
import plateform from '@kye-netc/plateform'
import { report_pv_event, report_CLK_event, report_EXP_event } from '@public/utils/reportUtil'
import { getUserInvitePoster } from '../../apis/user'
import { downloadFile } from '../../../native/pages/utils'
// 组件
import CompressImage from './compress-image.vue'
import './index.scss'

const loading = ref(true)
const base64ImgSrc = ref('')
const codeUrl = ref('')
const compressCanvas = ref(null)

// 分享提示文案
const shareTips = computed(() => {
  return '点击【保存到相册】或【分享到微信】，邀请寄件人完成实名认证'
  // return isWechatEnv ? '长按图片保存到相册或点击【分享到微信】，邀请寄件人完成实名认证' : '点击【保存到相册】或【分享到微信】，邀请寄件人完成实名认证'
})

const getPoster = async () => {
  loading.value = true
  try {
    const res = await getUserInvitePoster({ backgroundImageType: 31 })
    console.log(res, '获取海报')
    base64ImgSrc.value = res.data.base64
    codeUrl.value = res.data.imgUrl
    loading.value = false
  } catch(e) {
    console.log(e)
    loading.value = false
  }
}

const shareImg = async () => {
  report_CLK_event('clk_juris_manage_sender_identity_download_code_button', {
    button_name: '分享到微信'
  })
  if (!codeUrl.value) {
    return false
  }
  if (isWxAppEnv) {
    let imagePath = await downloadFile(codeUrl.value)
    let thumbPath = ''
    const res2 = await compressCanvas.value?.compressImage(imagePath, 30)
    thumbPath = res2.tempFilePath
    wx.miniapp.shareImageMessage({
      imagePath: imagePath,
      thumbPath: thumbPath,
      scene: 0,
      success: (res) => {
        console.error(res)
      },
      fail: (res) => {
        console.error(res)
      },
    })
  } else {
    Taro.downloadFile({
      url: codeUrl.value,
      success: (res) => {
        Taro.showShareImageMenu({
          path: res.tempFilePath,
          needShowEntrance: true,
        })
      }
    })
  }
}

const saveImg = async () => {
  report_CLK_event('clk_juris_manage_sender_identity_download_code_poster_button', {
    button_name: '保存到相册'
  })
  console.log(codeUrl.value, 'ooo')
  if (!codeUrl.value) {
    return false
  }
  try {
    await plateform.saveImageToPhotosAlbum(codeUrl.value)
  } catch (error) {
    // Taro.showToast({
    //   title: error.message || '保存失败',
    //   icon: 'none',
    // })
  }
  // Taro.downloadFile({
  //   url: codeUrl.value,
  //   success: (res) => {
  //     Taro.saveImageToPhotosAlbum({
  //       filePath: res.tempFilePath,
  //       success: () => {
  //         Taro.showToast({
  //           title: '保存成功',
  //           icon: 'none',
  //           duration: 2000,
  //         })
  //       },
  //       fail: (saveErr) => {
  //         if (saveErr && saveErr.errMsg.includes('auth')) {
  //           Taro.showToast({
  //             title: '请开启相册权限后再试',
  //             icon: 'none',
  //             duration: 2000,
  //           })
  //         }
  //       },
  //     })
  //   },
  //   fail: (err) => {
  //     console.error('下载文件失败:', err)
  //   },
  // })
}

useDidShow(() => {
  report_pv_event('page_juris_manage_sender_identity')
  report_EXP_event('exp_juris_manage_sender_identity_code_poster')
  getPoster()
})

useShareAppMessage(() => {
  return {
    // title: '您有一条付款授权申请待处理',
    // path: `packages/payment/payment-share?batchNo=${params.batchNo}&ksPhone=${params.ksPhone}`,
    // imageUrl: codeUrl.value,
  }
})
</script>
