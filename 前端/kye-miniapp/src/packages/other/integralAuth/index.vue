<!--
  积分授权页面
  转让积分给其他手机号，支持从通讯录选择
-->
<template>
  <view class="intergral-authorization-warp">
    <!-- 顶部栏 -->
    <view class="intergral-authorization__navbar">
      <image
        class="navbar-tip"
        src="https://ic-img.ky-express.com/netc/20240524_73966301152_!!1716521136581_60_64.png"
      />
      <text class="navbar-text">授权后历史及后续所得该类型积分均归接收手机所有，请谨慎操作！</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-warp">
      <form ref="integralAuthFormRef">
        <view class="form-item getPhone">
          <view class="form-label">
            <text>接收手机</text>
            <view class="getPhone-content" @click="getYourPhoneList">
              <image
                src="https://ic-img.ky-express.com/netc/20240523_80066301135_!!1716471590022_48_50.png"
                class="phone-icon"
              />
              从通讯录选择
            </view>
          </view>
          <input
            class="form-input"
            name="phone"
            :value="phone"
            type="number"
            maxlength="11"
            placeholder-class="form-input-placeholder"
            placeholder="请输入接收手机"
            @input="handleSetAndValidPhone"
            @blur="validPhone"
          />
          <!-- 错误提示 -->
          <view v-if="showPhoneErrorText" class="form-input-error">
            <text>{{ errorText }}</text>
          </view>
        </view>

        <view v-if="isShowComfirmPhone" class="form-item">
          <view class="form-label">
            <text>再次确认接收手机</text>
          </view>
          <input
            class="form-input"
            name="comfirmPhone"
            :value="comfirmPhone"
            type="number"
            maxlength="11"
            placeholder-class="form-input-placeholder"
            placeholder="请再次输入接收手机"
            @input="handleSetAndValidComfirmPhone"
            @blur="validComfirmPhone"
            @paste="handlePaste"
          />
          <view v-if="showComfirmPhoneErrorText" class="form-input-error">
            <text>{{ errorText }}</text>
          </view>
        </view>
      </form>
    </view>

    <!-- 底部栏 -->
    <view class="intergral-authorization__bottomBtn">
      <view class="bottom-checkbox">
        <checkbox-group v-if="!isShowTrueCheckbox" class="checkbox1" @change="handleChangechecked">
          <checkbox name="fakeCheckbox" value="fakeCheckbox" :checked="false" class="checkbox1" color="#fff" />
        </checkbox-group>
        <checkbox-group v-else class="checkbox1" @change="handleChangeRealchecked">
          <checkbox name="realCheckbox" value="realCheckbox" :checked="checked" class="checkbox1" color="#7143F0" />
        </checkbox-group>
        <text class="text1">我已同意</text>
        <text class="text2 aa" @click="handleGotoRichtext"> 《授权转让须知》 </text>
      </view>
      <view class="bottom-btns">
        <button :class="{ btn: checked }" :loading="submitLoading" :disabled="!checked" @click="getFormData">
          {{ submitLoading ? '提交中' : '确认授权' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { Form } from '@tarojs/components'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import IntegralAuthAPI from './apis'
import { useLogin } from '@/public/hooks'

defineOptions({ name: 'IntegralAuth' })

// 声明全局变量
declare const process: any
declare const getCurrentPages: any

const { autoLoginHook } = useAutoLogin()

const BaseH5URL = process.env.TARO_APP_HTTP_URL || 'https://ic-h5.kye-erp.com'

// 响应式数据
const checked = ref(false)
const submitLoading = ref(false)
const phone = ref('')
const comfirmPhone = ref('')
const showPhoneErrorText = ref(false)
const showComfirmPhoneErrorText = ref(false)
const isShowComfirmPhone = ref(false)
const isShowTrueCheckbox = ref(false)
const errorText = ref('请输入正确格式的11位大陆手机号码')

const { token } = useLogin()

// 获取手机通讯录
const getYourPhoneList = () => {
  Taro.chooseContact({
    success: (data: any) => {
      console.log('获取手机号成功', data)
      if (data && data.errMsg.includes('ok')) {
        Taro.setStorageSync('integralPhones', {})
        setTimeout(() => {
          Taro.setStorageSync('integralPhones', {
            phone: data.phoneNumber,
            comfirmPhone: '',
          })
          phone.value = data.phoneNumber
          comfirmPhone.value = ''
          console.log('=============================')
          // 需要隐藏再次接收手机
          isShowComfirmPhone.value = false
          // 因为微信小程序调用通讯录之后再回来页面会，刷新页面，之前状态会重置
          Taro.setStorageSync('isHiddenComfirmPhone', false)
        }, 200)
      }
    },
    fail: () => {
      isShowComfirmPhone.value = true
      Taro.setStorageSync('isHiddenComfirmPhone', true)
    },
  })
}

const delConfirmModel = () => {
  Taro.showModal({
    title: '温馨提示',
    content: '您的积分已成功授权，是否删除跨越领鲜交易完成的所有订单？',
    confirmText: '删除',
    confirmColor: '#8365F6',
    cancelText: '暂不处理',
    success: function (err: any) {
      if (err.confirm) {
        // integralPhones
        Taro.removeStorageSync('integralPhones')
        let isCheck = checked.value ? 1 : 0
        let gotoUrl = `${BaseH5URL}/integral-center.html#/integral-home?token=${token.value}&isCheck=${isCheck}&isdel=1&isFromMini=1`
        Taro.redirectTo({
          url: `/packages/webview/openWebview?url=${encodeURIComponent(gotoUrl)}`,
        })
      } else {
        // integralPhones
        Taro.removeStorageSync('integralPhones')
        let isCheck = checked.value ? 1 : 0
        let gotoUrl = `${BaseH5URL}/integral-center.html#/integral-home?token=${token.value}&isCheck=${isCheck}&isdel=2&isFromMini=1`
        Taro.redirectTo({
          url: `/packages/webview/openWebview?url=${encodeURIComponent(gotoUrl)}`,
        })
      }
    },
  })
}

const getFormData = async () => {
  console.log('提交')

  // 如果是同通讯录获取则不校验 validComfirmPhone
  let isfirst = Taro.getStorageSync('isHiddenComfirmPhone')
  console.log('isfirst >>> ', isfirst)
  if (!isfirst) {
    if (!(await validPhone())) {
      console.log('没有通过校验 isfirst ', isfirst)
      return
    }
  } else {
    if (!(await validPhone()) || !(await validComfirmPhone())) {
      console.log('没有通过校验')
      return
    }
  }

  submitLoading.value = true
  Taro.showModal({
    title: '确认是否授权?',
    content: '授权后获得积分历史及后续所得均归接收手机所有，后续由接收手机消费，请确认是否授权',
    confirmText: '确定',
    confirmColor: '#8365F6',
    cancelText: '我再想想',
    success: async (err: any) => {
      if (err.confirm) {
        // 请求接口
        try {
          await IntegralAuthAPI.authorizedTransfer({
            targetMobile: phone.value,
            operateSource: 30, // 10铸剑, 20app, 30小程序
          })
          delConfirmModel()
        } catch (error: any) {
          console.log('error >>>', error)
          submitLoading.value = false
          Taro.showToast({ icon: 'none', title: error.msg })
        }
      } else {
        submitLoading.value = false
        Taro.showToast({ icon: 'none', title: err.msg })
      }
      submitLoading.value = false
    },
  })
}

const isValidChineseMobileNumber = (phoneNumber: string) => {
  // 正则表达式，匹配以13、14、15、16、17、18、19开头的11位手机号
  const pattern = /^1[3-9]\d{9}$/
  return !pattern.test(phoneNumber)
}

// 校验
const validPhone = async () => {
  console.log('当前的值 phone 11', phone.value)
  // 先前端然后后端判断
  if (!phone.value) {
    showPhoneErrorText.value = true
    isShowComfirmPhone.value = true
    Taro.setStorageSync('isHiddenComfirmPhone', true)
    return false
  } else if (phone.value.length !== 11) {
    showPhoneErrorText.value = true
    isShowComfirmPhone.value = true
    Taro.setStorageSync('isHiddenComfirmPhone', true)
    return false
  } else if (isValidChineseMobileNumber(phone.value)) {
    showPhoneErrorText.value = true
    isShowComfirmPhone.value = true
    Taro.setStorageSync('isHiddenComfirmPhone', true)
    return false
  } else {
    showPhoneErrorText.value = false
    return true
  }
}

const validComfirmPhone = async () => {
  console.log('当前的值 comfirmPhone 11111', comfirmPhone.value)
  if (!comfirmPhone.value) {
    console.log(1)
    showComfirmPhoneErrorText.value = true
    return false
  } else if (comfirmPhone.value.length !== 11) {
    console.log(2)
    showComfirmPhoneErrorText.value = true
    return false
  } else if (isValidChineseMobileNumber(comfirmPhone.value)) {
    console.log(2)
    showComfirmPhoneErrorText.value = true
    return false
  } else if (comfirmPhone.value !== phone.value) {
    showComfirmPhoneErrorText.value = true
    console.log(2)
    return false
  } else {
    showComfirmPhoneErrorText.value = false
    return true
  }
}

const handleSetAndValidComfirmPhone = (e: any) => {
  comfirmPhone.value = e.target.value
  validComfirmPhone()
}

// 跳转协议
const handleGotoRichtext = () => {
  console.log('跳转--')
  console.log('hhhhhhh')
  let isHidden = Taro.getStorageSync('isHiddenComfirmPhone')
  console.log('协议跳转 ', isHidden)

  Taro.setStorageSync('integralPhones', {
    phone: phone.value,
    comfirmPhone: comfirmPhone.value,
  })

  let isCheck = checked.value ? 1 : 0
  // 进行跳转
  Taro.navigateTo({
    url: `/packages/webview/openWebview?url=${encodeURIComponent(
      `${BaseH5URL}/integral-center.html#/intergral-authorization-richtext?token=${token.value}&isCheck=${isCheck}`,
    )}`,
  })
}

const handlePaste = (event: any) => {
  event.preventDefault()
  // 可以在这里添加任何其他需要的逻辑
}

// change
const handleChangechecked = (e: any) => {
  console.log('e >>>> ', e)
  console.log('------ checked-----', checked.value)

  // 存储信息
  Taro.setStorageSync('integralPhones', {
    phone: phone.value,
    comfirmPhone: comfirmPhone.value,
  })

  Taro.navigateTo({
    url: `/packages/webview/openWebview?url=${encodeURIComponent(
      `${BaseH5URL}/integral-center.html#/intergral-authorization-richtext?token=${token.value}`,
    )}`,
  })
}

const handleChangeRealchecked = () => {
  checked.value = !checked.value
  Taro.setStorageSync('hasCheckbox', !checked.value)
}

const handleSetAndValidPhone = (e: any) => {
  console.log('%c🤪 ~ file: integralAuth/index.vue [IntegralAuth/handleSetAndValidPhone] -> e : ', 'color: #9759eb', e)

  phone.value = e.target.value
}

// 初始化的时候先判断是否要展示再次接收手机号
const initShowConfirmphone = () => {
  console.log('初始化的时候先判断是否要展示再次接收手机号')
  let isHidden = Taro.getStorageSync('isHiddenComfirmPhone')
  console.log(' --------- isHidden', isHidden, Boolean(isHidden))
  console.log('------> phone 值', phone.value)
  isShowComfirmPhone.value = Boolean(isHidden)

  // 解决场景,当从手机通讯录获取手机号，并且手机号有值的情况下进行校验
  if (!isHidden && phone.value) {
    validPhone()
  }
}

// 初始化checkbox判断
const initJustmentCheckbox = () => {
  let isCheckout = Taro.getStorageSync('hasCheckbox')
  console.log(isCheckout, 'isCheckout')

  let isHidden = Taro.getStorageSync('isHiddenComfirmPhone')
  console.log(' 111 --------- isHidden', isHidden, Boolean(isHidden))
  console.log('11 ------> phone 值', phone.value)

  // 回填手机号
  if (isCheckout) {
    let res = Taro.getStorageSync('integralPhones')

    if (res && Object.keys(res).length > 0) {
      phone.value = res.phone || ''
      comfirmPhone.value = res.comfirmPhone || ''
    }

    Taro.nextTick(() => {
      isShowComfirmPhone.value = isHidden
    })
  } else {
    Taro.setStorageSync('integralPhones', {})
    // 解决场景：初始化页面进来，原来已经操作过手机通讯录的场景下，需要重新设置为true，展示再次确认手机号
    if (!isHidden && !phone.value) {
      console.log('是否走到啊这里了')
      isShowComfirmPhone.value = true
      Taro.setStorageSync('isHiddenComfirmPhone', true)
    }
  }

  // 展示真实checkbox
  isShowTrueCheckbox.value = isCheckout
  checked.value = isCheckout
}

onMounted(async () => {
  await autoLoginHook()
  initShowConfirmphone()
  initJustmentCheckbox()
})
</script>

<style lang="scss">
@import './index.scss';
</style>
