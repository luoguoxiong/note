<template>
  <view :class="['bind-form', isPopup && 'is-popup']">
    <!-- 内容卡片（圆角背景） -->
    <view class="content-card">
      <!-- 申请商务区域 -->
      <ApplySection
        :isPopup="isPopup"
        :has-business="props.hasBusiness"
        :has-market-activity="props.hasMarketActivity"
        :is-success-tip="isSuccessTip"
        :apply-button-text="props.applyButtonText"
        :subtitle="props.subtitle"
        @apply="handleApply"
        @learnMore="handleLearnMore"
        @contactBusiness="handleContactBusiness"
      />

      <!-- 表单区域 -->
      <ky-form ref="formRef" :model-value="form">
        <view class="form-section">
          <!-- 客户编码 -->
          <ky-field
            v-model="form.customerCode"
            prop="customerCode"
            type="number"
            :rules="customerCodeRules"
            label="客户编码"
            placeholder="请输入客户编码"
            placeholder-style="z-index: 0;"
            :required="true"
            :maxlength="20"
            :inputDebounce="300"
            :cursorSpacing="46"
            :adjustPosition="!isPopup || needAdjustPosition"
            clearable
            @focus="handleFocus('customerCode')"
            @blur="handleBlur('customerCode')"
          />
          <!-- :formatter="formatter" -->

          <!-- 密码 -->
          <view class="password-content">
            <view class="forget" @tap="handleForgetPassword">
              <image
                class="forget-icon"
                src="https://ic-img.ky-express.com/netc/20260115_83756_!!1768478551438_48_48.png"
              ></image>
              忘记密码
            </view>
            <ky-field
              v-model="form.customerPassword"
              prop="customerPassword"
              label="客户编码密码"
              required
              :rules="passwordRules"
              placeholder="请输入客户编码密码"
              placeholder-style="z-index: 0;"
              :key="showPassword ? 'text' : 'password'"
              :type="showPassword ? 'text' : 'password'"
              :password="!showPassword"
              :maxlength="50"
              :enableNative="false"
              :inputDebounce="300"
              :cursorSpacing="26"
              clearable
              @focus="handleFocus('customerPassword')"
              @blur="handleBlur('customerPassword')"
            >
              <template #right>
                <image
                  @tap.stop="showPassword = !showPassword"
                  :src="
                    showPassword
                      ? 'https://ic-img.ky-express.com/netc/20250610_5177039510_!!1749556065567_96_96.png'
                      : 'https://ic-img.ky-express.com/netc/20250610_76270395192_!!1749556068955_96_96.png'
                  "
                  class="eye"
                  mode="aspectFit"
                >
                </image>
              </template>
            </ky-field>
          </view>

          <!-- 姓名（选填） -->
          <ky-field
            v-model="form.memberName"
            prop="memberName"
            :rules="nameRules"
            label="姓名"
            placeholder="请输入真实姓名以便公司核实管理（选填）"
            :maxlength="20"
            clearable
            @blur="handleBlur('memberName')"
          />
        </view>
      </ky-form>
    </view>

    <!-- 确认按钮 -->
    <view :class="['customer-page-footer', isFixed && 'fixed', isSafeArea && 'safe-area']">
      <ky-button class="submit-btn" type="primary" size="large" :loading="loading" @click="handleSubmit">
        确认
      </ky-button>
    </view>

    <!-- 图形验证码弹窗 -->
    <Captcha ref="captchaRef" @getCode="getCode" />

    <!-- 确认弹窗（重复绑定等场景） -->
    <Alert
      :visible="alertVisible"
      :title="alertTitle"
      :content="alertContent"
      :confirm-text="alertConfirmText"
      :cancel-text="alertCancelText"
      :show-cancel="alertShowCancel"
      :confirm-loading="alertConfirmLoading"
      @confirm="handleAlertConfirm"
      @cancel="handleAlertCancel"
      @close="handleAlertClose"
    />
  </view>
</template>

<script setup lang="ts">
/**
 * 客户编码绑定表单 - 核心组件
 *
 * 无UI模式感知的纯逻辑组件，供页面和弹窗容器复用
 * 包含：表单填写、校验、提交、图形验证码、异常处理
 *
 * 使用 miniUI 组件库 (kye-netc/kye-miniui)
 * 采用 ky-form + ky-field 实现表单验证（参考实名认证 personal-form.vue）
 *
 * 参考 H5: src/components/kye-customer-code/components/bindCode/index.jsx
 */
