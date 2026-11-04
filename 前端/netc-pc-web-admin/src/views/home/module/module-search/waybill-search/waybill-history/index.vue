<template>
  <div class="history">
    <div class="title" v-if="data.length > 0">
      <span class="text">查件历史</span>
      <span @click="clearHistory">清空</span>
    </div>
    <div class="list-wrap" v-if="data.length > 0">
      <div class="list-item" v-for="item in data" :key="item.id" @click="toHistory(item)">
        {{ item.searchKey }}
      </div>
    </div>
    <div class="hot-content">
      <img src="https://ic-img.ky-express.com/netc/20260430_55247_!!1777538824956_64_64.png" />
      <span>热门推荐</span>
    </div>
    <div class="recommend-list">
      <div class="list-item" v-for="item in recommendList" :key="item.name" @click="toHot(item.path)">
        <img src="https://ic-img.ky-express.com/netc/20260430_60661_!!1777539164554_56_56.png" alt="" />
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { WaybillHistoryIn } from '@/apis/home/types'
import { baseReportInstance } from '@/reportUmp'
import { uuid } from '@/utils'
interface WaybillHistoryProps {
  data: WaybillHistoryIn[]
}
const emit = defineEmits(['toHistory', 'clearHistory', 'toHot'])

defineProps<WaybillHistoryProps>()

const recommendList = [
  {
    name: '运单查询・查看路由',
    path: '/admin/waybill-v3',
  },
  {
    name: '每日签到・领取积分',
    path: '/admin/points-center',
  },
  {
    name: '运费时效・一键查询',
    path: '/admin/query',
  },
  {
    name: '违禁物品・自助查询',
    path: '/admin/contraband',
  },
  {
    name: '全国寄件・网点查询',
    path: '/admin/site-query',
  },
]

const toHistory = (searchKey: WaybillHistoryIn) => {
  baseReportInstance.add('work_id', uuid())
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_search_history_tag_v1',
    },
    {
      region_code: 'search_bar',
      region_name: '搜索栏',
      page_code: 'page_homepage_v1',
      event_name: '客户端首页_查件历史标签_点击',
      clk_content: searchKey.searchKey,
      type_name: '历史记录',
      work_id: baseReportInstance.get('work_id'),
    }
  )
  emit('toHistory', searchKey)
}

const toHot = (path: string) => {
  emit('toHot', path)
}

const clearHistory = () => {
  emit('clearHistory')
}
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
