<template>
  <div
    v-if="visible"
    class="template-list-wrap"
    :class="{ 'show-scroll-bar': isPcMiniprogram }"
    v-exposure-report="exp_sendtemplate_itc(templateList?.length)"
  >
    <scroll-view
      class="template-list"
      ref="scrollViewRef"
      :scroll-x="true"
      :scrollLeft="scrollLeft"
      scroll-with-animation
      :scroll-y="false"
    >
      <view class="template-list-content">
        <view
          v-for="item in templateList"
          @click.stop="() => handleToViewport(item)"
          :key="item.templateId || item.title"
          :id="'template-item-' + item.templateId"
          class="template-item"
          :class="{ active: showActiveClass(item), ['template-item-' + item.templateId]: true }"
        >
          {{ item.title }}
        </view>
      </view>
    </scroll-view>
    <div
      v-if="templateList.length > 1"
      @click="() => handleToList()"
      class="template-operation"
      v-click-report="{
        eventCode: 'clk_sendtemplate_itc',
        otherParams: () => {
          return { template_type: '有寄件模板', button_name: '管理模板' }
        },
      }"
    >
      管理模板
    </div>
    <div
      v-else
      @click="() => handleToList('detail')"
      class="template-operation"
      v-click-report="{
        eventCode: 'clk_sendtemplate_itc',
        otherParams: () => {
          return { template_type: '无寄件模板', button_name: '添加模板' }
        },
      }"
    >
      <SvgIcon name="icon-add" />
      &nbsp;添加模板
      <span class="suggest-icon" v-if="templateRecommendPop">
        <SvgIcon class="suggest-red-full" name="suggest-red-full"></SvgIcon>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { OrderPageType } from '@order-public-sub-public/constants'
import { ITemplate } from '@order-public-sub-public/types'

import { getTemplateId, setTemplateId } from '@order-public-sub-root-pages/order-single/hooks/template'
import { useRoute } from '@order-public-sub-public/vue-router/index'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import {
  handleGetTemplateList,
  templateList,
  templateRecommendPop,
} from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { getChannel } from '@order-public-sub-public/configs'
import { useTabCache } from '@order-public-sub-public/components/business/template-list/hooks/useTabCache'
import { exp_sendtemplate_itc } from './../hooks/report'
import { getApplicationByApplicationCode } from '@/public/utils'
import {
  visible,
  channelList,
  handleScroll,
  // handleStorageListener,
  handleToViewport,
  removeTemplateId,
  defaultBaseUrl,
  isPcMiniprogram,
  handleToList,
  scrollLeft,
} from '../hooks/update'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const orderPageType = computed(() => piniaStore.root.getOrderPageType)
const { setTabCacheData, clearTabCacheData } = useTabCache()

const routeQuery = useRoute()
const scrollViewRef = ref()

// 模板选中样式
const showActiveClass = (item: ITemplate) => {
  const _templateId = getTemplateId() || -1
  if (_templateId && item.templateId) {
    return _templateId === item.templateId
  }
  return false || !!item.defaultFlag
}

/**
 * @description 跳转默认设置
 */
const getDefaultUrl = async () => {
  const res = getApplicationByApplicationCode('H5_ORDER_DEFAULT_MINI_V1')
  defaultBaseUrl.value = res.loadAddress
}

// 添加storage事件
// const handleAddStorageListener = () => {
//   window.addEventListener('storage', handleStorageListener)
// }
// // 移除storage事件
// const handleRemoveStorageListener = () => {
//   window.removeEventListener('storage', handleStorageListener)
// }

const initData = async () => {
  if (channelList.includes(getChannel()) && orderPageType.value === OrderPageType.单票) {
    const { templateId } = routeQuery.query
    // PC小程序监听storage
    // if (isPcMiniprogram.value) {
    //   handleAddStorageListener()
    // }
    getDefaultUrl()
    await handleGetTemplateList()
    if (templateId) {
      console.log('templateId---11', routeQuery.query.templateId)
      setTemplateId(templateId as string)
    } else if (templateList.value?.length > 1) {
      const defaultItem = templateList.value.find((i) => i.defaultFlag)
      console.log('templateId---22', defaultItem?.templateId)
      setTemplateId(defaultItem?.templateId || '')
    }
    nextTick(() => {
      handleScroll()
    })
    removeTemplateId()
  }
}

const setInitCacheData = async () => {
  const initPromise = piniaStore.globalData.initDataPromise
  if (initPromise) {
    try {
      await initPromise
    } catch (error) {
      console.log('initPromise error', error)
    }
  }
  setTimeout(() => {
    setTabCacheData()
  })
}

onMounted(async () => {
  clearTabCacheData()
  await initData()
  await setInitCacheData()
})

onUnmounted(() => {
  if (isPcMiniprogram.value) {
    // handleRemoveStorageListener()
  }
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
