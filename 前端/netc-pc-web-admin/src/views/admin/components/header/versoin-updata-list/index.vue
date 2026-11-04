<template>
  <ky-drawer
    title="版本介绍"
    :class="['message-center__drawer', isOldClient && 'message-center__drawer-hack']"
    v-model:visible="visible"
    :modal="false"
    :size="540"
    :width="540"
    @confirm="handleConfirm"
  >
    <!--  版本更新列表  -->
    <message-center-list
      v-if="visible"
      :data="pageData.rows"
      :pageIndex="pageData.page"
      :pageSize="pageData.pageSize"
      :tabCurrent="tabCurrent"
      :loading="loading"
      :hasMore="pageHasMore"
      @onLoad="onLoad"
      @updateDataList="updateDataList"
      @onRefresh="onRefreshList"
      ref="listRef"
    />
  </ky-drawer>
</template>

<script setup lang="ts">
/**
 * 版本更新列表抽屉入口
 * 来源: netc-pc-web/src/views/versoin-updata-list/index.vue
 *
 * 迁移说明:
 * - @vue/composition-api -> vue script setup
 * - ky-drawer `:visible.sync` -> v-model:visible(本目录复刻组件)
 * - @api/versoinUpdata.getHistoryVersionList -> ../api getHistoryVersionList
 * - 老项目 `...toRefs(state)` 返回 -> script setup 顶层 ref/computed 直接暴露模板
 * - isOldClientMode: 老项目全局 mixin -> @/native/electron 函数导入
 */
import { computed, provide, ref, watch } from 'vue'
import KyDrawer from '../shared/ky-drawer.vue'
import MessageCenterList from './components/message-center-list.vue'
import { getHistoryVersionList } from '../api'
import { isOldClientMode } from '@/native/electron'
import type { VersionPageData, VersionRow, VersionTabItem } from './types'

defineOptions({ name: 'message-center-entry' })

/* 列表分页初始数据 */
const initialPageData: VersionPageData = {
  page: 1,
  pageSize: 10,
  pageTotal: 0,
  rowTotal: 0,
  rows: [], // 消息列表()
}

const visible = ref(false) // 抽屉是否展示
const loading = ref(false) // 列表loading
const tabNameValue = ref<string | number>('') // 当前分类value
const tabLists = ref<VersionTabItem[]>([]) // 分类 [{'label':'',value:'',isHaveNewMessage:false,unreadCount:0}]
const pageData = ref<VersionPageData>({ ...initialPageData, rows: [] })
const pageHasMore = ref(true) // 是否有下一页
const listRef = ref() // 列表ref
// 当前tab数据
const tabCurrent = computed<VersionTabItem>(() => {
  return tabLists.value.find((f) => Number(f.value) === Number(tabNameValue.value)) || ({} as VersionTabItem)
})

/* hack oldClient */
const isOldClient = isOldClientMode()

/**
 * 打开抽屉
 */
const showDrawer = () => {
  switchVisibleCallback(true)
}

const handleConfirm = () => {
  switchVisibleCallback(false)
}

/**
 * 切换是否展示弹窗
 * @param val Boolean
 */
const switchVisibleCallback = (val: boolean) => {
  visible.value = val
}

// 消息抽屉开关函数
provide('switchVisibleCallback', switchVisibleCallback)

watch(visible, (val) => {
  if (val) {
    pageInit()
  } else {
    pageDataReset()
  }
})

/**
 * 初始化页面
 */
async function pageInit() {
  await handleMessageList()
}

/**
 * 初始化列表
 */
const pageDataReset = () => {
  pageData.value = { ...initialPageData, rows: [] } // 初始化列表及分页
  pageHasMore.value = true
  tabNameValue.value = ''
  tabLists.value = []
}

interface HandleListOptions {
  rowParams?: Record<string, any> | null
  renderBefore?: (() => void) | null
}

/**
 * 获取列表
 * @param options.rowParams 默认取当前列表最后一条
 */
async function handleMessageList({ rowParams = null, renderBefore = null }: HandleListOptions = {}) {
  try {
    loading.value = true
    const { pageSize, page } = pageData.value
    const params = {
      ...rowParams,
      pushClientType: '2',
      pageSize,
      page,
    }
    const res = await getHistoryVersionList(params)
    if (renderBefore && typeof renderBefore === 'function') {
      renderBefore()
    }
    if (res.code === 0 && res.data) {
      pageData.value = {
        ...res.data,
        page: pageData.value.page,
        pageSize: pageData.value.pageSize,
        rows: pageData.value.rows.concat(res.data.rows || []),
      }
      if (params.page > res.data.pageTotal) {
        pageHasMore.value = false
      }
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

const onLoad = () => {
  if (pageHasMore.value) {
    console.log('加载下一页')
    pageData.value.page += 1
    handleMessageList()
  } else {
    console.log('没有下一页')
  }
}
/* 刷新列表数据 */
const onRefreshList = async (callback?: () => void) => {
  callback && callback()
}
/**
 * 更新当前消息列表数据
 * @param rows
 */
const updateDataList = (rows: VersionRow[]) => {
  if (rows) {
    pageData.value.rows = rows
  }
}

defineExpose({ showDrawer })
</script>

<style lang="scss" scoped>
.message-center__drawer {
  :deep(.ky-drawer__title) {
    font-size: 15px;
  }

  .message-center__tabs {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 1px;
      background-color: #f1f1f5;
      z-index: 1;
    }

    &-badge {
      line-height: 1;

      :deep(.el-badge__content) {
        scale: 0.9;
        top: -2px;
        right: 4px;
        transition: initial;
      }
    }

    &-title {
      font-size: 14px;
    }

    :deep() {
      .el-tabs__header {
        margin-bottom: 0;
      }

      .el-tabs__nav-prev,
      .el-tabs__nav-next {
        line-height: 54px;
        color: #bfbfbf;

        &:not(.is-disabled) {
          &:hover {
            background-color: #f1eefd;
          }
        }

        &.is-disabled {
          color: #333333;
        }
      }

      .el-tabs__nav-wrap::after {
        content: none;
      }

      .el-tabs__item {
        padding: 0 18px;
      }

      .is-scrollable {
        .el-tabs__nav-scroll {
          .el-tabs__item:last-child {
            padding-right: 36px;
          }
        }
      }

      .is-active {
        .message-center__tabs-title {
          font-weight: 600;
        }
      }
    }
  }

  :deep() {
    .el-drawer__body {
      padding: 0 0 16px;
    }
  }

  /* hack oldClient */
  &.message-center__drawer-hack {
    :deep() {
      .el-drawer__body {
        overflow: hidden;
      }

      .message-center__list {
        height: calc(100vh - 176px) !important;
      }
    }
  }
}
</style>
