<template>
  <div class="forget-custom-password-flow">
    <!-- 忘记密码 -->
    <forget-password-dialog ref="forgetPasswordDialogRef" />

    <!-- 绑定客户编码申请审批结果弹窗 -->
    <customer-approval-result-dialog ref="customerApprovalResultDialogRef" />

    <!-- 联系电话 -->
    <contact-phone-dialog ref="contactPhoneDialogRef" />
  </div>
</template>

<script setup lang="ts">
/**
 * 忘记密码流程编排(TS 版)
 * 来源: customer-code/components/forget-custom-password-flow.vue
 *  - @vue/composition-api -> vue script setup
 *  - 弹窗间数据流转(忘记密码 -> 审批结果 -> 联系电话)逻辑保持不变
 */
import { ref } from 'vue'
import ForgetPasswordDialog from './forget-password-dialog.vue'
import CustomerApprovalResultDialog from './customer-approval-result-dialog.vue'
import ContactPhoneDialog from './contact-phone-dialog.vue'
import type { ApprovalFlowData } from '../types'

defineOptions({ name: 'forget-custom-password-flow' })

const forgetPasswordDialogRef = ref<InstanceType<typeof ForgetPasswordDialog> | null>(null)
const customerApprovalResultDialogRef = ref<InstanceType<typeof CustomerApprovalResultDialog> | null>(null)
const contactPhoneDialogRef = ref<InstanceType<typeof ContactPhoneDialog> | null>(null)

async function showDialog(customerCode: string) {
  const result = await forgetPasswordDialogRef.value?.showDialog(customerCode)
  if (result?.data) {
    const data: ApprovalFlowData = { ...result.data, source: '2' }
    const flag = await customerApprovalResultDialogRef.value?.showDialog(data)
    if (flag) {
      if (data.role === '商务') {
        data.trackName = 'clk_customer_code_bind_password_businesspopup_button'
        data.changeTrackName = 'clk_customer_code_bind_password_changenumpopup_button'
      } else {
        data.trackName = 'clk_customer_code_bind_password_contactpopup_button'
        data.changeTrackName = 'clk_customer_code_bind_password_contactchangepopup_button'
      }
      await contactPhoneDialogRef.value?.showDialog(data)
    }
  }
}

defineExpose({
  showDialog,
})
</script>

<style lang="scss" scoped></style>
