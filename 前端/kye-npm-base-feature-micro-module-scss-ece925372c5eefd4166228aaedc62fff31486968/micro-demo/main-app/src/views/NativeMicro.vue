<template>
  <div class="micro-app-4-view">
    <!-- MicroApp(京东):以自定义元素组件方式嵌入子应用4
      - name: 子应用唯一标识(沙箱隔离 key)
      - url: 子应用入口地址(dev server 8004)
      - 子应用使用 hash 路由,无需 baseroute(baseroute 仅用于 history 模式子应用)
      - MicroApp 虚拟路由系统会隔离子应用 hash,不与主应用 hash(#/micro-app-4)冲突
      - keep-alive: 子应用卸载时进入缓存而非销毁,保留状态并提升重复渲染性能
        (与主应用 <keep-alive include="MicroApp4"> 配合:路由切走时 wrapper 组件被缓存,
         <micro-app> 随之 detach,MicroApp 通过 name=app4 缓存子应用实例,切回时恢复)
      - 支持 ?route=xxx 查询参数指定子应用的初始路由(如 ?route=vuex-counter)
    -->
    <micro-app
      :name="appName"
      :url="appUrl"
      keep-router-state
      keep-alive
    ></micro-app>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({ name: 'MicroApp4' });

const route = useRoute();

const subRoute = computed(() => route.query.route || '');

const appName = computed(() => 'app4');

const appUrl = computed(() => {
  const base = 'http://localhost:8004/#/';
  return subRoute.value ? `${base}${subRoute.value}` : base;
});
</script>

<style scoped>
.micro-app-4-view {
  min-height: 60vh;
}
</style>
