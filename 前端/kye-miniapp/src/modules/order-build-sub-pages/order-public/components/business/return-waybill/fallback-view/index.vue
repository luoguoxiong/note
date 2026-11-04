<template>
  <div
    class="return-waybill"
    :class="{ disabled: disabled }"
    v-exposure-report="{
      eventCode: 'exp_express_return_v1',
    }"
  >
    <div class="return-waybill-title flex items-center">
      <div class="font-level3 pr-8">需返程</div>
      <SvgIcon name="return-waybill-order" class="return-waybill-title-icon"></SvgIcon>
      <div class="return-waybill-title-desc font-level4" :class="[switchFlag ? 'color-error' : 'color-assist']">
        {{ switchFlag ? '返程费用由寄件人承担' : '部分货物需要从收货方返回' }}
      </div>
      <KySwitch
        v-model="switchFlag"
        :disabled="disabled"
        v-click-report="{
          eventCode: 'clk_express_return_v1',
        }"
      />
    </div>
    <!--    <div-->
    <!--      v-click-report="{-->
    <!--        eventCode: 'clk_express_return_msg_v1',-->
    <!--      }"-->
    <!--      :class="{ disabled: disabled }"-->
    <!--      class="return-waybill-content font-level3 flex items-center"-->
    <!--    >-->
    <!--      <div :style="{ color: '#03050D' }">返程运单信息</div>-->
    <!--      <SvgIcon name="required" class="return-waybill-content-required"></SvgIcon>-->
    <!--      <div-->
    <!--        class="return-waybill-content-value"-->
    <!--        id="returnWaybill_returnWaybill"-->
    <!--        data-validate="returnWaybill.returnWaybill"-->
    <!--      >-->
    <!--        <span class="return-waybill-placeholder">请填写</span>-->
    <!--      </div>-->
    <!--      <SvgIcon name="order-miniapp-right-arrow" class="return-waybill-content-icon" />-->
    <!--    </div>-->
    <!-- <div class="return-waybill-restrict font-level4" v-if="plainTips">
      {{ plainTips }}
    </div> -->
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KySwitch from '@order-public-sub-public/components/base/ky-switch/index.vue'
import { useSwitchFlag } from '@order-public-sub-public/components/business/return-waybill/hooks/useState'
import { computed, ref } from 'vue'
import { ServiceModeType } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { switchFlag } = useSwitchFlag()

const disabled = computed(() => {
  const { serviceMode } = piniaStore.order.moduleFormData(ModuleType['服务方式']) || {}
  return !serviceMode
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './../index.scss';
</style>
