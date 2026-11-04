<template>
  <div v-exposure-report="getTodoExpConfig(pendingItems?.locateTo)" :key="pendingItems?.locateTo"></div>
</template>
<script lang="ts" setup>
import { useHomeStore } from '@/hooks'
import { getTodoExpConfig } from '../../../report'
const { pendingItems } = useHomeStore()
</script>
