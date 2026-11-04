<template>
  <component-preview :name="componentName" v-if="componentName" />
</template>
<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import ComponentPreview from './componentPreview.vue'

const { page } = useData() // 获取当前页面信息
const componentName = computed(() => {
  if (!page.value?.filePath.includes('components')) {
    return null
  }
  return getSafeComponentName(page.value)
})
// page.value 中可获取
console.log('page value', page)

const getSafeComponentName = (page: any): string | null => {
  if (!page) return null

  // 优先取文件名（稳定，不受 title 影响）
  const relativePath = page.relativePath || page.filePath || ''
  if (!relativePath) return null

  // 提取文件名部分（去掉路径和扩展名）
  const fileName = relativePath.split('/').pop()?.replace(/\.md$/, '')
  if (!fileName) return null
  return fileName.toLowerCase()
  // // 转换为驼峰式，首字母大写（如 list-virtual → ListVirtual）
  // return fileName
  //   .split(/[-_]/g) // 按 - 或 _ 分割
  //   .map(str => str.charAt(0).toLowerCase() + str.slice(1))
  //   .join('')
}
</script>



<style scoped>
.custom-right {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
  margin-bottom: 12px;
}
</style>
