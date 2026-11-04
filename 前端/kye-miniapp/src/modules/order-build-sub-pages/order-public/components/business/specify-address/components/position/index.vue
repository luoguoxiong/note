<template>
  <div class="specify-address-position" @click.stop="onClickPosition">
    <div class="text">按最近距离排序</div>
    <div class="icon"></div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['onClickPosition'])

const onClickPosition = () => {
  emit('onClickPosition')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
