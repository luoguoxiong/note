<template>
  <div class="tabs-container">
    <!-- 菜单标题映射加载完成前不渲染，避免 tab 先显示路由英文名再闪变成中文 -->
    <el-tabs
      v-if="inited"
      v-model="activeTab"
      class="tabs"
      type="card"
      :closable="openedTabs.length !== 1"
      @tab-remove="handleClose"
    >
      <el-tab-pane v-for="tab in openedTabs" :key="tab.path" :label="getTabLabel(tab)" :name="tab.path" />
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLightAppStore } from '@/stores/lightapp'
import { usePcWebPermissionStore } from '@/stores/pc-web/permission'
import { routerReload } from '@/stores/pc-web/deps/misc'
import { permissionAuthConfirm, permissionIsEqual, permissionManageUserAuthEqual } from '@/utils/permissionUtil'
import { Any } from '@/types'

interface IframeTab {
  name: string
  path: string
  query: Record<string, Any>
}

const props = defineProps<{
  iframePaths: string[]
  closeIframe: (path: string) => void
}>()

const route = useRoute()
const router = useRouter()
const lightAppStore = useLightAppStore()

// 动态 iframe 页标题：code -> menuName
const menuNameMap = ref<Record<string, string>>({})
// 静态 iframe 页标题：路由 path -> menuName
const pathNameMap = ref<Record<string, string>>({})
// 已打开的页面 tab（按访问顺序追加，新开的页面在末尾）
const openedTabs = ref<IframeTab[]>([])
// 每次路由变化不更新 tab query 的页面（对齐老项目 NEVER_FRESH；老项目另有 outside-page 本项目无此路由）
const NEVER_FRESH = ['online-settlement']
// 菜单标题映射是否已就绪（就绪前不渲染 tabs，防止显示路由英文名）
const inited = ref(false)

// 是否为 iframe 页面（静态路由 path 命中 iframePaths，动态路由走 /admin/iframe/ 前缀）
const isIframePath = (path: string) => props.iframePaths.includes(path) || path.startsWith('/admin/iframe/')

