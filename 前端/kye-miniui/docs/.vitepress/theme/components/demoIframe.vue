<template>
  <div class="demo-iframe">
    <iframe :src="src" frameborder="0"></iframe>
  </div>
</template>

<script setup lang="ts">
defineProps<{ src: string }>()
</script>

<style scoped>
.demo-iframe {
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 16px;
  overflow: hidden;
  //position: fixed;
  width: 360px;
  top: 200px;
  right: 40px;
}
.demo-iframe iframe {
  width: 100%;
  height: calc(100vh - 200px);
}
</style>
