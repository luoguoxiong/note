<template>
  <component :is="currentDemo" />
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
// import demoComponents from '@/utils/demo-loader'
import { demoComponents } from '@/utils/demoImport'
import { useRouter } from '@tarojs/taro'

console.log('demoComponents>>>', demoComponents)

const { params } = useRouter()
console.log('route params', params)
const demoName = params?.name as string
console.log('demoName>>>', demoName)
// const currentDemoInfo = demoComponents.find(d => d.name === demoName)
const currentDemoInfo = demoComponents.find((d) => d.componentName === demoName)
console.log('currentDemoInfo', currentDemoInfo)
const currentDemo = currentDemoInfo.component
console.log('currentDemoInfo', currentDemoInfo)
// const currentDemo = defineAsyncComponent(currentDemoInfo.component)
</script>
