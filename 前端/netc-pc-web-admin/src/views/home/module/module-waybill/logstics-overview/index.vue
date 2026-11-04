<template>
  <div
    id="logstics-content"
    v-exposure-report="{
      eventCode: 'exp_homepage_waybill_overview_v1',
      region_code: 'waybill_overview',
    }"
  >
    <div class="overview">
      <div class="overview-title">物流概况</div>
      <div id="overview-content" class="logstics-count">
        <div
          class="overview-item"
          v-click-report="{
            eventCode: 'clk_homepage_waybill_overview_type_v1',
            region_code: 'waybill_overview',
            otherParams: () => {
              return { type: '待通知取货' }
            },
          }"
          @click="linkToWaybill(logisticsOverview?.notifyPickupUrl, logisticsOverview?.notifyPickupSource)"
        >
          <div class="overview-item-title">
            待通知取货
            <KIcon class="title-arrow" :size="8"><ArrowRightGrey /></KIcon>
          </div>
          <AdaptiveNumber
            class="overview-count"
            :value="logisticsOverview?.notifyPickupCount || 0"
            :max-size="32"
            :min-size="18"
            :line-height="34"
          />
        </div>
        <div
          class="overview-item"
          v-click-report="{
            eventCode: 'clk_homepage_waybill_overview_type_v1',
            region_code: 'waybill_overview',
            otherParams: () => {
              return { type: '待揽件' }
            },
          }"
          @click="linkToWaybill(logisticsOverview?.pendingItemsUrl, logisticsOverview?.pendingItemsSource)"
        >
          <div class="overview-item-title">
            待揽件
            <KIcon class="title-arrow" :size="8"><ArrowRightGrey /></KIcon>
          </div>
          <AdaptiveNumber
            class="overview-count"
            :value="logisticsOverview?.pendingItemsCount || 0"
            :max-size="32"
            :min-size="18"
            :line-height="34"
          />
        </div>
        <div
          class="overview-item"
          v-click-report="{
            eventCode: 'clk_homepage_waybill_overview_type_v1',
            region_code: 'waybill_overview',
            otherParams: () => {
              return { type: '待签收' }
            },
          }"
          @click="linkToWaybill(logisticsOverview?.signUrl, logisticsOverview?.signSource)"
        >
          <div class="overview-item-title">
            待签收
            <KIcon class="title-arrow" :size="8"><ArrowRightGrey /></KIcon>
          </div>
          <AdaptiveNumber
            class="overview-count"
            :value="logisticsOverview?.signCount || 0"
            :max-size="32"
            :min-size="18"
            :line-height="34"
          />
        </div>
        <div
          class="overview-item"
          v-click-report="{
            eventCode: 'clk_homepage_waybill_overview_type_v1',
            region_code: 'waybill_overview',
            otherParams: () => {
              return { type: '已签收' }
            },
          }"
          @click="linkToWaybill(logisticsOverview?.signedUrl, logisticsOverview?.signedSource)"
        >
          <div class="overview-item-title">
            已签收
            <KIcon class="title-arrow" :size="8"><ArrowRightGrey /></KIcon>
          </div>
          <AdaptiveNumber
            class="overview-count"
            :value="logisticsOverview?.signedCount || 0"
            :max-size="32"
            :min-size="18"
            :line-height="34"
          />
        </div>
      </div>
    </div>
    <div class="today-info">
      <div class="today-path">
        <img
          class="today-path-image"
          src="https://ic-img.ky-express.com/netc/20260901_15039_!!1788226678660_20_280.png"
          alt=""
        />
      </div>
      <div class="today-container">
        <div class="today-title">
          <div class="title-border">今日揽收概况</div>
        </div>
        <div class="today-content">
          <div class="today-item">
            <span class="totay-item-title">待揽件运单：</span>
            <AdaptiveNumber
              class="today-count"
              :value="receivingOverview?.pendingReceiveCount || 0"
              :max-size="22"
              :min-size="16"
              :line-height="24"
            />
            <span
              class="to-look"
              v-click-report="{
                eventCode: 'clk_homepage_waybill_overview_todaypickup_type_v1',
                region_code: 'waybill_overview',
                otherParams: () => {
                  return { type: '待揽件' }
                },
              }"
              @click="linkToWaybill(receivingOverview?.pendingReceiveUrl, receivingOverview?.pendingReceiveSource)"
              >查看
              <svg-icon name="right-ky"></svg-icon>
            </span>
          </div>
          <div class="today-item">
            <span class="totay-item-title">待签收运单：</span>
            <AdaptiveNumber
              class="today-count"
              :value="receivingOverview?.pendingSignCount || 0"
              :max-size="22"
              :min-size="16"
              :line-height="24"
            />
            <span
              class="to-look"
              v-click-report="{
                eventCode: 'clk_homepage_waybill_overview_todaypickup_type_v1',
                region_code: 'waybill_overview',
                otherParams: () => {
                  return { type: '待签收' }
                },
              }"
              @click="linkToWaybill(receivingOverview?.pendingSignUrl, receivingOverview?.pendingSignSource)"
              >查看
              <svg-icon name="right-ky"></svg-icon>
            </span>
          </div>
          <img
            class="package-image"
            src="https://ic-img.ky-express.com/netc/20260901_14223_!!1788226674286_181_124.png"
            alt=""
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { KIcon } from '@netc-design-pc/ui'
import { ArrowRightGrey } from '@netc-design-pc/icons'
import { useHomeStore } from '@/hooks'
import { locationRouteV2 } from '@/utils/appBridge'
import { baseReportInstance } from '@/reportUmp'
import AdaptiveNumber from '../components/adaptive-number.vue'

const { receivingOverview, logisticsOverview } = useHomeStore()

const linkToWaybill = (path: string, source?: number) => {
  // 后端未下发跳链(如角色无权限场景)时不跳转，避免 push({ path: undefined }) 报错
  if (!path) return
  sessionStorage.setItem('click_id', baseReportInstance.get('click_id'))
  // path 为后端下发、可能自带 query(如 /admin/waybill-v3?source=homePage&...)，
  // path 内嵌 query 由 locationRouteV2 统一拆出并入显式 query
  locationRouteV2.push({
    path,
    query: {
      needQuerySave: 'false',
      pre_click_id: baseReportInstance.get('click_id'),
      // 今日揽收概况的角色状态，与跳链中 waybillCustomerSource 一致；0 为合法值，仅在字段存在时拼接
      ...(source !== undefined ? { waybillCustomerSource: String(source) } : {}),
    },
  })
}
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
