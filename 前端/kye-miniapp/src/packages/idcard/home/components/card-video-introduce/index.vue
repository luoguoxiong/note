<template>
  <Card
    :isFirst="isFirst"
    :isLast="isLast"
    :isEdit="isEdit"
    :hiddenWrapPadding="true"
    :isOpen="isOpen"
    :showTips="true"
    :showApplayStatus="showApplayStatus(workOrderStatus)"
    :applyStatus="cardWorkOrderStatus"
    :title="title"
    :isEmpty="!fileId && !isEdit"
    @switch="onSwitch"
    @move="onMove"
    @upload="onUpload"
    :editTools="{
      switch: true,
      uploadBtnDisabled: status === statusMap.isUploading,
      hasUploadtBtn: true,
      hasEditBtn: false,
      hasMoveBtn: true,
    }"
    class="card-video-introduce__warp"
  >
    <!-- Reject Reason -->
    <view v-if="isRejectReasonInVideo" class="reject-wrap">
      <view class="reject-content">
        <view class="reject-label">原因:</view>
        <view class="reject-text">{{ rejectReason }}</view>
      </view>
    </view>

    <!-- Video Player -->
    <view v-if="status === statusMap.isVideo" class="components-page">
      <view :class="`video-wrap ${isEdit ? 'padding24' : ''}`">
        <view class="video-box">
          <template v-if="!isQw">
            <my-player
              ref="myPlayerRef"
              :appid="VIDEP_APPID"
              height="100%"
              object-fit="cover"
              :fileid="fileId"
              playerid="myPlayerId"
              @play="reportClick"
            ></my-player>
          </template>
          <template v-else>
            <video object-fit="cover" style="width: 100%; height: 100%" :src="mp4Link" @play="reportClick"></video>
          </template>
        </view>
      </view>
      <view v-if="!isEdit" class="video-info">
        <view class="video-title"></view>
        <view class="video-icon" @tap="handleStar">
          <image class="video-star" :src="videoStarImg" />
          {{ videoLikeAmount }}
        </view>
      </view>
    </view>

    <!-- Upload States -->
    <view v-if="status === statusMap.isUpLoadWaiting" class="upload-content" @tap="onUpload">
      <view class="upload-watting">
        <image
          src="https://ic-img.ky-express.com/netc/20250308_84870395140_!!1741415098454_112_112.png"
          class="upload-icon"
        />
        <view class="upload-text">暂无内容，请添加视频</view>
        <view class="upload-desc"> 支持上传小于50M的视频，上传后需由总经办进行工单审批，审批通过后将展示最新信息 </view>
      </view>
    </view>
    <view v-if="status === statusMap.isUploading" class="upload-content">
      <view class="upload-isUploading">
        <view class="progress">
          <view class="progress-val" :style="`width:${progress}%`"></view>
        </view>
        <view class="progess-desc">上传中...{{ progress }}%</view>
        <view class="cancel-upload" @tap="stopUpload">取消上传</view>
      </view>
    </view>

    <view v-if="status === statusMap.isUploadFail" class="upload-content" @tap="onUpload">
      <view class="upload-watting fail">
        <image
          src="https://ic-img.ky-express.com/netc/20250308_66270395148_!!1741419273649_112_112.png"
          class="upload-icon"
        />
        <view class="upload-text">上传失败，点击重新上传</view>
      </view>
    </view>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import Taro from '@tarojs/taro'
import { VIDEP_APPID } from '@public/utils/idcard-video'
import { uuid } from '@/public/utils'
import {
  editProfileVideo,
  getDetailForEmployee,
  getUploadSignature,
  publishMiniProGramProcess,
  videoLike,
} from '@/packages/idcard/api/index'
import VodUploader from '../../../lib/src/vod.js'
import Card from '../card'
import { useIdCardStore } from '@/packages/idcard/store/idcard'
import { trackEvent } from './report'

import type { CardVideoIntroduceProps } from './types'
import type { videoLikeRequestTypes } from '@/packages/idcard/api/types'

import { isQw } from '@/packages/idcard/utils/idcard-device'

import md5 from 'js-md5'

const props = defineProps<CardVideoIntroduceProps>()
const emits = defineEmits(['move', 'update:progress', 'updateVideoStatus', 'switch', 'updateVideoInfo'])

const statusMap = {
  isUpLoadWaiting: 1,
  isUploading: 2,
  isUploadFail: 3,
  isVideo: 4,
}

const CardVideoIntroduceStore = useIdCardStore()

const myPlayerRef = ref<{ play: () => void } | null>(null)

// 视频拒绝状态
const isRejectReasonInVideo = computed(() => props.isEdit && rejectReason.value && +workOrderStatus.value === 3)

const cardWorkOrderStatus = computed(() => {
  let res = showApplayStatus(workOrderStatus.value) ? workOrderStatus.value : false
  console.log('res ======= > ', res)
  return res
})

// 上传视频状态
const status = computed(() => {
  return props.data.videoInfo?.status
})

const fileId = computed(() => {
  return props.data.videoInfo?.fileId
})

const rejectReason = computed(() => {
  return props.data.videoInfo?.rejectReason
})

const workOrderStatus = computed(() => {
  return props.data.videoInfo?.workOrderStatus
})

const videoLikeAmount = computed(() => {
  return props.data.videoInfo?.videoLikeAmount
})

const isVideoLike = computed(() => {
  return props.data.videoInfo?.isVideoLike
})

const mp4Link = computed(() => {
  return props.data.videoInfo?.mp4Link
})

const videoStarImg = computed(() =>
  props.data?.videoInfo?.isVideoLike
    ? 'https://ic-img.ky-express.com/netc/20250212_35070395157_!!1739344847355_32_32.png'
    : 'https://ic-img.ky-express.com/netc/20250212_78170395182_!!1739344853301_32_32.png',
)

