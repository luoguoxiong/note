<template>
  <div
    id="new-customer-card"
    class="new-customer-card"
    v-exposure-report="{
      eventCode: 'exp_homepage_new_customer_card_v1',
      region_code: 'new_customer_card',
    }"
  >
    <!-- 步骤条 -->
    <div class="step-bar">
      <div
        v-for="(step, index) in steps"
        :key="step.key"
        :class="['step-item', { active: currentStep >= index + 1, done: currentStep > index + 1 }]"
      >
        <div class="step-circle">
          <span>{{ index + 1 }}</span>
        </div>
        <div class="step-label">{{ step.label }}</div>
        <div
          v-if="index < steps.length - 1"
          class="step-line"
          :style="{
            '--step-line-img': `url(${STEP_LINE_IMG})`,
            '--step-arrow-img': `url(${STEP_ARROW_IMG})`,
          }"
        >
          <div class="step-line-body" />
          <div class="step-line-arrow" />
        </div>
      </div>
    </div>

    <div class="card-body">
      <div class="card-content">
        <!-- 状态一：开通企业账号 -->
        <template v-if="!hasApplied">
          <div class="title">开通企业账号，解锁专属服务方案</div>
          <div class="feature-list">
            <div class="feature-item">
              <img class="feature-icon" :src="FEATURE_ICON_1" alt="" />
              <span class="feature-text">7×24小时响应</span>
            </div>
            <div class="feature-item">
              <img class="feature-icon" :src="FEATURE_ICON_2" alt="" />
              <span class="feature-text">企业专属报价</span>
            </div>
            <div class="feature-item">
              <img class="feature-icon" :src="FEATURE_ICON_3" alt="" />
              <span class="feature-text">全程管家式服务</span>
            </div>
          </div>
          <div class="btn-group">
            <KButton
              v-click-report="{
                eventCode: 'clk_homepage_new_customer_open_v1',
                region_code: 'new_customer_card',
                button_name: '开通企业账号',
              }"
              class="btn btn-primary"
              @click="handleOpenAccount"
            >
              <span>开通企业账号</span>
              <img v-if="hasCouponActivity" class="badge" :src="BADGE_IMG" alt="新客专享" />
            </KButton>
            <KButton
              type="default"
              plain
              v-click-report="{
                eventCode: 'clk_homepage_new_customer_bind_v1',
                region_code: 'new_customer_card',
                button_name: '已有账号去绑码',
              }"
              class="btn btn-secondary"
              @click="handleBindCode"
            >
              已有账号，去绑码
            </KButton>
          </div>
        </template>

        <!-- 状态二：已提交申请 -->
        <template v-else>
          <div class="title">您的申请已提交！距离开启企业寄件仅差一步</div>
          <div class="subtitle">您的专属商务将尽快与您联系提供客户编码。如需加急处理，欢迎随时联系我们</div>
          <div class="btn-group">
            <KButton
              v-click-report="{
                eventCode: 'clk_homepage_new_customer_contact_v1',
                region_code: 'new_customer_card',
                button_name: '联系商务',
              }"
              class="btn btn-primary"
              @click="handleContactBusiness"
            >
              联系商务
            </KButton>
            <KButton
              type="default"
              plain
              v-click-report="{
                eventCode: 'clk_homepage_new_customer_bind_v1',
                region_code: 'new_customer_card',
                button_name: '绑定客户编码',
              }"
              class="btn btn-secondary"
              @click="handleBindCode"
            >
              绑定客户编码
            </KButton>
          </div>
        </template>
      </div>

      <!-- 右侧插图 -->
      <div class="card-visual">
        <img class="visual-img" :src="VISUAL_IMG" alt="" />
      </div>
    </div>

    <!-- 联系商务弹窗：新客申请落地页为「申请专属商务」，传 isExclusive 对齐按钮文案 -->
    <CommonContact v-if="showBusiness" :visible="showBusiness" isExclusive @close="handleClose" />
  </div>
</template>

<script setup lang="ts">
import { KButton } from '@netc-design-pc/ui'
import { computed, ref } from 'vue'
import { useLinkTo } from '@/hooks'
import { useHomeStore } from '@/stores/home'
import CommonContact from '@/components/side-navigation/common-contact.vue'

