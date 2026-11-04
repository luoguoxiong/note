<template>
  <view class="search-history-list">
    <view class="search-history-list__title" v-if="list.length">
      <text>搜索历史</text>
      <image
        mode="aspectFit"
        class="search-history-list__title__cleanup"
        src="https://ic-img.ky-express.com/netc/20250716_11728_!!1752636002472_56_56.png"
        @tap="context.clearHistory"
      />
    </view>
    <scroll-view style="height: 100%; flex: 1" :scroll-y="true">
      <view class="search-history-list__content" v-if="list.length">
        <view
          class="search-history-list__item"
          v-for="item in filterList"
          :key="item.id"
          @tap.stop="handleQuickSearch(item)"
        >
          <view class="search-history-list__item-text">{{ item.searchKey }}</view>
          <image
            @tap.stop="context.removeHistory(item.id!)"
            class="search-history-list__item-clear"
            mode="aspectFit"
            src="https://ic-img.ky-express.com/netc/20250716_53968_!!1752635997359_56_56.png"
          />
        </view>
      </view>
      <view class="expand-content" v-if="list.length > 8">
        <view class="expand" @click="expand = !expand">
          <view class="text">{{ expand ? '收起' : '展开' }}</view>
          <img
            class="icon"
            :src="
              expand
                ? 'https://ic-img.ky-express.com/netc/20260430_17318_!!1777538107380_48_48.png'
                : 'https://ic-img.ky-express.com/netc/20260430_79876_!!1777538099574_48_48.png'
            "
            alt=""
          />
        </view>
      </view>
      <!-- 热门推荐 -->
      <view class="hot-recommend" v-if="!isH5FSEnv">
        <view class="hot-recommend__title">
          <img
            class="hot-icon"
            src="https://ic-img.ky-express.com/netc/20260430_55247_!!1777538824956_64_64.png"
            alt=""
          />
          <view class="text">热门推荐</view>
        </view>
        <view class="hot-recommend__list">
          <view
            class="hot-recommend__item"
            v-for="item in hotSearch"
            :key="item.searchKey"
            @tap.stop="hotRecommendClick(item)"
          >
            <img
              class="search-icon"
              src="https://ic-img.ky-express.com/netc/20260430_60661_!!1777539164554_56_56.png"
              alt=""
            />
            <view class="hot-recommend__item-text">{{ item.searchKey }}</view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useSearchContext } from '../../context'
import './index.scss'
import { isH5FSEnv } from '@/public/utils'
import { prodList, uatList } from './constants'
import { getEnvConfig } from '@/public/config'
import Taro from '@tarojs/taro'
import { openURL } from '@/modules/webview/utils'

defineOptions({ name: 'search-history-list' })
const emits = defineEmits(['search'])

const context = useSearchContext()

const expand = ref(false)

const hotSearch = computed(() => {
  const { isProd } = getEnvConfig()
  return isProd ? prodList : uatList
})

const list = computed(() => context.state.history)

const filterList = computed(() => {
  return expand.value ? list.value : list.value.slice(0, 8)
})

onMounted(() => {
  context.readHistory()
})

const handleQuickSearch = (item: any) => {
  emits('search', {
    keywordType: item.searchType,
    keyword: item.searchKey,
    searchFrom: 'history',
  })
}

const hotRecommendClick = (item: any) => {
  const { type, path } = item
  if (type === 0) {
    Taro.switchTab({ url: path })
  } else if (type === 1) {
    openURL(path, { needLogin: true })
  }
}
</script>
