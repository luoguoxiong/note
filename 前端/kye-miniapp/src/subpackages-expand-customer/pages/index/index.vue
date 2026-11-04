<!--
  全民拓客 - 主页面
  填写企业客户信息，包含表单验证、图形验证码、短信验证码
-->
<template>
  <view class="page page-home">
    <Header page="home" />

    <view class="page-home__body">
      <view class="form">
        <view class="form-item">
          <view class="form-item__label">
            <text>联系人</text>
          </view>
          <view class="form-item__content">
            <input
              type="text"
              class="form-item__input"
              placeholder="请填写企业联系人"
              :maxlength="8"
              :value="contactsName"
              @input="(e: any) => (contactsName = e.detail.value)"
            />
          </view>
        </view>

        <view class="form-item">
          <view class="form-item__label">
            <text>联系方式</text>
          </view>
          <view class="form-item__content">
            <input
              type="number"
              class="form-item__input"
              placeholder="请填写联系手机（必填）"
              :maxlength="11"
              :value="contactsPhone"
              @input="(e: any) => (contactsPhone = e.detail.value)"
            />
          </view>
        </view>

        <Address :on-confirm-cb="addrSelectCb" />

        <button
          v-if="showGetPhoneButton"
          class="get-phone-button"
          open-type="getPhoneNumber"
          @getphonenumber="onGetPhoneNumber"
        >
          授权手机号
        </button>

        <text class="tips">完善用户信息，精准匹配专属销售代表</text>

        <button class="button" @tap="onClick">领取福利</button>
      </view>
    </view>

    <view class="page-home__tips">
      <image class="page-home__tips--icon" :src="`${IMG_BASE_URL}/expand-customer/icon-tips.png`"></image>
      <text class="page-home__tips--text">以上请填写有寄件需求的企业客户信息</text>
    </view>

    <Dialog :show="dialogOption.show" :title="dialogOption.title" :on-close="onCloseDialog">
      <view v-if="dialogOption.view === 'imgCode'" class="img-code">
        <image class="img-code__img" :src="imageData" @tap="getImgCode" />
        <view class="img-code__tips">
          <text>看不清？点击图片刷新</text>
        </view>

        <CodeInput ref="imgCodeInputRef" :length="4" @submit="checkImgCode" />
      </view>

      <view v-if="dialogOption.view === 'smsCode'" class="sms-code">
        <view class="sms-code__tips">已向 {{ formatPhone(contactsPhone) }} 发送验证码,请输入</view>
        <view class="sms-code__resend">
          <text class="resend__text">未收到验证码？</text>
          <text v-if="time <= 0" class="resend__link" @tap="getImgCode">重新发送</text>
          <text v-else class="resend__link">重新发送 {{ time }}S</text>
        </view>

        <CodeInput ref="smsCodeInputRef" :length="6" @submit="checkSmsCode" />
      </view>
    </Dialog>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Taro from '@tarojs/taro'
import { useUserInfo } from '@/public/hooks'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import Header from '../../components/header/index.vue'
import Address from '../../components/address/index.vue'
import CodeInput from '../../components/code-input/index.vue'
import Dialog from '../../components/dialog/index.vue'
import ExpandCustomerAPI from '../../apis/index'

defineOptions({ name: 'ExpandCustomerIndex' })

// 声明全局变量
declare const getCurrentPages: any

// 常量
const IMG_BASE_URL = 'https://ic-h5.kye-erp.com/intro/miniprogram'
const COUNTDOWNTIME = 60

// Hooks
const { userInfo } = useUserInfo()
const { autoLoginHook } = useAutoLogin()

// 获取路由参数
const getRouteParams = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage.options || {}
}

const params = getRouteParams()
const employeeId = params.scene ? decodeURIComponent(params.scene) : ''

// 状态
const contactsName = ref('')
const contactsPhone = ref('')
const addressObj = ref<any>({})
const imgCodeInputRef = ref<any>(null)
const smsCodeInputRef = ref<any>(null)
const imageData = ref('')
const imgCodeKey = ref('')
const time = ref(COUNTDOWNTIME)
const dialogOption = ref({
  show: false,
  view: '',
  title: '',
})
const showGetPhoneButton = ref(false)

let timer: any = null

// 获取 openId
const getOpenId = async () => {
  const openId = await Taro.getStorageSync('openId')
  if (openId) return openId

  // TODO: 如果需要调用 silentOpenId 接口获取 openId，请在此处实现
  return ''
}

// 点击获取手机号
const onGetPhoneNumber = async (e: any) => {
  const { errMsg } = e.detail
  if (errMsg === 'getPhoneNumber:ok') {
    // TODO: 调用授权接口解密手机号
    // const { encryptedData, iv } = e.detail
    // await authorization(encryptedData, iv)
    showGetPhoneButton.value = false
    Taro.showToast({ title: '授权成功', icon: 'none' })
  } else {
    showGetPhoneButton.value = false
  }
}

// 提交成功，跳转
const onSuccess = (customerInfo: any) => {
  let query = ''
  if (customerInfo.marketAssistantPhone) {
    query = `?name=${customerInfo.marketAssistantName}&phone=${customerInfo.marketAssistantPhone}`
  } else if (customerInfo.marketPhone) {
    query = `?name=${customerInfo.marketName}&phone=${customerInfo.marketPhone}`
  }

  if (customerInfo.customerType === '10') {
    Taro.navigateTo({
      url: '../new/index' + query,
    })
  } else if (customerInfo.customerType === '20') {
    Taro.navigateTo({
      url: '../old/index' + query,
    })
  }
}

