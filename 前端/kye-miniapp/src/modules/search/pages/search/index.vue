<template>
  <view
    id="common-search-page waybill-card-id page-waybill-head-menus-id"
    class="common-search-page waybill-search-page"
  >
    <view class="common-search-page__header">
      <!-- <image
        class="common-search-page__back"
        mode="aspectFit"
        src="https://ic-img.ky-express.com/netc/20250716_27876_!!1752632621162_80_80.png"
        @tap.stop="Taro.navigateBack()"
      /> -->
      <SearchInput
        @focus="handleFocus"
        @search="handleSearch"
        @update:keyword="handleUpdateKeyword"
        :keyword="state.keyword"
        :placeholder="placeholder"
      />
    </view>
    <view class="common-search-page__content">
      <view class="common-search-page__tips" v-if="currentView !== 'result'">
        <view class="common-search-page__tips-title">搜索范围：</view>
        <view class="marquee-container">
          <view
            :class="{
              'marquee-text': true,
              noquee: !isBindCode,
            }"
          >
            {{
              isBindCode
                ? '运单号 / 手机号 / 寄收人姓名 / 自定义编码 / 托寄物 / 寄收公司 / 寄收城市 / 标签 / 封装号 / 签回联 / 应用'
                : '运单号'
            }}
          </view>
        </view>
      </view>

      <SearchResult v-if="currentView === 'result'" />
      <RecommendList v-else-if="currentView === 'recommend'" @search="searchHasType" />
      <HistoryList v-else-if="currentView === 'history'" @search="searchHasType" />
    </view>
    <TaroToast />
    <IntelligentRecognition
      v-if="state.intelligentRecognitionData.showIntelligentRecognition"
      @updateCurrentView="currentView = 'result'"
    />
  </view>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { debounce } from 'lodash-es'
import { createSearchContext } from '../../context'
import SearchInput from '../../components/search-input/index.vue'
import HistoryList from '../../components/history-list/index.vue'
import RecommendList from '../../components/recommend-list/index.vue'
import SearchResult from '../../components/search-result/index.vue'

import Taro, { useDidShow, useShareAppMessage, useRouter } from '@tarojs/taro'

import { useRoleFlags } from '@/layout/pages/home/hooks/use-role-flags'
import { report_CLK_event } from '@/public/utils'
import TaroToast from '@public/components/base/toast/toast.vue'
import { getOnlineH5Url } from '@/modules/waybill-build/constants/externalLink'
import { getNotifyReceiveShareWx } from '@/public/hooks/useNotifyReceiveShare'
import IntelligentRecognition from '../../components/intelligentRecognition/index.vue'
import './index.scss'

useShareAppMessage((res) => {
  // TODO: 点击分享按钮先存waybillNumber 再获取
  const params = {
    onlineH5Url: getOnlineH5Url(),
  }
  const obj = getNotifyReceiveShareWx(res, params)
  console.error(obj)
  return obj
})

defineOptions({ name: 'SearchIndex' })

const context = createSearchContext()

const { isBindCode } = useRoleFlags()

// 别人的骚操作，
// to 后来人，
// 我来注释一下: 对象引用使用，所以这里进行赋值，会直接引用 context 的对象，
// state 赋值也会同时 赋值 context.state
const state = context.state

const currentView = ref('history')

const placeholder = ref('')

const handleFocus = () => {
  currentView.value = state.keyword ? 'recommend' : 'history'

  report_CLK_event('clk_homepage_search_bar_trigger_cursor_v1', {
    event_code: 'clk_homepage_search_bar_trigger_cursor_v1',
    page_code: 'page_home_head_v1',
    region_code: 'search_bar',
    event_name: '移动端端首页_触发光标_点击',
    region_name: '搜索栏',
  })
}

const searchHasType = debounce(async (item: any) => {
  const isHistorySearch = item?.searchFrom === 'history'
  if (isHistorySearch) {
    context.setWorkId()
  }
  state.keywordType = item?.keywordType
  if (item.recoType !== 2) {
    // 没命中AI识别功能
    state.keyword = item?.keyword
  }
  const searchSuccess = await context.onSearch(
    false,
    () => {
      currentView.value = 'result'
    },
    !isHistorySearch,
  )
  if (!searchSuccess) {
    return
  }
  if (!isHistorySearch) {
    return
  }
  report_CLK_event('clk_homepage_search_history_tag_v1', {
    page_code: 'page_home_head_v1',
    event_code: 'clk_homepage_search_history_tag_v1',
    region_code: 'search_bar',
    event_name: '移动端首页_查件历史标签_点击',
    region_name: '搜索栏',
    clk_content: item.keyword,
    type_name: '历史记录',
    search_keyword: item.keyword,
    search_intention: context.getCurrentSearchIntertion(item.keywordType),
    work_id: context.state.workId,
  })
  await context.afterSearchJump()
}, 200)

const handleSearch = debounce(async () => {
  try {
    if (!context.checkValidate(isBindCode.value ? '请输入运单信息/应用信息' : '请输入运单号')) {
      return
    }
    Taro.showLoading({ title: '搜索中...' })
    state.search.waybill = null
    await context.onSearch(isBindCode.value, () => {
      currentView.value = 'result'
    })
    Taro.hideLoading()
    report_CLK_event('clk_home_searchbar_v1', {
      page_code: 'page_home_head_v1',
      event_code: 'clk_home_searchbar_v1',
      region_code: 'search_bar',
      event_name: '移动端首页_搜索按钮_点击',
      region_name: '搜索栏',
      type_name: '搜索',
      search_keyword: state.keyword,
      work_id: context.state.workId,
    })
  } catch (error) {
    Taro.hideLoading()
    console.log('搜索>> error', error)
  }
}, 200)

const saveAndGetHistory = () => {
  context.onRecommend()
}
const debouncedRequestRecommend = debounce(saveAndGetHistory, 400)

const handleUpdateKeyword = (keyword: string) => {
  if (!keyword) {
    currentView.value = 'history'
  } else {
    currentView.value = 'recommend'
  }
  state.keywordType = '30'
  state.keyword = keyword
  debouncedRequestRecommend()
}

const isInit = ref<boolean>(true)

useDidShow(() => {
  Taro.hideShareMenu()
  if (isInit.value) return
  context.refreshAll()
})

onMounted(async () => {
  // 如果接受到参数进行查询
  const router = useRouter()
  if (router?.params?.keyword) {
    currentView.value = 'result'
    const decodeKeyword: string = decodeURIComponent(router?.params?.keyword)
    Taro.showLoading({ title: '加载中...' })
    await searchHasType({ keyword: decodeKeyword })
    isInit.value = false
  } else {
    isInit.value = false
  }
  if (router?.params?.placeholder) {
    // 在飞书环境中需要进行转码
    placeholder.value = decodeURIComponent(router?.params?.placeholder)
  }
  context.parsingCliboard()
})

useDidShow(() => {
  Taro.hideLoading()
})
</script>
