<template>
  <div
    class="location-position"
    :class="{
      animated: isNet && loading,
      'line-animated': isNet && position.text,
      'is-poi': isPoi,
    }"
    :style="{
      maxWidth: position.width,
    }"
  >
    <div class="location-position__circle"></div>
    <transition name="text-scale" :enter-active-class="customEnterClass" :leave-active-class="customLeaveClass">
      <div
        v-if="isNet && position.text"
        class="location-position__title"
        :style="{
          fontSize: position.fontSize,
        }"
      >
        <p>{{ position.text }}</p>
      </div>
    </transition>
    <span class="location-position__line"></span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Position = {
  text: string
  width: string | number
  fontSize: string | number
}

interface PropsType {
  position: Position
  loading: boolean
  type: string
}
const props = withDefaults(defineProps<PropsType>(), {
  loading: false,
  type: '',
})

const customEnterClass = ref('custom-enter-class-with-delay')
const customLeaveClass = ref('custom-leave-class-with-delay')

const isNet = computed(() => props.type === '网点')
const isPoi = computed(() => props.type === '地址')
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './location-position.scss';
</style>
