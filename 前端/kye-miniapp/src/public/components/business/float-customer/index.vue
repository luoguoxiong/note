<template>
  <view v-if="isShowOnline">
    <FloatPanel ref="ball" class="online-wrap__floatpanel" :topLimit="80">
      <view class="online-wrap">
        <image
          class="online-service"
          src="https://ic-img.ky-express.com/default/20250823_20937_!!1755940933006_248_256.png"
          mode="aspectFit"
          @tap.stop.prevent="onOnlineService"
        />
        <view class="ad-bottom">
          <image
            class="ad-close"
            @tap="isShowOnline = false"
            src="https://ic-img.ky-express.com/netc/20250730_48195_!!1753868754306_80_80.png"
          ></image>
        </view>
      </view>
    </FloatPanel>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Taro from '@tarojs/taro'
import FloatPanel from '@public/components/base/float-panel/index.vue'

// 在线客服
const props = defineProps({
  isShowClose: {
    type: Boolean,
    default: false,
  },
  waybillNumber: {
    type: String,
    default: '',
  },
})

const ballX = ref(-1000)
const ballY = ref(-1000)
const isShowOnline = ref(false)

const ball = ref(null)

function getPosition() {
  // 延迟执行，确保节点渲染完成
  setTimeout(() => {
    const query = Taro.createSelectorQuery()
    query
      .select('.online-wrap')
      .boundingClientRect((rect) => {
        if (rect) {
          const { windowWidth, windowHeight } = Taro.getSystemInfoSync()
          ballX.value = windowWidth - rect.width - 10
          ballY.value = windowHeight - rect.height - 100
        }
      })
      .exec()
  }, 100)
}

/** 在线客服 */
function onOnlineService() {
  // Taro.navigateTo({ url: `/modules/webview/pages/online-service/index?paramsNum=${props.waybillNumber}&type=reminder` })
  Taro.navigateTo({ url: `/modules/webview/pages/online-service/index?paramsNum=${props.waybillNumber}&type=''` })
}

function handleClose() {
  isShowOnline.value = false
}

onMounted(() => {
  setTimeout(() => {
    isShowOnline.value = true
    getPosition()
  }, 600)
})

// 如果你有屏幕折叠状态，可以用 watch 或监听 Taro 事件
// watch(() => isDoubleFoldScreen.value, () => {
//   getPosition();
// });
</script>

<style lang="scss">
.online-wrap__floatpanel {
  z-index: 88;
}
.online-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  .ad-close {
    width: 40px;
    height: 40px;
    display: block;
    margin: 16px auto 0;
  }

  .online-service {
    position: relative;
    z-index: 999;
    width: 124rpx;
    height: 128rpx;
  }
}

.online-close-wrap {
  width: 64rpx;
  height: 64rpx;
  text-align: center;
}
.online-close {
  width: 36rpx;
  height: 36rpx;
  box-sizing: border-box;
  border: 1px solid #ffffff;
  margin-top: 10rpx;
}
</style>
