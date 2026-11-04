<template>
  <KDialog
    title="添加客户编码"
    v-model="dialogVisible"
    class="customer-code-add-dialog"
    width="416px"
    append-to-body
    is-form-page
    @close="handleClose('取消')"
    @confirm="handleConfirm"
  >
    <div class="tips">
      <el-icon><WarningFilled /></el-icon>
      添加客户编码成功后，将自动切换为当前绑定
    </div>

    <div class="form-wrapper">
      <customer-code-form
        ref="customerCodeFormRef"
        @handleForgetPassword="handleForgetPassword"
        v-model:loading="loading"
      />
    </div>
  </KDialog>
</template>

<script setup lang="ts">
/**
 * 添加客户编码弹窗(TS 版)
 * 来源: customer-code/components/customer-code-add-dialog.vue
 *  - @vue/composition-api -> vue script setup
 *  - ky-dialog(:visible.sync) -> KyDialog(v-model, 桥接父级 v-model)
 *  - @/hooks/useDialogVisibleSync -> computed get/set 桥接
 *  - element-ui KyButton(ky-button-new) -> @netc-design-pc/ui KButton
 *  - root.$reportUtils.* -> 本目录 report.ts(事件码不变)
 */
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
// import KyDialog from '@/components/base/ky-dialog2/index.vue'
import { KDialog } from '@netc-design-pc/ui'
import { userBindIsWebHide } from '../api'
import CustomerCodeForm from './customer-code-form.vue'
import { clkCustomerCodeBindAddpopupButton, expCustomerCodeBindAddpopup } from '../report'

defineOptions({ name: 'customer-code-add-dialog' })

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
    expCustomerCodeBindAddpopup()
  }
})

const handleConfirm = async () => {
  clkCustomerCodeBindAddpopupButton({ button_name: '确定' })
  try {
    // bindCustomerCode 可能返回 boolean 或结果对象
    const res: any = await customerCodeFormRef.value?.handleBindCustomerCode({
      targetName: '添加',
    })
    if (res?.success || res?.contactPhone) {
      handleClose()
    }
  } finally {
    loading.value = false
  }
}

const handleClose = (buttonName?: string) => {
  dialogVisible.value = false
  loading.value = false
  nextTick(() => {
    customerCodeFormRef.value?.handleResetFields()
  })
  clkCustomerCodeBindAddpopupButton({ button_name: buttonName || '关闭' })
}

const handleForgetPassword = async () => {
  try {
    const { data } = await userBindIsWebHide()
    if (data.isWebHide === 1) {
      ElMessage.error('手机号已设置外部隐藏，不可通过忘记密码发起绑码申请')
      return
    }
    emit('forgetPassword', customerCodeFormRef.value?.formData.customerCode)
  } catch (e) {
    console.log(e)
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/customerCodeDialog.scss';
:global(.customer-code-add-dialog) {
  // 去除弹窗body默认的padding
  --k-dialog-body-padding: 0;
}
.customer-code-add-dialog {
  .form-wrapper {
    padding: 0 24px 0px;
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

  .customer-code-form__container {
    padding-top: 16px;
  }

  @include customerForgetPassword;
}
</style>
