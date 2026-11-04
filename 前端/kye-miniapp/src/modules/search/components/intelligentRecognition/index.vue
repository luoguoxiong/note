<template>
  <ky-popup
    v-model:show="context.state.intelligentRecognitionData.showIntelligentRecognition"
    position="center"
    content-class="intelligent-recognition-popup"
    :closeOnClickOverlay="false"
  >
    <view class="content">
      <view class="header-wrap">
        <image
          class="header-bg"
          src="https://ic-img.ky-express.com/netc/20260617_95377_!!1781662535471_1244_364.png"
        ></image>
      </view>
      <view class="header">智能识别</view>
      <view class="main">
        <view class="cliboard-text" @click="handleShowAll">
          <view :class="['text', { expanded: showAll }]" id="cliboard-text">{{
            context.state.intelligentRecognitionData.cliboardText
          }}</view>
          <view class="text-height-checker" id="cliboard-text-checker">{{
            context.state.intelligentRecognitionData.cliboardText
          }}</view>
          <view class="btn" v-if="!isShowAll">
            <text>展开</text>
            <image
              class="icon"
              src="https://ic-img.ky-express.com/netc/20260617_59925_!!1781663595026_48_48.png"
            ></image>
          </view>
        </view>
        <view class="title">基于以上粘贴板内容获取，可点击查询：</view>
        <scroll-view :scroll-y="true" class="cliboard-list">
          <view
            v-for="(item, index) in context.state.intelligentRecognitionData.cliboardList"
            :key="item.content + index"
            class="cliboard-list-item"
            @click="handleQuery(item)"
          >
            <view class="item-text">{{ item.content }}</view>
            <ky-button type="primary" class="btn">查询</ky-button>
          </view>
        </scroll-view>
        <view class="no-longer-show">
          <view class="no-longer-show-content" @click="isSelect = !isSelect">
            <image
              class="icon"
              :src="
                isSelect
                  ? 'https://ic-img.ky-express.com/netc/20260617_94356_!!1781696342976_56_56.png'
                  : 'https://ic-img.ky-express.com/netc/20260617_12444_!!1781696335956_56_56.png'
              "
            ></image>
            <view class="text">{{ context.state.intelligentRecognitionData.noRemindDesc }}</view>
          </view>
        </view>
      </view>
    </view>
    <view class="close-icon-wrapper" @click="handleClose">
      <image
        class="close-icon"
        src="https://ic-img.ky-express.com/netc/20260617_16555_!!1781699072510_128_128.png"
      ></image>
    </view>
  </ky-popup>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import Taro from '@tarojs/taro'
import { useSearchContext } from '../../context'
import './index.scss'
import { useRoleFlags } from '@/layout/pages/home/hooks'
import { report_CLK_event, report_EXP_event } from '@/public/utils/reportUtil'

const context = useSearchContext()
const { isBindCode } = useRoleFlags()

const emit = defineEmits(['updateCurrentView'])

const showAll = ref(false)
const isTextOverflow = ref(false)
const isSelect = ref(false)

const isShowAll = computed(() => {
  if (!isTextOverflow.value) return true
  return showAll.value
})

const checkTextOverflow = async () => {
  await nextTick()
  Taro.createSelectorQuery()
    .select('#cliboard-text')
    .boundingClientRect()
    .select('#cliboard-text-checker')
    .boundingClientRect()
    .exec((res) => {
      if (res && res[0] && res[1]) {
        isTextOverflow.value = res[1].height > res[0].height + 2
      }
    })
}

const handleShowAll = () => {
  showAll.value = true
}

const handleClose = () => {
  console.log('close')
  context.state.intelligentRecognitionData.showIntelligentRecognition = false
  context.state.keyword = context.state.intelligentRecognitionData.cliboardText
  report_CLK_event('clk_homepage_recognize_close_v1', {
    page_code: 'page_home_head_v1',
    page_name: '首页顶部搜索页',
    event_code: 'clk_homepage_recognize_close_v1',
    event_name: '主页_首页搜索栏_智能识别搜索结果_点击关闭',
    region_code: 'search_bar',
    region_name: '搜索栏',
    work_id: context.state.workId,
    button_name: isSelect.value ? '勾选' : '不勾选',
  })
  if (isSelect.value) {
    context.noRemind()
  }
}

const handleQuery = async (item: { content: string; type: number }) => {
  context.state.searchFromAi = true
  context.state.search.waybill = null
  context.state.keyword = item.content
  Taro.showLoading({ title: '搜索中...' })
  if (item.type === 20) {
    await context.onSearchByAi(isBindCode.value, () => {
      emit('updateCurrentView')
    })
  } else {
    await context.onSearch(isBindCode.value, () => {
      emit('updateCurrentView')
    })
  }
  context.state.intelligentRecognitionData.showIntelligentRecognition = false
  Taro.hideLoading()
  report_CLK_event('clk_homepage_recognize_search_v1', {
    page_code: 'page_home_head_v1',
    page_name: '首页顶部搜索页',
    event_code: 'clk_homepage_recognize_search_v1',
    event_name: '主页_首页搜索栏_智能识别搜索结果_点击查询',
    region_code: 'search_bar',
    region_name: '搜索栏',
    work_id: context.state.workId,
    type_name: '智能识别',
    search_keyword: item.content,
  })
}

const reportExposure = () => {
  context.setWorkId()
  report_EXP_event('exp_homepage_recognize_v1', {
    page_code: 'page_home_head_v1',
    page_name: '首页顶部搜索页',
    event_code: 'exp_homepage_recognize_v1',
    event_name: '主页_首页搜索栏_智能识别搜索结果_曝光',
    region_code: 'search_bar',
    region_name: '搜索栏',
    work_id: context.state.workId,
  })
}

onMounted(() => {
  checkTextOverflow()
  reportExposure()
})

watch(
  () => context.state.intelligentRecognitionData.cliboardText,
  () => {
    showAll.value = false
    checkTextOverflow()
  },
)
</script>
