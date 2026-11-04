<template>
  <div class="order-footer footer-pd-0" v-if="currentConfig" :class="currentConfig.length > 2 ? 'footer-tab' : ''">
    <div class="footer-tab flex items-center" v-if="currentConfig.length > 2">
      <template v-for="(item, index) in currentConfig" :key="item.text">
        <!-- 如果最后一个是继续下单 -->
        <ky-button
          class="go-order-btn"
          :open-type="item.openType"
          @click="item.action()"
          :id="item.openTypeId"
          text=" "
          v-if="index === currentConfig.length - 1 && item.key === 'order' && currentConfig.length >= 4"
        >
          {{ item.text }}
        </ky-button>
        <div v-else style="position: relative; flex: 1" :class="[item.key === 'template' && 'template-btn']">
          <ky-button
            :open-type="item.openType"
            @click="item.action()"
            :id="item.openTypeId"
            text=" "
            class="footer-tab-item"
          >
            <template #icon>
              <SvgIcon
                class="footer-tab-icon"
                v-if="item.iconName || item.imgUrl"
                :name="item.iconName"
                :img-url="item.imgUrl"
              />
              <div class="footer-tab-item-title">{{ item.text }}</div>
            </template>
          </ky-button>
          <div
            class="template-tips"
            @click.stop
            v-if="isShowTips && extInfo?.bubbles && item.key === 'template' && extInfo?.showSaveTemplate"
          >
            <div>{{ extInfo?.bubbles }}</div>
            <div class="close" @click.stop="handleCloseTips">
              <SvgIcon
                name=""
                img-url="https://ic-img.ky-express.com/netc/20260326_9057_!!1774511384333_32_32.svg+xml"
                class="close-icon"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="flex items-center justify-center" v-if="currentConfig.length === 2">
      <ky-button
        v-for="(item, index) in currentConfig"
        :key="`${item.text}${index}`"
        class="button-footer"
        :class="item.type === 'default' ? 'button-left mr-24 border-purple' : ''"
        @click="item.action()"
        :type="buttonTypeFunc(item.type)"
        :open-type="item.openType"
        :id="item.openTypeId"
        size="normal"
        :text="item.text"
      ></ky-button>
    </div>
    <!-- 通知收件人 -->
    <ShareWaybill :waybill-number="waybillNumber"></ShareWaybill>
  </div>
</template>
<script setup lang="ts">
import { OrderSuccessPageConfig, SuccessOrderInfo, SuccessWaybill } from '@order-public-sub-public/types'
import { toRefs, computed, ref } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

import { useFooter } from '../hooks/useFooterConfig'

import ShareWaybill from './ShareWaybill.vue'
import { extInfo } from '../hooks/useOrderSuccess'

const isShowTips = ref(true)

const handleCloseTips = () => {
  isShowTips.value = false
}

const props = defineProps<{
  data?: SuccessOrderInfo
  waybillNumber: string
  orderSuccessPageConfig: OrderSuccessPageConfig
  waybillList?: SuccessWaybill[]
}>()

const { data } = toRefs(props)

const buttonTypeFunc = (type: string) => {
  return type as any
}
// 从hooks中获取当前配置
const currentConfig = computed(() =>
  useFooter(data, props.waybillNumber, props.orderSuccessPageConfig, props.waybillList),
)
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.order-footer {
  &.footer-tab {
    padding: 0 24px;
    padding-bottom: calc(20px + env(safe-area-inset-bottom, 20px));
    box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.1);
  }
  .footer-tab-item {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 120px;
    background: #fff;
    border: 0;
    padding: 0;
    &-title {
      margin-top: 8px;
      font-size: 22px;
    }
    // &::after {
    //   position: absolute;
    //   left: 0;
    //   top: 38px;
    //   content: '';
    //   width: 2px;
    //   height: 54px;
    //   background: #f2f0f4;
    // }
    &:active {
      background: #fff !important;
    }
    &:hover {
      background: #fff !important;
    }
    .ky-button__wrap {
      display: flex;
      flex-direction: column;
    }
  }
  .footer-tab-item {
    &:first-child::after {
      display: none;
    }
  }
  .footer-tab-icon {
    width: 44px;
    height: 44px;
    overflow: hidden;
    background-size: cover;
  }
  .border-purple {
    border-color: #8365f6;
  }
}
.footer-pd-0 {
  // padding-bottom: 0;
  padding-top: 16px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 20px));
}

.go-order-btn {
  width: 192px;
  height: 88px;
  background: #8365f6;
  font-size: 32px;
  color: #ffffff;
}

.template-btn {
  position: relative;
  .template-tips {
    z-index: 9;
    box-sizing: border-box;
    position: absolute;
    top: -48px;
    right: 0;
    background: linear-gradient(90deg, #8365f6 0%, #a48bf9 100%);
    width: 384px;
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 8px;
    color: #ffffff;
    padding: 0 10px 0 16px;
    font-size: 24px;
    .close {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      .close-icon {
        width: 32px;
        height: 32px;
      }
    }

    &::after {
      content: '';
      display: inline-block;
      border: 8px solid #a27cff;
      position: absolute;
      right: 40px;
      bottom: -12px;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 8px solid transparent;
      bottom: -14px;
    }
  }
}
</style>