import { ref, computed, onMounted } from 'vue'
import { showToast } from '@tarojs/taro'
import ApplySection from '../shared/ApplySection.vue'
import Alert from '../shared/Alert.vue'
import Captcha from '@/public/components/base/captcha/index.vue'
import { useBindForm } from '../../hooks/useBindForm'
import { useCustomerCodeStore } from '../../store/customerCode'
import {
  exp_customer_code_bind_page,
  clk_customer_code_button,
  other_customer_code_bind_sub,
  clk_customer_code_bind_old_norec_popup_end_button,
} from '../../report/index'
import { getBlackUserContactRole } from '@modules/user/apis/customerCode'
import { filterEmojis, filterAllSpace } from '../../../../utils/index'
import './index.scss'
import { useUserGlobalStore } from '@/store/user'
import { UserBindCustomerCodeResponse } from '@/modules/user/apis/customerCode/types'
import { userBindIsWebHide } from '@/modules/user/apis/customerCode'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import { useApplication } from '@/public/utils/application/useApplication'
import { useRoleFlags } from '@/layout/pages/home/hooks/use-role-flags'
import Taro from '@tarojs/taro'

interface Props {
  /** 是否有匹配商务（true=联系商务，false=申请专属商务 */
  /** H5 来源: getAppUserRelationAuth() 返回的 res.hasBusiness 字段 */
  hasBusiness?: boolean | null
  /** 是否有匹配有营销活动（true=有营销活动，false=没有营销活动 */
  hasMarketActivity?: boolean | null
  /** 申请按钮自定义文案（从 configData.btnLists 获取） */
  /** H5 来源: configData.btnLists.find(e => e.scene == 'applyCustomerCode').buttonname */
  applyButtonText?: string
  /** 副标题/场景提示文案（如"添加客户编码成功后，将自动切换为当前绑定"） */
  subtitle?: string
  isPopup?: boolean
  isFixed?: boolean
  isSafeArea?: boolean
  subType?: string
  /** 弹窗形态下首个输入框是否使用系统键盘避让（推页面）。默认 false 防止 iOS 26 APP 容器 focus 振荡；无底部 tabbar 的场景弹窗较矮，键盘会盖住首输入框，需传 true */
  needAdjustPosition?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasBusiness: null,
  hasMarketActivity: null,
  applyButtonText: '',
  isPopup: false,
  isFixed: true,
  isSafeArea: true,
  needAdjustPosition: false,
})

const emit = defineEmits<{
  (e: 'confirm', data?: any): void
  (e: 'cancel'): void
  (e: 'apply', url?: string): void
  (e: 'contactBusiness'): void
  (e: 'learnMore'): void
  (e: 'forget', customerCode: string): void
}>()

const store = useCustomerCodeStore()
const userStore = useUserGlobalStore()
const userInfo = userStore.userInfo
const {
  form,
  captchaRef,
  captchaCode,
  captchaInfoCache,
  submit,
  resetForm,
  getRules,
  skipCustomerCodeCaptcha,
  customerCodeCaptchaTriggered,
  hasSafeVerifyId,
} = useBindForm()
const { navigateApplicationWithCode } = useApplication()
const { activityParams } = useRoleFlags()

/** 表单引用 */
const formRef = ref<any>(null)

/** 是否显示密码 */
const showPassword = ref(false)

/** 是否点击跳转申请专属商务 */
const isSuccessTip = ref(false)

/** 验证码信息缓存（用于重新提交） */
// const captchaInfoCache = ref<any>(null)

const isHandBlur = ref(false)

/** Alert 弹窗状态 */
const alertVisible = ref(false)
const alertTitle = ref('')
const alertContent = ref('')
const alertConfirmText = ref('确定')
const alertCancelText = ref('取消')
const alertShowCancel = ref(true)
const alertConfirmLoading = ref(false)

/** 加载状态 */
const loading = computed(() => store.uiState.loading)

/** 根据subType映射埋点page_type（对齐H5 pageStatusMap） */
const pageTypeMap = {
  bind: '绑定客户编码',
  add: '添加客户编码',
  change: '更换客户编码',
}

/** 根据subType映射 current_path */
const currentPathMap = {
  bind: '绑定客户编码页',
  add: '绑定客户编码页',
  change: '更换客户编码页',
}
const reportPageType = computed(() => pageTypeMap[props.subType] || '绑定客户编码')
const reportCurrentPath = computed(() => currentPathMap[props.subType] || '绑定客户编码页')

/** 客户编码校验规则 */
const customerCodeRules = computed(() => getRules('customerCode', () => blurActiveField()))