const normalizePath = (path: string) => {
  // 移除 routePath 中的 # 前缀，确保以 / 开头
  const clean = path.replace(/^#/, '')
  return clean.startsWith('/') ? clean : `/${clean}`
}

const getCodeFromPath = (path: string) => {
  const match = path.match(/^\/admin\/iframe\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : ''
}

// 子页面可归属到已有页签，点击该页签仍返回它对应的主页面。
const activeTabPath = computed(() =>
  typeof route.meta.tabParentPath === 'string' ? route.meta.tabParentPath : route.path
)
const isActive = (tab: IframeTab) => tab.path === activeTabPath.value

// tab 记录的 query：needQuerySave === 'false' 时清空（对齐老项目 updateTab）
const getTabQuery = (): Record<string, Any> => (route.query.needQuerySave === 'false' ? {} : { ...route.query })

// el-tabs v-model：点击 tab 时通过 setter 跳转路由
// 对齐老项目 clickTab：恢复 tab 记录的 query 并追加 actionType: 'tabclick' 标记页签点击来源
const activeTab = computed({
  get: () => route.path,
  set: (path: string) => {
    if (path !== route.path) {
      const tab = openedTabs.value.find((item) => item.path === path)
      router.push({
        path,
        query: { ...(tab?.query || {}), actionType: 'tabclick' },
      })
    }
  },
})

const getTabLabel = (tab: IframeTab) => {
  const code = getCodeFromPath(tab.path)
  if (code && menuNameMap.value[code]) {
    return menuNameMap.value[code]
  }
  if (pathNameMap.value[tab.path]) {
    return pathNameMap.value[tab.path]
  }
  return tab.name
}

const handleClose = (name: Any) => {
  const path = String(name)
  // 至少保留一个 tab（与 netc-pc-web 保持一致）
  if (openedTabs.value.length <= 1) return
  const tab = openedTabs.value.find((item) => item.path === path)
  if (!tab) return
  const index = openedTabs.value.findIndex((item) => item.path === path)
  const isActiveTab = isActive(tab)
  // 关闭前先计算剩余 tab，用于关闭激活 tab 时跳转到相邻 tab
  const remaining = openedTabs.value.filter((item) => item.path !== path)
  if (isIframePath(path)) {
    props.closeIframe(path)
  }
  openedTabs.value = remaining
  if (isActiveTab) {
    const target = remaining[index] || remaining[remaining.length - 1]
    // 对齐老项目 removeTab → clickTab：跳相邻 tab 时同样恢复 query 并标记页签点击来源
    router.push(target ? { path: target.path, query: { ...target.query, actionType: 'tabclick' } } : '/admin/home')
  }
}

// 记录访问过的页面（内部页面 + iframe 页面），新页面追加到末尾
// 监听 fullPath 对齐老项目 $route watch：query-only 变化也同步 tab query
watch(
  () => route.fullPath,
  () => {
    const path = route.path
    if (!path.startsWith('/admin/') || path === '/admin') return
    const tabPath = activeTabPath.value
    const tabQuery = getTabQuery()
    const existing = openedTabs.value.find((item) => item.path === tabPath)
    if (existing) {
      // 已打开则更新 tab query（子页面归属父页签时不覆盖父页签 query；NEVER_FRESH 页面不更新）
      if (tabPath === path && !NEVER_FRESH.includes(route.name as string)) {
        existing.query = tabQuery
      }
      return
    }
    const tabRoute = tabPath === path ? route : router.resolve(tabPath)
    openedTabs.value.push({
      name: (tabRoute.meta.name as string) || (tabRoute.name as string) || tabPath,
      path: tabPath,
      query: tabPath === path ? tabQuery : {},
    })
  },
  { immediate: true }
)

// ==================== 实时权限校验（迁移自 netc-pc-web/src/views/layout/tab.vue watch permissionMenuInfo） ====================

const permissionStore = usePcWebPermissionStore()

/** 批量移除 tab（越权场景关闭「账号权限」页签；旧 tab.vue removeTabMultiple） */
const removeTabs = (tabs: IframeTab[]) => {
  if (!tabs.length) return
  const paths = tabs.map((tab) => tab.path)
  openedTabs.value = openedTabs.value.filter((item) => !paths.includes(item.path))
  tabs.forEach((tab) => {
    if (isIframePath(tab.path)) props.closeIframe(tab.path)
  })
}

/**
 * 企业配置权限监听-权限变更时处理越权：
 * 回首页刷新用户信息（guard.afterEach）或账号权限子应用经 storeBridge 更新权限后，
 * permissionMenuInfo 变化触发本监听——弹窗告知身份变化，跳回首页/刷新权限页并关闭「账号权限」页签
 */
watch(
  () => permissionStore.permissionMenuInfo,
  (val, oldVal) => {
    // 过滤重复数据、未初始化数据
    if (!val || !val.id || !oldVal?.id || permissionIsEqual(val, oldVal)) {
      return
    }
    const userAuthEqualValid = permissionManageUserAuthEqual(val, oldVal)
    if (userAuthEqualValid) {
      return
    }
    // 待移除的「账号权限」页签
    const permissionOpenTabs = openedTabs.value.filter((item) => item.path === '/admin/permission-manage')
    // 是否已存在越权确认弹窗
    const dialogTarget = document.querySelector('.permission-confirm-refresh')
    nextTick(() => {
      if (!dialogTarget || (dialogTarget as HTMLElement).parentElement?.style.display === 'none') {
        const currentPermissionPage = route.path === '/admin/permission-manage'
        const targetPath = currentPermissionPage
          ? `/admin/permission-manage?time=${Date.now()}`
          : `/admin/home?time=${Date.now()}`
        // 消息绑码页面过来的不弹越权弹窗
        if (route.query.businessCode && route.query.customerCode) return
        setTimeout(() => {
          permissionAuthConfirm().then(() => {
            router.replace(targetPath).then(() => {
              if (currentPermissionPage) {
                // 权限页内身份变化：整页刷新（对齐旧基座 envSdk.routerReload：壳内 native.reload，网页 location.reload）
                routerReload()
              } else {
                setTimeout(() => removeTabs(permissionOpenTabs), 1000)
              }
            })
          })
        }, 1000)
      } else {
        removeTabs(permissionOpenTabs)
      }
    })
  },
  { immediate: true }
)

onMounted(async () => {
  try {
    await lightAppStore.init()
    menuNameMap.value = Object.fromEntries(
      lightAppStore.lightAppList.map((item: Any) => [item.menuCode, item.menuName])
    )
    // 静态路由 path -> menuName，用于 iframe 页 tab 标题
    const pathMap: Record<string, string> = {}
    lightAppStore.menusList.forEach((item: Any) => {
      if (item.menuPath) pathMap[normalizePath(item.menuPath)] = item.menuName
      item.subMenus?.forEach((child: Any) => {
        if (child.menuPath) pathMap[normalizePath(child.menuPath)] = child.menuName
      })
    })
    pathNameMap.value = pathMap
  } finally {
    // 初始化失败也兜底显示 tabs（此时标题回退为路由英文名）
    inited.value = true
  }
})
</script>

<style lang="scss" scoped>
/* 样式与 netc-pc-web src/views/layout/tab.vue 保持一致 */
.tabs-container {
  padding-top: 8px;
  position: relative;
  background: #eff1fd;

  .tabs {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 28px;
    overflow: hidden;

    :deep(.el-tabs__header) {
      margin: 0;
      background-color: #eff1fd;
    }

    :deep(.el-tabs__item) {
      height: 28px;
      line-height: 28px;
      color: #686b75;
      font-weight: normal;
      font-size: 14px;
      border-bottom: 0;
    }

    :deep(.el-tabs__item.is-active) {
      background: linear-gradient(180deg, #ffffff 0%, #f5f7fd 100%);
      color: #24262b;
      border-radius: 4px 4px 0 0;
    }
  }

  :deep(.el-tabs__nav-prev),
  :deep(.el-tabs__nav-next) {
    line-height: 28px;
  }

  :deep(.el-tabs--card > .el-tabs__header) {
    border-bottom: none;

    .el-tabs__nav {
      border: none;
    }

    .el-tabs__item {
      border-left: none;
      position: relative;
      z-index: 5;

      &.is-active {
        z-index: 6;
        margin-left: -1px;
      }

      &:not(.is-active)::after {
        content: '';
        height: 70%;
        width: 1px;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        margin: auto;
        background-color: rgba(140, 140, 140, 0.25);
        cursor: none;
      }

      &:last-child::after {
        content: none;
      }

      // 关闭按钮常驻显示（EP 默认 width:0 仅 hover/激活显示）
      .is-icon-close {
        width: 16px !important;
        height: 15px;
        font-size: 16px;
      }

      // 覆盖 EP hover 时 padding 收缩，避免 tab 宽度抖动
      &.is-closable:hover {
        padding-left: 20px;
        padding-right: 20px;
      }
    }
  }
}
</style>
