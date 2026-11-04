<template>
  <div class="ky-dialog">
    <ky-dialog v-bind="$attrs">
      <template #title>
        <div class="title">
          <div class="title-icon" v-if="titleIcon" :style="`background-image:url('${titleIcon}')`"></div>
          <div class="title-msg" :class="{ 'has-title-icon': titleIcon }">{{ title }}</div>
        </div>
      </template>
      <template #default>
        <div class="content">
          <slot name="default" />
        </div>
      </template>
      <template #footer v-if="$slots.footer">
        <slot name="footer"></slot>
      </template>
    </ky-dialog>
  </div>
</template>

<script setup lang="ts">
export interface dialogProps {
  titleIcon?: string
}
withDefaults(defineProps<dialogProps>(), {})
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
