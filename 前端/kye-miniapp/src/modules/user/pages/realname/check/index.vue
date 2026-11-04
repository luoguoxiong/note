<template>
  <div class="real-name-check" v-if="!loading">
    <div class="tip-img">
      <img src="https://ic-img.ky-express.com/netc/20260108_6915_!!1767835441359_480_480.png" />
    </div>
    <div class="tip-content" v-html="tipMsg"></div>

    <div class="footer">
      <ky-button class="btn" type="primary" @click="onConfirm">{{ confrimBtnName }}</ky-button>
      <ky-button class="btn" type="primary" plain v-if="isShowNotConfirm" @click="onCancel">暂不认证</ky-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import './index.scss'
import { ref, computed, onMounted } from 'vue'
import { getQueryObject } from '@/public/utils/url'
import {
  exp_realname_check_message_landing_page,
  clk_realname_check_message_landing_button,
  other_realname_check_message_landing_page,
} from '../report/index'
import Taro, { useDidShow } from '@tarojs/taro'
import { checkUserStatus } from '@/modules/user/apis/realname'
import { useLoginSetting } from '@modules/setting/pages/index/hooks/useLoginSetting'
const { handleChangeLogin } = useLoginSetting()

// 类型定义（找不到的引用使用 any）
interface CheckData {
  resultMsg: string
  resultCode: string
}

// 响应式状态
const loading = ref<boolean>(true)
const checkData = ref<CheckData>({
  resultMsg: '请使用运单寄件人姓名【张三】完成实名',
  resultCode: '40',
})

// 计算属性
const tipMsg = computed<string>(() => {
  const val = checkData.value.resultMsg
  if (!val) {
    return ''
  }
  return val.replace(/【([^】]+)】/g, '<span>【$1】</span>')
})

const confrimBtnName = computed<string>(() => {
  let name = ''
  const code = +checkData.value.resultCode
  if (code === 30 || code === 50) {
    name = '返回首页'
  } else if (code === 40) {
    name = '切换登录'
  } else {
    name = '立即认证'
  }
  return name
})

// 展不展示暂不认证按钮
const isShowNotConfirm = computed<boolean>(() => {
  return [10, 20, 40].includes(+checkData.value.resultCode)
})

// 方法定义

const onConfirm = (): void => {
  clk_realname_check_message_landing_button({
    button_name: confrimBtnName.value,
  })
  other_realname_check_message_landing_page({
    button_name: confrimBtnName.value,
    type: checkData.value.resultMsg,
  })
  const code = +checkData.value.resultCode
  if (code === 30 || code === 50) {
    // name = '返回首页'
    // this.onCancel()
    Taro.switchTab({
      url: '/layout/pages/home/index',
    })
  } else if (code === 40) {
    handleChangeLogin()
  } else {
    Taro.navigateTo({
      url: '/modules/user/pages/realname/personal/index?work_id=' + new Date().getTime(),
    })
  }
}

// 点击暂不认证按钮
const onCancel = (): void => {
  clk_realname_check_message_landing_button({
    button_name: '暂不认证',
  })
  other_realname_check_message_landing_page({
    button_name: '暂不认证',
    type: checkData.value.resultMsg,
  })
  Taro.switchTab({
    url: '/layout/pages/home/index',
  })
}

const checkApi = async (): Promise<void> => {
  loading.value = true
  try {
    const { encodeWaybillNumber } = getQueryObject()
    const res = await checkUserStatus({ encodeWaybillNumber })
    console.log(res, 'checkApi')
    exp_realname_check_message_landing_page({
      tips: res.data.resultMsg,
    })
    checkData.value = res?.data || { resultMsg: '请使用运单寄件人姓名完成实名', resultCode: '10' }
    loading.value = false
  } catch (e) {
    console.log(e)
    checkData.value = { resultMsg: '请使用运单寄件人姓名完成实名', resultCode: '10' }
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  checkApi()
})

useDidShow(() => {
  checkApi()
})
</script>
