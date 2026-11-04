<!--
  参与抽奖
  节日活动抽奖页面
-->
<template>
  <view class="festival">
    <image class="festival__bg" :src="`${IMG_BASE_URL}/activity/festival-bg.png`" mode="aspectFill" />
    <view v-if="!showPrize" class="festival__content">
      <view class="content">
        <view class="title">请填写以下信息，以便获取奖品</view>
        <view class="fill-single fill-single-margin">
          <view class="require">*</view>
          <input
            class="inputText"
            placeholder="您的姓名"
            placeholder-style="font-size: 14px; color: #8f929f"
            :value="name"
            maxlength="10"
            @input="onName"
          />
          <view v-if="errorFormData.name && !name" class="error">{{ errorFormData.name }}</view>
        </view>
        <view class="fill-single fill-single-margin">
          <view class="require">*</view>
          <input
            type="number"
            class="inputText"
            placeholder="您的手机号"
            maxlength="11"
            placeholder-style="font-size: 14px; color: #8f929f"
            :value="phone"
            @input="onPhone"
          />
          <view v-if="errorFormData.phone && !isPhoneValid" class="error">{{ errorFormData.phone }}</view>
        </view>
        <view class="fill-single fill-single-margin">
          <view class="require">*</view>
          <input
            class="inputText"
            placeholder="公司名称"
            placeholder-style="font-size: 14px; color: #8f929f"
            :value="company"
            maxlength="50"
            @input="onCompany"
          />
          <view v-if="errorFormData.company && !company" class="error">{{ errorFormData.company }}</view>
        </view>
        <view class="fill-single fill-single-margin">
          <view class="require">*</view>
          <input
            class="inputText"
            placeholder="您的职务"
            placeholder-style="font-size: 14px; color: #8f929f"
            :value="job"
            maxlength="10"
            @input="onJob"
          />
          <view v-if="errorFormData.job && !job" class="error">{{ errorFormData.job }}</view>
        </view>
      </view>
      <view class="submit" @tap="submit">
        <image class="img" :src="`${IMG_BASE_URL}/activity/festival-submit.png`" mode="aspectFit" />
      </view>
      <view class="text">跨越速运会对您的信息保密，请放心提交。</view>
    </view>
    <view v-else class="festival__content">
      <view class="prize-show">
        <image class="prize-show-bg" :src="`${IMG_BASE_URL}/activity/prize-show.png`" mode="aspectFit" />
        <image class="prize-right" :src="`${IMG_BASE_URL}/activity/prize-right.png`" mode="aspectFit" />
        <view class="content">
          <view class="title">
            恭喜您获得
            <view class="title-bg"></view>
          </view>
          <view class="prize-name">
            <image class="prize-name-img" :src="prizeUrl" mode="aspectFit" />
          </view>
          <view class="name">{{ prizeName }}</view>
          <view class="desc">凭中奖截图</view>
          <view class="desc">询问跨越速运市场人员现场领取奖品</view>
        </view>
      </view>
      <view class="prize-relation">
        <image class="prize-relation-bg" :src="`${IMG_BASE_URL}/activity/prize-relation.png`" mode="aspectFit" />
        <image class="prize-left" :src="`${IMG_BASE_URL}/activity/prize-left.png`" mode="aspectFit" />
        <view class="content">
          <view class="desc">货急找跨越</view>
          <view class="relation">联系方式：廖春霞-18198953535</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Taro from '@tarojs/taro'
import FestivalDrawAPI from './apis/index'
import { useLogin } from '@public/hooks'

defineOptions({
  name: 'FestivalDraw',
})

const { token } = useLogin()
const openId = Taro.getStorageSync('openId')

const IMG_BASE_URL = 'https://ic-h5.kye-erp.com/intro/miniprogram'

// 响应式数据
const errorFormData = ref<Record<string, string>>({})
const name = ref('')
const phone = ref('')
const company = ref('')
const job = ref('')
const showPrize = ref(false)
const prizeName = ref('')
const prizeUrl = ref('')

// 计算属性：手机号是否有效
const isPhoneValid = computed(() => /^1[3456789]\d{9}$/.test(phone.value))

// 提交表单
const submit = async () => {
  if (!name.value || !isPhoneValid.value || !company.value || !job.value) {
    errorFormData.value = {
      name: '请填写您的姓名',
      phone: '请填写您的11位手机号码',
      company: '请填写您的公司名称',
      job: '请填写您所在公司职务',
    }
    return
  }

  // const token = Taro.getStorageSync('activity_token')
  // const openId = Taro.getStorageSync('activity_openId')

  Taro.showLoading({ title: '加载中...' })

  try {
    // 保存信息
    await FestivalDrawAPI.saveInfo({
      token: token.value,
      name: name.value,
      mobile: phone.value,
      company: company.value,
      industry: job.value,
      openId,
    })

    // 获取抽奖结果
    const res = await FestivalDrawAPI.getLuckyDraw({
      token: token.value,
      activityType: 0,
    })

    showPrize.value = true
    prizeUrl.value = res.data?.imageUrl || ''
    prizeName.value = res.data?.name || ''
    Taro.hideLoading()
  } catch (err: any) {
    Taro.hideLoading()
    Taro.showToast({
      title: err.msg || '操作失败',
      icon: 'none',
    })
  }
}

// 输入处理
const onName = (e: any) => {
  name.value = e.detail.value
}

const onPhone = (e: any) => {
  phone.value = e.detail.value
}

const onCompany = (e: any) => {
  company.value = e.detail.value
}

const onJob = (e: any) => {
  job.value = e.detail.value
}
</script>

<style lang="scss">
@import './draw.scss';
</style>

