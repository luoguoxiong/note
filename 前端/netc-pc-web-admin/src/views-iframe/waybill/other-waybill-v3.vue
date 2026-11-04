<!-- 查看他人运单（来源: netc-pc-web/src/views/micro-views/waybill/other-waybill-v3.vue） -->
<template>
  <Iframe menu-code="M-WAYBILL-OTHER" router-name="other-waybill-v3"></Iframe>
</template>

<script setup lang="ts">
import Iframe from '../components/iframe/index.vue'

/**
 * M-WAYBILL-OTHER 为派生菜单（基于 M3060 生成，不注册到后端），
 * 地址由 lightAppStore 合成派生菜单后经通用 Iframe 组件的 getAppUrl 解析
 */
</script>
