<template>
  <view class="search-result-wrapper">
    <view class="search-result-wrapper__title">
      搜索到{{ typeText }}信息共 <text class="highlight">{{ total }}</text> 条：
    </view>
    <view
      class="search-result-wrapper__content"
      :class="{
        'search-result-wrapper__content-more': showLoadMore,
        'search-result-wrapper__content-app-more': isApplicationList,
      }"
    >
      <slot />

      <view v-if="showLoadMore" class="search-result-wrapper__more" @tap.stop="handleLoadMore">
        <view class="search-result-wrapper__text">
          <text>{{ showText }}</text>
          <image
            class="arrow-icon"
            mode="aspectFit"
            src="https://ic-img.ky-express.com/netc/20250707_91976_!!1751871192393_48_48.png"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import './index.scss'
import { report_EXP_event } from '@/public/utils'
import { useSearchContext } from '../../context'

defineOptions({ name: 'ResultWrapper' })

const props = defineProps({
  typeText: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    required: true,
    validator: (value: number) => value >= 0,
  },
  isApplicationList: {
    type: Boolean,
  },
})

const emit = defineEmits(['load-more'])

const context = useSearchContext()

const restTotal = computed(() => props.total - 1)
const showLoadMore = computed(() => props.total > 1)

const showText = computed(() => `查看全部${props.typeText}，还剩余${restTotal.value}条`)

const handleLoadMore = () => {
  emit('load-more')
}

onMounted(() => {
  report_EXP_event('exp_home_search_card_display_v1', {
    page_code: 'page_home_head_v1',
    event_code: 'exp_home_search_card_display_v1',
    region_code: 'search_bar',
    event_name: '主页_首页搜索栏搜索结果_卡片_展示',
    region_name: '搜索栏',
    search_card: '全部',
    work_id: context.state.workId,
  })
})
</script>
