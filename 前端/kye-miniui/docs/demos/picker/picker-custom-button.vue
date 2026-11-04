<template>
  <button @click="onConfirm">inject 自定义确定</button>
  <button @click="onCancel">inject 自定义取消</button>
</template>
<script setup lang="ts">
import { inject } from 'vue'
const methods = inject('kyPickerMethods') || {}
const onConfirm = methods.confirm
const onCancel = methods.cancel
</script>

<style lang="scss"></style>
