<template>
  <view class="audit-footer-content" v-if="isShowFooter">
    <KyButton
      v-if="isShowCancel"
      loading-text="撤销申请"
      text="撤销申请"
      class="button cancel"
      plain
      loadingType="plain"
      @click="cancelOrder"
      v-exposure-report="exp_waybillaudit_revocation_v1()"
    >
    </KyButton>

    <KyButton
      v-if="isShowAnother"
      loading-text="再来一单"
      text="再来一单"
      class="button again"
      :class="{ 'margin-left': isShowCancel }"
      :plain="isShowContact ? true : undefined"
      :type="!isShowContact ? 'primary' : undefined"
      @click="anotherOrder"
      v-exposure-report="exp_waybillaudit_again_v1()"
    >
    </KyButton>

    <!-- 联系商务 -->
    <KyButton
      v-if="isShowContact"
      :loading-text="contactBusinessStr"
      :text="contactBusinessStr"
      class="button contact"
      :class="{ 'three-btn-type': isShowCancel && isShowAnother, 'margin-left': isShowCancel || isShowAnother }"
      type="primary"
      @click="contactBusiness"
      v-exposure-report="exp_waybillaudit_contactapprover_v1()"
    >
    </KyButton>
  </view>
  <ContactBusiness v-model:show="popupVisible" :phone="phone" :roleName="roleName" :customerCode="customerCode" />
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'

import { localStorage } from '@order-public-sub-public/utils/storage'
import { getChannel } from '@order-public-sub-public/configs'
import { Channel, ModuleType } from '@order-public-sub-public/constants'
import { OrderConsumer, OrderSuccessPageConfig, WaybillState } from '@order-public-sub-public/types'
import { cancelAuditOrder } from '@order-public-sub-public/apis'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { getOnlineH5Url } from '@order-public-sub-public/utils/env'
import { $native, getH5OrderUrl } from '@order-public-sub-public/utils'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import {
  clk_waybillaudit_revocation_v1,
  exp_waybillaudit_revocation_v1,
  exp_waybillaudit_again_v1,
  clk_waybillaudit_again_v1,
  exp_waybillaudit_contactapprover_v1,
  clk_waybillaudit_contactapprover_v1,
} from '../../hooks/report'
import { debounce } from 'lodash-es'
import { useRefresh } from '../../hooks/useInit'
import { openURL } from '@/modules/webview/utils'

import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const channel = getChannel()
const moduleFormData = computed(() => {
  return piniaStore.order.auditFormData
})

const router = useRouter()
const popupVisible = ref(false)
const phone = ref()

const sourceActionMap = {
  [Channel.运单审核]: 'OrderReview',
  [Channel.调价审核]: 'AdjustReview',
}
const sourcePageMap = {
  [Channel.运单审核]: 'OrderReview',
  [Channel.调价审核]: 'AdjustReview',
}

// 再来一单
const isShowAnother = computed(() => {
  if (channel === Channel.运单审核) {
    return true
  }
  if (channel === Channel.调价审核) {
    return moduleFormData.value.waybillState === WaybillState.已撤销
  }
  return false
})

const customerCode = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['下单公司'])?.customerCode || ''
})

/**
 * @description 再来一单逻辑,重开一个页面
 * @param channel
 */
const anotherOrder = () => {
  const waybillNumber = piniaStore.order.waybillNumber
  clk_waybillaudit_again_v1({ name: '再来一单', type: channel, waybillNumber })
  const auditTypeMap = {
    [Channel.运单审核]: 20,
    [Channel.调价审核]: 10,
  }

  const query = {
    channel: Channel.再来一单,
    channelScene: '50',
    auditType: auditTypeMap[channel as keyof typeof auditTypeMap],
    sourceAction: sourceActionMap[channel as keyof typeof sourceActionMap],
    sourcePage: sourcePageMap[channel as keyof typeof sourceActionMap],
    waybillNo: waybillNumber,
  }
  router.replace('/order', query)
  useRefresh(Channel.再来一单)
}

// 撤销申请
// const cancelBtnLoading = ref(false)
const isShowCancel = computed(() => {
  return moduleFormData.value.waybillState === WaybillState.审核中
})

const cancelOrder = async () => {
  clk_waybillaudit_revocation_v1({ name: '撤销申请', type: channel })
  try {
    const auditId = piniaStore.order.auditFormData.auditId
    await cancelAuditOrder([auditId])
    showToast('撤销成功')
    await goApprovalList()
  } catch (error: any) {
    showToast((error as any).msg || error.message)
  }
}

// 联系商务
const isShowContact = computed(() => {
  return moduleFormData.value.showLinkButton
})

const contactBusinessStr = computed(() => {
  return `联系${moduleFormData.value.authPersonName || '商务'}`
})

const roleName = computed(() => contactBusinessStr.value?.replace('联系', ''))

const contactBusiness = () => {
  // clk_waybillaudit_contactapprover_v1({ name: contactBusinessStr.value, type: channel })
  // const sceneMap = {
  //   [Channel.运单审核]: '10',
  //   [Channel.调价审核]: '20',
  // }
  // contactPopup({
  //   title: contactBusinessStr.value,
  //   scene: sceneMap[channel as keyof typeof sceneMap] || '20',
  // })
  handleContactPhone()
}

const handleContactPhone = debounce(() => {
  let _phone = ''
  try {
    // 解决跳转到下单成功页 是openWebview，导致store数据丢失没有手机号的场景
    const configJson = localStorage?.getItem('configOrderSuccessPageConfig')
    if (configJson) {
      const config = JSON.parse(configJson) as OrderSuccessPageConfig
      _phone = config?.phone || ''
    }
    phone.value = piniaStore.root.getUserInfo?.phone || _phone || ''
    popupVisible.value = true
  } catch (e) {
    console.log(e)
  }
}, 300)

const isShowFooter = computed(() => {
  return isShowCancel.value || isShowAnother.value || isShowContact.value
})

/**
 * @description 跳转审核列表
 */
const goApprovalList = async () => {
  const h5OrderUrl = await getH5OrderUrl()
  const baseUrl = h5OrderUrl ? `${h5OrderUrl}#` : getOnlineH5Url()
  const isAdjustPriceStr = channel === Channel.调价审核 ? '?tab=2' : '/'
  const url = `${baseUrl}/price-adjustment-approval-list${isAdjustPriceStr}`
  console.log('goApprovalListurl', url)
  openURL(url, { type: 'redirectTo', needLogin: true })
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
