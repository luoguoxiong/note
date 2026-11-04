<template>
  <ky-container v-bind="pageOptions" class="teplatepngpage">
    <img :src="url" mode="widthFix" class="teplatepngpage-content" />
  </ky-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from '@order-public-sub-public/vue-router/index'

const pageOptions = ref({
  navBarOptions: {
    showPlatList: [],
    title: '打印面单',
  },
  scrollOptions: {
    scrollViewPlatList: ['wx', 'alipay'],
  },
  toolOptions: {
    isHideShareMenu: true,
  },
  errorCheck: {
    // 监听弱网状态变化事件
    // onNetworkWeakChange: ({ errMsg, networkType, weakNet }) => {
    //   console.log('networkWeakChange', `${weakNet ? '弱网' : ''}`)
    // },
  },
})

const route = useRoute()
const url = ref('')
onMounted(() => {
  url.value =
    (route.query.pngurl as string) ||
    'https://ic-img.ky-express.com/netc/20240419_68948541690_!!1713512637166_1578_11048.png'
})
</script>
<style lang="scss">
.teplatepngpage {
  width: 100vw;
  height: 100vh !important;
  background-color: #ffffff;
  overflow: auto;
  overflow-x: hidden;

  .teplatepngpage-content {
    width: 105vw;
    height: auto;
    object-fit: cover;
  }
}
</style>
