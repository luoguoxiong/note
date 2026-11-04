<template>
  <div class="relation-account-flow">
    <!-- 没有关联账号权限切换/新增绑码提示弹窗 -->
    <WithoutRelateAccountDialog ref="withoutRelateAccountDialogRef" />

    <!-- 申请绑定其他公司弹窗 -->
    <ApplyBindCompanyDialog ref="applyBindCompanyDialogRef" />

    <!-- 绑定客户编码申请审批结果弹窗 -->
    <CustomerApprovalResultDialog ref="customerApprovalResultDialogRef" />

    <!-- 联系电话 -->
    <ContactPhoneDialog ref="contactPhoneDialogRef" />
  </div>
</template>

<script setup lang="ts">
/**
 * 关联账号申请流程弹窗集(流程编排器, TS 版)
 * 来源: netc-pc-web/src/views/setting/user/components/customer-code-list/relation-account-flow.vue
 *
 * 依赖映射:
 *  - @vue/composition-api -> vue script setup
 *  - without-relate-account-dialog / apply-bind-company-dialog / bind-customer-code-form
 *      -> 本目录新迁移(同目录)
 *  - customer-approval-result-dialog / contact-phone-dialog
 *      -> 复用 module-customer-code/components 已迁移版本(showDialog 接口一致)
 *  - userApi.getOtherBindApplyDetail / getOtherBindVirtualNum -> 本目录 api.ts
 *  - storageUtil.getPhone -> useCustomerCodeStore().phone
 *
 * 对外能力(defineExpose):
 *  - showDialog(payload) 流程入口(directApply 直接申请 / type+companyList+msg 先弹无权限提示)
 */
import { ref } from 'vue'
import WithoutRelateAccountDialog from './without-relate-account-dialog.vue'
import ApplyBindCompanyDialog from './apply-bind-company-dialog.vue'
import CustomerApprovalResultDialog from '../customer-approval-result-dialog.vue'
import ContactPhoneDialog from '../contact-phone-dialog.vue'
import { getOtherBindApplyDetail, getOtherBindVirtualNum } from '../../api'
import useCustomerCodeStore from '../../hooks/useCustomerCodeStore'

defineOptions({ name: 'relation-account-flow' })

const { phone } = useCustomerCodeStore()

const withoutRelateAccountDialogRef = ref<InstanceType<typeof WithoutRelateAccountDialog> | null>(null)
const applyBindCompanyDialogRef = ref<InstanceType<typeof ApplyBindCompanyDialog> | null>(null)
const customerApprovalResultDialogRef = ref<InstanceType<typeof CustomerApprovalResultDialog> | null>(null)
const contactPhoneDialogRef = ref<InstanceType<typeof ContactPhoneDialog> | null>(null)

/**
 * 流程入口
 * @param payload directApply true-直接申请绑定其他公司, false-先弹没有关联账号权限解绑提示弹窗
 */
async function showDialog(payload: { directApply?: boolean; type?: string; companyList?: any[]; msg?: string } = {}) {
  const { directApply = false, type = 'change', companyList = [], msg = '' } = payload
  if (directApply) {
    handleApplyBindCompany()
  } else {
    const flag = await withoutRelateAccountDialogRef.value?.showDialog?.({ type, companyList, msg })
    if (flag) handleApplyBindCompany()
  }
}

/** 申请绑定其他公司 */
async function handleApplyBindCompany() {
  try {
    // 申请关联账号前判断当前是否有申请中的流程
    const res = await getOtherBindApplyDetail()
    if (res.code === 0 && Number(res.data?.auditStatus) === 10) {
      handleApprovalResult({ applyStatus: res.data?.auditStatus })
    } else {
      const result = await applyBindCompanyDialogRef.value?.showDialog?.()
      if (result) handleApprovalResult({ applyStatus: 0 })
    }
  } catch (e) {
    console.log(e, ':>> e2')
  }
}

/** 申请成功/审批中弹窗 -> 联系客服 */
async function handleApprovalResult(payload: Record<string, any>) {
  try {
    const res = await getOtherBindVirtualNum({
      outPhone: phone.value,
      needVerifyAuthName: true,
    })
    if (res.code === 0 && res.data) {
      const data = { ...res.data, ...payload, source: '3' }
      const result = await customerApprovalResultDialogRef.value?.showDialog?.(data)
      if (result) {
        ;(data as Record<string, any>).trackName = 'clk_customer_code_bind_contact_button'
        ;(data as Record<string, any>).changeTrackName = 'clk_customer_code_bind_apply_company_button'
        await contactPhoneDialogRef.value?.showDialog?.(data)
      }
    }
  } catch (e) {
    console.log(e, ':>> e')
  }
}

defineExpose({
  showDialog,
})
</script>
