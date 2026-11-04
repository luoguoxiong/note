<template>
  <BottomPopup
    class="apply-cost-popup"
    title="申请查看运费"
    :show="modalShow"
    :footerText="footerText"
    showFooter
    @onClose="onClose"
    @onConfirm="onConfirm"
    :showTips="data?.status === FeeAuthApplyStatus.申请查看"
    tipIcon="required"
  >
    <div
      class="estimation-cost-apply"
      v-exposure-report="{
        eventCode: 'exp_express_cost_commerce_already_v1',
        regionCode: 'fare',
      }"
      v-if="data?.status !== FeeAuthApplyStatus.申请查看"
    >
      <div class="estimation-cost-apply-status flex">
        <SvgIcon class="estimation-cost-apply-status-svg" name="auth-apply-status" font-size="14" />
        <span class="estimation-cost-apply-status-title">{{ title }}</span>
        <span class="estimation-cost-apply-status-desc">您于 {{ data?.applyTime }} 已申请查看运费</span>
      </div>
      <div class="estimation-cost-apply-content">申请原因：{{ data?.applyReason }}</div>
      <div class="estimation-cost-apply-commerce">
        <text class="estimation-cost-apply-commerce-desc">如需加急，可联系{{ data?.contactTypeDesc }}紧急审批</text>
        <img
          v-if="modalShow"
          src="https://ic-img.ky-express.com/netc/20250619_6093_!!1750300560568_144_144.png"
          class="estimation-cost-apply-commerce-business-relation"
        />
        <text class="estimation-cost-apply-commerce-relation" @tap="handleContactPhone">
          联系{{ (data?.contactButtonName || '').replace('贵司', '') }}</text
        >
      </div>
    </div>
    <KyTextarea
      v-else
      :noPadding="true"
      :modelValue="inputValue"
      :show-word-limit="true"
      :placeholder="`请填写申请原因，便于${data?.contactTypeDesc}为您快速开通`"
      :rows="5"
      :maxlength="150"
      :clearable="!textDisable"
      v-bind="$attrs"
      :disabled="textDisable"
    ></KyTextarea>
  </BottomPopup>
</template>

<script setup lang="ts">
import KyTextarea from '@order-public-sub-public/components/base/ky-textarea/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { EstimatedCostDimension } from '@order-public-sub-public/types/moduleDimension'
import { contactPopup } from '@order-public-sub-public/components/business/contact-business' // ok
import { computed } from 'vue'
import { PersonnelContactType, FeeAuthApplyStatus } from '@order-public-sub-public/constants'

interface IProps {
  data?: EstimatedCostDimension
  title: string
  modalShow: boolean
  onClose: () => void
  onConfirm: () => void
  inputValue?: string
  footerText?: string
  textDisable?: boolean
}

const contactType = computed(
  () =>
    props?.data?.contactType &&
    [PersonnelContactType.主授权人, PersonnelContactType.管理员].includes(props?.data?.contactType),
)
const props = defineProps<IProps>()
const handleContactPhone = () => {
  if (contactType.value) {
    // 调用 拨打电话组件
    contactPopup({
      title: '审批人', // 因审批人包含部门可能过长，按产品要求，此处文案固定为审批人
      hideWeChat: true,
      approvedBy: true,
      scene: props.data?.contactScene?.toString(),
    })
  } else {
    contactPopup()
  }
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.apply-cost-popup {
  .required {
    font-size: 40px;
  }
}
</style>
