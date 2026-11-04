<template>
  <view class="industry-info">
    <view class="industry-info-title">行业解决方案</view>

    <scroll-view
      :scroll-x="true"
      enhanced
      :show-scrollbar="false"
      style="white-space: nowrap"
      enable-flex
      :class="{
        'web-scrollbar': isH5Pc,
      }"
      className="func-swiper"
    >
      <view
        className="func-item"
        :id="`func-item-exp-${index}`"
        v-exposure
        :exposure-report="{
          eventCode: 'exp_homepage_industry_solutions_v1',
          otherParams: {
            page_code: 'page_homepage_v1',
            region_code: 'industry_solutions',
            event_name: '移动端新版首页_行业解决方案_入口曝光',
            region_name: '行业解决方案',
            aaccess_name: item.title,
          },
        }"
        :key="item.title"
        v-for="(item, index) in industryInfo"
        @click="toDetail(item)"
      >
        <view className="func-title">{{ item.title }}</view>
        <view className="func-content">
          <network-image :src="item.coverImg" className="func-icon"></network-image>
          <view className="func-desc">{{ item.subTitle }}</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>
<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import './index.scss'
import { useHomeStore } from '../../store'
import { toRichTextPage } from '@/public/utils/rich'
import { reportIndustryInfoClick } from '../../report'
import { isH5Pc } from '@/public/utils'
import { useExposureReport } from '@/public/hooks/useExposureReport'

useExposureReport(['func-item-exp-0', 'func-item-exp-1', 'func-item-exp-2', 'func-item-exp-3', 'func-item-exp-4'])

const homeStore = useHomeStore()

const { data } = toRefs(homeStore)

const industryInfo = computed(() => data.value.industryInfo.slice(0, 5))

const toDetail = (info) => {
  reportIndustryInfoClick({ access_name: info.title })
  toRichTextPage(info)
}
</script>
