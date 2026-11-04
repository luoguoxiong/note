<template>
  <BottomPopup
    title="申请查看运费"
    v-model:show="show"
    showFooter
    :footerText="footerText"
    :loading="loading"
    :showTips="showInputTips"
    tipIcon="required"
    :buttonDisabled="loading"
    :catchMove="false"
    @onClose="handleClose"
    @onConfirm="handleConfirm"
  >
    <ApplyPopupContent
      :status="feeAuthStatus"
      :title="applyDataTitle"
      :applyTime="applyData.applyTime"
      :applyReason="applyData.applyReason"
      :contactTypeDesc="applyData.contactTypeDesc || '商务'"
      :contactButtonName="applyData.contactButtonName || '商务'"
      :showBusinessQr="true"
      :modalShow="true"
      :textDisable="textDisable"
      v-model="applyReason"
      @contact="showContact = true"
    />

    <!-- 联系商务弹窗 -->
    <ContactBusiness
      v-model:show="showContact"
      :phone="concatInfo.phone"
      :role-name="concatInfo.roleName"
      :scene="concatInfo.scene"
      :customerCode="concatInfo.customerCode"
    />
  </BottomPopup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BottomPopup from '@order-global-package-freight-time/components/ui/bottom-popup-ui/index.vue'
import ApplyPopupContent from '@order-global-package-freight-time/components/business/estimated-cost/components/apply-popup-content/index.vue'
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import { useApplyEstimate } from './hooks/useApplyEstimate'
import { CustomerStatus, PersonnelContactType } from '../../constants'
import { FeeAuthApplyStatus } from '@order-global-package-freight-time/constants'
import { useUserInfo } from '@public/hooks/useUserInfo'

const props = defineProps<{
  bindCustomerStatus: string
  /** 权限申请状态（FeeAuthApplyStatus），未传时由 bindCustomerStatus 推导 */
  applyStatus?: number
}>()

const emit = defineEmits<{
  submitSuccess: []
}>()

const { userInfo } = useUserInfo()

const { show, loading, applyReason, applyHeadTip, applyData, fetchApplyContent, handleSubmit, handleClose } =
  useApplyEstimate()

const concatInfo = computed(() => {
  // 判断是否是审批人
  const isApprover =  [PersonnelContactType.主授权人, PersonnelContactType.管理员].includes(applyData.contactType)
  return {
    phone: userInfo.value?.phone || '',
    // 以下参数都是审批人使用
    roleName: isApprover ? '审批人' : '',
    scene: isApprover ? applyData.contactScene : '',
    customerCode: isApprover ? userInfo.value?.customerCode : '',
  }
})

/** 权限申请状态：优先用 prop，否则由 bindCustomerStatus 推导 */
const feeAuthStatus = computed(() => {
  if (props.applyStatus !== undefined) return props.applyStatus
  return +props.bindCustomerStatus === CustomerStatus.APPLYING
    ? FeeAuthApplyStatus.申请中
    : FeeAuthApplyStatus.申请查看
})

/** 是否为"申请查看"视图（显示 textarea） */
const isApplyView = computed(() => feeAuthStatus.value === FeeAuthApplyStatus.申请查看)
const showInputTips = computed(() => isApplyView.value)

/** 申请中/失败视图的标题 */
const applyDataTitle = computed(() => {
  return feeAuthStatus.value === FeeAuthApplyStatus.申请失败 ? '申请失败' : '权限申请中'
})

/** 底部按钮文案 */
const footerText = computed(() => {
  if (isApplyView.value) return '确定'
  return '我知道了'
})

/** 申请中/失败时禁用文本输入 */
const textDisable = computed(() => !isApplyView.value)

const handleConfirm = async () => {
  if (!isApplyView.value) {
    handleClose()
  } else {
    const ok = await handleSubmit()
    if (ok) {
      emit('submitSuccess')
    }
  }
}

const showContact = ref(false)

const open = async () => {
  // if (!isApplyView.value) {
  //   await fetchApplyContent()
  // }
  await fetchApplyContent()
  show.value = true
}

defineExpose({
  show,
  applyHeadTip,
  open,
  fetchApplyContent,
})
</script>
