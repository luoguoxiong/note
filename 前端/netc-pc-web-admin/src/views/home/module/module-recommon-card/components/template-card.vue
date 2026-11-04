<template>
  <section class="recommend-panel">
    <div v-if="template" class="recommend-panel__decoration">
      <img
        class="recommend-panel__decoration-image"
        src="https://ic-img.ky-express.com/netc/20260831_25055_!!1788148991268_800_512.png"
        alt=""
      />
    </div>

    <div class="recommend-panel__content">
      <header class="recommend-panel__header">
        <h3 class="recommend-panel__title">寄件模板</h3>
        <span class="recommend-panel__tag">推荐配置</span>
      </header>

      <p class="recommend-panel__description">
        若您常使用相同发货地址，可添加寄件模板，下次寄件选择对应模板，即可自动填充全部信息
      </p>

      <div class="recommend-panel__actions">
        <KButton
          :loading="isLoading"
          native-type="button"
          class="recommend-panel__button"
          :disabled="isLoading"
          :aria-busy="isLoading"
          v-click-report="{
            eventCode: 'clk_homepage_recommon_card_template_action_v1',
            region_code: 'recommon_card',
            button_name: '添加模板',
          }"
          @click="emit('add-template')"
        >
          <template #loading>
            <ButtonLoadingIcon :src="LOADING_IMG" :size="14" :mr="0" />
          </template>
          <span>添加模板</span>
        </KButton>
      </div>
    </div>

    <article v-if="template" class="shipping-card">
      <header class="shipping-card__header">
        <div class="shipping-card__title" :title="template.title">{{ template.title }}</div>
        <span v-if="template.default" class="shipping-card__default">
          <span class="shipping-card__default-text">默认</span>
        </span>
      </header>

      <div class="shipping-card__body">
        <div class="shipping-card__people">
          <div class="shipping-person">
            <span class="shipping-person__icon shipping-person__icon--sender">
              <img
                class="shipping-person__icon-img"
                src="https://ic-img.ky-express.com/netc/20261020_65520_!!1792482780134_40_40.png"
                alt="寄"
              />
            </span>
            <div class="shipping-person__content">
              <span class="shipping-person__name">{{ truncateName(template.senderName) }}</span>
              <span class="shipping-person__phone">{{ template.senderPhone }}</span>
              <span class="shipping-person__address">
                {{ template.sendAddress }}
              </span>
            </div>
          </div>

          <div class="shipping-person">
            <span class="shipping-person__icon shipping-person__icon--receiver">
              <img
                class="shipping-person__icon-img"
                src="https://ic-img.ky-express.com/netc/20261020_34984_!!1792482780122_40_40.png"
                alt="收"
              />
            </span>
            <div class="shipping-person__content">
              <span class="shipping-person__name">{{ truncateName(template.receiveName) }}</span>
              <span class="shipping-person__phone">{{ template.receivePhone }}</span>
              <span class="shipping-person__address">
                {{ template.receiveAddress }}
              </span>
            </div>
          </div>
        </div>

        <div class="shipping-card__divider"></div>

        <div class="shipping-card__info">
          <div class="shipping-card__info-row">
            <div class="shipping-card__info-item">
              <span class="shipping-card__info-label"
                >付款方式：<span class="shipping-card__info-value">{{ template.payMode }}</span></span
              >
            </div>
            <div class="shipping-card__info-item">
              <span class="shipping-card__info-label"
                >服务方式：<span class="shipping-card__info-value">{{ template.serviceMode }}</span></span
              >
            </div>
          </div>

          <div class="shipping-card__info-row">
            <div class="shipping-card__info-item">
              <span class="shipping-card__info-label"
                >托寄物：<span class="shipping-card__info-value">{{ template.goodsType }}</span></span
              >
            </div>
            <div class="shipping-card__info-item">
              <span class="shipping-card__info-label"
                >增值服务：<span class="shipping-card__info-value">{{ template.addedService }}</span></span
              >
            </div>
          </div>
        </div>
      </div>

      <footer class="shipping-card__footer">
        <KButton native-type="button" class="shipping-card__send-button" @click="emit('shipping')">
          <span class="shipping-card__send-button-text">去寄件</span>
        </KButton>
      </footer>
    </article>

    <div v-else class="recommend-panel__preview">
      <img
        class="recommend-panel__preview-image"
        src="https://ic-img.ky-express.com/netc/20260831_38969_!!1788140988397_800_512.png"
        alt="寄件模板"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { KButton } from '@netc-design-pc/ui'
import ButtonLoadingIcon from '@/components/button-loading-icon/index.vue'
import type { NewHomepageShippingTemplate } from '@/apis/home/types'

const LOADING_IMG = 'https://ic-img.ky-express.com/netc/20240506_23970395195_!!1714993379948_14_14.png'

