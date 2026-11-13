<template>
  <div class="main-app">
    <header class="main-app__header">
      <h1 class="main-app__title">主应用 - Main App</h1>
      <nav class="main-app__nav">
        <div class="nav-group" v-for="group in navGroups" :key="group.label">
          <span class="nav-group-label">{{ group.label }}</span>
          <div class="nav-group-items">
            <router-link v-for="item in group.items" :key="item.path" :to="item.path">{{
              item.title
            }}</router-link>
          </div>
        </div>
      </nav>
    </header>
    <main class="main-app__content">
      <router-view v-slot="{ Component }">
        <!-- <keep-alive :include="['MicroApp4']"> -->
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
      <div class="native-micro-page">
        <div class="native-micro-page__container">
          <div class="native-micro-page__header">
            <span class="native-micro-page__title"> Native Iframe 子应用 </span>

            <span class="native-micro-page__url">
              http://localhost:8001/#/admin/user/home
            </span>
          </div>

          <iframe
            src="http://localhost:8001/#/admin/user/home"
            class="native-micro-page__iframe"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
      <div class="native-micro-page">
        <div class="native-micro-page__container">
          <div class="native-micro-page__header">
            <span class="native-micro-page__title"> Native Iframe 子应用 </span>

            <span class="native-micro-page__url">
              http://localhost:8002/#/admin/order/native-message
            </span>
          </div>

          <iframe
            src="http://localhost:8002/#/admin/order/native-message"
            class="native-micro-page__iframe"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";

const navGroups = ref([
  {
    label: "订单中台 order-utils",
    items: [{ path: "/admin/query", title: "运费时效" }],
  },
  {
    label: "远程组件测试",
    items: [
      { path: "/admin/home", title: "基座" },
      { path: "/admin/order/dashboard", title: "子应用" },
    ],
  },
  {
    label: "通信测试",
    items: [
      { path: "/admin/nativeStandalone", title: "Standalone" },
      { path: "/admin/user/home", title: "Micro-Module" },
      { path: "/admin/nativeMicro", title: "Micro-App" },
    ],
  },
  {
    label: "沙箱测试",
    items: [{ path: "/admin/user/sandbox-test", title: "Micro-Module 沙箱" }],
  },
  {
    label: "Micro-Module Vuex测试",
    items: [
      { path: "/admin/user/vuex-counter", title: "子应用1" },
      { path: "/admin/order/vuex-counter", title: "子应用2" },
    ],
  },
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
  margin-bottom: 14px;
}

.main-app__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
}

.nav-home {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background 0.3s;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
}
.nav-home:hover {
  background: rgba(255, 255, 255, 0.2);
}
.nav-home.router-link-active {
  background: rgba(255, 255, 255, 0.3);
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-group-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 8px;
}

.nav-group-items {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.nav-group-items a {
  color: white;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  transition: background 0.3s;
}

.nav-group-items a:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-group-items a.router-link-active {
  background: rgba(255, 255, 255, 0.3);
}

.main-app__content {
  padding: 30px;
}

.native-micro-page {
  margin-top: 30px;
}
.native-micro-page iframe {
  width: 100%;
  height: 500px;
  border: none;
}

.native-micro-page__header {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 46px;
  padding: 0 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
}

.browser-dots {
  display: flex;
  gap: 6px;
}

.browser-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.browser-dots span:nth-child(1) {
  background: #ff5f57;
}

.browser-dots span:nth-child(2) {
  background: #febc2e;
}

.browser-dots span:nth-child(3) {
  background: #28c840;
}

.browser-url {
  flex: 1;
  height: 30px;
  line-height: 30px;
  background: white;
  border-radius: 16px;
  text-align: center;
  font-size: 13px;
  color: #666;
  border: 1px solid #ddd;
}
</style>
