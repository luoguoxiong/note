<template>
  <div v-if="visible && suggestList.length > 0" :class="[styles['pickup-form-address-unfold-dropdown-menu']]">
    <div :class="[styles['dropdown-title']]">
      <span>最近取货联系人</span>
      <span :class="[styles['clear']]" v-if="!curSuggestList.some((v) => v.recommendType === 20)" @click="onClearAll"
        >清空</span
      >
    </div>
    <!-- 列表 -->
    <div :class="[styles['content']]" v-if="curSuggestList.length">
      <KyReport
        :eventCode="
          curSuggestList.some((v) => v.recommendType === 20)
            ? 'exp_express_single_entrusted_pickup_ai_pickup_recommend_v1'
            : ''
        "
        :otherParams="{
          ai_strategy_code: curSuggestList.find((v) => v.recommendType === 20)?.strategyId || '',
        }"
      ></KyReport>
      <div :class="[styles['list']]" v-for="(item, index) in curSuggestList" :key="index">
        <div :class="[styles['item']]" @click.stop="onSelectSuggest(item)">
          <div :class="[styles['list__connect'], 'flex']">
            <div :class="[styles['list__connect__name_box']]">
              <SvgIcon
                font-size="24px"
                v-if="item.recommendType === 20"
                :class="[styles['item-tuijian__icon']]"
                name="tuijian"
              ></SvgIcon>
              <div :class="[styles['list__connect__name']]" v-html="highlightText(item.contactName, keyword)"></div>
            </div>

            <div :class="[styles['list__connect__mobile']]" v-html="highlightText(item.contactMobile, keyword)"></div>
          </div>
          <div :class="[styles['list__phone'], 'flex']">
            <section v-html="highlightText(item.contactPhone, keyword)"></section>
            <section v-if="item.extension && item.contactPhone">-{{ item.extension }}</section>
          </div>
        </div>
        <div :class="[styles['item-clear']]" @click.stop="onDelete(item)" v-if="item.deleteFlag === 10">
          <SvgIcon font-size="28px" :class="[styles['item-clear__icon'], styles['clear-icon']]" name="delete"></SvgIcon>
        </div>
      </div>
    </div>

    <div :class="[styles['pickup-form-address-close']]" @click.stop="onCloseDropdownMenu">
      <span :class="[styles['pickup-form-address-close__text']]">关闭</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { pickUpProps } from '@order-public-sub-public/components/business/pickup-information/components/suggest-menu/types'
import { deletePickupContactInfo } from '@order-public-sub-public/apis'
import { RecommendType } from '@order-public-sub-public/apis/pickup/type'
import highlightText from '@order-global-package-order-sub/utils/highlightText'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import { ref, watch } from 'vue'
import { clk_express_single_entrusted_pickup_ai_pickup_recommend_v1 } from '../../report'
import KyReport from '@order-public-sub-public/components/base/ky-report/index.vue'
import styles from './index.module.scss'

const props = withDefaults(defineProps<pickUpProps>(), {
  visible: false,
  suggestList: () => [],
  keyword: '',
})

const curSuggestList = ref<RecommendType[]>([])

watch(
  () => props.suggestList,
  (value) => {
    curSuggestList.value = value
  },
  { immediate: true },
)

const emit = defineEmits(['onCloseDropdownMenu', 'onSelectSuggest'])

//关闭建议面板
const onCloseDropdownMenu = () => {
  emit('onCloseDropdownMenu')
}
//选择建议
const onSelectSuggest = (value: RecommendType) => {
  emit('onSelectSuggest', value)
  if (value.recommendType === 20) {
    clk_express_single_entrusted_pickup_ai_pickup_recommend_v1(value)
  }
}
// 清空
const onClearAll = async () => {
  try {
    onCloseDropdownMenu()
    await deletePickupContactInfo({
      idList: [],
      deleteType: '20',
    })
    showToast('清空成功')
  } catch (error) {
    console.log('error', error)
  }
}
// 单条删除
const onDelete = async (item: RecommendType) => {
  try {
    await deletePickupContactInfo({
      idList: [item.id],
      deleteType: '10',
    })
    const inxex = curSuggestList.value.findIndex((i) => i.id === item.id)
    inxex !== -1 && curSuggestList.value.splice(inxex, 1)
    showToast('删除成功')
    if (curSuggestList.value.length === 0) {
      onCloseDropdownMenu()
    }
  } catch (error) {
    console.log('error', error)
  }
}
</script>

<style lang="scss"></style>
