<template>
  <div class="ky-button-wrapper">
    <el-tooltip
      append-to="body"
      :persistent="false"
      virtual-triggering
      :virtual-ref="buttonRef"
      :effect="effect"
      :placement="placement"
      :content="disabledTips"
      :disabled="tooltipDisabled"
      v-if="!tooltipDisabled"
      :show-after="300"
      popper-style="max-width: 250px"
    >
    </el-tooltip>
    <el-button
      ref="buttonRef"
      class="ky-button"
      :class="[
        disabled ? 'disabled' : '',
        loading ? 'btn-loading' : '',
        ghost === 'ghost' ? 'el-button--ghost' : '',
        ghost === 'ghost-bg-color' ? 'el-button--ghost-bg-color' : '',
        ghost === 'ghost-black' ? 'el-button--ghost-black' : '',
        ghost === 'ghost-grey' ? 'el-button--ghost-grey' : '',
        ghost === 'ghost-grey-text' ? 'el-button--ghost-grey-text' : '',
        ghost === 'btn-secondary' ? 'btn-secondary' : '',
        $attrs.icon ? 'ky-button--icon' : '',
        type === 'text' ? 'el-button--text' : '',
      ]"
      :disabled="disabled"
      v-bind="{ ...$attrs, ...options, loading: false }"
      @click="clickEvent"
    >
      <template #icon v-if="$slots.icon">
        <span class="button-icon">
          <slot name="icon"></slot>
        </span>
      </template>
      <template #default>
        <!-- 加载图标 -->
        <KyLoading
          :visible="loading"
          :modal="false"
          :needText="false"
          :iconType="loadingIconType"
          class="btn-loading-icon"
        />
        <slot v-if="$slots.default" name="default"></slot>
      </template>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { ButtonProps } from '@/components/base/ky-button/types'
import KyLoading from '@/components/base/ky-loading'
import { ElButton } from 'element-plus'
import { Any } from '@/types'

interface CustomButtonProps extends ButtonProps {
  ghost?: 'ghost' | 'ghost-bg-color' | 'ghost-black' | 'ghost-grey' | ''
  type?: 'primary' | 'text' | ''
}
const props = withDefaults(defineProps<CustomButtonProps>(), {
  disabled: false,
  ghost: '',
  ghostBgColor: false,
  ghostBlack: false,
  disabledTips: '',
  effect: 'light',
  placement: 'bottom',
  loading: false, // 是否展示按钮加载动画
  loadingIconType: 'purple', // 按钮加载图标样式 purple grey white
})

const options = computed(() => {
  const params: Record<string, string> = {}
  if (props?.type && props.type !== 'text') {
    params.type = props.type
  }
  return params
})

const tooltipDisabled = computed(() => !props.disabled || !props.disabledTips)

const buttonRef = ref<InstanceType<typeof ElButton> | null>()

// const isLoading = computed(() => {
//   return props.loading
// })

const emits = defineEmits(['click'])

let clickEvent: Any = (event: MouseEvent) => {
  if (props.loading) {
    return false
  }
  emits('click', event)
}

onBeforeUnmount(() => {
  buttonRef.value = null
  clickEvent = null
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
