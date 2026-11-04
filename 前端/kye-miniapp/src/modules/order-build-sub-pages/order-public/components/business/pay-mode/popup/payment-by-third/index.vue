<template>
  <div class="payment-by-third">
    <div class="body">
      <KyInput
        type="number"
        @update:model-value="inputChange"
        v-model="account"
        :disabled="disabled"
        :maxlength="20"
        clearable
        :enableNative="false"
        :always-system="true"
        :always-system-gd="true"
        :cursor-spacing="240"
        @onClearInput="onClear"
        @click="clickHandle"
        @focus="isFocus = true"
        @blur="blurHandle"
        placeholder="请填写付款公司的客户编码或主授权号"
        :data-focus="isFocus"
        ref="inputRef"
      >
        <template #right>
          <div class="search-btn" @click="clickSearch">查询</div>
        </template>
        <template #left><SvgIcon class="cell-left-required mr-8" name="required" /></template>
      </KyInput>
      <div class="cur-companyName" v-if="curCompanyVisible">
        <span class="label">当前付款公司：</span>
        <span class="value">{{ paymentCustomerName || '空' }}</span>
      </div>
      <div class="tips">
        <SvgIcon class="star-tips" name="star-tips"></SvgIcon>
        <span class="text">第三方付：货物派送签收后，费用由第三方付款公司进行支付</span>
      </div>
      <div class="third-party-payment-account" :class="{ unselected: disabled }" v-if="accountList?.length">
        <div class="tip-title">可选第三方付款账号</div>
        <scroll-view :scroll-x="true" :scroll-y="false" style="width: 100%">
          <div class="slide-tag-content flex">
            <div class="account-item" v-for="item in accountList" :key="item.customerCode" @click="selectItem(item)">
              <div class="label">{{ item.customerName }}</div>
              <div class="account">{{ item.customerCode }}</div>
            </div>
          </div>
        </scroll-view>
      </div>
    </div>
    <div class="footer-content">
      <KyButton
        loading-text="确定"
        :loading="loading"
        color="#8365F6"
        class="confirm-btn"
        value="确定"
        @click="onClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import { PayModelProps, AuthorizeStatusEnum } from '@order-public-sub-public/components/business/pay-mode/type'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import { getAuthorizedList, getCustomerShortInfo } from '@order-public-sub-public/apis/pay-mode/index'
import { AuthorizedList } from '@order-public-sub-public/apis/pay-mode/types'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { useStore } from '@order-public-sub-public/store'
import { debounce } from 'lodash-es'
import { PayModeConfig, PickUp } from '@order-public-sub-public/types'
import { ModuleType, PayMode, OrderPageType, MAX_DELAY_TIME } from '@order-public-sub-public/constants'
import { filterAllSpace } from '@order-public-sub-public/utils'
import { payModeOrderData } from '@order-public-sub-public/components/business/pay-mode/hooks/state'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { beforeConfirmReport, confirmErrorReport } from '../../hooks/useReport'
import { isAliPayClient } from '@order-public-sub-public/utils/device'
import { adjustLayoutForKeyboard, restoreLayout } from '@order-public-sub-public/components/business/pay-mode/utils'
const piniaStore = useStore()

const props = defineProps<PayModelProps>()
const emitEvent = defineEmits(['confirmHandel', 'loadChange', 'backToSend'])
const loading = computed(() => {
  return props.loading
})
const paymentCustomerName = ref('')
const paymentCustomerCode = ref('')
const account = ref('')
const authorizeStatus = ref(10)
const msg = ref('')
const accountList = ref<AuthorizedList[]>()

const isFocus = ref(false)
const curCompanyVisible = ref(false)
const inputRef = ref()

/**
 * 默认值优先级
 * 1.表单数据
 * 2.列表返回的选中项
 */
