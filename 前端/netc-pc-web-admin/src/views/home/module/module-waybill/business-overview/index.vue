<template>
  <div id="buisness-content">
    <div class="buisness-title-wrap">
      <span class="title">
        <span
          style="margin-right: 8px"
          v-exposure-report="{
            eventCode: 'exp_homepage_business_overview_v1',
            region_code: 'business_overview',
          }"
          >公司业务概况</span
        >
        <KSelect
          v-show="homeStatus.activeTab"
          :model-value="homeStatus?.activeTab"
          @change="changeTab"
          :teleported="false"
          :options="homeStatus.businessLables"
        />
      </span>
      <More :to-more="toMore"></More>
    </div>
    <div class="buisness-inner">
      <div class="total-wrap business-count">
        <div class="total-item">
          <span class="total-item-title">总票数：</span>
          <AdaptiveNumber
            class="total-item-count"
            :value="activeData?.totalVotes || 0"
            :max-size="28"
            :min-size="18"
            :line-height="40"
            :font-weight="700"
          />
        </div>
        <div class="total-item">
          <span class="total-item-title">总件数：</span>
          <AdaptiveNumber
            class="total-item-count"
            :value="activeData?.totalPieces || 0"
            :max-size="28"
            :min-size="18"
            :line-height="40"
            :font-weight="700"
          />
        </div>
      </div>
      <div class="chart-wrap">
        <Chart></Chart>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import More from '@/views/home/components/more/index.vue'
import Chart from '../chart/index.vue'
import { KSelect } from '@netc-design-pc/ui'
import { useHomeStore } from '@/hooks/useHomeStore'
import { computed } from 'vue'
import dayjs from 'dayjs'
import { locationRouteV2 } from '@/utils/appBridge'
import { baseReportInstance } from '@/reportUmp'
import AdaptiveNumber from '../components/adaptive-number.vue'

const { businessOverview, homeStatus, updateBusinessOverviewTab } = useHomeStore()

const activeData = computed(() => {
  return (businessOverview.value || []).find((item) => item.type === homeStatus.value.activeTab)
})

const changeTab = (tab: 1 | 2 | 3) => {
  const tabEnum = {
    1: '作为寄方',
    2: '作为收方',
    3: '作为付款方',
  }
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_business_overview_change_role_v1',
    },
    {
      region_code: 'business_overview',
      role_name: tabEnum[tab],
    }
  )
  updateBusinessOverviewTab(tab)
}

const toMore = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_business_overview_view_more_v1',
    },
    {
      region_code: 'business_overview',
    }
  )
  sessionStorage.setItem('click_id', baseReportInstance.get('click_id'))
  const url = activeData.value?.viewMoreUrl
  // 后端未下发跳链时不跳转，避免 push({ path: undefined }) 报错
  if (!url) return
  // url 为后端下发、自带 query(如 /admin/bi-analytics?dateTime=...&role=1)，
  // path 内嵌 query 由 locationRouteV2 统一拆出并入显式 query
  locationRouteV2.push({
    path: url,
    query: {
      // 每次点击生成唯一 URL，强制 iframe 重建、子应用重新查询，防止同 URL 命中缓存
      timeStamp: `${dayjs().unix()}`,
      needQuerySave: 'false',
      pre_click_id: baseReportInstance.get('click_id'),
    },
  })
}
</script>
<style lang="scss">
.buisness-title-wrap {
  .el-select {
    width: 118px !important;
  }
  // element-plus 2.5+ 新版 select 结构，实际高度由 .el-select__wrapper 的 min-height: 32px 决定
  .el-select__wrapper {
    min-height: 30px !important;
    height: 30px !important;
    padding-top: 3px !important;
    padding-bottom: 3px !important;
  }
}
</style>
<style scoped lang="scss">
@import './index.scss';
</style>
