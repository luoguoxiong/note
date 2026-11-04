<template>
  <div class="ky-popover" v-if="mounted">
    <Popover
      v-bind="$attrs"
      v-model:show="show"
      trigger="manual"
      :close-on-click-action="false"
      :close-on-click-outside="false"
      :duration="0"
      :class="['ky-popover-comp', placement]"
      :placement="placement"
      :z-index="1"
    >
      <div class="text-content">{{ text }}</div>
      <template #reference>
        <slot></slot>
      </template>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { useModel, onMounted, ref } from 'vue'
import { PopoverType } from '@order-public-sub-public/components/base/ky-popover/types'

const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

const props = withDefaults(defineProps<PopoverType>(), {
  show: false,
  text: '',
  trigger: 'click',
  placement: 'top',
})

const show = useModel(props, 'show')
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
