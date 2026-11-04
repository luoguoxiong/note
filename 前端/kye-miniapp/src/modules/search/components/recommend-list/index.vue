<template>
  <view class="recommend-loading" v-show="loading">
    <image
      class="loading-icon"
      src="https://ic-img.ky-express.com/netc/20260112_8352_!!1768199489942_56_56.png"
    ></image>
    <view class="loading-text">{{ loadingText }}</view>
  </view>
  <view class="search-recommend-list" v-if="list.length && !loading">
    <view class="search-recommend-list__title">猜你想找</view>
    <scroll-view enable-flex :scroll-y="true" class="search-recommend-list__content">
      <view
        @tap="handleQuickSearch(item)"
        class="search-recommend-list__item"
        v-for="item in list"
        :key="item.keyword! + item.keywordType"
      >
        <image
          class="search-recommend-list__item-icon"
          mode="aspectFit"
          src="https://ic-img.ky-express.com/netc/20250716_51062_!!1752636786890_64_64.png"
        />
        <view class="search-recommend-list__item-text">
          <HighlightText
            class="search-recommend-list__item-text-hightlight"
            :text="item.keyword"
            :highlight="formatHighlight(item, context.state.keyword)"
          />
        </view>
        <view class="search-recommend-list__type" v-if="item.keywordType">{{ keywordType.get(item.keywordType) }}</view>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useSearchContext } from '../../context'
import HighlightText from '../highlight-text/index.vue'
import './index.scss'
import { report_CLK_event } from '@/public/utils'

defineOptions({ name: 'search-recommend-list' })

const context = useSearchContext()
const list = computed(() => context.state.recommend)
const loading = computed(() => context.state.recommendLoading)
const loadingText = computed(() => context.state.recommendLoadingText)

// 搜索关键字类型
const keywordType = new Map([
  ['10', '运单号'],
  ['20', '订单号'],
  ['30', '手机号'],
  ['40', '自定义编码'],
  ['50', '封装号'],
  ['60', '标签'],
  ['70', '寄收公司'],
  ['80', '寄收公司'],
  ['90', '部门'],
  ['100', '应用'],
  ['110', '托寄物'],
  ['120', '姓名'],
  ['130', '收件城市'],
  ['140', '签回联'],
  ['131', '寄件城市'],
])

const emits = defineEmits(['search'])
const handleQuickSearch = (item: any) => {
  report_CLK_event('clk_home_searchresult_v1', {
    page_code: 'page_home_head_v1',
    event_code: 'clk_home_searchresult_v1',
    region_code: 'search_bar',
    event_name: '移动端首页_首页搜索栏搜索结果_点击',
    region_name: '搜索栏',
    clk_content: item.keyword,
    type_name: '猜你想找',
    search_keyword: item.keyword,
    work_id: context.state.workId,
  })

  if (context.isSpecialSearchIntent(item)) {
    return context.handleSpecialSearchIntent(item)
  }

  emits('search', item)
}

const formatHighlight = (item: any, keyword: string) => {
  if (item.recoType === 2) {
    const appName = item.keyword.split('】')[0] + '】'
    return appName
  }
  return keyword
}
</script>
