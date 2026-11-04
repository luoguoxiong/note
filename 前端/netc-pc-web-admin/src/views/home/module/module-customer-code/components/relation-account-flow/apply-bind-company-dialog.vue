<template>
  <KDialog
    v-model="dialogVisible"
    title="申请绑定其他公司"
    width="410px"
    append-to-body
    class="apply-bind-company-dialog"
    cancel-text="取消"
    confirm-text="确定"
    :disable-submit-btn="disabled || !formData.reason"
    @confirm="handleConfirm"
  >
    <div class="info__tips">
      为保障客户信息安全，如需绑定多家公司进行下单，请填写以下资料申请，申请后由跨越审批后直接开通并绑定以下公司
    </div>
    <h4 class="sticky__header">
      <span>申请绑定公司({{ applyBindCompanyList.length }}/{{ companyListCount }})<i class="required-star">*</i></span>
      <el-tooltip effect="dark" placement="bottom-start" content="新增客户编码已达到上限" :disabled="!addDisabled">
        <span :class="['add-btn', addDisabled && 'disabled']" @click="handleAddCustomerCode">
          <img
            class="add-icon"
            v-show="!addDisabled"
            src="https://ic-img.ky-express.com/netc/20260116_67217_!!1768557754557_12_12.svg+xml"
            alt=""
          />
          <img
            class="add-icon"
            v-show="addDisabled"
            src="https://ic-img.ky-express.com/netc/20260116_18175_!!1768559065605_12_12.svg+xml"
            alt=""
          />
          新增
        </span>
      </el-tooltip>
    </h4>
    <div class="apply-list__wrapper">
      <BindCustomerCodeForm
        ref="bindCustomerCodeFormRef"
        :visible="dialogVisible"
        v-model:disabled="disabled"
        :formList="applyBindCompanyList"
        @delCustomerCode="handleDelCustomerCode"
      />
    </div>
    <div class="reason__wrapper">
      <h4>
        <span>申请原因<i class="required-star">*</i></span>
      </h4>
      <el-form :model="formData" :rules="formRules" ref="formRef">
        <el-form-item prop="reason">
          <el-input
            type="textarea"
            v-model="formData.reason"
            :rows="5"
            clearable
            resize="none"
            placeholder="请输入申请原因"
            :maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>
  </KDialog>
</template>

<script setup lang="ts">
/**
 * 申请绑定其他公司弹窗(TS 版)
 * 来源: netc-pc-web/src/views/setting/user/components/customer-code-list/apply-bind-company-dialog.vue
 *  - @vue/composition-api -> vue script setup
 *  - ky-dialog(:visible.sync + slot footer) -> KDialog(v-model + cancel/confirm 内置 footer)
 *  - el-button footer -> KDialog cancel/confirm + disable-submit-btn
 *  - root.$store.state.userInfo -> useUserStore().user
 *  - UserService.bindOtherCustomerList -> 本目录 api.ts
 *  - v-kytrack 指令 / window.report.sendExpEvent / root.$reportUtils.* -> 本目录 report.ts(事件码不变)
 *  - require('@/assets/...') -> import 本目录 assets 静态资源
 */
import { computed, reactive, ref, toRefs, watch } from 'vue'
import { cloneDeep } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { KDialog } from '@netc-design-pc/ui'
import BindCustomerCodeForm from './bind-customer-code-form.vue'
import { bindOtherCustomerList } from '../../api'
import { useUserStore } from '@/stores/user'
import {
  expCustomerCodeBindApplyCompanyPopup,
  clkCustomerCodeBindApplyCompanyPopupButton,
  otherCustomerCodeBindApplyCompanyPopupSub,
} from '../../report'

defineOptions({ name: 'apply-bind-company-dialog' })

const valueObj = { customerCode: '', customerShortName: '' }

const userStore = useUserStore()
const userInfo = computed(() => userStore.user)

