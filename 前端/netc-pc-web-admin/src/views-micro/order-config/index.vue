<template>
  <div class="micro-app-host">
    <micro-app
      name="app4"
      url="https://uc-uat.ky-express.com/web-order-config/0.252.10/#/order"
      keep-alive
      @mounted="onMounted"
      @error="onError"
    ></micro-app>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'order' })

type Status = 'loading' | 'mounted' | 'error'
const status = ref<Status>('loading')

const onMounted = () => {
  status.value = 'mounted'
}
const onError = () => {
  status.value = 'error'
}
</script>

<style lang="scss" scoped>
.micro-app-host {
  width: 100%;
  min-height: 100%;
}

.micro-app-loading,
.micro-app-error,
.micro-app-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 320px;
  font-size: 14px;
  color: #86909c;
  background: #f7f8fa;
  border-radius: 4px;
}

.micro-app-error {
  color: #f53f3f;
}

micro-app {
  display: block;
  width: 100%;
}
</style>
