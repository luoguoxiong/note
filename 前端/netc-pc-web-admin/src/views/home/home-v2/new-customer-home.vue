<template>
  <Layout>
    <template v-slot:left>
      <component v-for="code in leftModuleCodes" :key="code" :is="modules[code].component"></component>
    </template>
    <template v-slot:right>
      <component v-for="code in rightModuleCodes" :key="code" :is="modules[code].component"></component>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Layout from '../components/layout/index.vue'
import { modules } from '../module'
import { ParentModuleCode } from '@/apis/home/types'
import { useHomeStore } from '@/stores/home'

const homeStore = useHomeStore()

/** 新客首页左侧模块（自上而下） */
const leftModuleCodes: ParentModuleCode[] = [
  ParentModuleCode.HOME_PAGE_BANNER, // banner广告栏
  ParentModuleCode.HOME_PAGE_SEARCH_BAR,
  ParentModuleCode.NEW_CUSTOMER_CARD, // 新客户卡片
  ParentModuleCode.NEW_CUSTOMER_SEARCH, // 新客户搜索
  // ParentModuleCode.HOME_PAGE_EXCLUSIVE_INTEREST, // 专属权益
  ParentModuleCode.HOME_PAGE_ABOUT, // 关于跨越
  ParentModuleCode.INDUSTRY_INFO, // 行业解决方案
]

/** 新客首页右侧模块（自上而下），已关注公众号（isCandidate 为 true）时不展示跨越公众号模块 */
const rightModuleCodes = computed<ParentModuleCode[]>(() => {
  const codes: ParentModuleCode[] = [
    ParentModuleCode.HOME_PAGE_GREETING, // 问候卡片
    ParentModuleCode.NEW_CUSTOMER_COMMON, // 新客户推荐功能
    ParentModuleCode.WHY_CHOOSE_KYE, // 为什么选择跨越
  ]
  if (!homeStore.isCandidate) {
    codes.push(ParentModuleCode.KYE_OFFICIAL_ACCOUNTS) // 跨越公众号
  }
  return codes
})
</script>
