<template>
  <view class="password-apply">
    <view class="password-apply__header">
      <view class="text">
        <view class="tip">如您忘记客户编码密码，可在下方申请绑码，申请通过后将为您直接绑定</view>
      </view>
      <image
        src="https://ic-img.ky-express.com/netc/20260601_55523_!!1780301819703_376_272.png"
        class="img-bg"
        mode="aspectFit"
      ></image>
    </view>

    <view class="password-apply__body">
      <ky-form ref="formRef" :model-value="formData">
        <view class="form-item">
          <ky-field
            label="姓名"
            required
            v-model="formData.userName"
            prop="userName"
            :rules="userNameRules"
            placeholder="请输入您的姓名"
            :maxlength="20"
            clearable
            :class="{ error: errors.userName }"
            :inputDebounce="600"
            :cursorSpacing="26"
            @blur="handleUserNameBlur"
            @focus="clearFieldError('userName')"
          />
        </view>

        <view class="form-item">
          <ky-field
            label="公司名称"
            required
            v-model="formData.company"
            prop="company"
            :rules="companyRules"
            placeholder="请输入客户编码/公司简称"
            :maxlength="50"
            clearable
            :class="{ error: errors.company }"
            :inputDebounce="600"
            :cursorSpacing="26"
            @blur="handleCompanyBlur"
            @focus="clearFieldError('company')"
          />
        </view>

        <view class="form-item">
          <!-- 申请原因 -->
          <ky-field
            :required="true"
            label="申请原因"
            prop="reason"
            :rules="reasonRules"
            v-model="formData.reason"
            :maxlength="20"
            :clearable="true"
            :inputDebounce="600"
            :cursorSpacing="26"
            placeholder="请输入申请原因"
            @blur="handleFieldBlur('reason')"
          />
          <!-- <ky-field :required="true" label="申请原因" prop="reason" :rules="reasonRules" v-model="formData.reason">
            <template #input="{ isError }">
              <ky-textarea
                :isError="isError"
                placeholder="请输入申请原因"
                v-model="formData.reason"
                @blur="handleFieldBlur('reason')"
                :maxlength="20"
              >
              </ky-textarea>
            </template>
          </ky-field> -->
        </view>
      </ky-form>
    </view>

    <view class="password-apply__footer">
      <ky-button class="submit-button" type="primary" size="large" :loading="loading" @click="handleSubmit">
        提交
      </ky-button>
      <view class="tip-text">
        <text>若您忘记了客户编码或公司全称，需要绑码，可</text>
        <view class="color-sty" @tap="handleCallPhone">拨打95324</view>
      </view>
    </view>

    <!-- 确认弹窗 -->
    <Alert
      :visible="alertVisible"
      :title="alertTitle"
      :content="alertContent"
      :confirm-text="alertConfirmText"
      :cancel-text="alertCancelText"
      :show-cancel="alertShowCancel"
      @confirm="handleAlertConfirm"
      @cancel="handleAlertCancel"
      @close="handleAlertClose"
    />

    <!-- 图形验证码弹窗 -->
    <Captcha ref="captchaRef" @getCode="getCode" />
  </view>
</template>

<script setup lang="ts">
/**
 * 密码申请页面 - 忘记密码场景
 *
 * 从 H5 项目 (netc-h5-modules) 迁移的密码申请表单
 * 功能：用户忘记客户编码密码时，填写信息申请绑定
 *
 * 转换要点：
 * - van-field → ky-field (miniUI组件库)
 * - van-button → ky-button (miniUI组件库)
 * - vue-router → Taro 路由
 * - window.location.href → Taro.makePhoneCall
 * - Dialog/Toast → Alert/Taro.showToast
 */
import { ref, reactive, onMounted } from 'vue'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { showToast } from '@tarojs/taro'
import { useUserGlobalStore } from '@/store/user'
import plateform from '@kye-netc/plateform'
import KyImage from '@/public/components/base/ky-image/index.vue'
import Captcha from '@/public/components/base/captcha/index.vue'
import Alert from '../components/shared/Alert.vue'
import { applyBindCustomerParamCheck, applyBindCustomer } from '@modules/user/apis/customerCode'
import { exp_customer_code_password_page, clk_customer_code_password_button } from '../report/index'
import './index.scss'

interface Props {
  /** 页面来源参数 */
  source?: string | number
  /** 客户编码（从路由参数获取） */
  customerCode?: string
}

