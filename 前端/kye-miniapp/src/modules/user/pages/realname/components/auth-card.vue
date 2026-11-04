<template>
  <!-- 认证卡片组件 -->
  <div
    :class="[
      'auth-card',
      isAuthenticated ? 'auth-card--finish' : 'auth-card--start',
      `auth-card--${type}`,
      {
        'item-disabled': isDisabled,
        'reward-integral': showReward && !isAuthenticated,
      },
    ]"
    @click="handleClick"
  >
    <!-- 禁用状态提示 -->
    <div v-if="isDisabled && showTooltip" class="tooltip">暂不支持企业实名认证，如有疑问请联系商务</div>

    <div class="auth-card__left">
      <div class="title">{{ titleName }}</div>
      <div class="name" v-show="cardName">{{ cardName }}</div>
      <div class="code" v-show="cardCode">{{ cardCode }}</div>
      <div class="cardtip" v-show="description">{{ description }}</div>
    </div>

    <div class="auth-card__right">
      <img class="img" :src="getImageUrl" alt="" />
      <div class="label" :style="{ opacity: isDisabled ? 0 : 1 }">
        {{ isAuthenticated ? '查看实名信息' : '去实名认证' }}
        <img class="go-img" src="https://ic-img.ky-express.com/netc/20231018_70261096531_!!1697610971098_12_22.png" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './auth-card.scss'
import { computed } from 'vue'
import { IMAGE_URLS, AUTH_TYPE, AUTH_CARD_CONFIG } from '../hooks'
import type { AuthCardConfig } from '../hooks'

defineOptions({ name: 'AuthCard' })

const props = withDefaults(defineProps<AuthCardConfig>(), {
  isDisabled: false,
  showTooltip: false,
})

const emit = defineEmits<{
  click: [info: any]
}>()

/** 获取卡片配置 */
const cardConfig = computed(() => {
  if (props.isDisabled) {
    return AUTH_CARD_CONFIG.DISABLED
  }
  return props.type === AUTH_TYPE.PERSONAL ? AUTH_CARD_CONFIG.PERSONAL : AUTH_CARD_CONFIG.ENTERPRISE
})

const titleName = computed(() => {
  if (props.type === AUTH_TYPE.PERSONAL) {
    return props.isAuthenticated ? AUTH_CARD_CONFIG.PERSONAL.authName : AUTH_CARD_CONFIG.PERSONAL.name
  } else {
    return props.isAuthenticated ? AUTH_CARD_CONFIG.ENTERPRISE.authName : AUTH_CARD_CONFIG.ENTERPRISE.name
  }
})

const cardName = computed(() => {
  if (props.type === AUTH_TYPE.PERSONAL) {
    return props.isAuthenticated ? props.info.idCardName : ''
  } else {
    return props.isAuthenticated ? props.info.certificationName : ''
  }
})
const cardCode = computed(() => {
  if (props.type === AUTH_TYPE.PERSONAL) {
    return props.isAuthenticated ? props.info.idCardNo : ''
  } else {
    return props.isAuthenticated ? props.info.certificationCode : ''
  }
})

const description = computed(() => {
  if (props.type === AUTH_TYPE.PERSONAL) {
    return props.isAuthenticated ? '' : cardConfig.value.description
  } else {
    return props.isAuthenticated ? '' : cardConfig.value.description
  }
})

/** 获取图片 URL */
const getImageUrl = computed(() => {
  if (props.isDisabled) {
    return IMAGE_URLS.ENTERPRISE_DISABLED
  }

  if (props.isAuthenticated) {
    return props.type === AUTH_TYPE.PERSONAL ? IMAGE_URLS.PERSONAL_FINISH : IMAGE_URLS.ENTERPRISE_FINISH
  }

  return props.type === AUTH_TYPE.PERSONAL ? IMAGE_URLS.PERSONAL_NORMAL : IMAGE_URLS.ENTERPRISE_NORMAL
})

/** 处理点击事件 */
const handleClick = () => {
  if (!props.isDisabled) {
    emit('click', props.info)
  }
}
</script>

<style lang="scss">
@import './auth-card.scss';
</style>
