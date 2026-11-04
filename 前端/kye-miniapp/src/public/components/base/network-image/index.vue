<template>
  <image :src="imageSrc" v-bind="$attrs" @error="handleError" />
</template>

<script setup lang="ts" name="network-image">
import { computed, ref, watch } from 'vue'
import { useNetworkStore } from '@/store/useNetworkStore'
import { urlContact } from '@/public/utils'

defineOptions({ name: 'NetworkImage' })

const props = defineProps<{
  src: string
  fallbackSrc?: string
}>()

const neworkStore = useNetworkStore()

const randowId = ref(0)

const imageSrc = computed(() => {
  if (isError.value && props.fallbackSrc) {
    return props.fallbackSrc
  }
  if (!props.src) {
    return ''
  }
  const url = urlContact(props.src, {
    id: randowId.value,
  })
  return url
})

const isError = ref(false)

const handleError = () => {
  isError.value = true
}

watch(
  () => neworkStore.isConnected,
  (isConnected) => {
    if (isConnected && isError.value) {
      randowId.value += 1
      isError.value = false
    }
  },
)
</script>
