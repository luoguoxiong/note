<template>
  <view
    :class="[
      'coupon-card',
      {
        'coupon-card--single': single,
        'coupon-card--disabled': disabled,
        'coupon-card--pack': isPack,
      },
    ]"
  >
    <!-- 合并角标「共 X 张」 -->
    <view v-if="badgeText" class="coupon-card__badge">{{ badgeText }}</view>

    <!-- 券包卡（领券多张）：紫渐变整卡 + 小券横排 + 渐变右区（DSL：多类型） -->
    <template v-if="isPack">
      <view class="coupon-card__pack-list">
        <template v-for="(coupon, index) in packList" :key="coupon.activityId || index">
          <!-- 小券间连接区：CSS 绘制(竖虚线 + 白底紫⊕) -->
          <view
            v-if="index > 0"
            :class="['coupon-card__pack-connector', `coupon-card__pack-connector--${index === 1 ? 'a' : 'b'}`]"
          >
            <view class="coupon-card__pack-plus"></view>
          </view>
          <view
            :class="[
              'coupon-card__pack-item',
              `coupon-card__pack-item--${index}`,
              { 'coupon-card__pack-item--pair': packList.length === 2 },
            ]"
          >
            <view class="coupon-card__pack-amount-row">
              <template v-if="DISCOUNT_RELIEF_FORMS.includes(Number(coupon.reliefForm)) && coupon.discountRate != null">
                <text class="coupon-card__pack-amount">{{ formateDiscount(Number(coupon.discountRate)) }}</text>
                <text class="coupon-card__pack-unit">折</text>
              </template>
              <template v-else>
                <text class="coupon-card__pack-unit">¥</text>
                <text class="coupon-card__pack-amount">{{ coupon.amount }}</text>
              </template>
            </view>
            <view class="coupon-card__pack-type-row">
              <text class="coupon-card__pack-type">{{ formatCouponType(coupon.reliefForm!) }}</text>
              <view v-if="coupon.ticketNumber" class="coupon-card__pack-count">x{{ coupon.ticketNumber }}</view>
            </view>
          </view>
        </template>
      </view>
      <!-- 右区：撕边矢量切图 + 浅紫渐变按钮区（DSL：矢量45 + 容器49746） -->
      <view class="coupon-card__pack-right">
        <image class="coupon-card__pack-torn" :src="packTornEdge" mode="scaleToFill" />
        <view class="coupon-card__pack-right-inner">
          <ky-button
            type="primary"
            :disabled="buttonDisabled"
            :class="[
              'coupon-card__button',
              {
                'coupon-card__button--loading': receiveLoading,
                'coupon-card__button--disabled': disabled,
              },
            ]"
            @tap.stop="handleTap"
          >
            <text class="coupon-card__button-text">{{ buttonText }}</text>
          </ky-button>
        </view>
        <image v-if="stampSrc" class="coupon-card__stamp" :src="stampSrc" />
      </view>
    </template>

    <template v-else>
      <view class="coupon-card__left">
        <!-- 下单券 -->
        <template v-if="card.kind === 'order'">
          <view class="coupon-card__amount-row">
            <template v-if="isDiscountCard">
              <text class="coupon-card__amount">{{ card.discount }}</text>
              <text class="coupon-card__unit">折</text>
            </template>
            <template v-else>
              <text class="coupon-card__unit">¥</text>
              <text class="coupon-card__amount">{{ card.amount }}</text>
            </template>
            <view class="coupon-card__tag">{{ card.displayType }}</view>
          </view>
          <view class="coupon-card__desc">{{ card.desc }}</view>
        </template>

        <!-- 免单券（DSL 类型=免单券）：红色大标题 + 免单范围描边标签 + CRM 文案 -->
        <template v-else-if="card.kind === 'free'">
          <view class="coupon-card__amount-row">
            <text class="coupon-card__freetitle">免单券</text>
            <view v-if="card.scopeTag" class="coupon-card__tag coupon-card__tag--scope">{{ card.scopeTag }}</view>
          </view>
          <view class="coupon-card__desc">{{ card.mergedText }}</view>
        </template>

        <!-- 领券单张：现有展示逻辑 -->
        <template v-else>
          <view class="coupon-card__amount-row">
            <template v-if="isReceiveDiscount">
              <text class="coupon-card__amount">{{ formateDiscount(Number(receiveCoupon!.discountRate)) }}</text>
              <text class="coupon-card__unit">折</text>
            </template>
            <template v-else>
              <text class="coupon-card__unit">¥</text>
              <text class="coupon-card__amount">{{ receiveCoupon!.amount }}</text>
            </template>
            <view class="coupon-card__tag">{{ formatCouponType(receiveCoupon!.reliefForm!) }}</view>
          </view>
          <view class="coupon-card__desc">{{ receiveCoupon!.couponDesc }}</view>
        </template>
      </view>

      <!-- 虚线连接区：CSS 绘制(竖虚线 + 上下内凹圆遮挡) -->
      <view class="coupon-card__divider" />

      <view class="coupon-card__right">
        <ky-button
          type="primary"
          :disabled="buttonDisabled"
          :class="[
            'coupon-card__button',
            {
              'coupon-card__button--loading': receiveLoading,
              'coupon-card__button--disabled': disabled,
            },
          ]"
          @tap.stop="handleTap"
        >
          <text class="coupon-card__button-text">{{ buttonText }}</text>
        </ky-button>

        <!-- 已领取/已失效印章（仅领券卡） -->
        <image v-if="stampSrc" class="coupon-card__stamp" :src="stampSrc" />
      </view>
    </template>
  </view>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue'
