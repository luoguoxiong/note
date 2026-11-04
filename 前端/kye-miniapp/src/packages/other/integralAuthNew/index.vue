<!--
  积分授权页面-new
  转让积分给其他手机号，新UI版本
-->
<template>
  <view class="intergral-authorization-warp">
    <!-- 顶部栏 -->
    <view class="intergral-authorization__navbar">
      <image
        class="navbar-tip"
        src="https://ic-img.ky-express.com/netc/20240524_73966301152_!!1716521136581_60_64.png"
      />
      <text class="navbar-text">授权后历史及后续所得该类型积分均归接收手机所有，接收手机将不再获得运费积分，请谨慎操作！</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-warp">
      <form ref="integralAuthFormRef">
        <view class="form-item getPhone">
          <view class="form-label">
            <text>接收人手机</text>
            <view class="getPhone-content" @click="getYourPhoneList">
              <image
                src="https://ic-img.ky-express.com/netc/20240523_80066301135_!!1716471590022_48_50.png"
                class="phone-icon"
              />
              从通讯录选择
            </view>
          </view>
          <input
            :class="isPhoneFocus ? 'form-input active' : 'form-input'"
            name="phone"
            :value="phone"
            type="number"
            maxlength="11"
            placeholder-class="form-input-placeholder"
            placeholder="请输入接收积分的手机号码"
            @focus="handlePhoneFocus"
            @input="handleSetPhoneValue"
            @blur="validPhone"
          />
          <!-- 错误提示 -->
          <view v-if="showPhoneErrorText" class="form-input-error">
            <text>{{ errorText }}</text>
          </view>
        </view>

        <view v-if="isShowConfirmPhone" class="form-item">
          <view class="form-label">
            <text>再次确认接收人手机</text>
          </view>
          <input
            :class="isConfirmFocus ? 'form-input active' : 'form-input'"
            name="confirmPhone"
            :value="confirmPhone"
            type="number"
            maxlength="11"
            placeholder-class="form-input-placeholder"
            placeholder="请再次输入接收积分手机号码"
            @input="handleSetConfirmValue"
            @focus="handleConfirmPhoneFocus"
            @blur="validConfirmPhone"
            @paste="handlePaste"
          />
          <view v-if="showConfirmPhoneErrorText" class="form-input-error">
            <text>{{ errorText }}</text>
          </view>
        </view>
      </form>
    </view>

    <!-- 底部栏 -->
    <view class="intergral-authorization__bottomBtn">
      <view class="bottom-checkbox">
        <checkbox-group class="checkbox" @change="handleCheckedChange">
          <checkbox :value="String(checked)" :checked="checked" class="checkbox1" color="#7143F0" />
        </checkbox-group>
        <text class="text1">我已同意</text>
        <text class="text2 aa" @tap.stop="toAgreement"> 《授权转让须知》 </text>
      </view>
      <view class="bottom-btns">
        <button class="btn" :loading="submitLoading" @click="onSubmit">
          {{ submitLoading ? '提交中' : '提交' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import IntegralAuthAPI from './apis'

defineOptions({ name: 'IntegralAuthNew' })

// 声明全局变量
declare const process: any

const { autoLoginHook } = useAutoLogin()

// 响应式数据
const checked = ref(false)
const submitLoading = ref(false)
const phone = ref('')
const confirmPhone = ref('')
const isPhoneFocus = ref(false)
const isConfirmFocus = ref(false)
const showPhoneErrorText = ref(false)
const showConfirmPhoneErrorText = ref(false)
const isShowConfirmPhone = ref(true)
const errorText = ref('请输入正确格式的11位手机号码')
const isFromB = ref<any>('')

// 获取手机通讯录
const getYourPhoneList = () => {
  Taro.chooseContact({
    success: (data: any) => {
      console.log('获取手机号成功', data)
      if (data && data.errMsg.includes('ok')) {
        Taro.setStorageSync('integralPhones', {})
        setTimeout(() => {
          phone.value = data.phoneNumber
          confirmPhone.value = ''
          // 需要隐藏再次接收手机
          isShowConfirmPhone.value = false
          // 因为微信小程序调用通讯录之后再回来页面会，刷新页面，之前状态会重置
          setBtnStorage(false)
          showPhoneErrorText.value = false
        }, 200)
      }
    },
    fail: () => {
      isShowConfirmPhone.value = true
      setBtnStorage(true)
    },
  })
}

const delConfirmModel = () => {
  Taro.showModal({
    title: '温馨提示',
    content: '您已授权成功！识别到您历史有积分消费的订单，是否跳转到跨越领鲜快速删除？',
    confirmText: '立即跳转',
    confirmColor: '#8365F6',
    cancelText: '我再想想',
    success: async function (err: any) {
      if (err.confirm) {
        isFromB.value = 1
        Taro.setStorageSync('isFromStorage', true)

        Taro.navigateToMiniProgram({
          appId: 'wxb1503f29025cc7aa',
          path: 'package/pages/orders/orders',
          envVersion: process.env.TARO_APP_ENV === 'uat' ? 'trial' : 'release',
        })
      } else {
        await delayTime(1500)
        toIntegralCenter()
      }
    },
  })
}

// delayTime 函数
const delayTime = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const onSubmit = async () => {
  console.log('提交')
  // 如果是同通讯录获取则不校验 validConfirmPhone
  let isfirst = getBtnLocalStorage()
  console.log('isfirst >>> ', isfirst)
  if (!isfirst) {
    if (!(await validPhone())) {
      console.log('没有通过校验 isfirst ', isfirst)
      return
    }
  } else {
    if (!(await validPhone()) || !(await validConfirmPhone())) {
      console.log('没有通过校验')
      return
    }
  }

  if (!checked.value) {
    return Taro.showToast({ icon: 'none', title: '请阅读并勾选授权转让须知' })
  }

  submitLoading.value = true
  Taro.showModal({
    title: '授权确认',
    content: '授权后获得积分历史及后续所得均归接收手机所有，后续由接收手机消费，接收手机将不再获得运费积分，请确认是否授权？',
    confirmText: '确定',
    confirmColor: '#8365F6',
    cancelText: '我再想想',
    success: async (err: any) => {
      if (err.confirm) {
        // 请求接口
        authApi()
      } else {
        submitLoading.value = false
      }
    },
  })
}

const authApi = async () => {
  try {
    const res = await IntegralAuthAPI.authorizedTransfer({
      targetMobile: phone.value,
      operateSource: 30, // 10铸剑, 20App, 30小程序
    })
    if (res.hasOrder) {
      delConfirmModel()
    } else {
      Taro.showToast({ icon: 'none', title: '授权成功' })
      setTimeout(() => {
        toIntegralCenter()
      }, 2000)
    }
  } catch (e: any) {
    console.log(e)
    Taro.showToast({ icon: 'none', title: e.msg || '授权失败' })
  } finally {
    submitLoading.value = false
  }
}

const isValidChineseMobileNumber = (phoneNumber: string) => {
  // 正则表达式，匹配以13、14、15、16、17、18、19开头的11位手机号
  const pattern = /^1[3-9]\d{9}$/
  return !pattern.test(phoneNumber)
}

// 校验接收人手机
const validPhone = () => {
  console.log('当前接收人手机phone:', phone.value)
  let isPass = false
  let msg = ''
  if (!phone.value) {
    isPass = false
    msg = '请输入接收积分的手机号码'
  } else if (phone.value.length !== 11 || isValidChineseMobileNumber(phone.value)) {
    isPass = false
    msg = '请输入正确格式的11位手机号码'
  } else {
    isPass = true
    msg = ''
  }
  isPhoneFocus.value = false
  showPhoneErrorText.value = !isPass
  errorText.value = msg
  return isPass
}

// 校验再次输入接收人手机
const validConfirmPhone = async () => {
  console.log('当前接收人手机confirmPhone:', confirmPhone.value)
  let isPass = false
  let msg = ''
  if (!confirmPhone.value) {
    isPass = false
    msg = '请输入接收积分的手机号码'
  } else if (confirmPhone.value.length !== 11 || isValidChineseMobileNumber(confirmPhone.value)) {
    isPass = false
    msg = '请输入正确格式的11位手机号码'
  } else if (confirmPhone.value !== phone.value) {
    isPass = false
    msg = '接收手机号与确认手机号不一致'
  } else {
    isPass = true
    msg = ''
  }
  isConfirmFocus.value = false
  showConfirmPhoneErrorText.value = !isPass
  errorText.value = msg
  return isPass
}

// 前往积分中心页面
const toIntegralCenter = () => {
  Taro.navigateBack()
}

// 前往授权转让须知
const toAgreement = () => {
  Taro.navigateTo({ url: '/packages/other/authAgreement/index' })
}

const handleSetConfirmValue = (e: any) => {
  confirmPhone.value = e.target.value
}

const handlePaste = (event: any) => {
  event.preventDefault()
  // 可以在这里添加任何其他需要的逻辑
}

// 勾选框change
const handleCheckedChange = (e: any) => {
  console.log(e, '0000000handleCheckedChange00000')
  checked.value = !checked.value
  const isAgree = getIsAgreeLocalStorage()
  console.log(isAgree, 'handleCheckedChange')
  if (!isAgree) {
    toAgreement()
  }
  setIsAgreeLocalStorage(false)
}

const handleSetPhoneValue = (e: any) => {
  phone.value = e.target.value
  if (isPhoneFocus.value) {
    isShowConfirmPhone.value = true
    setBtnStorage(true)
  }
}

const handlePhoneFocus = () => {
  isPhoneFocus.value = true
}

const handleConfirmPhoneFocus = () => {
  isConfirmFocus.value = true
}

const clearForm = () => {
  phone.value = ''
  confirmPhone.value = ''
}

// 设置本地是否同意授权转让须知
const setIsAgreeLocalStorage = (value: boolean) => {
  Taro.setStorageSync('isAuthAgreement', value)
}

// 获取本地是否同意授权转让须知
const getIsAgreeLocalStorage = () => {
  const isAgree = Taro.getStorageSync('isAuthAgreement') || false
  console.log(Taro.getStorageSync('isAuthAgreement'), '999')
  return isAgree === true
}

// 设置本地是否展示二次按钮
const setBtnStorage = (value: boolean) => {
  Taro.setStorageSync('isShowBtn', value)
}

// 获取本地是否展示二次按钮
const getBtnLocalStorage = () => {
  const isShow = Taro.getStorageSync('isShowBtn')
  let isVal = true
  if (isShow === '') {
    isVal = true
  } else {
    isVal = isShow
  }
  console.log(Taro.getStorageSync('isShowBtn'), 'isShow111')
  return isVal === true
}

const init = () => {
  const isAgree = getIsAgreeLocalStorage()
  console.log(isAgree, 'init')
  checked.value = isAgree
  console.log(checked.value, 'checkedInit')

  const isShow = getBtnLocalStorage()
  isShowConfirmPhone.value = isShow
  console.log(isShow, 'isShowInit')
}

// 该函数从小程序b返回当前页面直接，直接跳转回积分中心
const backIntegralCenter = () => {
  console.log('切换到该页面')
  let targetFrom = Taro.getStorageSync('isFromStorage') || isFromB.value
  console.log('🚀 ~ backIntegralCenter ~ targetFrom:', targetFrom)
  if (+targetFrom === 1) {
    console.log('跳转到积分中心')
    isFromB.value = ''
    Taro.setStorageSync('isFromStorage', '')
    isFromB.value = ''
    toIntegralCenter()
  } else {
    console.log('啦啦啦')
  }
}

onMounted(async () => {
  await autoLoginHook()
  backIntegralCenter()
  init()
  const pages = Taro.getCurrentPages()
  console.log(pages, 'pages')
})
</script>

<style lang="scss">
@import './index.scss';
</style>
