<template>
  <!-- 代收人修改记录弹窗 -->
  <ky-popup
    :show="show"
    :closeOnClickOverlay="false"
    safeAreaInsetBottom
    position="bottom"
    @click="show = false"
    class="receiver-ky-popup"
  >
    <view class="receiver-pop-history-title">
      代收人修改记录
      <image
        src="https://ic-img.ky-express.com/netc/20250604_67972831178_!!1749044998243_56_56.png"
        @tap="show = false"
      />
    </view>
    <scroll-view scroll-y="true" :enableFlex="true" class="receiver-pop-history-content" :style="height">
      <view class="receiver-pop-history-content-wrap">
        <view
          v-for="(item, index) in list"
          :key="`receiver-pop-history-item-${index}`"
          class="receiver-pop-history-item"
        >
          <view
            ><label>修改内容：</label><text>{{ item.content || '--' }}</text></view
          >
          <view
            ><label>修改时间：</label><text>{{ item.operateTime || '--' }}</text></view
          >
          <view
            ><label>修改人：</label><text>{{ item.operateMobile || '--' }}</text></view
          >
          <view
            ><label>说明：</label><text>{{ item.operateDesc || '--' }}</text></view
          >
        </view>
      </view>
      <view class="re-loading" v-if="loading">
        <ky-loading size="large">加载中</ky-loading>
      </view>
    </scroll-view>
  </ky-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { queryProxyPickupRecords, type IQueryProxyPickupRecords } from '@public/apis/pop'
import Taro from '@tarojs/taro'

const show = ref<boolean>(false)
const loading = ref<boolean>(false)
const list = ref<IQueryProxyPickupRecords[]>([])
const height = computed(() => {
  return { height: `360rpx` }
})
const openDialog = (waybillNumber: string) => {
  list.value = []
  show.value = true
  loading.value = true
  // Taro.showLoading({ title: '加载中' })
  queryProxyPickupRecords({ waybillNumber })
    .then((res) => {
      list.value = res.data.rows || []
      if (list.value.length) {
        show.value = true
      } else {
        Taro.showToast({ title: '无代收人修改记录', icon: 'none' })
      }
    })
    .finally(() => {
      Taro.hideLoading()
      loading.value = false
    })
}
defineExpose({
  openDialog,
})
</script>

<style lang="scss">
.receiver-ky-popup {
  z-index: 1000 !important;
}
.receiver-pop-history-title {
  padding: 26px 32px;
  font-size: 34px;
  font-weight: 600;
  line-height: 42px;
  color: #24262b;
  box-sizing: border-box;
  border-bottom: 1px solid #e6e8ed;
  display: flex;
  align-items: center;
  justify-content: space-between;

  image {
    width: 32px;
    height: 32px;
  }
}

.receiver-pop-history-content {
  overflow-y: auto;
  box-sizing: border-box;
  min-height: 428px;
  max-height: calc(90vh - 96px);

  .receiver-pop-history-content-wrap {
    padding: 16px 24px;
  }

  .receiver-pop-history-item {
    padding: 24px;
    border-radius: 16px;
    border: 2px solid #e6e8ed;
    box-sizing: border-box;

    view {
      font-size: 28px;
      line-height: 40px;
      display: flex;
      align-items: baseline;

      label {
        flex-shrink: 0;
        color: #8c8f99;
      }

      text {
        color: #24262b;
        word-break: break-all;
      }
    }

    view + view {
      margin-top: 8px;
    }
  }

  .receiver-pop-history-item + .receiver-pop-history-item {
    margin-top: 16px;
  }
}
.re-loading {
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