const props = withDefaults(defineProps<Props>(), {
  source: undefined,
  customerCode: '',
})

const emit = defineEmits<{
  (e: 'submitSuccess', data?: any): void
  (e: 'cancel'): void
}>()

const userStore = useUserGlobalStore()
const userInfo = userStore.userInfo
const formRef = ref<any>(null)

const instance = getCurrentInstance()
const router = instance.router
const params = router?.params || {}

/** 单个字段 blur 校验 */
const handleFieldBlur = (key: string) => {
  formRef.value?.validate(key)
}
/** 表单数据 */
const formData = reactive({
  company: '',
  userName: '',
  reason: '',
})

/** 字段错误信息 */
const errors = reactive({
  company: '',
  userName: '',
  reason: '',
})

/** 加载状态 */
const loading = ref(false)

/** 滑块验证码 */
const captchaRef = ref(null)

/** 验证码信息缓存 */
const captchaInfoCache = ref<any>(null)

/** 是否提交中（用于区分校验和提交） */
const isSubmitting = ref(false)

/** Alert 弹窗状态 */
const alertVisible = ref(false)
const alertTitle = ref('')
const alertContent = ref('')
const alertConfirmText = ref('确定')
const alertCancelText = ref('取消')
const alertShowCancel = ref(true)
let alertResolve: ((value: boolean) => void) | null = null

/** 表情符号正则 */
const emojiReg =
  /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi

/**
 * 公司名称校验规则
 */
const companyRules = [{ required: true, message: '请输入客户编码/公司简称' }]

/**
 * 姓名校验规则
 */