import { DISCOUNT_RELIEF_FORMS } from './coupon-card'
import type { CouponCard, ReceiveView } from './coupon-card'
import { formatCouponType, formateDiscount } from './formatter'
import './coupon-card-item.scss'

/** 印章/撕边素材走 CDN（与项目既有券背景图同域名） */
const stampReceived = 'https://ic-img.ky-express.com/netc/20261012_5372_!!1791769974754_192_192.png'
const stampInvalid = 'https://ic-img.ky-express.com/netc/20261012_6598_!!1791769974752_192_192.png'
const packTornEdge = 'https://ic-img.ky-express.com/netc/20261012_23257_!!1791769974749_40_236.png'

defineOptions({ name: 'coupon-card-item' })

const props = defineProps({
  card: { type: Object as PropType<CouponCard>, required: true },
  /** 仅 1 张卡时整行铺满 */
  single: Boolean,
  receiveData: {
    type: Object as PropType<ReceiveView>,
    default: () => ({ list: [], total: 0 }),
  },
  receiveLoading: Boolean,
})

const emit = defineEmits<{
  (e: 'receive'): void
  (e: 'ship', card: CouponCard): void
}>()

const isReceive = computed(() => props.card.kind === 'receive')

/** 券包卡：领券列表多张（DSL 多类型卡） */
const isPack = computed(() => isReceive.value && props.receiveData.list.length > 1)

/** 券包小券：DSL 三张及以上取前 3 张 */
const packList = computed(() => props.receiveData.list.slice(0, 3))

const disabled = computed(() => isReceive.value && !!props.receiveData.invalidated)

const isDiscountCard = computed(() => {
  const c = props.card
  return c.kind === 'order' && c.discount !== undefined && c.discount !== null
})

/** 领券单卡首张券（映射层已保证 receive 卡 list 非空，此处仅取视图数据） */
const receiveCoupon = computed(() => props.receiveData.list[0])

const isReceiveDiscount = computed(() => DISCOUNT_RELIEF_FORMS.includes(Number(receiveCoupon.value?.reliefForm)))

const buttonText = computed(() => {
  if (!isReceive.value) return '立即寄件'
  // 交互说明 280:582230 场景一:已领取态按钮为「去寄件」(与线上老逻辑一致)
  return props.receiveData.isGet ? '去寄件' : '立即领取'
})

const buttonDisabled = computed(() => (isReceive.value && (props.receiveLoading || disabled.value)) || false)

const badgeText = computed(() => {
  const c = props.card
  if (c.kind === 'order' && c.count > 1) return `共${c.count}张`
  if (c.kind === 'receive' && props.receiveData.total > 1) return `共${props.receiveData.total}张`
  return ''
})

const stampSrc = computed(() => {
  if (!isReceive.value) return ''
  if (props.receiveData.invalidated) return stampInvalid
  if (props.receiveData.isGet) return stampReceived
  return ''
})

const handleTap = () => {
  if (isReceive.value) {
    emit('receive')
    return
  }
  emit('ship', props.card)
}
</script>
