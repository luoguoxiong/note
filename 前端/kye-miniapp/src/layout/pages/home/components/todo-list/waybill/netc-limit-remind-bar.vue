<template>
  <view :class="`netc-limit-remind-bar netc-limit-remind-bar--${reason}`">
    <view class="netc-limit-remind-bar__message">{{ message }}</view>
    <view v-if="isMore" class="netc-limit-remind-bar__more"></view>
  </view>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import './netc-limit-remind-bar.scss'

interface Props {
  reason: string | number
  message: string
  isMore?: boolean
}

defineProps<Props>()
</script>
