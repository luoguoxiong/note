<template>
  <view class="version-manage-text-box">
    <view v-if="!isExpanded" class="text" id="textContent">
      <template v-for="(line, index) in displayLines" :key="index">
        {{ line }}
        <br v-if="index !== displayLines.length - 1" />
        <text v-if="index === displayLines.length - 1 && isOverflow" class="toggle-btn" @tap.stop="toggleExpand">
          [展开]
        </text>
      </template>
    </view>

    <view v-else class="text" id="textContent">
      <template v-for="(line, index) in normalizedParagraphs" :key="index">
        {{ line }}
        <br v-if="index !== normalizedParagraphs.length - 1" />
      </template>
      <text v-if="isOverflow" class="toggle-btn" @tap.stop="toggleExpand"> [收起] </text>
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
  maxWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  fontSize: 14,
  lineHeight: 20,
  clamp: 3,
  maxWidth: 200,
})

// const isOverflow = ref(false)
const isExpanded = ref(false)
const displayLines = ref<string[]>([])

const isOverflow = computed(() => {
  // 收起时展示的行数
  const shortText = displayLines.value.join('\n')
  // 全文
  const fullText = normalizedParagraphs.value.join('\n')
  return shortText !== fullText
})

// 原始段落，按换行符拆分
const normalizedParagraphs = computed(() => props.text.replace(/↵/g, '\n').split(/\r\n|\r|\n/))

// 拆分前 clamp 行
const computeDisplayLines = () => {
  const lines: string[] = []
  const maxCharsPerLine = Math.floor(props.maxWidth! / (props.fontSize! * 0.6))
  let totalLines = 0

  for (const para of normalizedParagraphs.value) {
    if (!para) {
      lines.push('')
      totalLines++
    } else {
      let start = 0
      while (start < para.length) {
        if (totalLines >= props.clamp!) break
        lines.push(para.slice(start, start + maxCharsPerLine))
        start += maxCharsPerLine
        totalLines++
      }
    }
    if (totalLines >= props.clamp!) break
  }
  displayLines.value = lines
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// /* 手动计算是否超出 */
// const handleTextHeightMath = () => {
//   nextTick(() => {
//     const query = Taro.createSelectorQuery()
//     query
//       .select('#textContent')
//       .boundingClientRect((rect) => {
//         if (rect) {
//           const maxHeight = props.lineHeight! * props.clamp!
//           isOverflow.value = rect.height > maxHeight
//         }
//       })
//       .exec()
//   })
// }

onMounted(() => {
  computeDisplayLines()
})
</script>

<style lang="scss">
.version-manage-text-box {
  line-height: 42px; /* 要和 props.lineHeight 保持一致 */
  font-size: 28px;
  word-break: break-word;
  position: relative;
  .h5-br {
    display: block;
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
