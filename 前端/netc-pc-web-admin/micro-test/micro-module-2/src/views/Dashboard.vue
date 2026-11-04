<template>
  <div class="dashboard-view">
    <div class="charts">
      <div class="chart-item">
        <h4>销售额趋势</h4>
        <div class="bar-chart">
          <div class="bar" style="height: 80%"></div>
          <div class="bar" style="height: 60%"></div>
          <div class="bar" style="height: 90%"></div>
          <div class="bar" style="height: 70%"></div>
          <div class="bar" style="height: 95%"></div>
        </div>
      </div>
      <div class="chart-item">
        <h4>转化率</h4>
        <div class="circle-chart">
          <div class="circle" style="--percent: 75"></div>
          <span class="percent-text">75%</span>
        </div>
        <SharedButton type="primary" @click="onSharedClick">用户远程组件 按钮</SharedButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
// 子应用必须从 /sub-app 入口引入,避免把 loader/sandbox/router 拉进子应用 bundle
import { useRemoteComponent } from '@kye-netc/micro-module/sub-app'

// 引入子应用1共享的 button 组件(子应用 → 子应用):
//  - useRemoteComponent 找不到时,通过真实 window 上的全局加载解析器触发主应用 loader 加载 subApp1
//  - 加载解析器由主应用启动时写入,子应用沙箱内经 get 透传读取
//  - 组件 chunk 仍从 subApp1 自身域加载(复用其 publicPath)
const SharedButton = defineAsyncComponent(() => useRemoteComponent({ name: 'user', component: 'button' }))

const onSharedClick = () => {
  console.log('subApp1 共享按钮在 subApp2 中被点击')
}
</script>

<style scoped>
.dashboard-view h3 {
  color: #333;
  font-size: 22px;
  margin-bottom: 12px;
}

.dashboard-view p {
  color: #666;
  margin-bottom: 24px;
}

.charts {
  display: flex;
  gap: 20px;
}

.chart-item {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-item h4 {
  color: #333;
  font-size: 16px;
  margin-bottom: 16px;
}

.bar-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 120px;
  gap: 10px;
}

.bar {
  flex: 1;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 4px 4px 0 0;
  min-height: 10px;
}

.circle-chart {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 8px solid #e0e0e0;
  border-top-color: #4facfe;
  border-right-color: #4facfe;
  transform: rotate(calc(var(--percent) * 3.6deg - 90deg));
}

.percent-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
</style>
