<template>
  <view class="ky-autocomplete" :class="classes">
    <ky-popover location="bottom" :show="suggestions.length" :showArrow="false" :listenClickId="listenClickId">
      <template #reference>
        <view class="ky-autocomplete--content">
          <ky-input
            v-bind="props"
            @input="inputHandle"
            @blur="blurHandle"
            @focus="focusHandle"
            @clear="clearHandle"
            @confirm="confirmHandle"
            @keyboardHeightChange="keyboardHeightChangeHandle"
          />
        </view>
      </template>
      <template #content>
        <view class="popover">
          <view v-if="suggestionLoading">
            <slot name="loading"> 加载中 </slot>
          </view>
          <template v-else>
            <view
              v-for="(item, index) in suggestions"
              :key="index"
              :class="{ highlighted: highlightedIndex === index }"
              @click="handleSelect(item)"
            >
              <slot :item="item">
                <view class="ky-autocomplete-popover-item" v-html="highlightText(item, modelValue)"></view>
              </slot>
            </view>
          </template>
        </view>
      </template>
    </ky-popover>
  </view>
</template>

<script setup lang="ts" name="ky-autocomplete">
import { computed, ref } from 'vue'
import './index.scss'
import { AutoCompleteProps } from '@packages/__components/auto-complete/src/types'
import { highlightText } from '@packages/utils/src/common'

const props = withDefaults(defineProps<AutoCompleteProps>(), {
  disabled: false,
  modelValue: '',
  type: 'text',
  clearable: true,
  readonly: false,
  isError: false,
  size: 'normal',
  border: 'all',
  hideLoading: false,
})

const emit = defineEmits([
  'change',
  'update:modelValue',
  'focus',
  'blur',
  'clear',
  'click',
  'input',
  'confirm',
  'keyboardHeightChange',
  'select',
])

const prefix = 'ky-autocomplete'

const focus = ref(false)
const loading = ref(false)
const suggestionDisabled = ref(false)
const highlightedIndex = ref(-1)
const suggestions = ref<any>([])

const suggestionLoading = computed(() => !props.hideLoading && loading.value)

// 动态class
const classes = computed(() => {
  return {
    [`${prefix}`]: true,
    [`${prefix}--size-${props.size}`]: props.size,
  }
})

// 获取联想数据
const getData = async (queryString: string) => {
  if (suggestionDisabled.value) return
  const cb = (suggestionList: any[]) => {
    loading.value = false
    if (suggestionDisabled.value) return

    if (Array.isArray(suggestionList)) {
      suggestions.value = suggestionList
      highlightedIndex.value = props.highlightFirstItem ? 0 : -1
    } else {
      console.log('error')
    }
  }
  loading.value = true
  if (Array.isArray(props.fetchSuggestions)) {
    cb(props.fetchSuggestions)
  } else {
    const result = await props.fetchSuggestions(queryString, cb)
    if (Array.isArray(result)) cb(result)
  }
}

const debounce = (fn: () => void, wait: number) => {
  let timeout: number | null = null
  return function () {
    const context = this
    const args = arguments
    if (timeout) clearTimeout(timeout)
    const callNow = !timeout
    timeout = setTimeout(() => {
      timeout = null
    }, wait)
    if (callNow) fn.apply(context, args)
  }
}
const debouncedGetData = debounce(getData, props.debounce)

const handleSelect = async (item: any) => {
  emit('select', item)
  if (typeof item === 'string') {
    emit('update:modelValue', item)
  }
  suggestions.value = []
  highlightedIndex.value = -1
}

const inputHandle = (value: string, event: Event) => {
  emit('input', value, event)
  emit('update:modelValue', value)
  debouncedGetData(value)
}

const focusHandle = () => {
  focus.value = true
  emit('focus')
}

const blurHandle = () => {
  focus.value = false
  emit('blur')
}

const clearHandle = () => {
  emit('change', '')
  emit('update:modelValue', '')
  emit('clear')
}

const keyboardHeightChangeHandle = (event: Event) => {
  emit('keyboardHeightChange', event)
}
const confirmHandle = (value: string, event: Event) => {
  emit('confirm', value, event)
}
</script>
