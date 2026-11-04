<template>
  <el-config-provider :locale="zhCn">
    <router-view></router-view>
    <!-- 全局无权限/未绑码拦截弹窗（路由守卫触发） -->
    <PermissionDialog />
  </el-config-provider>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import PermissionDialog from '@/components/permission-dialog/index.vue'
import { useUserStore } from '@/stores/user'
import { useLightAppStore } from '@/stores/lightapp'
import { appInitPage } from '@/hooks/init'
const route = useRoute()
/* 关闭全局页面加载loading（首条路由渲染后隐藏 index.html 的静态 loading） */
watch(
  route,
  (val) => {
    if (val?.path === '/') return
    const loadingDiv = document.querySelector('.first-loading--static') as HTMLElement
    if (loadingDiv) {
      loadingDiv.style.display = 'none'
    }
  },
  { immediate: true }
)
onMounted(() => {
  useUserStore().init()
  useLightAppStore().init()
})
/* 应用初始化：拉取用户信息并写入 store（原 iframe 桥接初始化的本地替代） */
;(function () {
  appInitPage()
})()
</script>