const getAuthorizedInfo = async () => {
  let pickupMobile = piniaStore.order.moduleFormData(ModuleType['收方信息']).mobile
  pickupMobile = filterAllSpace(pickupMobile || '')
  const params = {
    pickupMobile: pickupMobile,
    payMode: PayMode['第三方付'],
  }

  // 1.表单数据
  if (payModeOrderData.value?.payMode === PayMode['第三方付'] && payModeOrderData.value?.paymentAccount) {
    account.value = payModeOrderData.value.paymentAccount
    paymentCustomerName.value = payModeOrderData.value.paymentCustomerName || ''
  }

  const waybillId = piniaStore.order.waybillId || ''

  // 2.列表返回的选中项
  const { data } = await getAuthorizedList({ ...params, waybillId })
  accountList.value = data

  // 兼容批量寄
  const orderPageType = piniaStore.root.getOrderPageType
  if (!(orderPageType === OrderPageType.批量寄单票 && account.value)) {
    // 循环找出需要默认选中的值，回显到输入框
    if (accountList.value && accountList.value.length) {
      for (let index = 0; index < accountList.value.length; index++) {
        const element = accountList.value[index]
        if (element.isDefault) {
          account.value = element.customerCode
          paymentCustomerName.value = element.customerName
          break
        }
      }
    }
  }
}

getAuthorizedInfo()

/**
 * 检验客户编码正确性
 *    payMode 付款方式
 *    payCustomer 输入值
 * 获取： 授权类型
 * 返回： 是否校验通过
 */
const checkHandel = async () => {
  let isCheckedOk = true
  if (!account.value) {
    isCheckedOk = false
    showToast('请输入正确的客户编码或主授权号')
    return isCheckedOk
  }
  const waybillId = piniaStore.order.waybillId || ''
  try {
    let { data } = await getCustomerShortInfo({
      payMode: PayMode['第三方付'],
      payCustomer: account.value as string,
      waybillId,
    })
    if (
      data.authorizeStatus?.status === AuthorizeStatusEnum['已授权'] ||
      data.authorizeStatus?.status === AuthorizeStatusEnum['无需授权'] ||
      data.authorizeStatus?.status === AuthorizeStatusEnum['未授权']
    ) {
      isCheckedOk = true
      curCompanyVisible.value
      paymentCustomerName.value = data.customerName
      paymentCustomerCode.value = data.customerCode
      authorizeStatus.value = data.authorizeStatus.status
      msg.value = data.authorizeStatus.tipMsg
    } else {
      isCheckedOk = false
      showToast('请输入正确的客户编码或主授权号')
    }
  } catch (error) {
    isCheckedOk = false
  }

  return isCheckedOk
}

const onClear = () => {
  curCompanyVisible.value = false
}

const blurHandle = () => {
  isFocus.value = false
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

const clickSearch = async () => {
  curCompanyVisible.value = await checkHandel()
}

const selectItem = (item: AuthorizedList) => {
  account.value = item.customerCode
  paymentCustomerName.value = item.customerName
  curCompanyVisible.value = true
}

const inputChange = (v: number) => {
  if (!v) {
    curCompanyVisible.value = false
    paymentCustomerName.value = ''
  }
}

const onClick = debounce(async () => {
  beforeConfirmReport()
  try {
    emitEvent('loadChange', true)
    const checkResult = await checkHandel()
    console.log(checkResult)
    if (!checkResult) {
      emitEvent('loadChange', false)
      confirmErrorReport({ reason: '请输入正确的客户编码或主授权号', type: '第三方付' })
      return
    }
    emitEvent('confirmHandel', {
      payMode: PayMode['第三方付'],
      paymentAccount: account.value,
      authorizeStatus: authorizeStatus.value,
      paymentCustomerName: paymentCustomerName.value,
      paymentCustomerCode: paymentCustomerCode.value,
      msg: msg.value,
    })
    authorizeStatus.value = 0
  } catch (err: any) {
    // 接口异常直接关闭loading
    confirmErrorReport({ reason: err?.message, type: '第三方付' })
    emitEvent('loadChange', false)
    console.log('error:', err as any)
  }
}, MAX_DELAY_TIME)

const isEdit = computed(() => {
  const fieldsConfig = piniaStore.schema.moduleConfigData(ModuleType.付款方式)?.fieldsConfig || []
  const recipientPayConfig = fieldsConfig.find((item) => item?.name === 'thirdPartyPay')

  return recipientPayConfig?.editable
})

const disabled = computed(() => {
  return loading.value || isEdit.value === false
})

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
