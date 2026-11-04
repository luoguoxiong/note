<template>
  <div id="menu">
    <div id="menu-content" class="menu">
      <!-- 无缓存加载中：菜单骨架屏 -->
      <div v-if="menuStatus === 'loading'" class="menu-skeleton">
        <el-skeleton animated>
          <template #template>
            <div v-for="i in 8" :key="i" class="skeleton-item">
              <el-skeleton-item variant="image" class="skeleton-icon" />
              <el-skeleton-item v-if="!isCollapse" variant="text" class="skeleton-text" />
            </div>
          </template>
        </el-skeleton>
      </div>
      <!-- 无缓存且加载失败：重试 -->
      <div v-else-if="menuStatus === 'error'" class="menu-error">
        <div class="menu-error-text">菜单加载失败</div>
        <el-button type="primary" size="small" class="menu-error-btn" @click="refreshMenu"> 重新加载 </el-button>
      </div>
      <!-- 正常菜单（有数据，含缓存秒显） -->
      <el-menu
        v-else
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        @select="handleSelect"
      >
        <template v-for="item in menusList" :key="item.menuCode">
          <el-sub-menu v-if="item.subMenus?.length" :index="item.menuCode" popper-class="menu-submenu--main">
            <template #title>
              <svg-icon
                v-if="item.menuDefaultIcon"
                :icon-class="menuIconClass(item, isParentActive(item))"
                class="menu-icon"
              />
              <img
                v-else-if="menuIconSrc(item, isParentActive(item))"
                :src="menuIconSrc(item, isParentActive(item))"
                class="menu-icon"
              />
              <span class="menu-text">{{ item.menuName }}</span>
              <!-- 气泡角标（style=40）：自身或子菜单的气泡挂可见的父级标题（对齐老项目）；折叠态不渲染 -->
              <CornerBubble
                v-if="bubbleCornerOf(item) && !isCollapse"
                :corner="bubbleCornerOf(item)"
                @close="cornerStore.dismissCorner"
              />
              <span v-else-if="hasCorner(item)" class="menu-corner" :class="`menu-corner--${cornerStyle(item)}`">
                <img
                  v-if="cornerStyle(item) === 1 && hasCornerPicture(item)"
                  :src="cornerPicture(item)"
                  class="menu-corner__img"
                  alt=""
                />
                <span v-else-if="cornerStyle(item) === 2" class="menu-corner__num">{{ cornerNumText(item) }}</span>
                <span v-else class="menu-corner__dot"></span>
              </span>
            </template>
            <el-menu-item
              v-for="child in item.subMenus"
              :key="child.menuCode"
              :index="normalizePath(child.menuPath || '')"
            >
              <svg-icon
                v-if="child.menuDefaultIcon"
                :icon-class="menuIconClass(child, isActive(child))"
                class="menu-icon"
              />
              <img
                v-else-if="menuIconSrc(child, isActive(child))"
                :src="menuIconSrc(child, isActive(child))"
                class="menu-icon"
              />
              <span class="menu-text">{{ child.menuName }}</span>
              <!-- 子菜单的 style=40 气泡上浮到父级标题展示，此处只渲染其他样式角标 -->
              <span
                v-if="hasCorner(child) && cornerStyle(child) !== 40"
                class="menu-corner"
                :class="`menu-corner--${cornerStyle(child)}`"
              >
                <img
                  v-if="cornerStyle(child) === 1 && hasCornerPicture(child)"
                  :src="cornerPicture(child)"
                  class="menu-corner__img"
                  alt=""
                />
                <span v-else-if="cornerStyle(child) === 2" class="menu-corner__num">{{ cornerNumText(child) }}</span>
                <span v-else class="menu-corner__dot"></span>
              </span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="normalizePath(item.menuPath || '')">
            <svg-icon v-if="item.menuDefaultIcon" :icon-class="menuIconClass(item, isActive(item))" class="menu-icon" />
            <img
              v-else-if="menuIconSrc(item, isActive(item))"
              :src="menuIconSrc(item, isActive(item))"
              class="menu-icon"
            />
            <span class="menu-text">{{ item.menuName }}</span>
            <!-- 叶子菜单自身可见，气泡直接挂当前项；折叠态降级为红点 -->
            <CornerBubble
              v-if="hasCorner(item) && cornerStyle(item) === 40 && !isCollapse"
              :corner="cornerOf(item)"
              @close="cornerStore.dismissCorner"
            />
            <span v-else-if="hasCorner(item)" class="menu-corner" :class="`menu-corner--${cornerStyle(item)}`">
              <img
                v-if="cornerStyle(item) === 1 && hasCornerPicture(item)"
                :src="cornerPicture(item)"
                class="menu-corner__img"
                alt=""
              />
              <span v-else-if="cornerStyle(item) === 2" class="menu-corner__num">{{ cornerNumText(item) }}</span>
              <span v-else class="menu-corner__dot"></span>
            </span>
          </el-menu-item>
        </template>
      </el-menu>
    </div>
    <div id="menu-handle-btn" @click="handleClick">
      <div class="icon-content">
        <svg
          v-if="isCollapse"
          class="fold-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            d="M2,2L14,2L14,3.5L2,3.5L2,2ZM10,11L14,8L10,5L10,11ZM2,7.25L9,7.25L9,8.75L2,8.75L2,7.25ZM2,12.5L14,12.5L14,14L2,14L2,12.5Z"
            fill-rule="evenodd"
            fill-opacity="1"
          />
        </svg>
        <svg
          v-else
          class="fold-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            d="M2,2L14,2L14,3.5L2,3.5L2,2ZM14,11L10,8L14,5L14,11ZM2,7.25L9,7.25L9,8.75L2,8.75L2,7.25ZM2,12.5L14,12.5L14,14L2,14L2,12.5Z"
            fill-rule="evenodd"
            fill-opacity="1"
          />
        </svg>
        <div class="fold-tooltip">{{ isCollapse ? '展开' : '收起' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLightAppStore } from '@/stores/lightapp'
import { useCornerStore } from '@/stores/corner'
import type { MenuItem } from '@/stores/mock'
import SvgIcon from './svg/index.vue'
import CornerBubble from './corner-bubble.vue'

interface MenuProps {
  isCollapse: boolean
  handleCollapse: (bol: boolean) => void
}
const props = defineProps<MenuProps>()

const route = useRoute()
const router = useRouter()
const lightAppStore = useLightAppStore()
const cornerStore = useCornerStore()

const menusList = computed(() => lightAppStore.menusList)

/** 菜单展示状态：loading / error / success */
const menuStatus = computed(() => lightAppStore.menuStatus)

/** 失败重试（initPromise 失败后已置空，可重新发起请求） */
const refreshMenu = () => {
  lightAppStore.init()
}

const activeMenu = computed(() => {
  for (const item of menusList.value) {
    if (item.subMenus?.length) {
      for (const child of item.subMenus) {
        if (isActive(child)) return normalizePath(child.menuPath || '')
      }
    } else if (isActive(item)) {
      return normalizePath(item.menuPath || '')
    }
  }
  return route.path
})

const normalizePath = (path: string) => {
  if (!path) return ''
  // 移除路径中的 # 前缀
  const clean = path.replace(/^#/, '')
  // 确保以 / 开头
  return clean.startsWith('/') ? clean : `/${clean}`
}

const menuIconSrc = (item: MenuItem, active: boolean) => {
  return active ? item.activeIcon || item.defaultIcon || item.menuIcon || '' : item.defaultIcon || item.menuIcon || ''
}

/** 新框架图标名：选中用 menuSelectIcon，未选中用 menuDefaultIcon（对齐 netc-pc-web 的 `${icon}-cos` 切换逻辑） */
const menuIconClass = (item: MenuItem, active: boolean) => {
  return active ? item.menuSelectIcon || item.menuDefaultIcon || '' : item.menuDefaultIcon || ''
}

const isActive = (item: MenuItem) => {
  const menuPath = normalizePath(item.menuPath || '')
  if (!menuPath) return false
  // 前缀匹配：子路由页面同样保持菜单高亮（对齐参考项目 setMenuIndex 的 startsWith 逻辑）
  return route.path === menuPath || route.path.startsWith(`${menuPath}/`)
}

const isParentActive = (item: MenuItem) => {
  return item.subMenus?.some((child) => isActive(child)) ?? false
}

// ========== 菜单角标 ==========
/** 取菜单第一个角标（对齐老项目 corners[0] 语义） */
const cornerOf = (item: MenuItem) => cornerStore.getCornersByMenuId(item.menuId)[0]
const hasCorner = (item: MenuItem) => !!cornerOf(item)
const cornerStyle = (item: MenuItem) => cornerOf(item)?.style ?? 0
const cornerContent = (item: MenuItem) => cornerOf(item)?.content || ''
const cornerPicture = (item: MenuItem) => cornerOf(item)?.pictureLink || ''

/** 父级标题上的气泡角标：自身优先，其次子菜单的第一个 style=40 角标（子项隐藏时挂可见的父级标题，对齐老项目） */
const bubbleCornerOf = (item: MenuItem) => {
  const own = cornerStore.getCornersByMenuId(item.menuId).find((c) => c.style === 40)
  if (own) return own
  for (const child of item.subMenus || []) {
    const childCorner = cornerStore.getCornersByMenuId(child.menuId).find((c) => c.style === 40)
    if (childCorner) return childCorner
  }
  return undefined
}
/** 数字微标：超过 99 显示 99+，非数字内容原样展示 */
const cornerNumText = (item: MenuItem) => {
  const content = cornerContent(item)
  const num = Number(content)
  return Number.isFinite(num) && num > 99 ? '99+' : content
}
/** 自定义图片：pictureLink 为空时降级为红点（真实数据存在 style=1 无图场景） */
const hasCornerPicture = (item: MenuItem) => !!cornerPicture(item)

/** 按跳转路径（normalizePath(menuPath)）反查菜单项 */
const findMenuByPath = (path: string): MenuItem | undefined => {
  for (const item of menusList.value) {
    if (normalizePath(item.menuPath || '') === path) return item
    const child = item.subMenus?.find((c) => normalizePath(c.menuPath || '') === path)
    if (child) return child
  }
  return undefined
}

const handleSelect = (index: string) => {
  // 点击菜单：消除角标并上报
  const menu = findMenuByPath(index)
  if (menu?.menuId) cornerStore.clickCorner(menu.menuId)
  router.push(index)
}

const handleClick = () => {
  props.handleCollapse(!props.isCollapse)
}

onMounted(() => {
  lightAppStore.init()
  // 角标按 menuId 匹配，与菜单加载无强依赖，并行拉取
  // cornerStore.fetchCorners()
})
</script>
<style lang="scss">
@import './el-reset.scss';
</style>
<style lang="scss" scoped>
@import './index.scss';
</style>
