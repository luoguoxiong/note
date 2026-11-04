<template>
  <view v-for="(item, index) in list" class="search-result-application" :key="index" @click="handleClick(item)">
    <image class="search-result-application-icon" mode="aspectFill" :src="item.menuIcon" />
    <view class="search-result-application-text">
      <view>{{ item.keyword }}</view>
      <view>{{ item.keywordDescription }}</view>
    </view>
    <image
      class="search-result-application-arrow"
      mode="aspectFill"
      src="https://ic-img.ky-express.com/netc/20250730_6099_!!1753869420570_64_64.png"
    />
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useSearchContext } from '../../context'
import './application-list.scss'
import { openURL } from '@/modules/webview/utils'
import { report_CLK_event, report_EXP_event } from '@/public/utils'
import { useApplication } from '@/public/utils/application/useApplication'
import type { ApplicationItem } from '@/public/utils/application/applicationType'
import type { WebUserApplicationIndexSearchOut } from '../../api'

// defineOptions({ name: 'search-result-application' })

const context = useSearchContext()

const list = computed(() => context.state.search.application)

const handleClick = (item: Required<WebUserApplicationIndexSearchOut>['applicationInfoList'][number]) => {
  try {
    useApplication().navigateApplication({ menuName: item.menuName || item.keyword || '', ...item } as unknown as ApplicationItem)
  } catch (err) {
    // ignore
    console.error(err)
    openURL(item.loadAddress + item.routePath, { needLogin: true })
  }
  report_CLK_event('clk_home_search_card_v1', {
    event_code: 'clk_home_search_card_v1',
    page_code: 'page_home_head_v1',
    region_code: 'search_bar',
    event_name: '主页_首页搜索栏搜索结果_卡片_点击',
    region_name: '搜索栏',
    search_card: '应用',
    apply_name: item.keyword,
    work_id: context.state.workId,
  })
}

onMounted(() => {
  report_EXP_event('exp_home_search_card_display_v1', {
    page_code: 'page_home_head_v1',
    event_code: 'exp_home_search_card_display_v1',
    region_code: 'search_bar',
    event_name: '主页_首页搜索栏搜索结果_卡片_展示',
    region_name: '搜索栏',
    search_card: '应用',
    work_id: context.state.workId,
  })
})
</script>
