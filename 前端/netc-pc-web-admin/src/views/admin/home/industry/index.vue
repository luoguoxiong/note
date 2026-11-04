<template>
  <div class="industry-detail">
    <div class="detail-header">
      <KBreadcrumb show-back :items="['首页', '行业解决方案']" @back="handleBack" @navigate="handleNavigate" />
    </div>

    <div class="detail-tabs" :class="{ 'is-stuck': isStuck }" v-if="tabList.length > 0">
      <div
        v-for="(tab, index) in tabList"
        :key="index"
        class="tab-item"
        :class="{ active: activeIndex === index }"
        @click="handleTabClick(index)"
      >
        {{ tab.title }}
      </div>
    </div>

    <!-- banner 图随 tab 切换：优先 CMS bannerImg，未下发时取正文第一张图片。适配规则与首页 banner 一致：宽度撑满、高度固定、cover 裁切 -->
    <div class="detail-banner" v-if="activeBannerImg">
      <img :src="activeBannerImg" :alt="tabList[activeIndex]?.title" />
    </div>

    <div class="detail-content">
      <el-skeleton v-if="loading" animated :rows="6" class="image-skeleton" />
      <!-- 保留各行业图片节点，切换时仅控制显示，避免重复创建图片。 -->
      <div v-for="(tab, index) in tabList" :key="index" v-show="activeIndex === index" class="industry-panel">
        <template v-if="tab.content">
          <el-skeleton v-if="!readyPanels.has(index)" animated :rows="6" class="image-skeleton" />
          <div
            v-first-image-ready="index"
            v-show="readyPanels.has(index)"
            class="html-content"
            v-html="tab.content"
          ></div>
        </template>
        <div v-else class="empty-content">
          <p>暂无内容</p>
        </div>
      </div>
      <div v-if="!loading && !tabList[activeIndex]" class="empty-content">
        <p>暂无内容</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated, onBeforeUnmount, nextTick, type Directive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KBreadcrumb } from '@netc-design-pc/ui'
import { getSecondPriorityData } from '@/apis/home'

interface IndustryConfig {
  title: string
  content: string
  /** CMS 下发的详情页 banner 图；未下发时取正文第一张图片，仍为空则隐藏 banner 区域 */
  bannerImg?: string
  menuId?: number | string
}

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const tabList = ref<IndustryConfig[]>([])
const readyPanels = ref(new Set<number>())
// 使用正文中的真实图片节点等待解码；失败时展示正文，避免骨架一直保留。
const vFirstImageReady: Directive<HTMLElement, number> = {
  async mounted(el, { value: index }) {
    const firstImage = el.querySelector('img')
    try {
      if (firstImage) await firstImage.decode()
    } catch {
      // 图片不可用时仍允许查看剩余正文。
    } finally {
      readyPanels.value.add(index)
    }
  },
}
// 优先按稳定标识 menuId 匹配，避免后台重排/过滤后下标错位；无 menuId 时回退 active 下标。
const activeIndex = computed(() => {
  const menuId = route.query.menuId
  if (typeof menuId === 'string' && menuId !== '') {
    const byMenuId = tabList.value.findIndex((item) => String(item.menuId) === menuId)
    if (byMenuId >= 0) return byMenuId
  }
  return (Number(route.query.active) || 1) - 1
})

// banner 图取当前 tab 的 bannerImg，空串/纯空白视为未下发，隐藏 banner 区域
const activeBannerImg = computed(() => {
  const img = tabList.value[activeIndex.value]?.bannerImg
  return typeof img === 'string' && img.trim() ? img.trim() : ''
})

const handleBack = () => {
  router.back()
}

// 面包屑导航：点击"首页"跳回新客首页；末项为当前页无需处理
const handleNavigate = (index: number) => {
  if (index === 0) router.push('/admin/home')
}

const resetScroll = async () => {
  await nextTick()
  const scrollContainer = document.getElementById('page-content')
  if (scrollContainer) scrollContainer.scrollTop = 0
}

const handleTabClick = async (index: number) => {
  const menuId = tabList.value[index]?.menuId
  await router.replace({
    query: {
      ...route.query,
      active: String(index + 1),
      ...(menuId !== undefined ? { menuId: String(menuId) } : {}),
    },
  })
  await resetScroll()
}

// 新约定：正文第一张图片即详情页 banner，需从正文中摘出单独渲染，剩余图片作为内容图展示
const extractBannerFromContent = (content: string): { content: string; bannerImg: string } => {
  const doc = new DOMParser().parseFromString(content, 'text/html')
  const firstImg = doc.body.querySelector('img')
  if (!firstImg) return { content, bannerImg: '' }
  const bannerImg = (firstImg.getAttribute('src') || '').trim()
  const parent = firstImg.parentElement
  firstImg.remove()
  // 仅包裹该图片的段落摘出图片后会变成空节点，一并移除避免正文顶部残留空白
  if (parent && parent !== doc.body && !parent.textContent?.trim() && !parent.querySelector('img')) {
    parent.remove()
  }
  return { content: doc.body.innerHTML, bannerImg }
}

