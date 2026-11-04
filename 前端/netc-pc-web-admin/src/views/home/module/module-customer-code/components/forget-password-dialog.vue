<template>
  <KDialog
    title="忘记密码"
    v-model="dialogVisible"
    class="forget-password-dialog"
    width="400px"
    append-to-body
    confirm-text="提交"
    @close="handleTrackClose"
    @confirm="handleTrackSubmit"
  >
    <div class="tips">
      <el-icon><WarningFilled /></el-icon>
      如您忘记客户编码密码，可在下方申请绑码，申请通过后将为您直接绑定
    </div>
    <div class="form-wrapper">
      <forget-password-form ref="forgetPasswordFormRef" v-model:loading="loading" :customerCode="customerCode" />
      <div class="suffix-tips">
        <span>如您忘记客户编码或公司简称，需要绑码可</span>
        <span class="phone-call">拨打95324</span>
      </div>
    </div>
  </KDialog>
</template>

<script setup lang="ts">
/**
 * 忘记密码弹窗(TS 版)
 * 来源: customer-code/components/forget-password-dialog.vue
 *  - @vue/composition-api -> vue script setup
 *  - ky-dialog(:visible.sync) -> KDialog(v-model)
 *  - element-ui el-button / $createElement+$kye_message.confirm -> KButton / h()+ElMessageBox.confirm
 *  - root.$reportUtils.* 与 v-kytrack 指令 -> 本目录 report.ts 显式上报(事件码不变)
 *  - storageUtil.getPhone -> useCustomerCodeStore().phone(新基座用户信息数据源)
 *  - UserService.* -> 本目录 api.ts
 */
import { nextTick, reactive, ref, toRefs, watch, h } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import { KDialog, KMessageBox } from '@netc-design-pc/ui'
import { applyBindCustomer, getVirtualNum } from '../api'
import ForgetPasswordForm from './forget-password-form.vue'
import { clkCustomerCodeBindPasswordpopupButton } from '../report'
import useCustomerCodeStore from '../hooks/useCustomerCodeStore'

defineOptions({ name: 'forget-password-dialog' })

const forgetPasswordFormRef = ref<InstanceType<typeof ForgetPasswordForm> | null>(null)
const { phone } = useCustomerCodeStore()

const state = reactive({
  loading: false,
  resolveResult: null as ((value: any) => void) | null,
  dialogVisible: false,
  customerCode: '',
})

// 模板绑定所需的顶层引用
const { dialogVisible, loading, customerCode } = toRefs(state)

function showDialog(code: string): Promise<any> {
  state.dialogVisible = true
  state.customerCode = code
  return new Promise<any>((resolve) => {
    state.resolveResult = resolve
  })
}

const handleTrackClose = () => {
  clkCustomerCodeBindPasswordpopupButton({ button_name: '取消' })
  handleClose()
}

const handleTrackSubmit = () => {
  clkCustomerCodeBindPasswordpopupButton({ button_name: '提交' })
  handleConfirm()
}

const handleConfirm = async () => {
  try {
    const isValid = await forgetPasswordFormRef.value?.validateForm(true)
    // 是否通过校验
    if (!isValid) {
      return false
    }
    state.loading = true
    await applyBindCustomerCode()
  } catch (e) {
    console.log(e)
  } finally {
    state.loading = false
  }
}

const applyBindCustomerCode = async (cancelOtherApplyFlag = false) => {
  try {
    const params = {
      ...forgetPasswordFormRef.value?.formData,
      cancelOtherApplyFlag,
      operatorSource: '30',
    }
    const res = await applyBindCustomer(params)
    if (res.code === 0 && res.data) {
      if (res.data.appliedFlag) {
        const firstApplied = res.data.appliedInfoList?.[0]
        const Msg = h('div', { style: 'line-height: 20px;' }, [
          h('span', null, '您已申请绑定'),
          h('span', { style: 'color: #ff8038;' }, `${firstApplied?.customerShortName}`),
          h(
            'span',
            null,
            `（${firstApplied?.customerCode}）${
              (res.data.appliedInfoList?.length ?? 0) > 1 ? '等公司' : ''
            }，继续提交将取消申请。`
          ),
        ])
        await KMessageBox.confirm(Msg, '温馨提示', {
          type: 'warning',
          confirmButtonText: '继续',
          cancelButtonText: '取消',
          closeOnClickModal: false,
        })
        await applyBindCustomerCode(true)
        return false
      }
      const virtualRes = await getVirtualNum({
        customer: res.data.customerCode,
        outPhone: phone.value,
        needVerifyAuthName: true,
      })
      if (virtualRes.code === 0 && virtualRes.data) {
        const data = { ...res.data, ...virtualRes.data }
        if (!res.data.existedApplyFlag) data.applyStatus = 0
        state.resolveResult && state.resolveResult({ data })
        handleClose()
      }
    }
  } catch (e) {
    console.log(e)
  }
}

const handleClose = () => {
  state.dialogVisible = false
  state.loading = false
  nextTick(() => {
    forgetPasswordFormRef.value?.handleResetFields()
  })
  clkCustomerCodeBindPasswordpopupButton({ button_name: '关闭' })
}

watch(
  () => state.dialogVisible,
  (val) => {
    nextTick(() => {
      if (forgetPasswordFormRef.value) {
        forgetPasswordFormRef.value.formData.customerName = state.customerCode || ''
      }
    })
    if (!val) {
      state.resolveResult && state.resolveResult(false)
    }
  }
)

defineExpose({
  showDialog,
})
</script>

<style lang="scss" scoped>
:global(.forget-password-dialog) {
  // 去除弹窗body默认的padding
  --k-dialog-body-padding: 0;
}

.forget-password-dialog {
  .form-wrapper {
    padding: 0 24px 16px;
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

  .forget-password-form__container {
    padding-top: 16px;
  }
  .suffix-tips {
    > span {
      color: #8f8fa8;
      font-size: 12px;
    }
    .phone-call {
      color: #ff8038;
      font-size: 12px;
    }
  }
  .el-button.is-disabled {
    background: #c1c7cf;
    border-color: #c1c7cf;
  }
}
</style>
