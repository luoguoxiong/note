<template>
  <button
    class="shared-btn"
    :class="`shared-btn--${type}`"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup>
// 子应用1共享按钮组件:供主应用/其他子应用通过 useRemoteComponent 引入
defineProps({
  type: {
    type: String,
    default: 'primary', // primary | plain
  },
});

const emit = defineEmits(['click']);
const handleClick = (e) => emit('click', e);
</script>

<style scoped>
.shared-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  line-height: 1.4;
}
.shared-btn:active {
  transform: translateY(1px);
}
.shared-btn--primary {
  background: #667eea;
  color: #fff;
}
.shared-btn--primary:hover {
  opacity: 0.9;
}
.shared-btn--plain {
  background: #f0f2f5;
  color: #333;
}
.shared-btn--plain:hover {
  background: #e4e7ed;
}
</style>
