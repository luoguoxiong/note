<template>
  <div class="lazy-load">
    <slot v-if="show"></slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
interface PropsType {
  time?: number
}
const props = withDefaults(defineProps<PropsType>(), {
  time: 200,
})
const show = ref(false)
const emit = defineEmits(['loaded'])

const timeoutId = ref<ReturnType<typeof setTimeout>>()

onMounted(() => {
  syncLoader()
})

onUnmounted(() => {
  clearTimeout(timeoutId.value)
})

const syncLoader = () => {
  timeoutId.value = setTimeout(() => {
    show.value = true
    emit('loaded')
  }, props.time)
}
</script>

<style scoped></style>
