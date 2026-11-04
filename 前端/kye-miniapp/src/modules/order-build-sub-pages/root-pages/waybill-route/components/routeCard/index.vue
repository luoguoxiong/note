<template>
  <view>{{ title }}</view>
</template>

<script setup lang="ts">
import './index.scss'
import { ref } from 'vue'

const title = ref('运单信息栏')
</script>
