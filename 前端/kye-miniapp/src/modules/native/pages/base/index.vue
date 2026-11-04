<template>
  <view></view>
</template>
<script setup lang="ts">
import { useRouter, useDidShow } from '@tarojs/taro'
import { chooseImage, getLocation, scanCode, getClipboardData, openFile } from './utils'
import { ref } from 'vue'
import { sleep } from '@/public/utils'
let { params } = useRouter() as any

const taskKey = params.taskKey || 'native-001'

const taskMethod = params.taskMethod as 'chooseImage' | 'getLocation' | 'scanCode' | 'getClipboardData' | 'openFile'
const data = JSON.parse(decodeURIComponent(params.data))

const shouldExecute = ref(true)

useDidShow(async () => {
  if (taskMethod === 'scanCode' && shouldExecute.value) {
    shouldExecute.value = false
    await sleep(600)
    scanCode(data, taskKey)
  }
})

switch (taskMethod) {
  case 'chooseImage':
    chooseImage(data, taskKey)
    break
  case 'getLocation':
    getLocation(data, taskKey)
    break
  // case 'scanCode':
  //   scanCode(data, taskKey)
  //   break
  case 'getClipboardData':
    getClipboardData(data, taskKey)
    break
  case 'openFile':
    openFile(data, taskKey)
    break
}
</script>
