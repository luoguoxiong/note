<template>
  <div class="adaptive-number-shell">
    <KTooltip :content="displayValue" :disabled="!isTruncated" placement="top">
      <div ref="viewportRef" class="adaptive-number-viewport">
        <span
          ref="numberRef"
          class="adaptive-number-value"
          :class="{ 'adaptive-number-value--truncated': isTruncated }"
          :style="{
            fontSize: `${currentFontSize}px`,
            fontWeight,
            lineHeight: `${lineHeight}px`,
          }"
        >
          {{ displayValue }}
        </span>
      </div>
    </KTooltip>
  </div>
</template>

<script setup lang="ts">
import { thousandSeparatorReplacer } from '@/utils/regexp'
import { KTooltip } from '@netc-design-pc/ui'
import ResizeObserver from 'resize-observer-polyfill'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { fitNumberFontSize } from './fit-number'

const props = withDefaults(
  defineProps<{
    value: number | string
    maxSize: number
    minSize: number
    lineHeight: number
    fontWeight?: number
  }>(),
  {
    fontWeight: 700,
  }
)

const viewportRef = ref<HTMLElement>()
const numberRef = ref<HTMLElement>()
const currentFontSize = ref(props.maxSize)
const isTruncated = ref(false)
const displayValue = computed(() => thousandSeparatorReplacer(`${props.value || 0}`, ','))

let observer: ResizeObserver | undefined
let animationFrame = 0

const fitNumber = () => {
  cancelAnimationFrame(animationFrame)
  animationFrame = requestAnimationFrame(() => {
    const viewport = viewportRef.value
    const number = numberRef.value
    if (!viewport || !number || viewport.clientWidth <= 0) return

    number.style.textOverflow = 'clip'

    const { fontSize, isTruncated: truncated } = fitNumberFontSize(props.maxSize, props.minSize, (currentFontSize) => {
      number.style.fontSize = `${currentFontSize}px`
      return number.scrollWidth > viewport.clientWidth
    })

    currentFontSize.value = fontSize
    number.style.textOverflow = truncated ? 'ellipsis' : 'clip'
    isTruncated.value = truncated
  })
}

watch(displayValue, () => nextTick(fitNumber))

onMounted(() => {
  observer = new ResizeObserver(fitNumber)
  if (viewportRef.value) observer.observe(viewportRef.value)
  void document.fonts?.ready.then(fitNumber)
  fitNumber()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(animationFrame)
})
</script>

<style lang="scss" scoped>
.adaptive-number-shell,
.adaptive-number-viewport {
  width: 100%;
  min-width: 0;
  height: 100%;
}

.adaptive-number-shell {
  position: relative;
}

.adaptive-number-viewport {
  overflow: hidden;
}

.adaptive-number-value {
  display: block;
  overflow: hidden;
  width: 100%;
  min-width: 0;
  font-family: 'Gilroy', 'Avenir Next', Arial, sans-serif;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: #24262b;
  text-overflow: clip;
}

.adaptive-number-value--truncated {
  text-overflow: ellipsis;
}
</style>
