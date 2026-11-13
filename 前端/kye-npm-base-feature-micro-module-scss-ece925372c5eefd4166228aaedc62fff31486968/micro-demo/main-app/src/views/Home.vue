<template>
  <div class="home-view">
    <div class="card">
      <h2>欢迎来到主应用</h2>
      <p>这是一个基于 Vue3 + Webpack5 的微前端架构 demo</p>
      <div class="features">
        <h3>架构特点</h3>
        <ul>
          <li>主应用作为基座，统一管理路由和布局</li>
          <li>子应用独立开发、独立打包、独立运行</li>
          <li>子应用支持 umd 格式导出，可被全局引用</li>
          <li>每个子应用拥有独立的路由和组件</li>
        </ul>
      </div>
      <div class="usage">
        <h3>使用说明</h3>
        <p>点击导航栏切换到不同的子应用</p>
      </div>
      <div class="shared">
        <h3>共享组件 demo</h3>
        <p>下方按钮来自子应用(user),通过 useRemoteComponent 按需引入:</p>
        <div class="shared-actions">
          <SharedButton type="primary" @click="onSharedClick"
            >用户共享组件 按钮</SharedButton
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import { useRemoteComponent } from '@kye-netc/micro-module';

// 引入子应用1共享的 button 组件:
//  - useRemoteComponent 找不到时会按 name 自动加载 subApp1(主应用上下文注入了解析器)
//  - 组件 chunk 仍从子应用自身域加载(复用其 publicPath)
const SharedButton = defineAsyncComponent(() =>
  useRemoteComponent({ name: 'user', component: 'button' }),
);

const onSharedClick = () => {
  console.log('子应用1共享按钮被点击');
};
</script>

<style scoped>
.home-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
}

.card h2 {
  color: #333;
  font-size: 28px;
  margin-bottom: 16px;
}

.card p {
  color: #666;
  font-size: 16px;
  margin-bottom: 24px;
  line-height: 1.6;
}

.features,
.usage {
  margin-bottom: 24px;
}

.features h3,
.usage h3 {
  color: #333;
  font-size: 18px;
  margin-bottom: 12px;
}

.features ul {
  list-style: none;
}

.features li {
  padding: 8px 0;
  color: #555;
  padding-left: 24px;
  position: relative;
}

.features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.shared {
  margin-top: 8px;
}

.shared h3 {
  color: #333;
  font-size: 18px;
  margin-bottom: 12px;
}

.shared p {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.shared-actions {
  display: flex;
  gap: 12px;
}
</style>
