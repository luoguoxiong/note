<template>
  <view class="waybill-search-page">
    <view class="page-waybill-head">
      <view class="page-waybill-search">
        <view class="page-waybill-search-input" @tap="handleShowSearchHistory" @touchstart="null">
          <ky-input placeholder="运单号/手机号/姓名/自定义编码/标签/托寄物" readonly></ky-input>
        </view>
        <view class="page-waybill-search-filter" @tap="handleShowSearchDrawer" @touchstart="null">
          <KyImage
            class="page-waybill-search-filter-icon"
            src="https://ic-img.ky-express.com/netc/20250116_83266203750_!!1737029006666_80_80.png"
          />
          <text class="page-waybill-search-filter-text">筛选</text>
        </view>
        <view class="page-waybill-head-menus">
          <ky-popover-menu
            :menus="[
              { label: '导出', icon: '', type: 1 },
              { label: '批量打印', icon: '', type: 2 },
            ]"
          >
            <template #reference>
              <view class="page-waybill-search-more">
                <KyImage
                  class="page-waybill-search-more-icon"
                  src="https://ic-img.ky-express.com/netc/20250118_25966203767_!!1737182567467_80_80.png"
                />
                <text class="page-waybill-search-more-text">更多</text>
              </view>
            </template>
          </ky-popover-menu>
        </view>
      </view>
      <view class="page-waybill-tabs"
        ><ky-tab :tabs="waybillStatusTabs" v-model="activeIndex" :distributeEvenly="false"></ky-tab
      ></view>
    </view>
    <view class="page-waybill-list">
      <view class="page-waybill-list-tips"></view>
      <ky-list></ky-list>
      <WaybillCard @tap="handleWaybillCardTap" @touchstart="null">
        <template #headLeft>
          <view class="waybill-card-number">运单号</view>
        </template>
        <template #headRight>
          <view class="waybill-card-head-right">
            <ky-tag size="5" bgColor="#FFF3E5" borderColor="#FFD194" textColor="#FF9300">网点自提</ky-tag>
            <view class="right-extra-btn">
              <KyImage src="https://ic-img.ky-express.com/netc/20250120_22566203766_!!1737339912002_48_48.png" />
              <text class="right-extra-btn-text">寄件码</text>
            </view>
          </view>
        </template>
        <!-- <template #cardInfoLeft>
          <view :style="{ flexShrink: 0 }">正在安排司机司机</view>
        </template> -->
        <!-- <template #cardContent>
          <view>123</view>
        </template> -->
        <template #cardBottom>
          <view class="waybill-card-bottom">
            <ky-popover-menu
              :menus="[
                { label: '导出', icon: '', type: 1 },
                { label: '批量打印', icon: '', type: 2 },
              ]"
            ></ky-popover-menu>
            <view class="waybill-card-bottom-right">
              <ky-button plain>通知收件人</ky-button>
              <ky-button plain>修改运单</ky-button>
              <ky-button plain>催取</ky-button>
            </view>
          </view>
        </template>
      </WaybillCard>
    </view>
    <!-- 搜索历史+联想弹窗 -->
    <SearchHistory v-model:searchHistoryVisible="searchHistoryVisible" />

    <!-- 筛选框抽屉 -->
    <SearchDrawer v-model:searchDrawerVisible="searchDrawerVisible"></SearchDrawer>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '@tarojs/taro'
import KyImage from '@order-public-sub-public/components/base/ky-image/index.vue'
import WaybillCard from '@order-public-sub-public/components/business/waybill-card/index.vue'
import SearchHistory from './components/search-history/index.vue'
import SearchDrawer from './components/search-drawer/index.vue'
import './index.scss'

// 搜索联想弹窗visible
const searchHistoryVisible = ref(false)
// 筛选抽屉
const searchDrawerVisible = ref(false)

// 运单状态tabs
const waybillStatusTabs = ref([
  {
    label: '待揽件',
    badgeCount: 0,
    id: 20,
  },
  {
    label: '待签收',
    badgeCount: 0,
    id: 30,
  },
  {
    label: '已签收',
    badgeCount: 4,
    id: 40,
  },
  {
    label: '全部',
    badgeCount: 0,
    id: 50,
  },
])

const activeIndex = ref(0) // 当前激活的索引

const handleShowSearchHistory = () => {
  searchHistoryVisible.value = true
}

const handleShowSearchDrawer = () => {
  searchDrawerVisible.value = true
}

const handleWaybillCardTap = () => {
  console.log('handleWaybillCardTap')
  navigateTo({
    url: '/modules/waybill-build/pages/waybill-route/index',
  })
}
</script>
