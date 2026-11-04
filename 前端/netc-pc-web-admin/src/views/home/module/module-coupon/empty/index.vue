<template>
  <div
    class="content"
    v-exposure-report="{
      eventCode: 'exp_homepage_coupon_area_v1',
      region_code: 'coupon_area',
    }"
  >
    <div class="title">
      <div class="title-left">
        <span class="coupon-title">专属权益</span>
        <span class="empty-desc">暂无活动，敬请期待</span>
      </div>
      <More text="查看我的优惠券" :to-more="toMore"></More>
    </div>
  </div>
</template>

<script setup lang="ts">
import More from '@/views/home/components/more/index.vue'

interface EmptyProps {
  toMore: () => void
}
defineProps<EmptyProps>()
</script>

<style lang="scss" scoped>
.content {
  margin-top: 8px;
  height: 64px;
  padding: 20px 24px;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
}
.title,
.title-left {
  display: flex;
  align-items: center;
}
.title {
  justify-content: space-between;
  height: 24px;
}
.title-left {
  gap: 8px;
}
.coupon-title {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
}
.empty-desc {
  font-size: 13px;
  color: rgba(104, 107, 117, 1);
  font-weight: 400;
}
</style>
