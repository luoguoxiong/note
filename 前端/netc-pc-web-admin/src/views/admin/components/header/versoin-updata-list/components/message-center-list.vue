<template>
  <div
    :class="[
      'message-center__list',
      (!data || data.length === 0) && 'message-center__list-nodata',
      showCheckManage && 'message-center__list-manage',
    ]"
    ref="listRef"
    v-loading="hasDataloading"
  >
    <!-- 列表骨架屏  -->
    <div v-if="skeletonLoading" class="w_full skeleton-wrapper">
      <message-center-skeleton :loading="skeletonLoading" />
    </div>
    <!--  列表  -->
    <div v-show="!skeletonLoading" class="message-center__list-content w_full flex">
      <scroll-list @onLoad="onLoad" v-if="data && data.length > 0" ref="scrollListRef">
        <!-- 列表item -->
        <message-center-list-item :data="item" v-for="(item, index) in data" :key="index" />
        <!--   无更多提示, loading仅加载更多分页出现     -->
        <message-center-list-bottom :hasNoMoreComputed="hasNoMoreComputed" :loading="loading && pageIndex > 1" />
      </scroll-list>
      <!--  缺省空白页  -->
      <none-data-two msg="暂无数据" v-else />
      <!-- 新消息指引  -->
      <div class="quick-guide" v-show="showQuickGuide" @click="handleGuideCallback"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 版本更新列表(骨架屏/滚动加载/新消息指引)
 * 来源: netc-pc-web/src/views/versoin-updata-list/components/message-center-list.vue
 *
 * Vue3 适配:
 * - 老项目 `...toRefs(state)` 返回 -> script setup 顶层 ref/computed 直接暴露模板
 * - v-loading(全局指令) -> ElLoading.directive 局部注册
 * - 老项目 state 中 checkboxAll/checkboxIndeterminate 相关 watch 为引用不存在属性的
 *   死代码(运行时静默失效), 且本页面无管理/删除功能, 未迁移
 */
import { computed, nextTick, ref, watch } from 'vue'
import { ElLoading } from 'element-plus'
import { debounce } from 'lodash-es'
import MessageCenterListItem from './message-center-list-item.vue'
import ScrollList from '../../shared/scroll-list/index.vue'
import NoneDataTwo from '../../shared/none-data-two.vue'
import MessageCenterSkeleton from '../../shared/message-center-skeleton.vue'
import useMessageIntersection from '../../shared/scroll-list/useMessageIntersection'
import MessageCenterListBottom from '../../shared/message-center-list-bottom.vue'
import type { VersionRow, VersionTabItem } from '../types'

defineOptions({ name: 'message-center-list' })

// 局部注册 v-loading 指令(与老项目 v-loading 行为一致)
const vLoading = ElLoading.directive

const props = withDefaults(
  defineProps<{
    // 列表数据
    data: VersionRow[]
    // 分页页数
    pageIndex?: number
    // 分页条数
    pageSize?: number
    // 当前tab分类
    tabCurrent: VersionTabItem
    loading?: boolean
    // 是否有更多
    hasMore?: boolean
  }>(),
  {
    data: () => [],
    pageIndex: 1,
    pageSize: 1,
    tabCurrent: () => ({}),
    loading: false,
    hasMore: true,
  }
)

const emit = defineEmits(['onLoad', 'updateDataList', 'onRefresh'])

const skeletonLoading = ref(false) // 骨架屏是否loading
const hasDataloading = ref(false) // 已存在数据下的loading <仅删除时使用>
// 显示更多，补充处理 <最后一条消息为新消息不展示没有更多>
const hasNoMoreComputed = computed(() => {
  return !props.hasMore
})
// 是否展示管理按钮
const showCheckManage = computed(() => {
  return !skeletonLoading.value && props.data && props.data.length > 0
})
// 当前分类是否有未读消息数量
const unreadCount = computed(() => {
  return props.tabCurrent?.unreadCount
})
const unReadLineRef = ref()
const listRef = ref<HTMLElement | null>(null)
const scrollListRef = ref() // 滚动列表ref
// 新消息指引hook
const { showQuickGuide, handleInterSection, removeIntersection, handleGuideCallback } = useMessageIntersection({
  unreadCount,
  scrollListRef,
})

watch(
  () => props.loading,
  (val) => {
    skeletonLoadingChangeThrottle(val)
  }
)
/* 监听tab值变更 */
watch(
  () => props.tabCurrent.value,
  () => {
    if (scrollListRef?.value) {
      // 重置滚动事件
      scrollListRef.value.resetScrollEvent()
      scrollListRef.value.resetIsBottom()
    }
  }
)

/* 监听tab变更 + 数据列表变更 */
watch(
  () => [props.tabCurrent.value, props.data],
  ([val, dataVal]) => {
    // 存在tab + 有数据列表执行视图监听 + 分页小于等于1
    if (val && dataVal && (dataVal as VersionRow[]).length > 0 && props.pageIndex <= 1) {
      nextTick(() => {
        handleInterSection(unReadLineRef)
      })
    }
  }
)
/* 监听分界线ref变更 */
watch(
  () => unReadLineRef.value,
  (val) => {
    nextTick(() => {
      removeIntersection()
      if (val) {
        handleInterSection(unReadLineRef)
      }
    })
  }
)

/**
 * 加载下一页事件函数
 */
const onLoad = () => {
  emit('onLoad')
  scrollListRef.value?.resetIsBottom()
}
/**
 * 骨架屏loading 防抖 <存在删除loading,不展示骨架屏>
 */
const skeletonLoadingChangeThrottle = debounce((val: boolean) => {
  skeletonLoading.value = hasDataloading.value || props.pageIndex > 1 ? false : val
}, 200)
</script>

<style lang="scss" scoped>
/* 老项目全局工具类, 新项目无全局定义, 此处补齐 */
.w_full {
  width: 100%;
}
.flex {
  display: flex;
}

.message-center__list {
  position: relative;
  height: calc(100% - 90px);

  &-manage {
    height: calc(100% - 56px);
  }

  &-content {
    position: relative;
    height: calc(100% - 56px);
  }

  .scroll-list {
    padding: 0 24px;
  }

  &-nodata {
    display: flex;
  }

  /* 管理 */
  .checkbox-manage {
    background: #f5f7fb;
    padding: 0 24px;
    margin-bottom: 4px;
    box-sizing: border-box;

    &__selection {
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &-view {
      justify-content: flex-end;
    }

    &-edit {
      display: flex;
    }

    &-btn-list {
      .el-button {
        padding: 5px 15px;
      }

      .btn-delete {
        &:not(.is-disabled) {
          border-color: #dad1fc;
          background-color: #f3f0fe;
          color: #8365f6;
        }
      }
    }
  }

  .quick-guide {
    display: flex;
    align-items: center;
    cursor: pointer;
    position: absolute;
    right: 0;
    top: 34px;
    padding: 0 6px 0 10px;
    height: 28px;
    border-radius: 14px 0 0 14px;
    background: #ffffff;
    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);

    .iconfont {
      color: #8f8fa8;
    }
  }

  :deep() {
    .el-loading-spinner {
      .circular {
        display: none;
      }

      &::after {
        content: '';
        background: url('../assets/loading2.png') no-repeat top center;
        background-size: 20px 20px;
        width: 50px;
        height: 50px;
        display: block;
        margin: auto;
      }
    }
  }
}
</style>
