<template>
  <div class="site">
    <h1>组件库测试</h1>
    <p>开发过程中的组件测试</p>
    <nc-foo :msg="msg"></nc-foo>
    <nc-dialog></nc-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const msg = ref('hello world')
</script>

<style scoped lang="scss">
.site {
  padding: 20px;
}
</style>
