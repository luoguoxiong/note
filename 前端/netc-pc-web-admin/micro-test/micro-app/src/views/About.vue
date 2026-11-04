<template>
  <div class="about-view">
    <div class="card">
      <h2>关于 MicroApp 子应用4</h2>
      <p>
        MicroApp 采用 Web Components
        思想,将子应用封装为自定义元素,主应用像使用组件一样嵌入子应用。
      </p>
      <dl class="info">
        <dt>框架</dt>
        <dd>Vue 3 + Vue Router 4(history 模式 + baseroute)</dd>
        <dt>接入方式</dt>
        <dd>@micro-zoe/micro-app(microApp.start + &lt;micro-app&gt;)</dd>
        <dt>沙箱</dt>
        <dd>MicroApp ProxySandbox(JS 隔离)+ 样式作用域隔离</dd>
        <dt>独立访问</dt>
        <dd>http://localhost:8004</dd>
      </dl>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.about-view {
  display: flex;
  justify-content: center;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 36px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 640px;
  width: 100%;
}

.card h2 {
  color: #333;
  font-size: 22px;
  margin-bottom: 14px;
}

.card p {
  color: #666;
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 20px;
}

.info dt {
  font-weight: bold;
  color: #e6a23c;
  margin-top: 10px;
}

.info dd {
  margin: 4px 0 0 0;
  color: #555;
  font-size: 14px;
}
</style>
