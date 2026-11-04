<template>
  <KDialog
    title="更换客户编码"
    v-model="dialogVisible"
    class="change-customer-code-dialog"
    width="416px"
    append-to-body
    :loading="loading"
    @confirm="handleConfirm"
  >
    <div class="tips">
      <el-icon><WarningFilled /></el-icon>
      更换客户编码成功后将替换之前的客户编码
    </div>
    <div class="form-wrapper">
      <div class="customer-code__form">
        <customer-code-form
          ref="customerCodeFormRef"
          @handleForgetPassword="handleForgetPassword"
          type="change"
          v-model:loading="loading"
          passwordPlaceHolder="请填写客户编码密码"
        />
      </div>
    </div>
  </KDialog>
</template>

<script setup lang="ts">
/**
 * 更换客户编码弹窗(TS 版)
 * 来源: customer-code/components/change-customer-code-dialog.vue
 *  - @vue/composition-api -> vue script setup
 *  - ky-dialog(:visible.sync) -> KDialog(v-model, 桥接父级 v-model)
 *  - @/hooks/useDialogVisibleSync -> computed get/set 桥接
 *  - element-ui KyButton(ky-button-new) -> @netc-design-pc/ui KButton
 *  - root.$reportUtils.* -> 本目录 report.ts(事件码不变)
 */
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { KDialog } from '@netc-design-pc/ui'
import { userBindIsWebHide } from '../api'
import CustomerCodeForm from './customer-code-form.vue'
import { clkCustomerCodeChangeButton, expCustomerCodeChangeChangeWindow, otherCustomerCodeBindSub } from '../report'

defineOptions({ name: 'change-customer-code-dialog' })

const props = defineProps<{ modelValue?: boolean }>()

const emit = defineEmits(['update:modelValue', 'forgetPassword'])

const customerCodeFormRef = ref<InstanceType<typeof CustomerCodeForm> | null>(null)
const loading = ref(false)

// 老组件 props.visible + :visible.sync -> v-model 桥接
const dialogVisible = computed({
  get: () => !!props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

watch(dialogVisible, (val) => {
  if (val) {
    expCustomerCodeChangeChangeWindow()
  }
})

const handleConfirm = async () => {
  clkCustomerCodeChangeButton({ button_name: '确定' })
  try {
    // bindCustomerCode 可能返回 boolean 或结果对象
    const res: any = await customerCodeFormRef.value?.handleBindCustomerCode()
    if (res?.success || res?.contactPhone) {
      otherCustomerCodeBindSub({ page_type: '更换客户编码' })
      handleClose()
    }
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  dialogVisible.value = false
  loading.value = false
  nextTick(() => {
    customerCodeFormRef.value?.handleResetFields()
  })
}

const handleForgetPassword = async () => {
  try {
    const { data } = await userBindIsWebHide()
    if (data.isWebHide === 1) {
      ElMessage.error('手机号已设置外部隐藏，不可通过忘记密码发起绑码申请')
      return
    }
    emit('forgetPassword', customerCodeFormRef.value?.formData.customerCode)
    handleClose()
  } catch (e) {
    console.log(e)
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/customerCodeDialog.scss';
:global(.change-customer-code-dialog) {
  // 去除弹窗body默认的padding
  --k-dialog-body-padding: 0;
}
.change-customer-code-dialog {
  .form-wrapper {
    padding: var(--k-spacing-16) var(--k-spacing-24);
  }

  .tips {
    opacity: 1;
    background: #fff3e5;
    font-size: 13px;
    font-weight: normal;
    line-height: 20px;
    color: #f57200;
    padding: 6px 16px;
    display: flex;
    gap: 8px;
    align-items: flex-start;
    .el-icon {
      margin-top: 4px;
    }
  }

  @include customerForgetPassword;

  .customer-code__form {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