/** 密码校验规则 */
const passwordRules = computed(() => getRules('customerPassword'))

/** 姓名校验规则 */
const nameRules = computed(() => getRules('memberName'))

/**
 * 页面曝光时触发埋点
 */
onMounted(() => {
  exp_customer_code_bind_page()
  isSuccessTip.value = false
})

const formatter = (value: string): string =>
  filterAllSpace(value.replace(filterEmojis, '').replace(/[\u4e00-\u9fa5]/g, ''))

const handleBlur = async (field: string) => {
  if (isHandBlur.value) {
    isHandBlur.value = false
    return
  }
  formRef.value?.validate(field).then(({ valid, errors }: { valid: boolean; errors: any[] }) => {
    if (valid) {
      console.log('success:', valid)
    } else {
      console.warn('error:', errors)
    }
  })
}

/** 聚焦时清除当前字段的校验气泡 */
const handleFocus = (field: string) => {
  formRef.value?.reset(field)
}
/**
 * 处理提交按钮点击
 */
const handleSubmit = async () => {
  // 埋点：确认按钮点击
  clk_customer_code_button('确认', { page_type: reportPageType.value })

  // 设置跳过客户编码字段的接口校验（提交时屏蔽单个接口校验）
  skipCustomerCodeCaptcha.value = true

  // 使用 ky-form 的 validate 方法进行校验
  try {
    formRef.value?.validate().then(async ({ valid, errors }) => {
      if (valid) {
        // 如果打开过图形验证码但未操作成功/直接叉掉（没有安全id），则先手动触发图形验证码
        if (customerCodeCaptchaTriggered.value && !hasSafeVerifyId.value) {
          hasSafeVerifyId.value = false
          captchaRef.value?.showCaptcha({
            ruleId: 36,
            strategyCode: 'checkCustomerCode',
            phone: userInfo.phone,
          })
          captchaInfoCache.value = { type: 'submit' }
          skipCustomerCodeCaptcha.value = false
          return
        }
        // 校验通过后提交表单
        const res = (await submit(props.subType === 'change' ? { type: 3 } : undefined)) as UserBindCustomerCodeResponse
        if (res?.data?.status === 1) {
          // 埋点：绑定成功结果上报
          other_customer_code_bind_sub({
            request_result: '成功',
            customer_no: form.customerCode,
            page_type: reportPageType.value,
          })
          showToast({
            title: '绑码成功',
            icon: 'none',
          })
          emit('confirm', res?.data?.currentBind)
        } else {
          // 埋点：绑定失败结果上报
          other_customer_code_bind_sub({
            request_result: '失败',
            customer_no: form.customerCode,
            page_type: reportPageType.value,
            failure_reason: res?.msg || res?.message || '服务错误',
          })
          // 错误码分支处理（与H5保持一致）
          // err.code === 264587 && err.data.type == 4 → 腾讯验证码 showVerifyCodeDialog
          // err.code === 34000 → 黑名单限制绑码 → getBlackUserContactRole 弹窗
          // res.status !== 1 → 重复绑定确认Alert（含公司列表 errCompanyList）
          if (res.code === 34000) {
            getBlackUserContactRoleApi(
              form.customerCode,
              res.msg || '您已被该公司限制绑码，如需绑码请联系公司管理员，在【账号权限管理】中解除限制',
            )
          } else if (res.code === 264587 && res.data?.type === 4) {
            captchaRef.value?.showCaptcha(
              {
                ruleId: res.data.ruleId,
                strategyCode: res.data.strategyCode,
                phone: userInfo.phone,
              },
              { type: res.data.type, unToken: true },
            )
            captchaInfoCache.value = { type: 'submit' }
          } else if (!res?.code && res?.data?.status !== 1) {
            captchaInfoCache.value = { type: 'submit' }
            const companyList = res?.data?.errCompanyList || []
            console.log('companyList:', res)
            const msg = `
              您已申请绑定<span style="color: #24262b;font-weight: 600;">${companyList[0].customerShortName}(${companyList[0].customerCode})</span>${companyList.length > 1 ? '等公司' : ''}，继续提交将取消申请。
            `
            showAlert({
              title: '温馨提示',
              content: msg,
              confirmText: '继续',
              cancelText: '取消',
              showCancel: true,
            })
          } else {
            showToast({ title: res.msg || '服务错误', icon: 'none' })
          }
        }
      } else {
        console.warn('error:', errors)
      }
      skipCustomerCodeCaptcha.value = false
    })
  } catch (error) {
    skipCustomerCodeCaptcha.value = false
    console.error('表单校验失败:', error)
  }
}

