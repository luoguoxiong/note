<template>
  <div class="micro-app-4">
    <nav class="m4-nav">
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
      <router-link to="/list">列表</router-link>
    </nav>
    <div class="m4-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.micro-app-4 {
  min-height: 100%;
}

.m4-nav {
  display: flex;
  gap: 16px;
  padding: 12px 20px;
  background: #f0f2f5;
  border-bottom: 1px solid #e8e8e8;
}

.m4-nav a {
  color: #e6a23c;
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 4px;
  font-weight: 500;
  transition: background 0.3s;
}

.m4-nav a:hover {
  background: rgba(230, 162, 60, 0.15);
}

.m4-nav a.router-link-active {
  background: #e6a23c;
  color: white;
}

.m4-content {
  padding: 8px 0;
}
</style>