const loadConfig = async () => {
  loading.value = true
  try {
    const { data } = await getSecondPriorityData()
    const config = JSON.parse(data.solutionCmsConfig || '[]')
    tabList.value = Array.isArray(config)
      ? config
          .filter((item: IndustryConfig) => item && typeof item.title === 'string' && typeof item.content === 'string')
          .map((item: IndustryConfig) => {
            // CMS 已下发 bannerImg 时以接口为准；否则取正文第一张图片作为 banner
            if (item.bannerImg?.trim()) return item
            return { ...item, ...extractBannerFromContent(item.content) }
          })
      : []
  } catch (error) {
    console.error('Failed to load industry config:', error)
  } finally {
    loading.value = false
  }
}

// 吸附态边缘线（QA 验收：滚动页面时 tabs 底部出现 1px #E6E8ED 边缘线，与滚动内容分隔）
const isStuck = ref(false)
let scrollContainer: HTMLElement | null = null
const handleContentScroll = () => {
  isStuck.value = (scrollContainer?.scrollTop ?? 0) > 0
}

onMounted(() => {
  loadConfig()
  // 页面滚动发生在后台布局共享的 #page-content 内（非 window），监听其 scroll 控制 tabs 吸附态
  scrollContainer = document.getElementById('page-content')
  scrollContainer?.addEventListener('scroll', handleContentScroll, { passive: true })
  handleContentScroll()
})

onBeforeUnmount(() => {
  scrollContainer?.removeEventListener('scroll', handleContentScroll)
  scrollContainer = null
})
onActivated(resetScroll)
</script>

<style lang="scss" scoped>
.industry-detail {
  // 仅详情页抵消后台内容区的左右留白，实现通栏。
  // margin: 0 -14px;
  min-height: 100vh;
  background: #fff;
  box-sizing: border-box;
}

/* 设计稿：工具栏高 48、左右 24、白→浅蓝纵向渐变底；置顶吸附保证滚动时返回入口始终可见 */
.detail-header {
  position: sticky;
  top: 0;
  // 高于 detail-tabs 的 z-index:1，避免长内容（图片/标题）滚动时穿透覆盖
  z-index: 2;
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 24px;
  background: var(---C9-Gradient-02-, linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(245, 247, 253, 1) 100%));
}

/* banner 适配规则与首页 banner 一致：宽度撑满、高度固定 224px、object-fit: cover 居中裁切，不随页面宽度放大缩小 */
.detail-banner img {
  display: block;
  width: 100%;
  height: 224px;
  object-fit: cover;
}

.detail-tabs {
  position: sticky;
  // QA1028：吸附态下 header(0~48) 与 tabs(48~) 两个 sticky 因亚像素取值会露出 1px 缝隙线（滚动时可见）。
  // tabs 上移 1px 塞到 header 底下（header z-index:2 更高），padding-top:1px 保持 tab 项原视觉位置，缝隙不再可能出现
  top: 47px;
  z-index: 1;
  display: flex;
  gap: 24px;
  padding: 1px 24px 0;
  background: #fff;
  overflow-x: auto;
  box-sizing: border-box;

  /* QA1102：吸附态下 tabs 底部出现 1px #E6E8ED 边缘线，与滚动内容分隔；
     用 box-shadow 而非 border，避免增加 1px 布局高度引起抖动 */
  &.is-stuck {
    box-shadow: 0 1px 0 0 #e6e8ed;
  }
}

.tab-item {
  position: relative;
  flex-shrink: 0;
  padding: 13px 0;
  font-size: 15px;
  line-height: 22px;
  font-weight: 600;
  color: #24262b;
  cursor: pointer;
  transition: color 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: #7143f0;
  }

  &.active {
    color: #7143f0;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 40px;
      height: 3px;
      border-radius: 12px;
      background: #7143f0;
      transform: translateX(-50%);
    }
  }
}

.detail-content {
  background: #fff;
  min-height: 400px;
  // padding: 64px 0;
}

.image-skeleton {
  // 与内容区域保持一致的固定宽度居中
  width: 956px;
  margin: 0 auto;
  min-height: 400px;
  padding: 32px 24px;
  box-sizing: border-box;
}

.html-content {
  // width: 956px;
  margin: 0 auto;

  line-height: 1.8;
  color: #24262b;
  // padding: 0 24px;
  :deep(h2) {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: #24262b;
  }

  :deep(p) {
    font-size: 14px;
    color: #606266;
    margin: 0;
  }

  :deep(img) {
    /* 内容图固定 956px 宽、水平居中，不随页面宽度缩放；
       !important 用于覆盖 CMS 图片自带的 max-width:100% 内联样式 */
    display: block !important;
    width: 956px !important;
    max-width: none !important;
    height: auto !important;
    margin: 0 auto !important;
  }
}

.empty-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #8a8d96;
  font-size: 14px;
}
</style>
