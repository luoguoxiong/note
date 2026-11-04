<!-- 国际运单（Postmate 微前端容器，对齐老项目 micro-views；子应用 tms-global-logistics-web 需 Postmate 握手） -->
<template>
  <IframeView menu-code="M3828" router-name="global-waybill"></IframeView>
</template>

<script setup lang="ts">
import IframeView from '../iframe-view.vue'
</script>
