<template>
  <div id="admin">
    <Header></Header>
    <div id="layout-content">
      <div id="menu-wrap" :class="isCollapse ? 'collapse ' : ''">
        <!-- 侧边栏头像区域: 用户信息 + 添加/切换客户编码 + 切换部门(来源: 老基座 avatar.vue 业务块) -->
        <UserInfo class="menu-user-info" :is-collapse="isCollapse" />
        <CustomerCodeButton class="menu-customer-code" :is-collapse="isCollapse" />
        <DepartmentSwitch class="menu-dept" :is-collapse="isCollapse" />
        <Menu :is-collapse="isCollapse" :handle-collapse="handleCollapse"></Menu>
      </div>
      <div id="page-wrap">
        <Loading v-if="isHomeLoading" class="page-loading" />
        <Tabs :iframe-paths="iframePaths" :close-iframe="closeIframe"></Tabs>
        <!-- 保持路由组件挂载以发起接口，加载完成前隐藏内容。 -->
        <div id="page-content" v-show="!isHomeLoading">
          <!-- <keep-alive :include="['order']"> -->
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
          <component
            v-for="item in renderComponentsArr"
            :key="item.path"
            :is="item.name"
            v-show="route.path === item.path && !item.closed"
          ></component>
        </div>
      </div>
    </div>
    <!-- 悬浮导航（对齐老项目 side-navigation：仅运单/理赔相关路由显示，组件内部按路由名控制显隐） -->
    <SideNavigation />
  </div>
</template>

<script setup lang="ts">
import Header from './components/header/index.vue'
import Menu from './components/menu/index.vue'
import Tabs from './components/tabs/index.vue'
import CustomerCodeButton from './components/customer-code/index.vue'
import DepartmentSwitch from './components/dept/index.vue'
import UserInfo from './components/user-info/index.vue'
import Loading from '@/components/loading/index.vue'
import SideNavigation from '@/components/side-navigation/index.vue'
import { useHomeStore } from '@/stores/home'
import { useUserStore } from '@/stores/user'
import { useRoute } from 'vue-router'
import { computed, onBeforeMount, onMounted } from 'vue'
import { isClientMode, maximize, setLoginFormFlag } from '@/native/electron'
import { useRoutePrefetch } from './hooks/useRoutePrefetch'
import { useLayout } from './hooks/useLayout'
import originalMessage from '@/utils/iframeBridge/originalMessage'
import { setupApplicationVersionCheck } from '@/utils/updateCheck/versionCheck'

const { renderComponentsArr, closeIframe, iframePaths } = useRoutePrefetch()
const { isCollapse, handleCollapse } = useLayout()

const route = useRoute()
const homeStore = useHomeStore()
const userStore = useUserStore()
const isHomeLoading = computed(() => route.path === '/admin/home' && (homeStore.isFetching || !userStore.isInitialized))

// 原始 postMessage 监听(未接入 iframeBridge 的子应用, 对齐老项目 admin.vue onBeforeMount)
onBeforeMount(() => {
  originalMessage.originalIframeMessageHandle()
  // 版本升级检查入队(主应用升级 + 轻应用静态更新, 仅登录后布局内后台轮询; 幂等)
  setupApplicationVersionCheck()
})

// 客户端模式下，登录进入主应用时最大化窗口(对齐老项目 admin.vue created; 刷新页面不重复触发)
onMounted(() => {
  if (!isClientMode()) return
  if (sessionStorage.getItem('isReload')) return
  maximize()
  setLoginFormFlag(false)
  sessionStorage.setItem('isReload', '1')
})
</script>
<style lang="scss" scoped>
@import './index.scss';

#page-wrap > .page-loading {
  position: absolute;
  z-index: 10;
  pointer-events: auto;
}
</style>
