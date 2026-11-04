<template>
  <div
    v-if="visible && suggestList.length > 0"
    class="address-unfold-dropdown-menu"
    :class="{
      'mobile-menu-position': visibleDropdownMenuPosition === 'mobile',
    }"
  >
    <KyReport eventCode="exp_express_association_v1" :otherParams="expReport(suggestList, source)"></KyReport>
    <!-- 列表 -->
    <div class="content">
      <div class="list" v-for="(item, index) in suggestList" :key="index" @click="selectSuggest(item)">
        <div class="list__connect">
          <div class="list__connect__name" v-html="highlightText(item.person, person)"></div>
          <div
            v-if="item.mobile"
            class="list__connect__mobile"
            v-html="highlightText(item.mobile, filterAllSpace(mobile))"
          ></div>
          <div v-else class="list__connect__mobile">
            {{ item.telephone }}<span v-if="item.extension">-{{ item.extension }}</span>
          </div>
        </div>
        <div v-if="item.mobile && item.telephone" class="list__telephone">
          {{ item.telephone }}<span v-if="item.extension">-{{ item.extension }}</span>
        </div>
        <div class="list__companyName">{{ item.companyName }}</div>
        <div class="list__address">{{ item.fullAddress }}</div>
      </div>
    </div>

    <div class="close">
      <span class="close__text" @click="onCloseDropdownMenu">关闭</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import KyReport from '@order-public-sub-public/components/base/ky-report/index.vue'

// 方法
import { AddressValue } from '@order-public-sub-public/constants'
import highlightText from '@order-global-package-order-sub/utils/highlightText'

import { filterAllSpace } from '@order-public-sub-public/utils'
import { expReport, clickReport } from './report/index'

const props = defineProps({
  visible: {
    type: Boolean,
  },
  person: {
    type: String,
    default: '',
  },
  mobile: {
    type: String,
    default: '',
  },
  suggestList: {
    type: Array,
    default: () => [],
  },
  source: {
    type: String,
    default: '',
  },
  visibleDropdownMenuPosition: {
    type: String,
    default: 'person',
  },
})

const emit = defineEmits(['onCloseDropdownMenu', 'selectSuggest'])

const onCloseDropdownMenu = () => emit('onCloseDropdownMenu')
const selectSuggest = (value: AddressValue) => {
  clickReport(value, props.source)
  emit('selectSuggest', value)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
