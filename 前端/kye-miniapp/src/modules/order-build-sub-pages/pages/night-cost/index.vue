<template>
  <div class="night-cost-container">
    <div class="night-cost-text">
      <div class="night-cost-text-first">1、货好时间为贵司已备好货物时间，跨越小哥上门后可顺利取货</div>
      <div>2、夜间取货费</div>
      <div>
        <div class="night-cost-marker">
          <text class="night-cost-marker-icon"></text>为满足夜间寄件需求，提升服务体验，跨越速运提供夜间收件服务。
        </div>
        <div class="night-cost-marker">
          <text class="night-cost-marker-icon"></text><rich-text :nodes="`收费标准&服务时间`"></rich-text>
        </div>
      </div>
    </div>
    <div class="night-cost-detail" v-if="nightCost?.feeSectionList?.length">
      <div class="night-cost-item night-cost-top">
        <div class="night-cost-header">开始时间</div>
        <div class="night-cost-header">结束时间</div>
        <div class="night-cost-header">价格</div>
      </div>
      <div class="night-cost-item" v-for="item in nightCost?.feeSectionList" :key="item.beginTime">
        <div class="night-cost-start">{{ item.beginTime }}</div>
        <div class="night-cost-end">{{ item.endTime }}</div>
        <div class="night-cost-price">{{ item.price }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getNightCostDetail } from '@order-public-sub-public/apis/waybill/estimated-cost'
import { useLoad } from '@tarojs/taro'
import { ref } from 'vue'
const nightCost = ref({
  feeSectionList: [],
})

useLoad((query) => {
  getDetail(query.batchId)
})
const getDetail = async (batchId) => {
  const { data } = await getNightCostDetail({}, { batchId })
  nightCost.value = data
}
</script>
<style lang="scss">
@import './index.scss';
</style>