const { linkToBindCode, linkToApplyCustomerCode } = useLinkTo()
const homeStore = useHomeStore()

// CDN 图片常量
const BADGE_IMG = 'https://ic-img.ky-express.com/netc/20260904_61476_!!1788512589773_188_48.png'
const VISUAL_IMG = 'https://ic-img.ky-express.com/netc/20260904_42414_!!1788512589782_1200_504.png'
// 步骤连接线素材（2x 图，仅取 alpha 形状作遮罩，颜色由 CSS 填充）：线体 520x8、箭头 34x24
const STEP_LINE_IMG = 'https://ic-img.ky-express.com/netc/20260923_35427_!!1790146846103_520_8.png'
const STEP_ARROW_IMG = 'https://ic-img.ky-express.com/netc/20260923_24521_!!1790146846108_34_24.png'
// 卖点图标（设计切图 40x40 @2x，展示 20px）：时钟-7×24响应、¥-专属报价、钻石-管家服务
const FEATURE_ICON_1 = 'https://ic-img.ky-express.com/netc/20261019_67076_!!1792377148061_40_40.png'
const FEATURE_ICON_2 = 'https://ic-img.ky-express.com/netc/20261019_89064_!!1792377148063_40_40.png'
const FEATURE_ICON_3 = 'https://ic-img.ky-express.com/netc/20261019_27120_!!1792377148059_40_40.png'

const showBusiness = ref(false)

/**
 * 是否已提交开通企业账号申请
 * 依据一级接口 getFirstPriorityData 的留资标识 resourceFlag（10-留资 20-非留资），
 * store 已映射为 bindSalesFlag（applyCustomerInfo 缺省时兜底 '20'）
 */
const hasApplied = computed(() => homeStore.bindSalesFlag === '10')

/**
 * 当前步骤：1-开通企业账号 2-绑定客户编码 3-开始寄件
 * - hasApplied=false 时停留在第 1 步
 * - hasApplied=true 时推进到第 2 步
 */
const currentStep = computed(() => (hasApplied.value ? 2 : 1))

const steps = [
  { key: 'open', label: '开通企业账号' },
  { key: 'bind', label: '绑定客户编码' },
  { key: 'ship', label: '开始寄件' },
]

/**
 * 槽位31：新客留资送券活动（命名对齐小程序 newCustomerActivity，未配置时为空）
 */
const newCustomerActivity = computed(() =>
  homeStore.applyCustomerInfo?.activityList?.find((item) => item.receiveSource === 31)
)

/**
 * 槽位32：新客查询时效送券活动（命名对齐小程序 waybillActivity，未配置时为空）
 */
const waybillActivity = computed(() =>
  homeStore.applyCustomerInfo?.activityList?.find((item) => item.receiveSource === 32)
)

/**
 * 是否已配置新客优惠活动（31 留资送券 / 32 查询时效送券）
 * 控制「开通企业账号」按钮「新客专享优惠」角标显隐：任一槽位已配置即显示
 */
const hasCouponActivity = computed(() => !!newCustomerActivity.value?.activity || !!waybillActivity.value?.activity)

/**
 * 开户跳转：参考小程序双槽位全透传
 * - 31 留资送券沿用原参数名 activityId/couponCount，兼容下游既有消费
 * - 32 查询时效送券使用 waybill* 独立参数名，与 31 可并存，互不挤占
 * - 来源码 receiveSource/waybillReceiveSource 随槽位透传，目标页可区分活动类型
 */
const handleOpenAccount = () => {
  linkToApplyCustomerCode({
    ...(newCustomerActivity.value?.activity?.activityId !== undefined
      ? {
          receiveSource: newCustomerActivity.value.receiveSource,
          activityId: newCustomerActivity.value.activity.activityId,
          couponCount: newCustomerActivity.value.activity.couponCount,
          hasLeadCaptureActivity: 1,
        }
      : {}),
    ...(waybillActivity.value?.activity?.activityId !== undefined
      ? {
          waybillReceiveSource: waybillActivity.value.receiveSource,
          waybillActivityId: waybillActivity.value.activity.activityId,
          waybillCouponCount: waybillActivity.value.activity.couponCount,
          hasShippingExpiredActivity: 1,
        }
      : {}),
  })
}

