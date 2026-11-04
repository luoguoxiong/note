<template>
  <div class="content" id="home-content">
    <div class="left-side">
      <slot name="left"></slot>
    </div>
    <div class="right-side">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
<style lang="scss" scoped>
@import './index.scss';
</style>
