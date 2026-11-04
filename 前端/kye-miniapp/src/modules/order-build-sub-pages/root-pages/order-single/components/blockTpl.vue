<template>
  <div>{{ moduleId }}</div>
</template>
<script setup lang="ts">
defineProps<{
  config: any
  moduleId: string
  required: boolean
  type: string
  visible: boolean
}>()
</script>
