<template>
  <view class="lottery-number">
    <view class="common-card" :class="cardClass">
      <button class="avatar-button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image class="avatar" :src="headImg || IMG_BASE_URL + '/icon_avatar2.png'" />
        <view v-if="!headImg" class="cover">点击更换头像</view>
      </button>
      <view class="tips">您的抽奖号码</view>
      <view class="code">{{ activity?.luckyCode }}</view>
      <view class="lottery-place">
        <text class="label">开奖地点：</text>
        <text class="value">跨越速运展台</text>
        <view class="view-box">
          <text class="label">温馨提示：</text>
          <view>
            <view>① 本抽奖号当日有效，隔日作废</view>
            <view>② 收到中奖通知后，凭抽奖号至展台兑换</view>
            <view>③ 请【订阅中奖通知】，否则无消息提醒</view>
          </view>
        </view>
      </view>
      <view class="subscribe" @click="onSubscribeMessage">
        <view class="common-button" :class="buttonClass">{{ buttonText }}</view>
      </view>
    </view>

    <!-- 订阅取消二次提示弹框 -->
    <view v-if="showDialog" class="dialog-overlay">
      <view class="dialog-content">
        <view class="dialog-title">订阅失败</view>
        <view class="dialog-message">您已取消了订阅，将无法收到中奖提醒</view>
        <view class="dialog-buttons">
          <button class="dialog-btn cancel-btn" @click="handleCancel">错过就错过</button>
          <button class="dialog-btn confirm-btn" @click="handleConfirm">重新开启</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { computed, ref, watch } from 'vue'
import { isAutoModel } from '../../constants'
import Taro from '@tarojs/taro'
import MarketingLotteryAPI from '../../apis'

defineOptions({ name: 'LotteryNumber' })

const props = defineProps<{ activity: any }>()

const IMG_BASE_URL = 'https://ic-h5.kye-erp.com/intro/miniprogram'

// 订阅消息模板ID
const TEMP_IDS = ['4bEkTJHkz1FfqzblWuycvym6YZJGntRB-98ceruHMKw', 'cGP4pixBuzWbERomzQuujaUuLNB72Ypk-4UGpgwgtCc']

// 状态
const subscribed = ref(true)
const debounce = ref(false)
const headImg = ref(props.activity?.headImg || '')
const showDialog = ref(false)

// 计算属性
const canAutoModel = computed(() => isAutoModel(props.activity))
const isTemp = computed(() => props.activity && props.activity.templateId !== null && +props.activity.templateId === 0)
const cardClass = computed(() => (canAutoModel.value || !isTemp.value ? 'card' : 'card-new'))
const buttonClass = computed(() => (canAutoModel.value || !isTemp.value ? 'colorful-button' : 'colorful-button-new'))
const buttonText = computed(() => (canAutoModel.value || !isTemp.value ? '订阅中奖通知' : ''))

// 监听活动信息变化
watch(
  () => props.activity,
  (newActivity) => {
    if (newActivity) {
      getSubscribeSetting()
      headImg.value = newActivity.headImg || ''
    }
  },
  { immediate: true },
)

// 获取订阅设置
function getSubscribeSetting() {
  Taro.getSetting({
    withSubscriptions: true,
    success: ({ subscriptionsSetting }) => {
      const itemSettings = subscriptionsSetting.itemSettings
      if (!itemSettings || itemSettings[TEMP_IDS[0]] !== 'accept' || itemSettings[TEMP_IDS[1]] !== 'accept') {
        subscribed.value = false
      }
    },
  })
}

// 订阅消息
function onSubscribeMessage() {
  if (debounce.value) return
  debounce.value = true
  Taro.requestSubscribeMessage({
    tmplIds: TEMP_IDS,
    success: (result) => {
      if (TEMP_IDS.every((id) => result[id] === 'accept')) {
        subscribed.value = true
        Taro.showToast({ title: '订阅成功' })
      }
    },
    fail: () => {},
    complete: (result: any) => {
      // 是否有拒绝订阅的消息
      showDialog.value = result.errCode === 20004 || TEMP_IDS.some((id) => result[id] === 'reject')
      debounce.value = false
    },
  })
}

// 选择头像
function onChooseAvatar(e: any) {
  const { avatarUrl } = e.detail
  console.log('选择的头像路径:', avatarUrl)
  
  // 检查文件路径是否有效
  if (!avatarUrl) {
    console.error('头像路径为空')
    Taro.showToast({
      title: '获取头像失败，请重试',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  // 获取到用户信息然后调接口保存
  const bizId = Math.ceil(Math.random() * 99999).toString()
  
  MarketingLotteryAPI.uploadAvatar(avatarUrl, bizId)
    .then((res: any) => {
      console.log('上传响应:', res)
      if (res.data && res.data.length > 0) {
        const url = res.data[0].url
        const requestParams = {
          activityId: props.activity.activityId,
          nickName: 'AAA',
          headImg: url,
        }
        return MarketingLotteryAPI.saveUserInfo(requestParams).then(() => url)
      } else {
        throw new Error('上传响应数据格式错误')
      }
    })
    .then((url) => {
      if (url) {
        headImg.value = url
        Taro.showToast({
          title: '更换头像成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
    .catch((error) => {
      console.error('上传头像失败:', error)
      // 在开发工具中，chooseAvatar 可能会失败，提示用户在真机上测试
      const errorMsg = error.errMsg || error.message || '上传头像失败'
      if (errorMsg.includes('ENOENT') || errorMsg.includes('no such file')) {
        Taro.showToast({
          title: '开发工具暂不支持，请在真机上测试',
          icon: 'none',
          duration: 3000
        })
      } else {
        Taro.showToast({
          title: '上传头像失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
}

// 弹框处理
function handleCancel() {
  showDialog.value = false
}

function handleConfirm() {
  Taro.openSetting()
  showDialog.value = false
}
</script>

