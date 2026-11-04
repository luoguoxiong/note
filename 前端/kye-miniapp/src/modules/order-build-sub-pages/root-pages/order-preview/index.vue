<template>
  <div class="preview-page">
    <Order :route="route" :data="schema" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, ref, computed, watch } from 'vue'
import Order from '../order/index.vue'
import { Schema } from '@order-public-sub-public/types'
import { isProdPreviewRoute } from '@order-public-sub-public/utils/route'
import { useStore } from '@order-public-sub-public/store'
import { OrderPageType } from '@order-public-sub-public/constants'
import { mockData } from './mockData'
const piniaStore = useStore()

const route = OrderPageType.预览

const schema = ref<Schema>()
const dataRef = reactive<Schema>({
  layout: [],
  module: {},
  data: {},
  config: {},
})
const isProdPreviewStyle = computed(() => (isProdPreviewRoute() ? '' : 'none'))

const handleMessage = (event: any) => {
  const receivedData = event.data
  try {
    if (typeof receivedData === 'string') {
      const jsonData = JSON.parse(receivedData)
      console.log('receivedData update', jsonData)
      dataRef.layout = jsonData.layout
      schema.value = jsonData
    }
  } catch (error) {
    schema.value = {
      layout: [],
      module: {},
      data: {},
      config: {},
    }
    console.error('数据格式解析出错', error)
  }
}

// 添加滚动 条样式
const addScrollStyle = () => {
  const style = document.createElement('style')
  style.id = 'preview_page_style'
  style.innerHTML = `
    ::-webkit-scrollbar {
      display: none;
      width: 0;
    }
  `
  document.head.appendChild(style)
}
// 去除滚动条样式
const removeScrollStyle = () => {
  const style = document.getElementById('preview_page_style')
  if (style) {
    document.head.removeChild(style)
  }
}

const componentList = computed(() => piniaStore.globalData.componentList)
watch(
  () => componentList.value,
  (val) => {
    // 预览页面不需要管控校验
    if (val?.length > 0) {
      piniaStore.globalData.resetComponentList(undefined)
    }
  },
)

onMounted(async () => {
  // 本地调试用这个数据(对应的是EAM: 这里的data; "iframeRef.contentWindow.postMessage(JSON.stringify(data), this.iframeSrc)")
  if (location.hostname === 'localhost') {
    handleMessage({ data: JSON.stringify(mockData) })
  } else {
    window.addEventListener('message', handleMessage)
  }
  // 预览页面去掉滚动条
  addScrollStyle()
  const app = document.querySelector('#app')
  app && app.classList.add('autoHeight')
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
  removeScrollStyle()
  const app = document.querySelector('#app')
  app && app.classList.remove('autoHeight')
})
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
.preview-page {
  pointer-events: v-bind(isProdPreviewStyle);
  overflow: scroll;
  &::scrollbar-button {
    display: none;
  }

  /* 轨道 */
  ::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }

  /* 滑块 */
  ::-webkit-scrollbar-thumb {
    background-color: #888;
  }

  /* 滑块悬停状态 */
  ::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
}
</style>
