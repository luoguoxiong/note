<template>
  <ky-container
    v-bind="pageOptions"
    @click-left="handleClickLeft"
    @click-right="handleClickRight"
    @click-title="handleClickTitle"
    @scroll="onScroll"
    @scrolltolower="onScrollLower"
    @scrolltoupper="onscrolltoupper"
    @containerInit="onContainerInit"
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
    <view class="page-container">
      <view class="page-title">组件预览页- 详情页</view>
      <view class="page-desc">demo列表来自doc/demos目录vue单文件</view>
      <view v-for="item in [1, 2, 3, 4]" :key="item" class="container-view-item">
        <view>{{ item }}</view>
      </view>
    </view>
  </ky-container>
</template>
<script setup lang="ts">
// @ts-ignore
import { ref } from 'vue'
import Taro from '@tarojs/taro'

const pageOptions = ref({
  navBarOptions: {
    showPlatList: ['wx', 'alipay', 'h5'],
    title: '自定义导',
    leftText: '左',
    backPath: '/pages/index/index',
    beforeBack: () => {
      return new Promise((resolve) => {
        Taro.showModal({
          title: '提示',
          content: '这是一个模态弹窗',
          success: function (res) {
            if (res.confirm) {
              resolve(true)
            } else if (res.cancel) {
              resolve(false)
            }
          },
        })
      })
    },
  },
  toolOptions: {
    isHideShareMenu: true,
  },
  errorCheck: {
    // 监听弱网状态变化事件
    onNetworkWeakChange: ({ errMsg, networkType, weakNet }) => {
      console.log('networkWeakChange', `${weakNet ? '弱网' : ''}`, errMsg, networkType)
    },
  },
})

const handleClickLeft = () => {
  console.log('container navbar handleClickLeft')
}

const handleClickRight = () => {
  console.log('container navbar handleClickRight')
}

const handleClickTitle = () => {
  console.log('container navbar handleClickTitle')
}
// 可选-scroll监听
const onScroll = () => {
  // console.log('onScroll container-demo e', e)
}
// 可选-scroll到底部监听
const onScrollLower = (e) => {
  console.log('onScrollLower container-demo e', e)
}
// 可选-scroll到顶部监听
const onscrolltoupper = (e) => {
  console.log('onscrolltoupper container-demo e', e)
}
// container初始化页面回调
const onContainerInit = (value: any) => {
  console.log('onContainerInit', value?.networkType, value?.navAppHeaderHeight)
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

.container-view-item {
  width: 100%;
  height: 500px;
  background-color: gray;
  margin: 10px 0;
}
</style>
