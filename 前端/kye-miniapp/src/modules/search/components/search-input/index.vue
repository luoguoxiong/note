<template>
  <view class="common-search-input">
    <ky-input
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      @input="$emit('update:keyword', $event)"
      :model-value="keyword"
      :clearable="true"
      :placeholder="placeholder || '查询运单信息/应用信息'"
      class="common-search-input__controller"
      clearTrigger="always"
      :enableWxNative="true"
      :focus="focus"
      :shouldFocus="true"
      :maxlength="120"
    >
      <template #left>
        <image
          class="common-search-input__icon"
          mode="aspectFit"
          src="https://ic-img.ky-express.com/netc/20250716_10385_!!1752632075929_64_64.png"
        />
      </template>
    </ky-input>
    <ky-button @tap="$emit('search')" class="common-search-input__button" type="primary">搜索</ky-button>
  </view>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useSearchContext } from '../../context'
import './index.scss'

const context = useSearchContext()

// defineOptions({ name: 'common-search-input' })
const focus = ref(false)

watch(() => context.state.finishAiSearch, (newVal) => {
  console.log('111', newVal, context.state.intelligentRecognitionData.showIntelligentRecognition)
  if (newVal && !context.state.intelligentRecognitionData.showIntelligentRecognition) {
    focus.value = true
  }
}, { immediate: true })

onMounted(() => {
  // setTimeout(() => {
  //   focus.value = true
  // }, 300)
})
defineProps({ keyword: String, placeholder: String })
</script>
