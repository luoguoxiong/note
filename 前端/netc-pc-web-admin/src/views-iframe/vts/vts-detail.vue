<!-- 整车运单详情（来源: netc-pc-web/src/views/micro-views/vts/vts-detail.vue） -->
<template>
  <div id="content">
    <Iframe menu-code="VTS-WAYBILL-DETAIL" router-name="vtsWaybill-detail"></Iframe>
  </div>
</template>

<script setup lang="ts">
import Iframe from '../components/iframe/index.vue'

/**
 * VTS-WAYBILL-DETAIL 为派生菜单（基于 M3848 整车运单生成，不注册到后端，对齐老基座
 * microIframeApp.js 由 M3058 派生 vtsDetailConfig 的做法），地址由 lightAppStore
 * 合成派生菜单后经通用 Iframe 组件的 getAppUrl 解析。
 *
 * routerName 对齐路由 name 'vtsWaybill-detail'：老项目此处误写为 'vtsWaybill'（与路由
 * name 不一致），通用组件按 route.name === routerName 守卫会丢弃详情页子应用的 COMMON
 * 消息（再次下单/退登等）；对齐后详情页子应用可正常经 COMMON 通道通信
 */
</script>

<style lang="scss" scoped>
#content {
  width: 100%;
  height: 100%;
}
</style>