/** 当前绑定客户编码 */
const customerCodeComputed = computed(() => {
  const { customerCode } = (userInfo.value as any)?.customerInfo || {}
  return customerCode || ''
})

const state = reactive({
  loading: false,
  disabled: true,
  resolveResult: null as ((value: boolean) => void) | null,
  dialogVisible: false,
  applyBindCompanyList: [] as any[],
  formData: {
    reason: '',
  },
})
const { dialogVisible, disabled, applyBindCompanyList, formData } = toRefs(state)

const formRef = ref()
const bindCustomerCodeFormRef = ref()

const validateReason = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  const reg =
    /([0-9*#]\uFE0F\u20E3)|([0-9#]\u20E3)|([\u203C-\u3299]\uFE0F\u200D)|([\u203C-\u3299]\uFE0F)|([\u2122-\u2B55])|(\u303D)|(\u00A9|\u00AE)\u3030|(\u00A9)|(\u00AE)|(\u3030)|([\uD83C\uD83D\uD83E][\uDC00-\uDFFF])|([\uDC00-\uDFFF])|([\uD83C\uD83D\uD83E])|(\u200D)|(\uFE0F)/g
  if (reg.test(value) || /\s+/g.test(value)) {
    return callback(new Error('不可输入表情符号和空格'))
  }
  callback()
}

const formRules = {
  reason: [{ validator: validateReason, trigger: 'blur' }],
}

const companyListCount = computed(() => (customerCodeComputed.value ? '10' : '9'))

/** 新增按钮达到上限 disable */
const addDisabled = computed(() => {
  if (customerCodeComputed.value) {
    return state.applyBindCompanyList.length >= 10
  }
  return state.applyBindCompanyList.length >= 9
})

function showDialog() {
  state.dialogVisible = true
  // 弹窗曝光(老 window.report.sendExpEvent)
  setTimeout(() => {
    expCustomerCodeBindApplyCompanyPopup({ session_id: localStorage.getItem('sessionId') })
  }, 200)
  return new Promise<boolean>((resolve) => {
    state.resolveResult = resolve
  })
}

/** 确定 */
async function handleConfirm() {
  try {
    const notValid =
      (customerCodeComputed.value && bindCustomerCodeFormRef.value?.ruleForm.formList.length <= 1) ||
      (!customerCodeComputed.value && bindCustomerCodeFormRef.value?.ruleForm.formList.length < 1)
    if (notValid) {
      ElMessage.warning('请添加需要绑定的客户编码')
      return false
    }
    try {
      await bindCustomerCodeFormRef.value?.ruleFormRef.validate()
    } catch (e) {
      console.log(e, ':>>> error')
      if (e === false) {
        ElMessage.error('申请绑定公司异常，请检查后再提交')
        return false
      }
    }
    await formRef.value?.validate()
    let list = cloneDeep(state.applyBindCompanyList)
    // 列表首位为当前绑定公司(无需申请), 提交时剔除
    if (customerCodeComputed.value) {
      list.splice(0, 1)
    }
    const customerCodeList = list.filter((i: any) => /\S/.test(i.customerCode)).map((f: any) => f.customerCode)
    state.loading = true
    const res = await bindOtherCustomerList({
      applyBindCustomerCodeList: customerCodeList,
      applyReason: state.formData.reason,
      operatorSource: '30',
    })
    if (res.code === 0 && res.data) {
      state.resolveResult && state.resolveResult(true)
      state.dialogVisible = false
    }
    // 提交结果上报(老 $reportUtils.otherCustomerCodeBindApplyCompanyPopupSub)
    otherCustomerCodeBindApplyCompanyPopupSub({
      request_result: res?.code === 0 ? '成功' : '失败',
      failure_reason: res?.code !== 0 && res?.msg ? res?.msg : '',
      company_code: customerCodeList.join(),
      apply_reason: state.formData.reason,
      session_id: localStorage.getItem('sessionId'),
    })
  } catch (e) {
    console.log(e, ':>> e')
  } finally {
    state.loading = false
  }
}

/** 新增申请绑定公司 */
function handleAddCustomerCode() {
  clkCustomerCodeBindApplyCompanyPopupButton({ button_name: '新增' })
  if (customerCodeComputed.value) {
    if (state.applyBindCompanyList.length >= 10) return false
  } else {
    if (state.applyBindCompanyList.length >= 9) return false
  }
  state.applyBindCompanyList.push(cloneDeep(valueObj))
}

/** 删除当前行绑定公司 */
function handleDelCustomerCode(index: number) {
  if (customerCodeComputed.value) {
    if (index === 0) {
      ElMessage.error('不可删除当前绑定公司')
      return false
    }
    if (state.applyBindCompanyList.length === 2 && index === 1) {
      return false
    }
  } else {
    if (index === 0) {
      return false
    }
  }
  state.applyBindCompanyList.splice(index, 1)
}

watch(
  dialogVisible,
  (val) => {
    if (val) {
      formRef.value?.resetFields()
      bindCustomerCodeFormRef.value?.ruleFormRef?.resetFields()
      state.applyBindCompanyList = [cloneDeep(valueObj)]
      if (customerCodeComputed.value) {
        state.applyBindCompanyList.unshift({
          customerCode: customerCodeComputed.value,
          customerShortName: (userInfo.value as any)?.customerInfo?.customerShortName,
        })
      }
    } else {
      state.applyBindCompanyList = []
      state.resolveResult && state.resolveResult(false)
    }
  },
  { immediate: true }
)

defineExpose({
  showDialog,
})
</script>

<style lang="scss" scoped>
// KDialog body 默认 padding 去除(customer-approval-result-dialog 同款变量)
:global(.apply-bind-company-dialog) {
  --k-dialog-body-padding: 0;
}
.apply-bind-company-dialog {
  h4 {
    color: #333333;
    font-size: 16px;
    position: relative;
    padding-left: 12px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    .required-star {
      color: #ff706d;
      font-style: normal;
      margin-left: 2px;
    }
    > span {
      &:first-of-type {
        color: #333333;
        font-size: 16px;
        font-weight: bold;
        line-height: 30px;
        position: relative;
        &:before {
          content: '';
          display: block;
          width: 3px;
          height: 16px;
          background: #666666;
          border-radius: 2px;
          position: absolute;
          top: 7px;
          left: -12px;
        }
        &:after {
          content: '';
          display: inline-block;
          color: #ff706d;
          font-size: 16px;
          transform: translateY(3px);
        }
      }
      &.add-btn {
        color: #8a61f2;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        .add-icon {
          height: 12px;
          width: 12px;
          margin-right: 4px;
        }
        &:hover {
          background-color: #f3f0fe;
        }
        &.disabled {
          color: #ccc;
          cursor: not-allowed;
          &:hover {
            background-color: #f3f6fe;
          }
        }
      }
    }
  }
  .info__tips {
    width: 100%;
    height: 54px;
    background-image: url('../../assets/apply-bind-company-bg.png');
    background-size: cover;
    background-repeat: no-repeat;
    color: #fff;
    font-size: 12px;
    line-height: 18px;
    padding: 9px 15px 9px 69px;
    box-sizing: border-box;
  }
  .sticky__header {
    background: #fff;
    padding: 16px 18px 8px 32px;
    margin-bottom: 0;
    width: 100%;
    box-sizing: border-box;
  }
  .apply-list__wrapper {
    padding: 0 24px 12px 32px;
  }
  .reason__wrapper {
    padding: 0px 24px 20px 32px;
    :deep(.el-textarea__inner) {
      background: #f7f7f7;
      border-radius: 6px;
      border: none;
      padding: 12px;
    }
    :deep(.el-textarea .el-input__count) {
      background: transparent;
      bottom: 10px;
    }
  }
}
</style>
