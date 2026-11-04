<!-- 暂不使用 -->
<script setup lang="ts">
import { ref, onMounted, useAttrs } from 'vue'

/**
 * props 只声明必需的参数，其它属性透传
 */
const props = defineProps<{
  path: string
  title?: string
  description?: string
}>()

const attrs = useAttrs() // 拿到 title/description/path/其他未声明属性
const sourceCode = ref('')

/**
 * 使用 import.meta.glob 获取原始源码
 * 注意路径要和实际文件夹匹配
 */
const modules = import.meta.glob('../../../demos/**/*.vue', { as: 'raw' })

const loadSource = async (path: string) => {
  const importer = modules[`../../${path}`]
  if (importer) {
    sourceCode.value = await importer()
  } else {
    sourceCode.value = `文件不存在: ${path}`
  }
}

onMounted(() => {
  if (props.path) loadSource(props.path)
})
</script>

<template>
  <div class="code-preview">
<!--    <h4 v-if="attrs.title || props.title">{{ attrs.title || props.title }}</h4>-->
<!--    <p v-if="attrs.description || props.description">{{ attrs.description || props.description }}</p>-->
    <pre><code class="language-html">{{ sourceCode }}</code></pre>
  </div>
</template>

<style scoped>
.code-preview {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
  background: var(--vp-c-bg-soft);
  overflow-x: auto;
}
.code-preview pre {
  margin: 0;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>
