<template>
  <div class="coupon-item" :class="{ 'special-bg': +item?.showBack === 10 }">
    <div :class="{ 'use-coupon': true, 'cover-opacity': !isCanUse }">
      <SvgIcon name="check-disable-icon" class="use-coupon-select" v-if="!isCanUse" />

      <SvgIcon name="check-icon" class="use-coupon-select" v-else-if="(item || {}).isSelect" @click="selected" />
      <SvgIcon name="no-check-icon" class="use-coupon-select" @click="selected" v-else />
      <div class="use-coupon__mold">
        <div class="use-coupon__mold-content">
          <div class="use-coupon__mold-content-unit" v-if="isViewUnit((item || {}).couponTitle)">¥</div>
          <div class="use-coupon__mold-content-money">{{ setTitle((item || {}).couponTitle) }}</div>
          <div class="use-coupon__mold-content-unit discount" v-if="isViewCouponUnit((item || {}).couponTitle)">折</div>
          <div class="use-coupon__mold-content-name" v-if="(item || {}).couponTypeDesc">
            {{ (item || {}).couponTypeDesc }}
          </div>
          <div class="use-coupon__mold-content-expired" v-if="(item || {}).remainDaysEnd">
            {{ (item || {}).remainDaysEnd }}
          </div>
        </div>
        <div class="use-coupon__mold-desc gobi-font-color">
          {{ (item || {}).couponDesc }}
        </div>
      </div>
      <div class="use-coupon__parting-line" v-if="isShowSepLine">
        <img
          src="https://ic-img.ky-express.com/netc/20250619_47965_!!1750314609458_1358_2.png"
          class="use-coupon__parting-line-semicircle"
        />
      </div>
      <div class="use-coupon__detail">
        <div class="use-coupon__detail-content">
          <div class="use-coupon__detail-content-time gobi-font-color">
            有效期：{{ (item || {}).validStart }}-{{ (item || {}).validEnd }}
          </div>
          <div class="use-coupon__detail-content-code gobi-font-color">
            券编码：{{ (item || {}).couponCode }}
            <SvgIcon name="copy-icon" v-copy="(item || {}).couponCode" />
          </div>
        </div>
        <div class="use-coupon__detail-desc gobi-color-detail" @click="toggle">
          <span>详情</span>
          <SvgIcon name="arrowDown-icon" class="use-coupon__detail-desc-add-service-down" v-if="spreed" />
          <SvgIcon name="arrowUp-icon" class="use-coupon__detail-desc-add-service-down" v-else />
        </div>
      </div>
    </div>
    <div
      :class="{ 'coupon-detail': true, 'cover-opacity': !isCanUse }"
      v-if="!spreed && item?.descDetailList && item?.descDetailList?.length > 0"
    >
      <div v-for="(text, index) in item.descDetailList" :key="index" class="coupon-detail__list">
        <div class="coupon-detail__list-circle"></div>
        <div class="coupon-detail__list-desc">
          <span>{{ text }}</span>
        </div>
      </div>
    </div>
    <div class="driver" v-if="!isCanUse"></div>
    <div class="coupon-not-detail bg-opacity-special" v-if="!isCanUse">
      <div class="coupon-not-detail-reason-title-wrap">
        <SvgIcon name="tips-warn" class="coupon-not-detail-warn-icon" />
        <span> 不可用原因： </span>
        <!-- <div v-for="res in item.unusableDescList" :key="res" class="coupon-not-detail-reason-content">{{ res }}</div> -->
      </div>
      <div class="coupon-not-detail-reason-content-wrap">
        <div>
          <div v-for="res in item.unusableDescList" :key="res" class="coupon-not-detail-reason-content">
            {{ res }}
          </div>
        </div>
        <div v-if="+item.couponType === 30" class="coupon-not-detail-contact" @click="openContact && openContact()">
          <img
            class="coupon-not-detail-contact-icon"
            src="https://ic-img.ky-express.com/netc/20250619_6093_!!1750300560568_144_144.png"
          />
          联系商务
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import vCopy from '@order-public-sub-public/directives/copy'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { isViewUnit, isViewCouponUnit, setTitle } from '../../utils'

const props = defineProps({
  type: {
    type: String,
    default: 'canUse',
  },
  item: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: 0,
  },
  isShowSepLine: {
    type: Boolean,
    default: true,
  },
  openContact: {
    type: Function,
  },
  closeContact: {
    type: Function,
  },
})
const emit = defineEmits(['select'])
const spreed = ref(true)
const isCanUse = computed(() => props.type === 'canUse')

const selected = () => {
  emit('select', props.index)
}

const toggle = () => {
  spreed.value = !spreed.value
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