defineProps<{
  template: NewHomepageShippingTemplate | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'add-template'): void
  (e: 'shipping'): void
}>()

/** 姓名最多显示 4 个字，超出部分以尾缀省略号表示 */
const truncateName = (name?: string | null) => {
  if (!name) return ''
  return name.length > 4 ? `${name.slice(0, 4)}…` : name
}
</script>

<style lang="scss" scoped>
@import './recommend-panel.scss';

/* .recommend-panel__actions {*/
/*   margin-top: 28px;*/
/* }*/

.recommend-panel__decoration {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 0;
  width: 400px;
  height: 256px;
  overflow: hidden;
  pointer-events: none;
}

.recommend-panel__decoration-image {
  width: 400px;
  height: 256px;
  display: block;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
}

.shipping-card {
  position: relative;
  z-index: 3;
  width: 280px;
  height: 232px;
  margin-right: 24px;
  display: flex;
  flex: 0 0 280px;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  border: 1px solid #ffffff;
  border-radius: 8px;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0) 0.002%, rgba(194, 172, 255, 0.16) 99.998%),
    rgba(255, 255, 255, 1);
  box-shadow: 0 4px 24px -2px rgba(35, 0, 133, 0.12);
  box-sizing: border-box;
}

.shipping-card__header {
  width: 280px;
  height: 48px;
  padding: 12px;
  display: flex;
  flex: 0 0 48px;
  align-items: center;
  border-bottom: 1px solid #e6e8ed;
  box-sizing: border-box;
}

.shipping-card__title {
  width: auto;
  max-width: 188px;
  height: 22px;
  flex: 0 0 auto;
  overflow: hidden;
  color: #24262b;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shipping-card__default {
  width: 32px;
  height: 18px;
  margin-left: 8px;
  padding: 0 4px;
  display: flex;
  flex: 0 0 32px;
  align-items: center;
  justify-content: center;
  border: 1px solid #ffbc70;
  border-radius: 2px;
  background: #fff3e5;
  box-sizing: border-box;
}

.shipping-card__default-text {
  width: 24px;
  height: 18px;
  color: #f57200;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  text-align: center;
  white-space: nowrap;
}

.shipping-card__body {
  width: 280px;
  height: 140px;
  padding: 11px 16px 12px;
  display: flex;
  flex: 0 0 140px;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
}

.shipping-card__people {
  width: 248px;
  height: 64px;
}

.shipping-person {
  width: 248px;
  height: 20px;
  display: flex;
  align-items: center;

  & + & {
    margin-top: 12px;
  }
}

.shipping-person__icon {
  width: 20px;
  height: 20px;
  display: flex;
  flex: 0 0 20px;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &--sender,
  &--receiver {
    background: transparent;
  }
}

.shipping-person__icon-img {
  width: 20px;
  height: 20px;
  display: block;
  object-fit: contain;
}

.shipping-person__content {
  width: 220px;
  min-width: 0;
  height: 18px;
  margin-left: 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.shipping-person__name,
.shipping-person__phone {
  width: auto;
  height: 18px;
  flex: 0 0 auto;
  color: var(---CG-Grey-09, rgba(36, 38, 43, 1));
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  white-space: nowrap;
}

.shipping-person__phone {
  margin-left: 8px;
}

.shipping-person__address {
  width: auto;
  min-width: 0;
  height: 18px;
  margin-left: 8px;
  flex: 1 1 auto;
  overflow: hidden;
  color: #686b75;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shipping-card__divider {
  width: 248px;
  height: 1px;
  margin-top: 8px;
  border-top: 1px dashed #e6e8ed;
  box-sizing: border-box;
}

.shipping-card__info {
  width: 248px;
  height: 44px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.shipping-card__info-row {
  width: 248px;
  height: 18px;
  display: flex;
  align-items: center;

  & + & {
    margin-top: 8px;
  }
}

.shipping-card__info-item {
  width: 120px;
  height: 18px;
  display: flex;
  flex: 0 0 120px;
  align-items: center;

  & + & {
    margin-left: 8px;
  }
}

.shipping-card__info-label {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  color: #686b75;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  white-space: nowrap;
}

.shipping-card__info-value {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(---CG-Grey-09, rgba(36, 38, 43, 1));
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shipping-card__footer {
  width: 280px;
  height: 44px;
  padding: 0 16px;
  display: flex;
  flex: 0 0 44px;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px solid #e6e8ed;
  box-sizing: border-box;
}

.shipping-card__send-button {
  width: 76px;
  height: 28px;
  padding: 0 12px;
  display: flex;
  flex: 0 0 76px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  box-sizing: border-box;
}

.shipping-card__send-button-text {
  width: 39px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  text-align: center;
  white-space: nowrap;
}
</style>
