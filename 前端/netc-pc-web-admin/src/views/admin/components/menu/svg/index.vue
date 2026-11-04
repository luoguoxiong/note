<template>
  <component :is="resolveComponent" v-if="resolveComponent" :class="['svg-icon', className]" :style="styles" />
</template>

<script setup lang="ts">
import { computed, type Component, type CSSProperties } from 'vue'
import menuReportCos from './svg/menu-report-cos.vue'
import menuReport from './svg/menu-report.vue'
import menuBillCos from './svg/menu-bill-cos.vue'
import menuBill from './svg/menu-bill.vue'
import menuOrderCos from './svg/menu-order-cos.vue'
import menuOrder from './svg/menu-order.vue'
import menuHomeCos from './svg/menu-home-cos.vue'
import menuHome from './svg/menu-home.vue'
import menuOpen from './svg/menu-open.vue'
import menuClose from './svg/menu-close.vue'
import menuCompanyCos from './svg/menu-company-cos.vue'
import menuCompany from './svg/menu-company.vue'
import menuPayCos from './svg/menu-pay-cos.vue'
import menuPay from './svg/menu-pay.vue'
import menuCouponCos from './svg/menu-coupon-cos.vue'
import menuCoupon from './svg/menu-coupon.vue'
import menuFreightCos from './svg/menu-freight-cos.vue'
import menuFreight from './svg/menu-freight.vue'
import menuAddressCos from './svg/menu-address-cos.vue'
import menuAddress from './svg/menu-address.vue'
import menuServiceCos from './svg/menu-service-cos.vue'
import menuService from './svg/menu-service.vue'
import menuSetting from './svg/menu-setting.vue'
import menuSettingCos from './svg/menu-setting-cos.vue'
import menuHellp from './svg/menu-help.vue'
import menuHellpCos from './svg/menu-help-cos.vue'
import menuUserCos from './svg/menu-user-cos.vue'
import menuUser from './svg/menu-user.vue'
import menuPayiCos from './svg/menu-payi-cos.vue'
import menuPayi from './svg/menu-payi.vue'
import menuPaynewCos from './svg/paynew-cos.vue'
import menuPaynew from './svg/paynew.vue'
import menuCoreCos from './svg/menu-core-cos.vue'
import menuCore from './svg/menu-core.vue'

const props = withDefaults(
  defineProps<{
    iconClass: string
    className?: string
    styles?: CSSProperties
  }>(),
  {
    className: '',
    styles: () => ({}),
  }
)

/** 图标名 -> 图标组件映射（与 netc-pc-web layout/svg/index.vue 保持一致） */
const componentMap: Record<string, Component> = {
  'menu-report': menuReport,
  'menu-report-cos': menuReportCos,
  'menu-bill': menuBill,
  'menu-bill-cos': menuBillCos,
  'menu-order': menuOrder,
  'menu-order-cos': menuOrderCos,
  'menu-home': menuHome,
  'menu-home-cos': menuHomeCos,
  menuOpen,
  menuClose,
  'menuCompany-cos': menuCompanyCos,
  menuCompany,
  'menuPay-cos': menuPayCos,
  menuPay,
  'menuCoupon-cos': menuCouponCos,
  menuCoupon,
  'menuFreight-cos': menuFreightCos,
  menuFreight,
  'menuAddress-cos': menuAddressCos,
  menuAddress,
  'menuService-cos': menuServiceCos,
  menuService,
  'menuSetting-cos': menuSettingCos,
  menuSetting,
  'menuHellp-cos': menuHellpCos,
  menuHellp,
  'menuUser-cos': menuUserCos,
  menuUser,
  'menuPayi-cos': menuPayiCos,
  menuPayi,
  'menuPaynew-cos': menuPaynewCos,
  menuPaynew,
  'menuCore-cos': menuCoreCos,
  menuCore,
}

const resolveComponent = computed(() => componentMap[props.iconClass] || null)
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
