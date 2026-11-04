<template>
  <view class="industry-content">
    <view class="industry-content-title">行业解决方案</view>
    <view class="industry-content-desc">为您提供全行业定制化解决方案</view>
    <view
      class="industry-content-wrap"
      id="industry-content-exp"
      v-exposure
      :exposure-report="{
        eventCode: 'exp_homepage_industry_solutions_v1',
        otherParams: {
          page_code: 'page_homepage_v1',
          region_code: 'industry_solutions',
          region_name: '行业解决方案',
          event_name: '移动端新版首页_行业解决方案_曝光',
          page_name: '移动端新版首页',
          access_name: filterData.map((item) => item.title).join('、'),
        },
      }"
    >
      <view
        v-for="(item, index) in filterData"
        v-show="index < 4 || (showMore && index >= 4)"
        :key="item.title"
        class="industry-content-item"
        @click="handleDetail(item, index)"
      >
        <view class="industry-content-item-title">
          <view class="industry-content-item-title-text">{{ item.title }}</view>
          <ky-lazy-image
            :delay="500"
            class="arrow-icon"
            src="https://ic-img.ky-express.com/netc/20260408_67280_!!1775653064758_28_28.svg+xml"
            alt=""
          />
        </view>
        <view class="industry-content-item-desc">{{ item.subTitle }}</view>
        <ky-lazy-image
          :delay="500"
          :placeholder="''"
          class="industry-content-item-img"
          :src="item.coverImg"
        ></ky-lazy-image>
        <ky-lazy-image :delay="500" :placeholder="placeholder" class="industry-placeholder" :src="''"></ky-lazy-image>
      </view>
      <view class="show-more-wrap" v-if="industry.length > 4">
        <view class="show-more" @click="handleShowMore">
          <view class="show-more-text">{{ showMore ? '收起' : '展开更多' }}</view>
          <ky-lazy-image
            :delay="500"
            class="arrow-icon"
            :src="
              showMore
                ? 'https://ic-img.ky-express.com/netc/20260416_93896_!!1776348263476_24_24.svg+xml'
                : 'https://ic-img.ky-express.com/netc/20260408_74722_!!1775654390184_24_24.svg+xml'
            "
            alt=""
          />
        </view>
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { ref, computed, toRefs } from 'vue'
import './index.scss'
import { report_CLK_event } from '@/public/utils/reportUtil'
import placeholder from '@/layout/assets/images/industry-placeholder.png'
import { useHomeStore } from '@/layout/pages/home/store'
import Taro from '@tarojs/taro'
import { useExposureReport } from '@/public/hooks/useExposureReport'

useExposureReport(['industry-content-exp'])

const homeStore = useHomeStore()

const { data } = toRefs(homeStore)

const showMore = ref(false)

const industry = computed(() => {
  return data.value.industryInfo
})

const filterData = computed(() => {
  return data.value.industryInfo.slice(0, 6)
})

const handleDetail = (info, index) => {
  report_CLK_event('clk_homepage_industry_solutions_v1', {
    event_code: 'clk_homepage_industry_solutions_v1',
    page_code: 'page_homepage_v1',
    region_code: 'industry_solutions',
    region_name: '行业解决方案',
    event_name: '移动端新版首页_行业解决方案_点击',
    page_name: '移动端新版首页',
    access_name: info.title,
  })
  // TODO 跳转详情
  Taro.navigateTo({
    url: `/modules/tools/industry/index?activeTab=${index}`,
  })
}

const handleShowMore = () => {
  report_CLK_event('clk_homepage_industry_solutions_expand_v1', {
    event_code: 'clk_homepage_industry_solutions_expand_v1',
    page_code: 'page_homepage_v1',
    region_code: 'industry_solutions',
    region_name: '行业解决方案',
    event_name: `移动端新版首页_行业解决方案_${!showMore.value ? '展开' : '收起'}_点击`,
    page_name: '移动端新版首页',
    access_name: !showMore.value ? '展开' : '收起',
  })
  showMore.value = !showMore.value
}
</script>
