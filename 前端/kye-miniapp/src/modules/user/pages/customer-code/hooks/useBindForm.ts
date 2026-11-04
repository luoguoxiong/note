/**
 * 绑定表单管理 Hook
 *
 * 封装绑定客户编码的表单状态、校验规则、提交逻辑
 * 与 Store 解耦，供 BindCodeForm 组件使用
 *
 * 采用 ky-form + ky-field 的验证体系：
 * - 校验规则通过 rules 属性配置
 * - 表单验证由 ky-form 统一管理
 * - 本 Hook 提供业务逻辑和 API 调用
 *
 * 参考 H5: src/components/kye-customer-code/components/bindCode/index.jsx
 */
import { reactive, ref } from 'vue'
import { useCustomerCodeStore } from '../store/customerCode'
import { useUserGlobalStore } from '@/store/user'
import { userBindCustomerCode, checkCustomerCode } from '@modules/user/apis/customerCode'
import type { FormItemRule } from '@kye-netc/kye-miniui/packages/__components/field/src/types'
import { useCustomerCodeMode } from './useCustomerCodeMode'

/** 中英文姓名正则（与 H5 保持一致） */
const NAME_REGEX = /[^\u4e00-\u9fa5a-zA-Z]/

const { mode } = useCustomerCodeMode()
const userStore = useUserGlobalStore()
const userInfo = userStore.userInfo

