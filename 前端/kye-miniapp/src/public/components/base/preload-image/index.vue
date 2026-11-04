<template>
  <image :src="imgSrc" :mode="mode" v-bind="$attrs" @load="handleLoad" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  src: string
  placeholder: string
  fallback?: string
  mode?: string
}>()

const emits = defineEmits(['load'])

const imgSrc = ref(props.placeholder)

const handleLoad = () => {
  emits('load')
  imgSrc.value = props.src
}
</script>
