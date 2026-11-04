<template>
  <div class="ky-checkbox">
    <ky-checkbox-group v-bind="props" @change="change">
      <slot></slot>
    </ky-checkbox-group>
  </div>
</template>

<script setup lang="ts">


type KyCheckboxProps = {
  modelValue: any[]
}

const props = withDefaults(defineProps<KyCheckboxProps>(), {
  modelValue: () => [],
  disabled: false,
  max: 0,
  direction: 'vertical',
  iconSize: '20px',
  checkedColor: '#1989fa',
})

const emit = defineEmits(['change'])

const change = (names: any[]) => emit('change', names)
</script>