// 获取黑名单用户的角色，根据角色弹出提示框
const getBlackUserContactRoleApi = async (customerCode, errMsg) => {
  const roleEnum = {
    0: '商务',
    10: '主授权号',
    20: '管理员',
  }
  try {
    const res = await getBlackUserContactRole({ customerCode })
    if (res && res.data) {
      captchaInfoCache.value = { type: 'manager' }
      console.log('res:', res, captchaInfoCache.value)
      showAlert({
        title: '温馨提示',
        content: errMsg || '您已被该公司限制绑码，如需绑码请联系公司管理员，在【账号权限管理】中解除限制',
        confirmText: '联系' + (roleEnum[res.data.role] || '商务'),
        cancelText: '我知道了',
        showCancel: true,
      })
    }
  } catch (error) {}
}

// 处理提交报错error
const dealErrorInfo = (res) => {
  if (res.code === 34000) {
    getBlackUserContactRoleApi(
      form.customerCode,
      res.msg || '您已被该公司限制绑码，如需绑码请联系公司管理员，在【账号权限管理】中解除限制',
    )
  } else if (res.code === 264587 && res.data?.type === 4) {
    hasSafeVerifyId.value = false
    captchaRef.value?.showCaptcha(
      {
        ruleId: res.data.ruleId,
        strategyCode: res.data.strategyCode,
        phone: userInfo.phone,
      },
      { type: res.data.type, unToken: true },
    )
    captchaInfoCache.value = { type: 'submit' }
  } else if (!res?.code && res?.status !== 1) {
    captchaInfoCache.value = { type: 'submit' }
    const companyList = res?.errCompanyList || []
    console.log('companyList:', res)
    const msg = `
      您已申请绑定<span style="color: #24262b;font-weight: 600;">${companyList[0].customerShortName}(${companyList[0].customerCode})</span>${companyList.length > 1 ? '等公司' : ''}，继续提交将取消申请。
    `
    showAlert({
      title: '温馨提示',
      content: msg,
      confirmText: '继续',
      cancelText: '取消',
      showCancel: true,
    })
  } else {
    showToast({ title: res.msg || '服务错误', icon: 'none' })
  }
}

/**
 * 处理申请商务点击
 *
 * H5 原始逻辑 (handleApply):
 * 1. 触发埋点上报
 * 2. 调用 onApply(bindCodeChangeCompany.url) 通知父组件跳转申请页
 * 3. 设置 setIsSuccessTip(true) 切换UI状态为"您已成功申请专属商务"
 */
const handleApply = () => {
  clk_customer_code_button('申请专属商务', { page_type: '绑定客户编码' })
  // 设置成功提示状态
  isSuccessTip.value = true

  navigateApplicationWithCode({
    ...ApplicationCodeMap['首页-申请专属商务'],
    queryParams: {
      express_type: '绑码组件',
      ...activityParams.value,
    },
  })
}

/**
 * 处理联系商务点击
 */
const handleContactBusiness = () => {
  clk_customer_code_button('联系商务', { page_type: '绑定客户编码' })
  emit('contactBusiness')
}

/**
 * 处理联系管理员点击
 */
const handleContactManager = () => {
  // clk_customer_code_button('管理员', { page_type: '绑定客户编码' })
  emit('contactManager', form.customerCode)
}

/**
 * 处理了解更多点击
 */
const handleLearnMore = () => {
  clk_customer_code_button('了解更多', { page_type: '绑定客户编码' })
  emit('learnMore')
}

/**
 * 处理忘记密码
 *
 * H5 原始逻辑 (handleForget):
 * 1. 调用 userBindIsWebHide() 检查权限
 * 2. isWebHide=1 → 拦截提示"手机号已设置外部隐藏，禁止使用该功能"
 * 3. 否则 → 调用 onForget(customerCode, passBindCodeChangeCompany.url) 通知父组件跳转忘记密码页
 */
const handleForgetPassword = async () => {
  clk_customer_code_button('忘记密码', { page_type: '绑定客户编码' })
  // 步骤1: 调用 userBindIsWebHide() API 检查是否外部隐藏用户
  const { data } = await userBindIsWebHide()
  if (data.isWebHide === 1) {
    showToast({ title: '手机号已设置外部隐藏，禁止使用该功能', icon: 'none' })
    return
  }

  const titleMap = {
    bind: '1',
    add: '2',
    change: '3',
    switch: '4',
  }
  console.log(props.subType, 'kkk')
  // 跳转忘记密码页（携带客户编码）
  Taro.navigateTo({
    url: `/modules/user/pages/customer-code/password-apply/index?title=${titleMap[props.subType] || '1'}&customerCode=${form.customerCode}`,
  })
}

