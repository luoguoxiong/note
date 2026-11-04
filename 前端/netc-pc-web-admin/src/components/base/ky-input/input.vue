<template>
  <section class="ky-input">
    <el-tooltip
      append-to="body"
      :persistent="false"
      virtual-triggering
      :virtual-ref="inputWrapRef"
      :effect="effect"
      :placement="placement"
      :content="disabledTips"
      :popper-style="`max-width: ${width}px;min-width: 120px`"
      :disabled="!disabled || !disabledTips"
      :offset="9"
      popper-class="ky-input-tooltip"
      :show-after="300"
      v-if="!tooltipDisabled"
    >
    </el-tooltip>
    <div class="ky-input-wrap" ref="inputWrapRef">
      <ElInput
        ref="inputRef"
        v-bind="{ ...$props, ...$attrs, type: customType, clearable: false }"
        :class="{ 'is-error': isError, 'border-bottom': !border }"
        autocomplete="off"
        :formatter="formatter"
        :parser="formatter"
        @input="onInput"
        @change="onChange"
        @focus="onFocus"
        @blur="onBlur"
      >
        <template #prefix v-if="$slots.prefix">
          <slot name="prefix"></slot>
        </template>
        <template #suffix>
          <span
            @click.stop="onClear"
            v-if="clearable && modelValue && !disabled"
            :class="['clear-btn', $slots.suffix ? 'has-margin' : '', disabled ? 'disabled' : '']"
          >
          </span>

          <slot name="suffix" v-if="$slots.suffix"></slot>
        </template>
      </ElInput>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import { ElInput } from 'element-plus'
import { KyInputProps } from '@/components/base/ky-input/types'
import { Any } from '@/types'

const emits = defineEmits([
  'update:modelValue',
  'input',
  'change',
  'onInput',
  'onChange',
  'onBlur',
  'onFocus',
  'onClear',
])
const props = withDefaults(defineProps<KyInputProps>(), {
  border: true,
  disabled: false,
  disabledTips: '',
  effect: 'dark',
  placement: 'bottom-start',
  type: 'text',
})

const inputRef = ref<InstanceType<typeof ElInput> | null>(null)
const inputWrapRef = ref()
const width = ref(150)
let isFocus = ref(false)

let initValue = ''
let valueHasChanged = false

onMounted(() => {
  const el = inputWrapRef.value
  if (!el) return
  // 获取内容高度, 让tips弹层宽度跟随内容(减去弹层的左右padding)
  width.value = (el as HTMLElement).getBoundingClientRect().width - 22

  // 修复在弹框、抽屉中自动聚焦不生效问题，手动修复
  nextTick(() => {
    if (props.autofocus === true) focus()
  })
})

const tooltipDisabled = computed(() => !props.disabled || !props.disabledTips)

const customType = computed(() => {
  return props.type !== 'number' ? props.type : 'text'
})

function updateModelValue(value: string) {
  emits('update:modelValue', value)
}

/**
 * 重写input事件，使用透传input事件时，会触发两次input事件，一次为正常的传输值，一次为原生的input事件，参数为Event
 * @param value
 */
function onInput(value: string) {
  valueHasChanged = true

  let val = value || ''
  if (props.type === 'number') {
    // number类型仅允许输入数字
    val = val?.replace(/\D/g, '')
    // 支持最小值
    if (props.min) {
      val = Number(val) < props.min ? '' : val
    }
  }
  // 过滤表情字符
  /* eslint-disable */
  val = val.replace(
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[A9|AE]\u3030|\uA9|\uAE|\u3030/gi,
    ''
  )
  /* eslint-disable */
  updateModelValue(val)
  emits('input', val)
  emits('onInput', val)
}

function onChange(value: string) {
  updateModelValue(value)
  emits('change', value)
  emits('onChange', value)
}

function onBlur(e: FocusEvent) {
  let tempE: Any = e
  isFocus.value = false
  emits('onBlur', tempE)
  tempE = null

  // 兼容的场景
  //    输入框中输入123，再删除123，此时也认为值发生变化
  if (valueHasChanged && initValue === props.modelValue) {
    onChange(props.modelValue as string)
  }

  initValue = ''
  valueHasChanged = false
}

function onFocus(e: FocusEvent) {
  let tempE: Any = e
  initValue = props.modelValue as string
  valueHasChanged = false

  emits('onFocus', tempE)
  tempE = null
}

function onClear() {
  updateModelValue('') // 清空

  emits('onClear')
  emits('input', '')
  emits('onInput', '')
  emits('change', '')
  emits('onChange', '')

  // 手动聚焦
  focus()
}

// const showTemp = computed(() => {
//   return !isFocus.value
//   // return props.placeholder !== '手机/固话二选一'
// })

// async function onClickTemplate(isDisabled: Boolean) {
//   if (isDisabled) return
//   isFocus.value = true
//   await nextTick()
//   focus()
// }

function blur() {
  inputRef.value?.blur()
}
function focus() {
  inputRef.value?.focus()
}

onBeforeUnmount(() => {
  inputRef.value = null
  inputWrapRef.value = null
})

defineExpose({
  blur,
  focus,
})
</script>

<style scoped lang="scss">
@import './input.scss';
</style>
<style lang="scss">
.ky-input-tooltip {
  .el-popper__arrow {
    transform: translate3d(16px, 0px, 0px) !important;
  }
}
</style>
