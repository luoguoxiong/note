<template>
  <div class="ky-switch ky-switch__container">
    <ky-switch v-bind="{ ...props, ...$attrs }" @click="click" @change="change" />
  </div>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps(), {
  modelValue: '',
  loading: false,
  disabled: false,
  size: '26px',
  activeColor: '#8365F6',
  inactiveColor: 'rgba(120, 120, 128, 0.16)',
  activeValue: true,
  inactiveValue: false,
})

const emit = defineEmits(['change', 'click'])

const change = (value: any) => emit('change', value)

const click = (event: MouseEvent) => emit('click', event)
</script>
<style lang="scss">
.ky-switch__container {
  background: #E6E8ED;
}
.ky-switch--disabled {
  background-color: #cccccc !important;
  opacity: 1 !important;
}
</style>
