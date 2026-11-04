<template>
  <div class="ky-textarea-new" :class="{ 'ky-textarea-new__focus': isFocus }">
    <el-input
      type="textarea"
      v-bind="{ ...props, ...attrs, showWordLimit: false }"
      @update:model-value="updateModelValue"
      @input="onInput"
      @blur="onBlur"
      @focus="onFocus"
    ></el-input>
    <div class="limit-wrapper">
      <span class="limit" v-if="maxlength">
        <span>{{ ('' + modelValue).length }}</span>
        <span>/{{ maxlength }}</span>
      </span>
      <span :class="{ 'clear-btn': needShowClearBtn }">
        <i class="icon-clear iconfont icon-delete-mini" v-show="needShowClearBtn" @click="onClear"></i>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'

defineOptions({
  name: 'input-textarea-new',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    maxlength?: string | number
    modelValue?: string
    clearable?: boolean
    permanentMaxLengthTip?: boolean
  }>(),
  {
    clearable: false,
    permanentMaxLengthTip: false,
  }
)

const emits = defineEmits(['update:modelValue', 'onInput', 'clear', 'onFocus', 'onBlur'])
const attrs = useAttrs()

const isFocus = ref(false)

const needShowClearBtn = computed(() => {
  return !!props.clearable && (props.modelValue?.length || 0) > 0
})

const onClear = () => {
  emits('update:modelValue', '')
  emits('onInput', '')
  emits('clear')
}

const onFocus = (e: FocusEvent) => {
  isFocus.value = true
  emits('onFocus', e)
}

const onBlur = (e: FocusEvent) => {
  isFocus.value = false
  emits('onBlur', e)
}

const onInput = (value: string) => {
  emits('onInput', value)
}

const updateModelValue = (value: string) => {
  emits('update:modelValue', value)
  emits('onInput', value)
}
</script>

<style lang="scss" scoped>
.ky-textarea-new {
  position: relative;
  padding: 8px 2px 8px 8px;
  border: 1px solid #e6e8ed;
  border-radius: 4px;
  :deep(.el-textarea) {
    textarea {
      border: 0;
      padding: 0 1px 0 0;
    }
  }
  &:hover {
    border-color: #adb0b8;
  }
  &__focus {
    border-color: #7143f0;
    &:hover {
      border-color: #7143f0;
    }
  }
}
.limit-wrapper {
  text-align: right;
  padding-right: 12px;
  position: relative;
  > .limit {
    //position: absolute;
    padding-top: 3px;
    color: #686b75;
    font-weight: 400;
    > .warn {
      margin-right: 8px;
    }
  }
  > .clear-btn {
    padding-left: 16px;
    color: #686b75;
    cursor: pointer;
  }
}
</style>
