<template>
  <div class="payment-by-receiving">
    <div class="body">
      <KyInput
        :showBorder="true"
        clear-trigger="always"
        @click="clickHandle"
        @blur="blurHandle"
        @update="change"
        :maxlength="20"
        autocomplete="off"
        v-model="modelValue"
        :disabled="disabled"
        :enableNative="false"
        :enableWxNative="true"
        :always-system="true"
        :inputDebounce="800"
        :cursor-spacing="240"
        clearable
        placeholder="请输入收方公司简称或客户编码"
        ref="inputRef"
      />
      <div class="autofill-tip" v-if="isShowAutofillTip">
        <AdhesiveBandage
          class="bandage payment-by-receiving-autofill-tip"
          isDirectivity
          text="已为您自动填充付款公司，如错误请修改或删除即可"
        />
      </div>
      <div class="tips">
        <SvgIcon class="star-tips" name="star-tips"></SvgIcon>
        <span class="text">收方付：货物派送签收时，收件人可通过线上支付、扫收款码、月结账户支付等方式付款</span>
      </div>
    </div>
    <div class="footer-content">
      <KyButton color="#8365F6" loading-text="确定" :loading="loading" class="confirm-btn" @click="confirm" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import AdhesiveBandage from '@order-public-sub-public/components/base/ky-adhesive-bandage/index.vue'
import { getCustomerShortInfo } from '@order-public-sub-public/apis/pay-mode/index'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { PayModelProps, AuthorizeStatusEnum } from '@order-public-sub-public/components/business/pay-mode/type'
import { PayModeConfig } from '@order-public-sub-public/types'
import { ModuleType, PayMode, MAX_DELAY_TIME } from '@order-public-sub-public/constants'
import { debounce } from 'lodash-es'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { getPaymodeItem, payModeOrderData } from '@order-public-sub-public/components/business/pay-mode/hooks/state'
import { beforeConfirmReport, confirmErrorReport } from '../../hooks/useReport'
import { isAliPayClient } from '@order-public-sub-public/utils/device'
import { adjustLayoutForKeyboard, restoreLayout } from '@order-public-sub-public/components/business/pay-mode/utils'
import useEffect from '@order-public-sub-public/validate'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const props = defineProps<PayModelProps>()
const emit = defineEmits(['confirmHandel', 'loadChange'])
const { limitHooksHandOut } = useEffect()

const loading = computed(() => {
  return props.loading
})
const isShowAutofillTip = ref(false)
const modelValue = ref('')
let paymentCustomerName = ref('')
let paymentCustomerCode = ref('')
const authorizeStatus = ref(0)
const msg = ref('')
const inputRef = ref()
// 校验
const checkHandel = async () => {
  let isCheckedOk = true
  if (!modelValue.value) {
    isCheckedOk = true
    return true
  }
  const waybillId = piniaStore.order.waybillId || ''
  let { data } = await getCustomerShortInfo({ payMode: PayMode['收方付'], payCustomer: modelValue.value, waybillId })
  if (
    data.authorizeStatus?.status === AuthorizeStatusEnum.无需授权 ||
    data.authorizeStatus?.status === AuthorizeStatusEnum.未授权 ||
    data.authorizeStatus?.status === AuthorizeStatusEnum.已授权
  ) {
    isCheckedOk = true
    authorizeStatus.value = data.authorizeStatus.status
    paymentCustomerCode.value = data.customerCode
    paymentCustomerName.value = data.customerName
    msg.value = data.authorizeStatus.tipMsg
  } else {
    isCheckedOk = false
    if (data.checkResultList?.length) {
      limitHooksHandOut(data.checkResultList)
    }
    // showToast('请输入正确的公司简称客户编码')
  }
  return isCheckedOk
}

/**
 * 默认值逻辑，优先级如下：
 *    1.表单中有数据，直接使用表单数据做默认值
 *    2.收方公司触发了/ERP配置, 数据体现在付款列表中
 * paymentAccount: 录入的值，可以是公司名称或公司编码
 */
const setDefault = () => {
  // 收方公司触发数据
  const defaultValue = getPaymodeItem(PayMode.收方付)?.customerName || ''

  // 收方付可以不用填公司
  if (payModeOrderData.value?.payMode === PayMode.收方付) {
    // 表单数据
    modelValue.value = payModeOrderData.value?.paymentAccount || ''
  } else if (defaultValue) {
    // 收方公司触发默认数据
    modelValue.value = defaultValue
    isShowAutofillTip.value = true
  }
}

setDefault()

const confirm = debounce(async () => {
  beforeConfirmReport()
  emit('loadChange', true)
  try {
    const isChecked = await checkHandel()
    if (!isChecked) {
      emit('loadChange', false)
      confirmErrorReport({ reason: '请输入正确的公司简称或客户编码', type: '收方付' })
      return
    }
    emit('confirmHandel', {
      payMode: PayMode['收方付'],
      paymentAccount: modelValue.value,
      authorizeStatus: authorizeStatus.value,
      paymentCustomerName: paymentCustomerName.value,
      paymentCustomerCode: paymentCustomerCode.value,
      msg: msg.value,
    })
  } catch (err: any) {
    confirmErrorReport({ reason: err?.message, type: '收方付' })
    emit('loadChange', false)
    console.log('error:', err as any)
  }
  authorizeStatus.value = 0
}, MAX_DELAY_TIME)

// 自动填充值改变时隐藏提示
const change = (value: string) => {
  isShowAutofillTip.value = false
  // #459414 清空时需要同步清空其他本地状态
  if (!value) {
    clearReceive()
  }
}

const isEdit = computed(() => {
  const fieldsConfig = piniaStore.schema.moduleConfigData(ModuleType.付款方式)?.fieldsConfig || []
  const recipientPayConfig = fieldsConfig.find((item) => item?.name === 'recipientPay')

  return recipientPayConfig?.editable
})

const disabled = computed(() => {
  return loading.value || isEdit.value === false
})

/**
 * @description 重置收方付本地状态
 */
const clearReceive = () => {
  modelValue.value = ''
  authorizeStatus.value = 0
  paymentCustomerCode.value = ''
  paymentCustomerName.value = ''
  msg.value = ''
}

const blurHandle = () => {
  restoreLayout()
}

/**
 * @description 处理支付宝键盘偶现没顶起页面
 */
const clickHandle = () => {
  if (!isAliPayClient) {
    return
  }
  setTimeout(() => {
    adjustLayoutForKeyboard()
  }, 100)
}

/**
 * 手动失焦-适配
 */
const handleInputBlur = () => {
  inputRef.value?.$refs.inputRef.blur()
}

defineExpose({
  handleInputBlur: handleInputBlur,
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