const showApplayStatus = (msg: string): boolean => {
  console.log('🚀 ~ showApplayStatus ~ msg:', msg)
  return `${msg}` === '1' || `${msg}` === '3'
}

const onMove = (e: any) => {
  emits('move', e)
}

const onSwitch = (e: any) => emits('switch', e)

const handleStar = async () => {
  try {
    if (!props.data.isLogin || isVideoLike.value) return
    await videoLike({
      optType: 0,
      code: props.data.code,
    } as videoLikeRequestTypes.videoLikeRequest)
    emits('updateVideoInfo', {
      isVideoLike: true,
      videoLikeAmount: videoLikeAmount.value + 1,
    })
  } catch (error) {
    console.error(error)
  }
}

const calculateVideoMD5 = async (tempFilePath: string): Promise<string | null> => {
  const fs = Taro.getFileSystemManager()
  try {
    const fileData = await new Promise<string>((resolve, reject) => {
      fs.readFile({
        filePath: tempFilePath,
        encoding: 'base64',
        success: (res) => resolve(res.data as string),
        fail: (err) => reject(err),
      })
    })
    // let videoMd5 = MD5(fileData).toString()
    let videoMd5 = md5.md5(fileData)
    console.log('🚀 ~ calculateVideoMD5 ~ videoMd5:', videoMd5)
    return videoMd5
  } catch (error) {
    console.error(error)
    return null
  }
}

const toUpload = async () => {
  CardVideoIntroduceStore.updateFresh(false)
  try {
    const res = await Taro.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
    })

    emits('updateVideoStatus', statusMap.isUploading)
    emits('update:progress', 0)

    if (res.size > 50 * 1024 * 1024) {
      Taro.showToast({
        title: '文件不能大于50M',
        icon: 'none',
        duration: 2000,
      })
      emits('updateVideoStatus', fileId.value ? statusMap.isVideo : statusMap.isUpLoadWaiting)
      return
    }

    const vedioMd5 = await calculateVideoMD5(res.tempFilePath)
    if (vedioMd5 === props.data.videoInfo.md5) {
      Taro.showToast({
        title: '视频已上传，请勿重复提交',
        icon: 'none',
        duration: 2000,
      })
      emits('updateVideoStatus', fileId.value ? statusMap.isVideo : statusMap.isUpLoadWaiting)
      return
    }

    const uid = uuid()
    const upload = VodUploader.start({
      mediaFile: res,
      getSignature: async (callback: (signature: string) => void) => {
        const { data: re } = await getUploadSignature({ uid, bizType: 1 })
        callback(re.signature)
      },
      progress: (result: { percent: number }) => {
        emits('update:progress', Math.max(result.percent * 50, 0).toFixed(0))
      },
      finish: async (result: { fileId: string }) => {
        if (CardVideoIntroduceStore.getIsStop()) return

        const timer = setInterval(async () => {
          // 做兼容
          if (status.value === statusMap.isVideo) {
            emits('updateVideoStatus', statusMap.isUploading)
          }
          const { data: videoStatus } = await publishMiniProGramProcess({ fileId: result.fileId, uid })
          if (videoStatus.status === 2) {
            clearInterval(timer)
            emits('update:progress', 100)
            await editProfileVideo({
              id: props.data.idCardId,
              profileVideoFileId: result.fileId,
              mp4Link: videoStatus.mp4Link,
              md5: vedioMd5,
            })
            const { data: resNewData } = await getDetailForEmployee({ code: props.data.code, origin: 'edit' })
            emits('updateVideoStatus', statusMap.isVideo)
            emits('updateVideoInfo', resNewData.baseInfo.profileVideo || {})
            Taro.showToast({
              title: '上传成功',
              icon: 'none',
              duration: 2000,
            })
          } else {
            nextTick(() => {
              let newProgress = Math.min(+props.progress + 2, 99)
              emits('update:progress', newProgress)
            })
          }
        }, 1000)
        CardVideoIntroduceStore.setUploadTimer(timer)
      },
      error: () => {
        emits('updateVideoStatus', statusMap.isUploadFail)
      },
    })
    CardVideoIntroduceStore.startUpload(upload)
  } catch (error) {
    console.error(error)
    emits('updateVideoStatus', fileId.value ? statusMap.isVideo : statusMap.isUpLoadWaiting)
    emits('update:progress', 0)
    clearInterval(CardVideoIntroduceStore.uplodaTimer)
  }
}

const onUpload = () => {
  trackEvent('clk_personal_introduction_edit_add_video', '上传', {
    page_name: 'page_business_card_edit',
    employee_id: props.employeeId,
    sales_id: props.employeeId,
  })

  if (status.value === statusMap.isUploading) {
    Taro.showToast({
      title: '视频正在上传中',
      icon: 'none',
      duration: 2000,
    })
    return
  }
  toUpload()
}

const stopUpload = () => {
  trackEvent('clk_personal_introduction_edit_cancel', '取消上传', {
    page_name: 'page_business_card_edit',
    employee_id: props.employeeId,
    sales_id: props.employeeId,
  })
  try {
    CardVideoIntroduceStore.stopUpload()
    emits('updateVideoStatus', fileId.value ? statusMap.isVideo : statusMap.isUpLoadWaiting)
    Taro.showToast({
      title: '取消上传成功',
      icon: 'none',
      duration: 2000,
    })
  } catch (error) {
    console.error(error)
  }
}

const reportClick = () => {
  trackEvent('clk_page_business_card_homepage_click_on_personal_introduction', '个人介绍视频播放', {
    page_name: 'page_business_card_homepage',
    sales_id: props.employeeId,
  })
}
</script>

<style lang="scss">
@import './index.scss';
</style>
