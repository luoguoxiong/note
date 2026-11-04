<template>
  <Content v-if="orderedCouponData.length > 0" :is-loading="isFetchingCoupon">
    <template v-slot:title>
      <span
        class="coupon-title"
        v-exposure-report="{
          eventCode: 'exp_homepage_coupon_area_v1',
          region_code: 'coupon_area',
        }"
      >
        专属权益
      </span>
    </template>
    <template v-slot:more>
      <More text="查看我的优惠券" :to-more="toMyCoupon"></More>
    </template>
    <template v-slot:content>
      <div class="coupon-body">
        <Coupon
          v-for="item in orderedCouponData"
          :key="item.id"
          :coupon-info="item"
          @invalid="handleCouponInvalid"
        ></Coupon>
      </div>
    </template>
  </Content>
  <Empty v-else-if="!isFetchingCoupon" :to-more="toMyCoupon"></Empty>
</template>
<script setup lang="ts">
import Content from '@/views/home/components/content/index.vue'
import More from '@/views/home/components/more/index.vue'
import Empty from './empty/index.vue'
import Coupon from './coupon/index.vue'
import { useHomeStore } from '@/hooks'
import { isCouponReadyToShip } from '@/apis/home'
import { computed, ref } from 'vue'
import { locationRouteV2 } from '@/utils/appBridge'

const { couponData, isFetchingCoupon } = useHomeStore()
const hiddenCouponIds = ref<Set<number>>(new Set())

// 主动领券优先于已经到账、可直接寄件的券；同一状态下保持接口原始顺序。
const orderedCouponData = computed(() => {
  return couponData.value
    .filter((item) => item.couponInfoList?.length && !hiddenCouponIds.value.has(item.id))
    .map((item, index) => ({ item, index }))
    .sort(
      (left, right) =>
        Number(isCouponReadyToShip(left.item)) - Number(isCouponReadyToShip(right.item)) || left.index - right.index
    )
    .map(({ item }) => item)
})

const handleCouponInvalid = (id: number) => {
  hiddenCouponIds.value = new Set(hiddenCouponIds.value).add(id)
}

const toMyCoupon = () => {
  locationRouteV2.push({
    path: '/admin/coupon',
    query: {
      needQuerySave: 'false',
    },
  })
}
</script>
<style lang="scss" scoped>
.coupon-title {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  img {
    width: 18px;
    height: 18px;
    margin-right: 4px;
  }
}
.coupon-body {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-gap: 16px;
}

@container home-left (max-width: 1055.99px) {
  .coupon-body {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
