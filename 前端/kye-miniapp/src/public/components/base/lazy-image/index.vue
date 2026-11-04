<template>
  <image
    v-bind="$attrs"
    :src="realSrc"
    :mode="mode"
    :id="lazyImgId"
    class="fade"
    @tap="handleClick"
    :class="{ loaded: visible }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDidShow } from '@tarojs/taro'
import { createObserve } from '@/public/createObserve'

interface Props {
  id: string
  delay: number
  src: string
  placeholder: string
  isDelay: boolean
}

const refRandomId = Math.random().toString(36).slice(-8)

const props = withDefaults(defineProps<Props>(), {
  mode: 'aspectFill',
  threshold: 0,
  delay: 0,
  placeholder: '',
  isDelay: false,
})

const emit = defineEmits(['load', 'click'])

const lazyImgId = props.id || `lazy-img-${refRandomId}`

const visible = ref<boolean>(false)

const handleClick = (e) => {
  emit('click', e)
}

const showImage = () => {
  setTimeout(() => {
    visible.value = true
    emit('load')
  }, props.delay)
}

const initObserver = function () {
  const el = document.getElementById(lazyImgId)
  if (!el) return
  const close = createObserve(lazyImgId, () => {
    showImage()
    close()
  })
}

const realSrc = computed(() => {
  return visible.value ? props.src : props.placeholder
})

const createTask = () => {
  setTimeout(() => {
    if (props.isDelay && props.delay > 0) {
      showImage()
    } else {
      initObserver()
    }
  }, 100)
}

onMounted(() => {
  createTask()
})

useDidShow(() => {
  createTask()
})
</script>

<style scoped>
/* 渐进加载动画 */
.fade {
  opacity: 0.8;
  transition: opacity 0.3s ease;
}
.fade.loaded {
  opacity: 1;
}
</style>
