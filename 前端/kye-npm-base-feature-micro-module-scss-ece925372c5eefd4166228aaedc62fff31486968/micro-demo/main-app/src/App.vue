<template>
  <router-view></router-view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const subAppRoutes = ref([
  { path: '/user/home', title: '用户首页' },
  { path: '/user/manager', title: '用户管理' },
  { path: '/user/setting', title: '用户设置' },
  { path: '/user/sandbox-test', title: 'chunk沙箱测试' },
  { path: '/order/dashboard', title: '订单数据' },
  { path: '/order/products', title: '订单产品' },
  { path: '/order/manager', title: '订单管理' },
  // MicroApp(京东)子应用4:进入容器路由后,子应用内部自行导航
  { path: '/micro-app-4', title: 'MicroApp4' },
]);
</script>

<style scoped>
.main-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-app__header {
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  color: white;
}

.main-app__title {
  font-size: 24px;
  margin-bottom: 10px;
}

.main-app__nav {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.main-app__nav a {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background 0.3s;
}

.main-app__nav a:hover {
  background: rgba(255, 255, 255, 0.2);
}

.main-app__nav a.router-link-active {
  background: rgba(255, 255, 255, 0.3);
}

.main-app__content {
  padding: 30px;
}
</style>