// 倒计时
const lastTime = () => {
  time.value = COUNTDOWNTIME
  if (timer) clearInterval(timer)

  timer = setInterval(() => {
    if (time.value > 1) {
      time.value--
    } else {
      clearInterval(timer)
      timer = null
      time.value = 0
    }
  }, 1000)
}

// 格式化显示手机号码
const formatPhone = (phone: string) => {
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

// 生成图形验证码
const getImgCode = async () => {
  if (!/^1[3-9]\d{9}$/.test(contactsPhone.value)) {
    Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  try {
    Taro.showLoading({ mask: true, title: '加载中...' })
    const res = await ExpandCustomerAPI.getImgCode({ phone: contactsPhone.value })
    const data: any = res.data || res
    imageData.value = data.imageData
    imgCodeKey.value = data.imgCodeKey
    dialogOption.value = {
      show: true,
      title: '请输入图片验证码',
      view: 'imgCode',
    }
  } catch (err) {
    console.error('获取图形验证码失败:', err)
  } finally {
    Taro.hideLoading()
  }
}

// 校验图形验证码
const checkImgCode = async (imgCode: string) => {
  if (!/^1[3-9]\d{9}$/.test(contactsPhone.value)) return

  try {
    Taro.showLoading({ mask: true, title: '加载中...' })
    await ExpandCustomerAPI.checkImgCode({
      phone: contactsPhone.value,
      imgCodeKey: imgCodeKey.value,
      imgCode,
    })

    Taro.hideLoading()
    Taro.showToast({ title: '已发送短信，请注意查收', icon: 'none' })

    dialogOption.value = {
      show: true,
      title: '请输入短信验证码',
      view: 'smsCode',
    }

    // 倒计时
    lastTime()
  } catch (error) {
    Taro.hideLoading()
    Taro.showToast({ title: '输入错误，请重试', icon: 'none' })
    setTimeout(() => {
      imgCodeInputRef.value?.clearValue()
      getImgCode()
    }, 500)
  }
}

// 校验短信验证码
const checkSmsCode = async (smsCode: string) => {
  if (!/^1[3-9]\d{9}$/.test(contactsPhone.value)) return

  try {
    Taro.showLoading({ mask: true, title: '加载中...' })
    await ExpandCustomerAPI.checkSmsCode({
      phone: contactsPhone.value,
      smsCode,
    })

    const res = await ExpandCustomerAPI.submitCustomer({
      minAppsAddResourceFlag: '10',
      employeeId,
      contactsName: contactsName.value,
      contactsPhone: contactsPhone.value,
      ...addressObj.value,
    })

    const data = res.data || res

    dialogOption.value = {
      show: false,
      title: '',
      view: '',
    }

    onSuccess(data)
    Taro.hideLoading()
  } catch (error: any) {
    Taro.hideLoading()
    Taro.showToast({ title: error.msg || '提交失败', icon: 'none' })

    if (error.code === 38750) {
      dialogOption.value = {
        show: false,
        title: '',
        view: '',
      }
    }
  }
}

// 地址选择回调
const addrSelectCb = (data: any) => {
  addressObj.value = {
    province: data.province.districtName,
    provinceId: data.province.districtID,
    city: data.city.districtName,
    cityId: data.city.districtID,
    district: data.area.districtName,
    districtId: data.area.districtID,
    street: data.street.districtName,
    streetId: data.street.districtID,
  }
}

// 点击提交
const onClick = async () => {
  try {
    // 判断必填
    if (!/^1[3-9]\d{9}$/.test(contactsPhone.value)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }

    if (userInfo.value.phone === contactsPhone.value) {
      Taro.showLoading({ mask: true, title: '加载中...' })
      const res = await ExpandCustomerAPI.submitCustomer({
        minAppsAddResourceFlag: '10',
        employeeId,
        contactsName: contactsName.value,
        contactsPhone: contactsPhone.value,
        ...addressObj.value,
      })
      const data = res.data || res
      onSuccess(data)
      Taro.hideLoading()
    } else {
      getImgCode()
    }
  } catch (error: any) {
    Taro.hideLoading()
    if (error.code && error.code !== 0) {
      Taro.showToast({ title: error.msg || '提交失败', icon: 'none' })
    }
  }
}

// 关闭弹窗
const onCloseDialog = () => {
  imgCodeInputRef.value?.clearValue()
  smsCodeInputRef.value?.clearValue()

  dialogOption.value = {
    ...dialogOption.value,
    show: false,
  }
}

// 尝试登录
onMounted(async () => {
  Taro.showLoading({ mask: true, title: '加载中...' })
  try {
    await autoLoginHook()
  } catch (err) {
    console.error('登录失败:', err)
  } finally {
    Taro.hideLoading()
  }

  // 统计访问量
  const openId = await getOpenId()
  if (employeeId) {
    ExpandCustomerAPI.visit({
      openid: openId,
      employeeId,
      contactsPhone: '',
    }).catch(() => {})
  }

  // 控制点击获取手机号
  if (userInfo.value.phone) {
    contactsPhone.value = userInfo.value.phone
    showGetPhoneButton.value = false
  } else {
    showGetPhoneButton.value = true
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss">
@import '../../styles/base.scss';
@import './index.scss';
</style>
