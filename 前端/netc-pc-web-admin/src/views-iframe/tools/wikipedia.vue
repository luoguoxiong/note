<template>
  <div id="content">
    <Iframe menu-code="M3079" router-name="wikipedia" @message="getMessage"></Iframe>
  </div>
</template>

<script setup lang="ts">
import Iframe from '../components/iframe/index.vue'

const getMessage = ({ type, data }: { type: string; data: any }) => {
  console.error('type', type, data)
}
</script>

<style lang="scss" scoped>
#content {
  width: 100%;
  height: 100%;
}
</style>
