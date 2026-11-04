<template>
  <el-form
    class="forget-password-form-container"
    :model="formData"
    :rules="rules"
    label-position="top"
    ref="forgetPasswordFormRef"
  >
    <k-form-item label="客户编码/公司简称" prop="customerName" :class="{ 'is-focus': focus.customerName }">
      <k-input
        type="text"
        clearable
        v-model="formData.customerName"
        placeholder="请填写客户编码或公司简称"
        :maxlength="20"
        @input="onInput('customerName')"
        @focus="focus.customerName = true"
        @blur="focus.customerName = false"
      ></k-input>
    </k-form-item>
    <k-form-item label="姓名" prop="userName" :class="{ 'is-focus': focus.userName }">
      <k-input
        v-model="formData.userName"
        clearable
        placeholder="请填写您的姓名"
        :maxlength="20"
        @input="onInput('userName')"
        @focus="focus.userName = true"
        @blur="focus.userName = false"
      />
    </k-form-item>
    <k-form-item label="申请原因" prop="applyReason" :class="{ 'is-focus': focus.applyReason }">
      <k-input
        v-model="formData.applyReason"
        placeholder="请填写申请原因"
        clearable
        :maxlength="20"
        @focus="focus.applyReason = true"
        @blur="focus.applyReason = false"
      />
    </k-form-item>
  </el-form>
</template>

<script setup lang="ts">
/**
 * 忘记密码表单(TS 版)
 * 来源: customer-code/components/forget-password-form.vue
 *  - @vue/composition-api -> vue script setup
 *  - element-ui Message -> element-plus ElMessage
 *  - @utils/regular -> 本目录 utils/regular
 *  - @/components/ky-verify-code -> 本目录 utils/verify-code(局部化)
 *  - UserService.applyBindCustomerParamCheck -> 本目录 api.ts
 */
