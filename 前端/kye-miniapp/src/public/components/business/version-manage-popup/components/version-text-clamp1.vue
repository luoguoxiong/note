<template>
  <view class="version-manage-text-box">
    <text
      id="textContent"
      class="version-text-content"
      :style="isExpanded ? '' : 'display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;'"
    >
      {{ text }}
    </text>
    <view v-if="isOverflow" class="toggle-btn" @tap="toggleExpand">
      {{ isExpanded ? '[收起]' : '[展开]' }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import Taro from '@tarojs/taro'

interface Props {
  text: string
  fontSize?: number
  lineHeight?: number
  clamp?: number
}

const props = withDefaults(defineProps<Props>(), {
  fontSize: 14,
  lineHeight: 20,
  clamp: 3,
})

const isOverflow = ref(false)
const isExpanded = ref(false)

// 统一换行符
const normalizedText = computed(() => props.text.replace(/↵/g, '\n'))

const checkTextOverflow = () => {
  nextTick(() => {
    const query = Taro.createSelectorQuery()
    query
      .select('#textContent')
      .boundingClientRect((rect) => {
        if (rect) {
          const maxHeight = props.lineHeight * props.clamp
          isOverflow.value = rect.height > maxHeight
        }
      })
      .exec()
  })
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

onMounted(() => {
  checkTextOverflow()
})
</script>

<style lang="scss">
.version-manage-text-box {
  position: relative;
  .version-text-content {
    line-height: 42px; /* 要和 props.lineHeight 保持一致 */
    font-size: 28px;
    word-break: break-word;
  }

  .toggle-btn {
    display: inline-block;
    color: #8365f6;
    font-size: 28px;
    line-height: 34px;
    margin-top: 4px;
  }
}
</style>
