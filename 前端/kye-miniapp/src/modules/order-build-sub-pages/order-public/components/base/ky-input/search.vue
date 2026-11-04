<template>
  <div class="ky-input-search" :class="classes">
    <Search
      v-bind="$attrs"
      shape="round"
      autocomplete="off"
      @input="onInput"
      :placeholder="placeholder"
      @blur="onBlur"
      @focus="onFocus"
    >
      <template #left-icon>
        <SvgIcon name="search-icon" class="search-icon" />
      </template>
    </Search>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
// import { Search } from 'vant'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

export interface KySearchProps {
  showBorder?: boolean
  placeholder?: string
  shape?: 'round' | 'square'
}
const props = withDefaults(defineProps<KySearchProps>(), {
  showBorder: true,
  placeholder: '',
  shape: 'round',
})
const emit = defineEmits(['input', 'blur', 'focus'])
const isHighLight = ref(false)

const classes = reactive({
  highlight: props.showBorder && isHighLight,
})
const onInput = () => {
  emit('input')
}

const onBlur = (e: MouseEvent) => {
  isHighLight.value = false
  emit('blur', e)
}

const onFocus = (e: MouseEvent) => {
  isHighLight.value = true
  emit('focus', e)
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import '@order-global-package-order-sub/styles/settings/variable.scss';
@import '@order-global-package-order-sub/styles/tools/mixins.scss';
@import './search.scss';
</style>
