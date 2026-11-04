<template>
  <Content :is-loading="isLoading">
    <template v-slot:title>
      <span class="title">
        <span class="text">运单统计</span>
        <span class="fred-data">(近60天数据)</span>
      </span>
    </template>
    <template v-slot:more>
      <Refresh :to-refresh="toRefresh" v-if="toRefresh"></Refresh>
    </template>
    <template v-slot:content>
      <div :style="`height: ${minHeight}px`" id="content-wrap">
        <ErrorRefresh v-if="homeStatus.businessIsFail" @refresh="toRefresh"></ErrorRefresh>
        <slot name="logstics"></slot>
        <slot name="business"></slot>
      </div>
    </template>
  </Content>
</template>
<script setup lang="ts">
import Refresh from '@/views/home/components/refresh/index.vue'
import Content from '@/views/home/components/content/index.vue'
import ErrorRefresh from '@/components/error-refresh/index.vue'
// import { SubModuleCode } from '@/apis/home/types'
import { computed } from 'vue'
import { useHomeStore } from '@/hooks'
const { homeStatus, showLogistics, showBusiness } = useHomeStore()

// 内容区最小高度：物流概况 140 + 业务概况 243 + 间距 16，按实际展示的模块计算
const minHeight = computed(() => {
  let height = 0
  if (showLogistics.value) {
    height += 140
  }
  if (showBusiness.value) {
    height += showLogistics.value ? 243 + 16 : 243
  }
  return height
})

interface WaybillContentProps {
  toRefresh?: () => void
  isLoading?: boolean
}
defineProps<WaybillContentProps>()
</script>
<style lang="scss" scoped>
.title {
  display: flex;
  align-items: center;
  height: 26px;
  .text {
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
  }
}
.fred-data {
  margin-left: 4px;
  font-size: 13px;
  color: rgba(104, 107, 117, 1);
  font-weight: 400;
  line-height: 20px;
}
#content-wrap {
  & > :nth-child(2) {
    margin-top: 16px;
  }
}

:deep(#content-icon) {
  height: 26px;
}
</style>