export const useBindForm = () => {
  const store = useCustomerCodeStore()

  /* 腾讯风控 */
  const captchaRef = ref<any>(null)
  const captchaInfoCache = ref<any>(null)
  const captchaCode = ref('')

  /** 是否跳过客户编码字段的风控（提交时使用） */
  const skipCustomerCodeCaptcha = ref(false)

  /** 客户编码校验是否触发过图形验证码（res.code/error.code === 264587） */
  const customerCodeCaptchaTriggered = ref(false)

  /** 是否有图形验证码返回的安全id（每次打开图形验证码时重置为 false，验证成功后置为 true） */
  const hasSafeVerifyId = ref(false)

  /** 表单数据 */
  const form = reactive({
    customerCode: '',
    customerPassword: '',
    memberName: '',
  })

  /** 客户编码异步校验错误信息 */
  const customerCodeErrorMsg = ref('')

  /**
   * 获取指定字段的校验规则
   *
   * H5 原始规则 (bindCode/index.jsx):
   * - customerCode: 必填 + 调用 checkCustomerCode API 异步校验
   * - customerPassword: 必填
   * - memberName: 正则校验只允许中英文 /[^\u4e00-\u9fa5a-zA-Z]/g
   */
  const getRules = (field: string, onFn?: () => void): FormItemRule[] => {
    switch (field) {
      case 'customerCode':
        return [
          { required: true, message: '请输入客户编码' },
          {
            validator: (value: string) => {
              return new Promise(async (resolve, reject) => {
                // 确定按钮不再触发单个接口校验
                if (!value || skipCustomerCodeCaptcha.value) {
                  resolve('')
                  return
                }
                try {
                  const params = { customerCode: form.customerCode, safeVerifyId: '' }
                  if (captchaInfoCache.value?.type === 'customerCode' && captchaCode.value) {
                    params.safeVerifyId = captchaCode.value
                    // 仅只用一次，清空
                    captchaCode.value = ''
                    captchaInfoCache.value = null
                  }
                  const res = await checkCustomerCode(params)
                  console.log(res, 'checkCustomerCode')
                  if (res.code === 0) {
                    customerCodeErrorMsg.value = ''
                    resolve('')
                  } else if (res.code === 264587) {
                    console.log('res.data', res.data)
                    onFn?.()
                    customerCodeCaptchaTriggered.value = true
                    hasSafeVerifyId.value = false
                    captchaRef.value?.showCaptcha(
                      {
                        ruleId: res.data.ruleId,
                        strategyCode: res.data.strategyCode,
                        phone: userInfo.phone,
                      },
                      { type: res.data.type, unToken: true },
                    )
                    captchaInfoCache.value = { type: 'customerCode', customerCode: value }
                  } else {
                    customerCodeErrorMsg.value = res?.msg || '客户编码校验失败'
                    reject(customerCodeErrorMsg.value)
                  }
                } catch (error: any) {
                  if (error.code === 264587) {
                    onFn?.()
                    console.log('error.data', error.data)
                    customerCodeCaptchaTriggered.value = true
                    hasSafeVerifyId.value = false
                    captchaRef.value?.showCaptcha(
                      {
                        ruleId: error.data.ruleId,
                        strategyCode: error.data.strategyCode,
                        phone: userInfo.phone,
                      },
                      { type: error.data.type, unToken: true },
                    )
                    captchaInfoCache.value = { type: 'customerCode', customerCode: value }
                  } else {
                    customerCodeErrorMsg.value = error?.msg
                    reject(customerCodeErrorMsg.value)
                  }
                }
              })
            },
          },
        ]
      case 'customerPassword':
        return [
          { required: true, message: '请输入客户编码密码' },
          {
            validator: (value: string) => {
              if (!value) return true
              if (/[\u4e00-\u9fa5]/.test(value)) return false
              return true
            },
            message: '请输入数字或字母',
          },
        ]
      case 'memberName':
        return [
          {
            validator: (value: string) => {
              // 空值不校验（由 required 规则处理）
              if (!form.memberName) return true

              // 包含非中英文字符则校验失败
              if (NAME_REGEX.test(value)) return false

              // 校验通过
              return true
            },
            message: '请输入中英文姓名',
          },
        ]
      default:
        return []
    }
  }

  /**
   * 处理字段失焦事件（可选的额外业务逻辑）
   */
  const handleFieldBlur = async (field: keyof typeof form) => {
    // ky-field 会根据 rules 自动进行基础校验
    // 此处可添加额外的业务逻辑（如异步校验、API 调用等）
  }

  /**
   * 手动校验表单（备用方案，通常使用 formRef.validate()）
   */
  const validate = async (): Promise<boolean> => {
    const requiredFields = ['customerCode', 'customerPassword'] as const

    for (const field of requiredFields) {
      if (!form[field] || !form[field].trim()) {
        const rule = getRules(field)[0]
        if (rule?.required) {
          console.warn(`${field} 校验失败: ${rule.message}`)
          return false
        }
      }
    }

    // memberName 格式校验
    if (form.memberName && NAME_REGEX.test(form.memberName)) {
      console.warn('memberName 校验失败: 请输入中英文姓名')
      return false
    }

    return true
  }

  /**
   * 提交表单（调用API绑定客户编码）
   *
   * H5 原始参数:
   * - customerCode: 客户编码
   * - customerPwd: 密码
   * - memberName: 姓名
   * - type: status === "3" ? 3 : 0  (3=更换, 0=绑定/添加)
   * - source: getProjectInfo().source || "" 注意：原生化不需要
   * - deviceCode: source (设备码) 注意：原生化不需要
   * - cancelApplyFlag: 取消申请标志
   * - safeVerifyId: 验证码ID(风控场景)
   */
  const submit = async (extraParams?: Record<string, any>) => {
    try {
      store.setLoading(true)
      const res = await userBindCustomerCode({
        customerCode: form.customerCode,
        customerPwd: form.customerPassword,
        memberName: form.memberName || '',
        type: extraParams?.type || mode.value === 'switch' ? 3 : 0,
        cancelApplyFlag: extraParams?.cancelApplyFlag ? true : undefined,
        safeVerifyId: extraParams?.safeVerifyId || undefined,
        ...extraParams,
      })
      console.log('绑定客户编码', res)
      return res || {}
    } catch (error: any) {
      console.error('绑定客户编码失败:', error)
      return error
    } finally {
      store.setLoading(false)
    }
  }

  /** 重置表单数据 */
  const resetForm = () => {
    form.customerCode = ''
    form.customerPassword = ''
    form.memberName = ''
    customerCodeCaptchaTriggered.value = false
    hasSafeVerifyId.value = false
  }

  return {
    form,
    captchaRef,
    captchaInfoCache,
    captchaCode,
    skipCustomerCodeCaptcha,
    customerCodeCaptchaTriggered,
    hasSafeVerifyId,
    getRules,
    handleFieldBlur,
    validate,
    submit,
    resetForm,
  }
}
