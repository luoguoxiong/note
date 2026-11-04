<template>
  <view
    class="partner"
    id="company_cooperation"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_company_cooperation_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        region_code: 'company_cooperation',
        event_name: '移动端新版首页_合作企业_信息曝光',
        region_name: '合作企业',
      },
    }"
  >
    <view class="partner-top">
      <view class="partner-top-one">
        <text class="blue-text-fw"><text class="font-34">120万+</text></text>
        企业的共同选择
      </view>
      <view class="partner-top-two">
        <text class="blue-text">70,122</text>
        吨日均寄件量
      </view>
    </view>

    <view class="partner-bottom-content">
      <ky-lazy-image
        class="partner-bottom-bg"
        src="https://ic-img.ky-express.com/netc/20260409_9344_!!1775700460525_750_144.png"
      ></ky-lazy-image>
      <view class="partner-bottom-scroll" v-for="(row, index) in rows" :key="index">
        <view class="partner-bottom-scroll-wrap">
          <view class="partner-bottom-scroll-row" :class="{ offset: index % 2 === 1 }">
            <view class="partner-bottom-scroll-item" v-for="(item, i) in row" :key="`row-${index}-item-${i}`">
              <ky-lazy-image :src="getImg(item)" isDelay :delay="1000" />
            </view>

            <view class="partner-bottom-scroll-item" v-for="(item, i) in row" :key="`row-${index}-clone-${i}`">
              <ky-lazy-image :src="getImg(item)" isDelay :delay="1000" />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import './index.scss'
import { useExposureReport } from '@/public/hooks/useExposureReport'

useExposureReport(['company_cooperation'])
// 工具函数：生成数据
const createRow = (prefix: string, count: number) => Array.from({ length: count }, (_, i) => `${prefix}-${i + 1}`)

// 数据统一管理
const rows = [createRow('1', 5), createRow('2', 5)]

// 图片路径函数（避免模板里写字符串拼接）
const getImg = (name: string) => `https://ic-img-test.ky-express.com/20250911cmsbak/${name}.png`
</script>
