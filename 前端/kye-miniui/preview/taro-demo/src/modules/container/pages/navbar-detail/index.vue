<template>
  <ky-navbar
    leftText=""
    right-text=""
    :title="title"
    :showPlatList="showPlatList"
    :back-path="backPath"
    :leftArrow="leftArrow"
    @click-left="handleClickLeft"
    @click-right="handleClickRight"
    @click-title="handleClickTitle"
  >
    <template #right>
      <view style="display: flex; align-items: center; justify-content: center">
        <img
          src="https://ic-img.ky-express.com/netc/20230317_26163869242_!!1679035216961_64_64.png"
          style="width: 30px; height: 30px"
        />
        <ky-button>自定义右侧</ky-button>
      </view>
    </template>
  </ky-navbar>
  <view class="page-container">
    <view class="page-title">组件预览页- 详情页</view>
    <view class="page-desc">demo列表来自doc/demos目录vue单文件</view>
  </view>
</template>
<script setup lang="ts">
// @ts-ignore
import { ref } from 'vue'

const backPath = ref('/pages/index/index')
const title = ref('标题内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容')
const leftArrow = ref(true)
const showPlatList = ['wx', 'h5']

const handleClickLeft = () => {
  console.log('handleClickLeft')
}

const handleClickRight = () => {
  console.log('handleClickRight')
}

const handleClickTitle = () => {
  console.log('handleClickTitle')
}
</script>

<style lang="scss">
.page-container {
  padding: 60px 30px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
}

.page-desc {
  color: #c9c9c9;
}

.component-lists {
  margin-top: 60px;
  &-picker {
    view {
      border: 1px solid red;
    }
  }
}
</style>
