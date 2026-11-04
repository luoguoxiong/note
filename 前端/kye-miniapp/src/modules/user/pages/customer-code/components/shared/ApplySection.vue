<template>
  <view v-if="shouldShow" class="apply-section">
    <!-- 副标题模式：仅展示一句提示（subType=add | subType=change 添加客户编码场景） -->
    <view v-if="subtitle" class="apply-section__subtitle">
      <text class="subtitle-text">{{ subtitle }}</text>
    </view>

    <!-- 默认完整模式：提示行 + 分隔线 + 操作区 -->
    <template v-else>
      <view :class="['apply-section__tips', isPopup && 'is-popup']">
        <text class="tips-text">下单需绑定客户编码，以保证公司信息安全，点击</text>
        <view class="tips-link" @tap="handleLearnMore">
          <text class="link-text">了解更多</text>
          <image
            class="link-icon"
            src="https://ic-img.ky-express.com/netc/20260115_3340_!!1768467485643_48_48.png"
          ></image>
        </view>
      </view>

      <!-- 分隔线（仅操作区域可见时显示） -->
      <view v-if="!isPopup" class="apply-section__divider" />

      <view class="apply-section__action">
        <text v-if="isSuccessTip && hasBusiness" class="action-text">
          您已成功申请专属商务，如需获取客户编码，请联系商务吧！
        </text>
        <text v-else class="action-text">
          <template v-if="hasMarketActivity">
            如贵司有寄件需求，点击获取专属服务方案，<text style="font-weight: 600">立得专享优惠券</text>
          </template>
          <template v-else>
            {{
              hasBusiness
                ? '若您还没有客户编码，请联系商务获取吧！'
                : '如贵司有寄件需求，请点击获取专属服务方案对接合作'
            }}
          </template>
        </text>

        <ky-button v-if="hasBusiness" class="action-btn" size="small" type="primary" @click="handleContactBusiness">
          联系商务
        </ky-button>
        <ky-button v-else class="action-btn" size="small" type="primary" @click="handleApply">
          <image
            v-if="hasMarketActivity"
            class="new-icon"
            src="https://ic-img.ky-express.com/netc/20260413_62475_!!1776062444291_112_56.png"
          ></image>
          {{ applyButtonText || '获取专属服务方案' }}
        </ky-button>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
/**
 * 客户编码模块 - 申请商务区域组件
 *
 * 用于绑定页面的申请专属商务入口
 * 根据 hasBusiness 判断显示"联系商务"或"申请专属商务"
 * 参考 H5 源码 bindCode/index.jsx 的 ApplySection 实现
 */
import { computed } from 'vue'
import KyImage from '@/public/components/base/ky-image/index.vue'
import './ApplySection.scss'

interface Props {
  /** 是否有匹配商务（true=联系商务，false=申请专属商务 */
  hasBusiness?: boolean | null
  /** 是否有匹配有营销活动（true=有营销活动，false=没有营销活动 */
  hasMarketActivity?: boolean | null
  /** 是否显示成功提示（已申请专属商务成功场景） */
  isSuccessTip?: boolean
  /** 申请按钮自定义文案（从 configData 获取） */
  applyButtonText?: string
  /** 页面状态（1=绑定，2=添加，3=更换） */
  status?: string
  /** 场景类型：bind=绑定页，change=更换页，switch=切换页 */
  scene?: 'bind' | 'change' | 'switch'
  isPopup?: boolean
  /** 副标题/场景提示文案（如"添加客户编码成功后，将自动切换为当前绑定"） */
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  hasBusiness: null,
  hasMarketActivity: null,
  isSuccessTip: false,
  applyButtonText: '',
  status: '1',
  scene: 'bind',
  isPopup: false,
  subtitle: '',
})

const emit = defineEmits<{
  (e: 'apply'): void
  (e: 'learnMore'): void
  (e: 'contactBusiness'): void
}>()

/**
 * 是否显示申请商务区域
 * 根据页面状态和环境判断
 */
const shouldShow = computed(() => {
  if (props.status === '2' || props.status === '3') {
    return false
  }
  return true
})

/**
 * 处理点击申请按钮
 */
const handleApply = () => {
  emit('apply')
}

/**
 * 处理点击了解更多
 */
const handleLearnMore = () => {
  emit('learnMore')
}

/**
 * 处理联系商务点击
 */
const handleContactBusiness = () => {
  emit('contactBusiness')
}
</script>