const userNameRules = [
  { required: true, message: '请输入您的姓名' },
  {
    validator: (_rule: any, value: string) => {
      if (!value) return Promise.resolve()

      const reg =
        /[()（）\-－*,，.~。？?=+！`·:：;；"“\"'''、/@#￥%……&*——+!@#$%^&*()_{}《》\\|【】\[\]<>!@#$%^&*_\u0020\u3000]/g

      if (
        emojiReg.test(value) ||
        /[0-9]/g.test(value) ||
        (/[\u4e00-\u9fa5]/g.test(value) && /[0-9A-Za-z]/g.test(value)) ||
        (!/[\u4e00-\u9fa5]/g.test(value) && /^(?:\W{3,}|[\u{2250}-\u{27BF}]+)$/u.test(value)) ||
        (!/[\u4e00-\u9fa5]/g.test(value) && !/[A-Za-z]/g.test(value) && reg.test(value))
      ) {
        return Promise.reject(new Error('姓名为"中文"或"英文"或"中/英文+符号"'))
      }

      return Promise.resolve()
    },
    trigger: 'blur',
  },
]

/**
 * 申请原因校验规则
 */
const reasonRules = [{ required: true, message: '请输入申请原因' }]

/**
 * 清除字段错误
 */
const clearFieldError = (fieldName: keyof typeof errors) => {
  errors[fieldName] = ''
}

/**
 * 公司名称失焦处理
 */
const handleCompanyBlur = async () => {
  try {
    await formRef.value?.validate('company')
    if (formData.company) {
      await checkCustomerAndCompany(formData.company)
    }
  } catch (e) {
    console.warn('公司名称校验失败:', e)
  }
}

/**
 * 姓名失焦处理
 */
const handleUserNameBlur = async () => {
  try {
    await formRef.value?.validate('userName')
  } catch (e) {
    console.warn('姓名校验失败:', e)
  }
}

/**
 * 申请原因失焦处理
 */
const handleReasonBlur = async () => {
  try {
    await formRef.value?.validate('reason')
  } catch (e) {
    console.warn('申请原因校验失败:', e)
  }
}

/**
 * 拨打电话
 */
const handleCallPhone = () => {
  clk_customer_code_password_button('95324')
  plateform.makePhoneCall({ phoneNumber: '95324' })
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  clk_customer_code_password_button('提交')

  let isValid = false
  await formRef.value?.reset()
  formRef.value?.validate().then(async ({ valid, errors }) => {
    if (valid) {
      // 校验通过后提交表单
      isSubmitting.value = true
      await checkCustomerAndCompany(formData.company, true)
    } else {
      console.warn('error:', errors)
    }
  })
  // try {
  //   const result = await formRef.value?.validate()
  //   isValid = result?.valid !== false
  // } catch (error) {
  //   console.warn('表单校验失败:', error)
  //   isValid = false
  // }

  // if (!isValid) return

  // isSubmitting.value = true
  // await checkCustomerAndCompany(formData.company, true)
}

/**
 * 校验客户编码或公司名称
 *
 * @param customer - 客户编码或公司简称
 * @param isSubmit - 是否是提交操作触发
 * @param safeVerifyId - 安全验证ID
 */
const checkCustomerAndCompany = async (customer: string, isSubmit = false, safeVerifyId = '') => {
  if (!customer) return

  try {
    const params: any = { customer }
    if (safeVerifyId) {
      params.safeVerifyId = safeVerifyId
    }

    const res = await applyBindCustomerParamCheck(params)
    console.log(res, '返回提交信息', isSubmitting.value)
    if (res.code === 264587) {
      isSubmitting.value = isSubmit
      captchaRef.value?.showCaptcha(
        {
          ruleId: res.data.ruleId,
          strategyCode: res.data.strategyCode,
          phone: userInfo.phone,
        },
        { type: res.data.type, unToken: true },
      )
      return
    }
    if (isSubmit) {
      await onApplyBind(false)
      isSubmitting.value = false
    }

    errors.company = ''
  } catch (error: any) {
    errors.company = error.message || '校验失败'
    if (isSubmit) {
      isSubmitting.value = false
    }
  }
}

/**
 * 申请绑定客户编码
 *
 * @param cancelOtherApplyFlag - 是否取消其他流程中的申请
 */
const onApplyBind = async (cancelOtherApplyFlag: boolean) => {
  try {
    loading.value = true

    const { data } = await applyBindCustomer({
      customerName: formData.company,
      applyReason: formData.reason,
      userName: formData.userName,
      cancelOtherApplyFlag,
      operatorSource: props.source,
    })
    console.log(data, '返回提交信息')

    if (data?.appliedFlag) {
      const appliedInfo = data?.appliedInfoList?.[0] || {}
      const tip = data?.appliedInfoList?.length > 1 ? '等公司' : ''
      const content = `您已申请绑定${appliedInfo?.customerShortName}(${appliedInfo?.customerCode})${tip}，继续提交将取消申请。`

      const shouldContinue = await showAlert({
        title: '温馨提示',
        content,
        confirmText: '继续',
        cancelText: '取消',
        showCancel: true,
      })

      if (shouldContinue) {
        await onApplyBind(true)
      }
    } else {
      Taro.redirectTo({
        url: `/modules/user/pages/customer-code/password-result/index?title=${params.title}&applyStatus=${data?.existedApplyFlag ? 1 : 0}&customerCode=${data?.customerCode}&phone=${userInfo.phone}`,
      })
    }
  } catch (error: any) {
    showToast({ title: error.message || '申请失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

/**
 * 显示确认弹窗（返回 Promise）
 */
const showAlert = (options: {
  title?: string
  content: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}): Promise<boolean> => {
  return new Promise((resolve) => {
    alertTitle.value = options.title || ''
    alertContent.value = options.content
    alertConfirmText.value = options.confirmText || '确定'
    alertCancelText.value = options.cancelText || '取消'
    alertShowCancel.value = options.showCancel !== false
    alertVisible.value = true
    alertResolve = resolve
  })
}

/**
 * Alert 确认回调
 */
const handleAlertConfirm = () => {
  alertVisible.value = false
  if (alertResolve) {
    alertResolve(true)
    alertResolve = null
  }
}

/**
 * Alert 取消回调
 */
const handleAlertCancel = () => {
  alertVisible.value = false
  if (alertResolve) {
    alertResolve(false)
    alertResolve = null
  }
}

/**
 * Alert 关闭回调
 */
const handleAlertClose = () => {
  alertVisible.value = false
  if (alertResolve) {
    alertResolve(false)
    alertResolve = null
  }
}

/**
 * 图形验证码成功回调
 */
const getCode = async (code: any) => {
  if (!code) return
  checkCustomerAndCompany(formData.company, isSubmitting.value, code)
}

/**
 * 页面初始化
 */
onMounted(() => {
  console.log(params, 'params')

  if (params.customerCode) {
    formData.company = params.customerCode
  }

  if (params.source) {
    props.source = params.source
  }

  // 页面曝光埋点
  exp_customer_code_password_page()
})

defineExpose({
  validate: () => formRef.value?.validate(),
  reset: () => {
    formData.company = ''
    formData.userName = ''
    formData.reason = ''
    formRef.value?.reset()
  },
})
</script>
