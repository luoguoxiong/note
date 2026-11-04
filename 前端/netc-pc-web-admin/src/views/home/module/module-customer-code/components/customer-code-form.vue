<template>
  <k-form
    class="customer-code-form__container"
    :model="formData"
    label-position="top"
    :rules="rules"
    ref="customerCodeFormRef"
  >
    <k-form-item label="客户编码" prop="customerCode">
      <KInput
        type="text"
        autocomplete="new-password"
        v-model="formData.customerCode"
        v-kye-restrict.positive
        v-parse-space="handleParseSpaceCallback"
        placeholder="请填写客户编码"
        :maxlength="20"
        @focus="focus.customerCode = true"
        @blur="focus.customerCode = false"
        clearable
      ></KInput>
    </k-form-item>
    <k-form-item class="customer-code-form__container--password" label="客户编码密码" prop="password">
      <template #label="{ label }">
        <span>{{ label }}</span>
        <k-button link class="customer-code-form__container--forget-btn" @click="handleForgetPassword">
          <template #icon>
            <k-icon><PasswordManage /></k-icon>
          </template>
          忘记密码
        </k-button>
      </template>
      <KInput
        v-model="formData.password"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="new-password"
        :placeholder="passwordPlaceHolder"
        :maxlength="15"
        @input="handleInput('password')"
        v-parse-space
        :clearable="false"
        @focus="focus.password = true"
        @blur="focus.password = false"
      >
        <template #suffix>
          <IconEye :showPassword="showPassword" @onClick="showPassword = !showPassword"></IconEye>
        </template>
      </KInput>
    </k-form-item>
    <k-form-item class="memberName" label="姓名" prop="memberName">
      <KInput
        v-model="formData.memberName"
        type="text"
        autocomplete="off"
        placeholder="请填写真实姓名以便公司核实管理（选填）"
        :maxlength="20"
        @input="handleInput('memberName')"
        v-parse-space
        clearable
        @focus="focus.memberName = true"
        @blur="focus.memberName = false"
      ></KInput>
    </k-form-item>
  </k-form>
</template>

<script setup lang="ts">
/**
 * 客户编码绑定表单(TS 版)
 * 来源: customer-code/components/customer-code-form.vue
 *  - @vue/composition-api -> vue script setup
 *  - element-ui Message -> element-plus ElMessage
 *  - @views/login/components/icon-eye -> 本目录 icon-eye.vue
 *  - v-kyerestrict / v-parseSpace 全局指令 -> 本目录 directives 局部指令
 *  - useCustomerCode/useCustomerCodeStore(setting/user) -> 本目录 hooks
 *  - size="medium" -> element-plus 默认尺寸
 */
import { reactive, ref, toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FormRules } from 'element-plus'
import useCustomerCode from '../hooks/useCustomerCode'
import useCustomerCodeStore from '../hooks/useCustomerCodeStore'
import IconEye from './icon-eyes.vue'
import { KMessage, KInput, KButton, KForm, KFormItem, KIcon, type KFormInstance } from '@netc-design-pc/ui'
import { PasswordManage } from '@netc-design-pc/icons'
import { customerCodeRule } from '../utils/validate-customer-code'
import { CompanyInfoType } from '../consts'
import kyeRestrictDirective from '../directives/kye-restrict'
import parseSpaceDirective from '../directives/parse-space'

defineOptions({ name: 'customer-code-form' })

withDefaults(
  defineProps<{
    type?: string
    /** 编码密码placeholder */
    passwordPlaceHolder?: string
  }>(),
  {
    type: 'bind',
    passwordPlaceHolder: '请填写客户编码密码',
  }
)

const emit = defineEmits(['update:loading', 'update:disabled', 'handleForgetPassword'])

const vKyeRestrict = kyeRestrictDirective
const vParseSpace = parseSpaceDirective

const customerCodeFormRef = ref<KFormInstance>()
const state = reactive({
  showPassword: false,
  formData: {
    customerCode: '',
    password: '',
    memberName: '',
  },
  focus: {
    customerCode: false,
    password: false,
    memberName: false,
  },
})
// 模板绑定所需的顶层引用
const { showPassword, formData, focus } = toRefs(state)
const rules = reactive<FormRules>({
  customerCode: [
    { required: true, message: '请填写客户编码' },
    { validator: customerCodeRule, trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请填写客户编码密码' },
    { pattern: /^[^\u4e00-\u9fa5]{1,32}$/, message: '请填写正确的编码密码', trigger: 'blur' },
  ],
  memberName: [{ pattern: /^[A-Za-z\u4e00-\u9fa5]+$/, message: '请填写中英文姓名', trigger: 'blur' }],
})
const { bindCustomerCode } = useCustomerCode({ router: useRouter() })
const { companyInfoType } = useCustomerCodeStore()

const handleBindCustomerCode = async ({ targetName }: { targetName?: string } = {}) => {
  await new Promise<void>((resolve, reject) => {
    customerCodeFormRef.value?.elFormRef.validate((validate, errors = {}) => {
      if (!validate) {
        const key = ['customerCode', 'password', 'memberName'].find((k) => errors[k])
        if (key) {
          KMessage.error(errors[key]?.[0]?.message)
        }
        reject()
        return
      }
      resolve()
    })
  })

  emit('update:loading', true)

  return bindCustomerCode({
    customerCode: state.formData.customerCode,
    password: state.formData.password,
    memberName: state.formData.memberName,
    bindType: companyInfoType.value === CompanyInfoType.CHANGE_CUSTOMER_CODE ? 3 : 0,
    targetName,
  })
}

const handleResetFields = () => {
  customerCodeFormRef.value?.elFormRef.resetFields()
}

const handleParseSpaceCallback = (e: string) => {
  if (!/^\d*$/.test(e)) {
    state.formData.customerCode = ''
  }
}

/* 表单input移除空格 */
const handleInput = (field: 'password' | 'memberName') => {
  // 输入编码密码，仅支持英文、数字
  if (field === 'password') {
    state.formData[field] = state.formData[field].replace(/[^a-zA-Z0-9]/g, '') || ''
  }
  if (Object.prototype.hasOwnProperty.call(state.formData, field)) {
    state.formData[field] = state.formData[field].replace(/\s/g, '')
  }
}

const handleForgetPassword = () => {
  emit('handleForgetPassword')
}

// 编码/密码均填写后通知父级(老逻辑保留: 父级可通过 v-model:disabled 消费)
watch(
  () => state.formData,
  (val) => {
    if (val.customerCode && val.password) {
      emit('update:disabled', false)
    } else {
      emit('update:disabled', true)
    }
  },
  { deep: true }
)

defineExpose({
  formData: state.formData,
  handleBindCustomerCode,
  handleResetFields,
})
</script>

<style lang="scss" scoped>
.customer-code-form__container {
  &--password {
    position: relative;
  }
  &--forget-btn {
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>