import { reactive, ref, toRefs, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { applyBindCustomerParamCheck } from '../api'
import { emoji, chineseOnly } from '../utils/regular'
import { showVerifyCodeDialog } from '../utils/verify-code'
import { VerifyDialogType, ErrorResultCode } from '../consts'
import { KFormItem, KInput } from '@netc-design-pc/ui'

defineOptions({ name: 'forget-password-form' })

const emit = defineEmits(['update:disabled'])

const forgetPasswordFormRef = ref()
const state = reactive({
  formData: {
    customerName: '',
    userName: '',
    applyReason: '',
  },
  // 需求：客户编码校验增加风控弹窗，需要验证用户是否通过风控验证
  isPassRisk: true,
  focus: { customerName: false, userName: false, applyReason: false },
})

// 模板绑定所需的顶层引用
const { formData, focus } = toRefs(state)

type FormField = 'customerName' | 'userName' | 'applyReason'

const onInput = (key: FormField) => {
  state.formData[key] = state.formData[key].replace(/\s+/g, '').replace(emoji, '')
}

const checkCustomerAndCompany = async (params: Record<string, any>) => {
  return await applyBindCustomerParamCheck(params)
}

type Validator = (rule: unknown, value: string, callback: (error?: Error) => void) => void

// 校验器需同步返回 void, 异步风控校验放在内部 async 函数中
const validateCustomer: Validator = (_rule, value, callback) => {
  doValidateCustomer(value, callback)
}

const doValidateCustomer = async (value: string, callback: (error?: Error) => void) => {
  if (!/\S/.test(value)) {
    return callback(new Error('客户编码/公司简称不能为空'))
  }
  const params: Record<string, any> = { customer: value }
  // 新请求层业务错误以 reject 抛出(hideErrMsg 仅关闭全局提示), 取响应体对齐老基座 res.code 判断
  let res: any
  try {
    res = await checkCustomerAndCompany(params)
  } catch (error) {
    res = error
  }
  // 风险控制处理
  if (res.code === ErrorResultCode.VERIFY_CODE) {
    // 风控校验错误码，1-图形验证码，2-已锁定不需要弹窗图形验证，4-滑块
    if (res.data?.type === VerifyDialogType.HAS_LOCKED) {
      state.isPassRisk = false
      ElMessage({ message: res.msg, type: 'info' })
      return callback()
    }
    const verifyResult = await showVerifyCodeDialog(
      {
        ruleId: res.data?.ruleId,
        strategyCode: res.data?.strategyCode,
      },
      { type: res.data?.type }
    )
    if (verifyResult && (verifyResult as any)?.safeVerifyId) {
      params.safeVerifyId = (verifyResult as any)?.safeVerifyId
      // 二次校验仍可能失败(编码仍有问题): 成功/失败统一交给末尾 callback(对齐老基座, 不能在此抛出导致校验挂起)
      try {
        res = await checkCustomerAndCompany(params)
      } catch (error) {
        res = error
      }
      state.isPassRisk = true
    } else {
      state.isPassRisk = false
      return callback()
    }
  }

  if (res.code !== 0 && res.msg) {
    return callback(new Error(res.msg))
  }
  callback()
}

const validateName: Validator = (_rule, value, callback) => {
  if (!/\S/.test(value)) {
    return callback(new Error('姓名不能为空'))
  }
  const reg =
    /[()（）\-－*,，.~。？?=+！`·:：;；"“”'‘’、/@#￥%……&*——+!@#$%^&*()_{}《》\\|【】[\]<>!@#$%^&*_\u0020\u3000]/g
  if (
    emoji.test(value) ||
    /[0-9]/g.test(value) ||
    (/[\u4e00-\u9fa5]/g.test(value) && /[0-9A-Za-z]/g.test(value)) ||
    (!/[\u4e00-\u9fa5]/g.test(value) && !/[A-Za-z]/g.test(value) && reg.test(value))
  ) {
    return callback(new Error('姓名为“中文”或“英文”或“中/英文+符号”'))
  }
  callback()
}

const validateReason: Validator = (_rule, value, callback) => {
  if (!/\S/.test(value)) {
    return callback(new Error('申请原因不能为空'))
  }
  callback()
}

const rules = {
  customerName: [
    { required: true, message: '请填写客户编码或公司简称' },
    { validator: validateCustomer, trigger: 'blur' },
  ],
  userName: [
    { required: true, message: '请填写您的姓名' },
    { validator: validateName, trigger: 'blur' },
  ],
  applyReason: [
    { required: true, message: '请填写申请原因' },
    { validator: validateReason, trigger: 'blur' },
    { pattern: chineseOnly, message: '请输入中文汉字', trigger: 'blur' },
    { max: 20, message: '至多允许输入20个汉字', trigger: 'blur' },
  ],
}

const validateForm = async (toast = false) => {
  const isValid = await new Promise<boolean>((resolve) => {
    forgetPasswordFormRef.value.validate((validate: boolean, errors: Record<string, any>) => {
      const keys: FormField[] = ['customerName', 'userName', 'applyReason']
      if (!validate) {
        if (toast) {
          const errorKey = keys.find((k) => errors[k])
          if (errorKey) {
            ElMessage.error(errors[errorKey]?.[0]?.message)
          }
        }
        return resolve(false)
      }
      return resolve(true)
    })
  })
  return isValid && state.isPassRisk
}

const handleResetFields = () => {
  forgetPasswordFormRef.value.resetFields()
}

watch(
  () => state.formData,
  () => {
    if (state.formData.customerName && state.formData.userName && state.formData.applyReason) {
      emit('update:disabled', false)
    } else {
      emit('update:disabled', true)
    }
  },
  { deep: true }
)

defineExpose({
  formData: state.formData,
  validateForm,
  handleResetFields,
})
</script>

<style lang="scss" scoped>
.forget-password-form-container {
  padding-top: 16px;
}
</style>
