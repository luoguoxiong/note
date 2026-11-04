<template>
  <view class="container">
    <!-- 控制元素的显示与隐藏 -->
    <button @click="toggleVisible">Toggle Transition</button>
    <ky-transition :show="visible" :duration="[500, 1000]" name="transition">
      <view class="transition-box"> This is a transition box! </view>
    </ky-transition>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import "./index.scss";

const visible = ref(false);

function toggleVisible() {
  visible.value = !visible.value;
}
</script>
