<template>
  <div id="content">
    <Iframe :menu-code="code" router-name="iframe-code"></Iframe>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Iframe from '../components/iframe/index.vue'

const route = useRoute()

// /admin/iframe/:code 中的 code 为轻应用菜单编码，由 Iframe 组件解析出实际地址
const code = computed(() => (route.params.code as string) || '')
</script>

<style lang="scss" scoped>
#content {
  width: 100%;
  height: 100%;
}
</style>
