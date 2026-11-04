<template>
  <div class="order-status w-full">
    <!-- 右上角tips图标 -->
    <SvgIcon v-if="result.tips" class="order-status-icon-tips" :name="result.tips" />
    <!-- 副标题 -->
    <div class="icon-and-text">
      <SvgIcon class="icon-success-waybill2" :imgUrl="iconImg" :name="iconName"></SvgIcon>
      <SubTitle />
    </div>
  </div>
  <ApprovelRuleCard :list="data?.topics" v-if="data?.topics?.length" />
  <div class="adjust-tips" v-if="data.adjustStatus === '10'">
    {{ data?.role === 1 ? '后续您下的所有运单均将按照此规则加收费用' : '后续贵司付款的所有运单需加收该费用' }}
  </div>
  <div class="adjust-tips" v-else-if="data.adjustStatus === '20'">
    <KyReport eventCode="exp_page_express_result_fee_confirm_v1"></KyReport>
    商务审核中，如有疑问请<span class="color-b" @click="concat">点击联系商务</span>
  </div>
  <!-- 主标题 -->
  <MainTitle />
</template>
<script setup lang="tsx">
import { SuccessOrderInfo, SuccessWaybill } from '@order-public-sub-public/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { useOrderStatus } from '../hooks/useOrderStatus'
import { computed, toRefs } from 'vue'
import { contactPopup } from '@order-public-sub-public/components/business/contact-business'
import ApprovelRuleCard from '@order-public-sub-public/components/business/approvel-rule-card/index.vue'
import KyReport from '@order-public-sub-public/components/base/ky-report/index.vue'
import { clickresultFeeConfirmDisagreeReport } from '../report/index'

const props = defineProps<{ data: SuccessOrderInfo; list: SuccessWaybill[] }>()

const { data, list } = toRefs(props)

const result = computed(() => useOrderStatus(data.value, list.value).result)

// icon 兼容:icon 字段既可能是图标名(走 CDN name 路径),也可能是完整 URL(下单失败场景),URL 时直接作为 imgUrl 使用
const isIconUrl = computed(() => /^https?:\/\//.test(result.value.icon))
const iconImg = computed(() => result.value.iconUrl || (isIconUrl.value ? result.value.icon : undefined))
const iconName = computed(() => (isIconUrl.value ? '' : result.value.icon))

const MainTitle = result.value.mainTitle

const SubTitle = result.value.subTitle

const concat = () => {
  clickresultFeeConfirmDisagreeReport('联系商务')
  contactPopup()
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
