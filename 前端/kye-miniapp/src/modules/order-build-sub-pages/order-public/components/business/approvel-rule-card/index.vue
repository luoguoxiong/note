<template>
  <div
    class="rich-text-wrap"
    id="rich-text-wrap"
    :class="{
      'rich-text-wrap-no-padding': !needIsExpand,
      'rich-text-wrap-expand': !isExpand,
    }"
  >
    <div id="list-wrap">
      <div class="content-card" v-for="(item, index) in list" :key="item.adjustId">
        <div class="content-header">
          <span class="text">
            <span class="num" v-if="list?.length > 1">{{ index + 1 }}</span>
            {{ item?.adjustTitle || '' }}
          </span>
          <span class="money" @click="goApprovalList" v-if="index === 0">
            查看审核列表
            <img src="https://ic-img.ky-express.com/netc/20260515_27691_!!1778814529839_8_15.png" class="arrow-right" />
          </span>
        </div>
        <div class="content">
          <div class="c-1" v-if="item?.customerOrderTipsText" v-html="convertHtml(item?.customerOrderTipsText)"></div>
          <div class="c-2" v-if="item?.crmRuleTips">
            <div><span v-html="convertHtml(item?.crmRuleTips)"></span></div>
          </div>
        </div>
      </div>
    </div>
    <div class="expand" @click="doExpand" v-if="needIsExpand">
      {{ !isExpand ? '展开' : '收起' }}
      <img :src="url" class="img" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Topics } from '@order-public-sub-public/types'
import { convertHtml } from '@/public/utils/createTagConverter'
import Taro from '@tarojs/taro'
import { getH5OrderUrl } from '@order-public-sub-public/utils'
import { getOnlineH5Url } from '@order-public-sub-public/utils/env'
import { openURL } from '@/modules/webview/utils'

const props = defineProps<{ list: Topics[] }>()

const isExpand = ref(false) //
const needIsExpand = ref(false) // 是否需要展开

const url = computed(() => {
  return isExpand.value
    ? 'https://ic-img.ky-express.com/netc/20260427_9069_!!1777261730427_16_12.png'
    : 'https://ic-img.ky-express.com/netc/20260511_35321_!!1778485084424_16_12.png'
})

const doExpand = () => {
  isExpand.value = !isExpand.value
}

const init = () => {
  const query = Taro.createSelectorQuery()
  query.select('#rich-text-wrap').boundingClientRect()
  query.select('#list-wrap').boundingClientRect()
  query.exec((res) => {
    const fatherWrap = res[0]
    const sonWrap = res[1]
    if (!fatherWrap || !sonWrap) {
      needIsExpand.value = true
      return
    }
    const fatherInnerHeight = fatherWrap.height
    needIsExpand.value = fatherInnerHeight < sonWrap.height
  })
}

const checkExpandStatus = () => {
  nextTick(() => {
    setTimeout(() => {
      init()
    }, 200)
  })
}

/**
 * @description 跳转审核列表
 */
const goApprovalList = async () => {
  const h5OrderUrl = await getH5OrderUrl()
  const baseUrl = h5OrderUrl ? `${h5OrderUrl}#` : getOnlineH5Url()
  const url = `${baseUrl}/price-adjustment-approval-list?isMiniApp=1&tab=2&subTab=20`

  openURL(url, { type: 'redirectTo', needLogin: true })
}

onMounted(() => {
  checkExpandStatus()
})
</script>

<style lang="scss">
@import './index.scss';
</style>
