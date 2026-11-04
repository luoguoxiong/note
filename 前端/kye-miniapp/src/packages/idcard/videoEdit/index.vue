<template>
  <view class="video-edit-page">
    <view class="video-notice">
      编辑个人介绍信息后需由上级领导或总经办进行工单审批，审批通过后将更新展示最新名片信息
    </view>

    <template v-if="isNotPassApplyStatus">
      <view class="video-apply">
        <view class="apply-status">
          <view class="apply-label">审批状态</view>
          <view :class="`apply-tag ${isFailApplyStatus ? 'error' : ''}`">
            {{ isFailApplyStatus ? '审核不通过' : '审核中' }}
          </view>
        </view>

        <view v-if="isFailApplyStatus" class="apply-status">
          <view class="apply-label">原因</view>
          <view class="apply-info">{{ rejectDesc || '无' }}</view>
        </view>
      </view>
    </template>

    <view class="upload-wrap">
      <view class="upload-title">视频介绍</view>

      <!-- 未上传 -->
      <view v-if="videoInfo.imgProgress === -1 && !videoInfo.fileId" class="upload-content" @click="uploadVideo">
        <image
          class="upload-icon"
          src="https://ic-img.ky-express.com/netc/20250225_80970395141_!!1740485892623_64_64.png"
        />
        <view class="upload-label">添加视频</view>
      </view>

      <!-- 上传中 -->
      <view v-if="videoInfo.imgProgress !== -1 && !videoInfo.fileId" class="upload-loading">
        <image
          class="upload-spin"
          src="https://ic-img.ky-express.com/netc/20250225_75570395148_!!1740485888362_96_96.png"
        />
        <view class="upload-spin-text">上传中....{{ videoInfo.imgProgress }}%</view>
      </view>

      <view v-if="videoInfo.fileId" class="video-wrap">
        <image
          v-if="applyStatus !== 0"
          class="upload-remove"
          @click="removeVideo"
          src="https://ic-img.ky-express.com/netc/20250207_2717039518_!!1738913178436_64_64.png"
        />
        <my-player
          :appid="VIDEP_APPID"
          height="100%"
          width="100%"
          object-fit="cover"
          :fileid="videoInfo.fileId"
          style="height: 100%; width: 100%"
          playerid="myPlayerId"
        />
      </view>

      <view class="upload-desc">支持小于50M的视频</view>
    </view>

    <view class="fixed-btn">
      <button :class="`vidoe-btn ${applyStatus === 0 ? 'disabled' : ''}`" @click="submit">提交</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Taro from '@tarojs/taro'
import { getUploadSignature, publishMiniProGramProcess, editProfileVideo, getDetailForEmployee } from '../api/index'
import { uuid } from '../../../utils'
import VodUploader from '../lib/src/vod.js'
import { VIDEP_APPID } from '@public/utils/idcard-video'

const router = Taro.useRouter()
const { id, code } = router.params

// 1 审核通过/新加，0审核中，-1 审核不通过
const APPLY_STATUS = {
  pass: 1,
  padding: 0,
  fail: -1,
}

// eslint-disable-next-line no-undef
const refTimer = ref<NodeJS.Timeout | null>(null)
const rejectDesc = ref('')
const applyStatus = ref(APPLY_STATUS.pass) // 1 审核通过/新加，0审核中，-1 审核不通过

const videoInfo = ref({
  fileId: '',
  imgProgress: -1, // -1 未上传
  isOk: false,
})

const isNotPassApplyStatus = computed(() => applyStatus.value !== APPLY_STATUS.pass)

const isFailApplyStatus = computed(() => applyStatus.value === APPLY_STATUS.fail)

const removeVideo = () => {
  videoInfo.value = {
    fileId: '',
    imgProgress: -1,
    isOk: false,
  }
}

const uploadVideo = async () => {
  try {
    const res = await Taro.chooseMedia({
      count: 1,
      sourceType: ['album', 'camera'],
      sizeType: ['original'],
      mediaType: ['video'],
      maxDuration: 60,
      chunkSize: 8388608,
      chunkRetryTimes: 10,
      chunkParallelLimit: 3,
    })

    const file = res.tempFiles[0]
    if (file.size > 50 * 1024 * 1024) {
      Taro.showToast({
        title: '文件不能大于50M',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    videoInfo.value = {
      fileId: '',
      imgProgress: 0,
      isOk: false,
    }

    const uid = uuid()
    VodUploader.start({
      mediaFile: file,
      getSignature: async (callback) => {
        const re = await getUploadSignature({ uid, bizType: 1 })
        callback(re.signature)
      },
      progress: (result) => {
        videoInfo.value.imgProgress = Math.max(result.percent * 100 - 1, 0).toFixed(0)
      },
      finish: (result) => {
        refTimer.value = setInterval(async () => {
          const videoStatus = await publishMiniProGramProcess({
            fileId: result.fileId,
            uid,
          })
          if (videoStatus.status === 1) {
            clearInterval(refTimer.value as NodeJS.Timeout)
            videoInfo.value = {
              isOk: true,
              fileId: result.fileId,
              imgProgress: 100,
            }
          }
        }, 1000)
      },
      error: () => {
        videoInfo.value = {
          fileId: '',
          imgProgress: -1,
          isOk: false,
        }
      },
    })
  } catch (error) {
    console.error(error)
  }
}

const submit = async () => {
  try {
    if (!videoInfo.value.fileId) {
      Taro.showToast({
        title: '请上传视频',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    await editProfileVideo({
      id: id,
      profileVideoFileId: videoInfo.value.fileId,
    })

    Taro.showToast({
      title: '提交成功',
      icon: 'none',
      duration: 2000,
    })
    Taro.navigateBack()
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  try {
    const res = await getDetailForEmployee({
      code: code,
      origin: 'edit',
    })

    videoInfo.value = {
      fileId: res.baseInfo.profileVideo.fileId,
      imgProgress: -1,
      isOk: false,
    }

    rejectDesc.value = res.baseInfo.profileVideo.rejectReason

    const applyStatusMap = {
      1: 0,
      2: 1,
      3: -1,
    }

    applyStatus.value = applyStatusMap[res.baseInfo.profileVideo.workOrderStatus]
  } catch (error) {
    console.error(error)
  }
})

onUnmounted(() => {
  if (refTimer.value) {
    clearInterval(refTimer.value)
  }
})
</script>

<style scoped>
@import './index.scss';
</style>
