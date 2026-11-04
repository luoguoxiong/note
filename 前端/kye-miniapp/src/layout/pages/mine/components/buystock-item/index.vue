<template>
  <view class="buystock">
    <PreloadImage :src="data.menuIcon" :placeholder="placeholder" @load="handleLoad" />
    <view class="buystock-name" v-if="show">{{ data.menuName }}</view>
    <view class="buystock-desc" v-if="show">{{ data.menuContent }}</view>
  </view>
</template>
<script setup lang="ts">
import PreloadImage from '@/public/components/base/preload-image/index.vue'
import placeholder from '@/layout/assets/images/mine-placeholer.png'
import './index.scss'
import { ref } from 'vue'
defineProps<{ data: any }>()

const show = ref(false)
const handleLoad = () => {
  show.value = true
}
</script>
