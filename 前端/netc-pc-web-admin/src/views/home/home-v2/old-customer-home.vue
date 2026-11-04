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

/** 老客首页左侧模块（自上而下） */
const leftModuleCodes: ParentModuleCode[] = [
  ParentModuleCode.HOME_PAGE_BANNER, // banner广告栏
  ParentModuleCode.HOME_PAGE_SEARCH_BAR,
  ParentModuleCode.HOME_PAGE_WAYBILL_STAT, // 运单统计
  ParentModuleCode.HOME_PAGE_TODO_LIST, // 待办事项
  ParentModuleCode.HOME_PAGE_EXCLUSIVE_INTEREST, // 专属权益
  ParentModuleCode.PAY_FOR_DESIPTETTIME, // 预存运费
  ParentModuleCode.RECOMMON_CARD,
]

/** 老客首页右侧模块（自上而下），已关注公众号（isCandidate 为 true）时不展示跨越公众号模块 */
const rightModuleCodes = computed<ParentModuleCode[]>(() => {
  const codes: ParentModuleCode[] = [
    ParentModuleCode.HOME_PAGE_GREETING, // 问候卡片
    ParentModuleCode.HOME_PAGE_COMMON_FUNCTION, // 常用功能
    ParentModuleCode.MARKETING_CARD, // 营销卡片
    ParentModuleCode.HOME_PAGE_LATEST_MESSAGE, // 最新消息
  ]
  if (!homeStore.isCandidate) {
    codes.push(ParentModuleCode.KYE_OFFICIAL_ACCOUNTS) // 跨越公众号
  }
  return codes
})
</script>
