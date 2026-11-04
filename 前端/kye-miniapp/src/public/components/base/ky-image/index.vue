<template>
  <network-image :class="class" :src="imageSrc" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  class: {
    type: String,
    default: '',
  },
  src: {
    type: String,
    default: '',
  },
})

const imageSrc = ref('')

onMounted(() => {
  if (props.src) {
    imageSrc.value = props.src
  } else {
    imageSrc.value = `https://ic-img.ky-express.com/kye-miniapp/${props.name}`
  }
})

watch(
  () => props.name,
  () => {
    if (!props.src && props.name) {
      imageSrc.value = `https://ic-img.ky-express.com/kye-miniapp/${props.name}`
    }
  },
)
</script>
