<template>
  <view v-if="!useButton" @click.stop="onClick" v-bind="$attrs">
    <slot></slot>
  </view>
  <KyButton v-else class="ky-dialog-button-share" v-bind="bindAttrs" @click="onClick">
    <slot></slot>
  </KyButton>
</template>

<script lang="ts" setup>
import KyButton from '@packages/__components/button'
import { computed, useAttrs } from 'vue'

interface DialogBtnProps {
  useButton: boolean
  text: string
}

const props = withDefaults(defineProps<DialogBtnProps>(), {
  useButton: false,
  text: '',
})

const emit = defineEmits(['click'])

const attrs = useAttrs()
const bindAttrs = computed(() => {
  const { class: _c, ...rest } = attrs
  return rest
})

const onClick = (e) => {
  emit('click', e)
}
</script>
<style scoped lang="scss"></style>