/**
 * 图形验证码成功回调
 *
 * @param code - 验证码结果（包含 safeVerifyId 等）
 */
const getCode = async (code: any) => {
  console.log('result:', code)
  if (!code) return
  captchaCode.value = code
  hasSafeVerifyId.value = true
  if (captchaInfoCache.value?.type === 'customerCode') {
    formRef.value?.validate('customerCode')
  }
  if (captchaInfoCache.value?.type === 'submit') {
    const res = await submit({ safeVerifyId: code, ...(props.subType === 'change' ? { type: 3 } : {}) })
    if (res?.data?.status === 1) {
      showToast({
        title: '绑码成功',
        icon: 'none',
      })
      emit('confirm', res?.data?.currentBind)
    } else {
      dealErrorInfo(res)
    }
    // 触发提交风控，则清空风控参数
    captchaInfoCache.value = null
    captchaCode.value = ''
  }
}

/**
 * 显示确认弹窗
 *
 * @param options - 弹窗配置
 */
const showAlert = (options: {
  title?: string
  content: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}): void => {
  alertTitle.value = options.title || ''
  alertContent.value = options.content
  alertConfirmText.value = options.confirmText || '确定'
  alertCancelText.value = options.cancelText || '取消'
  alertShowCancel.value = options.showCancel !== false
  alertVisible.value = true
}

/**
 * Alert 确认回调（继续提交 - 取消之前的申请）
 *
 * H5 原始逻辑 (handleAlertConfirm):
 * 1. 埋点上报 button_name="继续"
 * 2. 重新调用 userBindCustomerCode API，cancelApplyFlag 强制为 true
 * 3. 成功 → 关弹窗 + onConfirm 回调
 * 4. 失败 → toast 提示 "绑码异常"
 */
const handleAlertConfirm = async () => {
  // 埋点：继续按钮点击
  clk_customer_code_button('继续', { page_type: '绑定客户编码' })
  clk_customer_code_bind_old_norec_popup_end_button('继续', reportCurrentPath.value)
  alertConfirmLoading.value = true
  try {
    if (captchaInfoCache.value?.type === 'submit') {
      const res = (await submit({
        cancelApplyFlag: true,
        ...(props.subType === 'change' ? { type: 3 } : {}),
      })) as UserBindCustomerCodeResponse
      if (res?.data?.status === 1) {
        showToast({
          title: '绑码成功',
          icon: 'none',
        })
      } else {
        showToast({
          title: '绑码异常',
          icon: 'none',
        })
      }
      alertVisible.value = false
      emit('confirm', res?.data?.currentBind)
    }
    if (captchaInfoCache.value?.type === 'manager') {
      alertVisible.value = false
      handleContactManager()
    }
  } catch (error) {
    console.error('重复绑定确认失败:', error)
    if (captchaInfoCache.value?.type === 'submit') {
      showToast({
        title: '绑码异常',
        icon: 'none',
      })
    }
  } finally {
    alertConfirmLoading.value = false
  }
}

/**
 * Alert 取消回调
 */
const handleAlertCancel = () => {
  clk_customer_code_bind_old_norec_popup_end_button('取消', reportCurrentPath.value)
  alertVisible.value = false
}

/**
 * Alert 关闭回调
 */
const handleAlertClose = () => {
  alertVisible.value = false
}

/**
 * 让当前聚焦的表单失焦
 */
const blurActiveField = () => {
  console.log('youmeiyouchufa')
  // 方式1: 直接收起键盘
  Taro.hideKeyboard()
  isHandBlur.value = true

  // 方式2: 通过选择器获取当前聚焦的 input 并失焦（兼容性更好）
  setTimeout(() => {
    const query = Taro.createSelectorQuery()
    query
      .select('input:focus')
      .boundingClientRect((rect) => {
        if (rect) {
          query
            .select('input:focus')
            .node()
            .then((res: any) => {
              if (res?.[0]) {
                res[0].blur()
              }
            })
        }
      })
      .exec()
  }, 50)
}

defineExpose({
  validate: () => formRef.value?.validate(),
  reset: () => {
    resetForm()
    formRef.value?.reset()
  },
  clearValidate: (props?: string | string[]) => {
    formRef.value?.reset(props)
  },
})
</script>