const handleBindCode = () => {
  // 留资模块仅新客可见，绑码跳转固定携带新客标识（参数名对齐小程序 isNewCustomer）
  linkToBindCode({ isNewCustomer: '1' })
}

const handleContactBusiness = () => {
  showBusiness.value = true
}

const handleClose = () => {
  showBusiness.value = false
}
</script>

<style lang="scss" scoped>
.new-customer-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 316px;
  margin-top: 8px;
  border-radius: 8px;
  background: linear-gradient(180deg, #f6f3ff 0%, #e0d6ff 100%);
  box-sizing: border-box;
}

.step-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 64px;
  padding: 19px 120px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--CG-Grey-04, rgba(230, 232, 237, 1));
}

.step-item {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;

  &:last-child {
    flex: none;
  }
}

.step-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  font-weight: 600;
  border-radius: 50%;
  background: #afb1ba;
  color: #fff;
  font-size: 18px;
  line-height: 1;
}

.step-item.active .step-circle {
  background: #7541f6;
}

.step-item.active:not(.done) .step-circle::after {
  position: absolute;
  bottom: -4px;
  left: 9px;
  width: 0;
  height: 0;
  border-top: 5px solid #7541f6;
  border-right: 3px solid transparent;
  border-left: 3px solid transparent;
  content: '';
}

.step-label {
  margin-left: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #93959f;
  white-space: nowrap;
}

.step-item.active .step-label {
  color: #24262b;
}

.step-line {
  display: flex;
  align-items: flex-end;
  flex: 1;
  min-width: 0;
  margin: 0 32px;
}

// 线体与箭头公共部分：图片仅作形状遮罩，颜色由 background-color 控制
.step-line-body,
.step-line-arrow {
  background-color: #acaeb6;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

// 线体（520x8 @2x）：随宽度压缩拉伸
.step-line-body {
  flex: 1;
  min-width: 0;
  height: 4px;
  -webkit-mask-image: var(--step-line-img);
  mask-image: var(--step-line-img);
}

// 箭头（34x24 @2x）：固定 17x12 原比例，不随线体压缩
.step-line-arrow {
  flex: none;
  width: 17px;
  height: 12px;
  -webkit-mask-image: var(--step-arrow-img);
  mask-image: var(--step-arrow-img);
}

// 完成态复用父级 .step-item.done
.step-item.done .step-line-body,
.step-item.done .step-line-arrow {
  background-color: #6f41ed;
}

.card-body {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-height: 252px;
}

.card-content {
  position: relative;
  z-index: 1;
  min-width: 0;
  padding: 32px 24px;
}

.title {
  margin-bottom: 16px;
  color: #24262b;
  font-size: 28px;
  font-weight: 700;
  line-height: 40px;
}

.subtitle {
  margin-bottom: 32px;
  color: #797984;
  font-size: 14px;
  line-height: 24px;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 0;
  margin-bottom: 32px;
}

.feature-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #797984;
  font-size: 15px;
  line-height: 20px;

  & + &::before {
    width: 1px;
    height: 18px;
    margin: 0 12px;
    background: linear-gradient(180deg, transparent, #b59aff, transparent);
    content: '';
  }
}

.feature-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.btn-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 28px;
}

.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  width: 196px;
  height: 48px;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-sizing: border-box;
  transition: background 0.2s ease;
}

// 主题库中 plain+default 变体的 active 变量与 hover 相同（均为紫底 #F0ECFD），按下无额外反馈；
// 参照灰描边按钮的 active 规范（文字/描边加深为 #3E25E9）在业务层补齐按压态，scoped 属性选择器保证优先级高于 .el-button:active
.btn-secondary:active {
  background: rgba(113, 67, 240, 0.24);
}

.badge {
  position: absolute;
  top: -12px;
  right: -16px;
  display: block;
  width: 94px;
  height: 24px;
  pointer-events: none;
}

.card-visual {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 600px;
  height: 100%;
  pointer-events: none;
}

.visual-img {
  display: block;
  width: 100%;
  height: 100%;
  // 固定尺寸完整渲染不裁剪不缩放，窄屏时左侧透明区域延伸到文案下方，如背景般融合
  object-fit: contain;
  object-position: right bottom;
}

@container home-left (max-width: 1055.99px) {
  .step-bar {
    padding: 19px 120px;
  }

  .step-line {
    margin: 0 20px;
  }
}
</style>
