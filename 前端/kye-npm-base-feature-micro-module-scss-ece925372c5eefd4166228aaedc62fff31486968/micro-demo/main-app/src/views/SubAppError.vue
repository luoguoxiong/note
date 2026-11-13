<template>
  <div class="sub-app-error">
    <div class="sub-app-error__card">
      <h2 class="sub-app-error__title">子应用加载失败</h2>
      <p class="sub-app-error__app">应用: {{ app || '未知' }}</p>
      <p class="sub-app-error__tip">请检查子应用服务是否启动,或稍后重试。</p>
      <div class="sub-app-error__actions">
        <button class="sub-app-error__btn" @click="retry">重试</button>
        <button class="sub-app-error__btn sub-app-error__btn--ghost" @click="goHome">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  app: String,
  from: String,
});

const router = useRouter();
const retry = () => router.replace(props.from || '/');
const goHome = () => router.replace('/');
</script>

<style scoped>
.sub-app-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 20px;
}

.sub-app-error__card {
  max-width: 420px;
  padding: 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.sub-app-error__title {
  margin-bottom: 16px;
  font-size: 20px;
  color: #d33;
}

.sub-app-error__app {
  margin-bottom: 8px;
  color: #555;
}

.sub-app-error__tip {
  margin-bottom: 24px;
  color: #888;
  font-size: 14px;
}

.sub-app-error__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.sub-app-error__btn {
  padding: 8px 20px;
  font-size: 14px;
  color: #fff;
  background: #667eea;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.sub-app-error__btn:hover {
  background: #5568d3;
}

.sub-app-error__btn--ghost {
  color: #667eea;
  background: transparent;
  border: 1px solid #667eea;
}

.sub-app-error__btn--ghost:hover {
  background: rgba(102, 126, 234, 0.08);
}
</style>
