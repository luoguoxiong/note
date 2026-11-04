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
    <!-- 列表操作   -->
    <message-center-manage-bar
      v-if="showCheckManage"
      :status="checkboxManageStatus"
      :checkboxAll="checkboxAll"
      :indeterminate="checkboxIndeterminate"
      :delDisabled="delDisabled"
      :checkListNum="checkListNum"
      @switch-status="switchManageStatus"
      @all-change="checkboxAllChange"
      @cancel="handleCheckCancel"
      @delete="handleDelete"
    />
    <!--  列表  -->
    <div v-show="!skeletonLoading" class="message-center__list-content w_full flex">
      <scroll-list
        @onLoad="onLoad"
        v-if="data && data.length > 0"
        ref="scrollListRef"
        v-exposure-report="{
          eventCode: 'exp_web_message_tabulation_v1',
          region_code: 'message_tabulation',
          otherParams: () => ({
            ref_source: tabCurrent,
            page_code: 'page_home_tabulation_v1',
          }),
        }"
      >
        <el-checkbox-group v-model="checkList">
          <message-center-list-item
            :showCheckBox="showCheckBoxItem"
            :data="item"
            :hasSeparateLine="item.messageSerialNumber === lastUnreadItem.messageSerialNumber"
            v-for="(item, index) in data"
            :key="index"
            :ref="setItemRef(item)"
            v-click-report="{
              eventCode: 'clk_web_message_tabulation_v1',
              region_code: 'message_tabulation',
              otherParams: {
                message_id: item.messageSerialNumber,
                page_code: 'page_home_tabulation_v1',
              },
            }"
            @update:checklist="handleUpdateChecklist"
          />
        </el-checkbox-group>
        <!--   无更多提示, loading仅加载更多分页出现     -->
        <message-center-list-bottom :hasNoMoreComputed="hasNoMoreComputed" :loading="loading && pageIndex > 1" />
      </scroll-list>
      <KEmpty v-else class="message-center__list--empty" description="暂无消息" />
      <!-- 新消息指引  -->
      <div class="quick-guide" v-show="showQuickGuide" @click="handleGuideCallback">
        <el-icon class="mr_4"><ArrowDown /></el-icon>
        <span class="c_666">{{ quickGuideCount }}条新消息</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 消息中心列表(管理/全选/删除/骨架屏/滚动加载/新消息指引)
 * 来源: netc-pc-web/src/views/message-center-entry/components/message-center-list.vue
 *
 * Vue3 / element-plus 适配:
 * - el-button type="text" size="mini" -> type="primary" link size="small"
 * - $umpExposure(scrollList.$el) -> v-exposure-report 指令(新项目曝光埋点机制)
 * - v-ump-click -> v-click-report 指令
 * - $kye_message.$message({title, message, type:'warning'}) -> kye_message.confirm(needTitle)
 * - $message -> ElMessage
 * - v-for 动态字符串 ref -> 函数 ref(setItemRef) 收集未读分界线 item 实例
 * - scroll-list $el -> defineExpose 暴露的 scrollRef
 * - iconfont icon-manage/icon-arrow-bottom -> @element-plus/icons-vue(新项目 iconfont 无对应字形)
 *
 * 结构说明: 管理态逻辑抽至 hooks/useMessageCheckboxManage, 管理操作条抽至
 * message-center-manage-bar.vue, 本组件保留列表渲染/滚动加载/新消息指引(行为不变)
 */
import { computed, nextTick, onUnmounted, reactive, ref, toRefs, watch } from 'vue'
import { ElLoading } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'
import MessageCenterListItem from './message-center-list-item.vue'
import MessageCenterManageBar from './message-center-manage-bar.vue'
import ScrollList from '../../shared/scroll-list/index.vue'
import { KEmpty } from '@netc-design-pc/ui'
import MessageCenterSkeleton from '../../shared/message-center-skeleton.vue'
import MessageCenterListBottom from '../../shared/message-center-list-bottom.vue'
import useMessageIntersection from '../../shared/scroll-list/useMessageIntersection'
import useMessageCheckboxManage from '../hooks/useMessageCheckboxManage'
import messageApiService, { type MessageRow, type MessageTypeItem } from '../service/messageApiService'

defineOptions({ name: 'message-center-list' })

// 局部注册 v-loading 指令(与老项目 v-loading 行为一致)
const vLoading = ElLoading.directive

const props = withDefaults(
  defineProps<{
    // 列表数据
    data: MessageRow[]
    // 分页页数
    pageIndex?: number
    // 分页条数
    pageSize?: number
    // 当前tab分类
    tabCurrent: MessageTypeItem
    loading?: boolean
    // 是否有更多
    hasMore?: boolean
  }>(),
  {
    data: () => [],
    pageIndex: 1,
    pageSize: 1,
    tabCurrent: () => ({} as MessageTypeItem),
    loading: false,
    hasMore: true,
  }
)

const emit = defineEmits(['onLoad', 'updateDataList', 'onRefresh'])

const state = reactive({
  skeletonLoading: false, // 骨架屏是否loading
})
// 模板直接访问 state 字段(等价老项目 data 扁平结构)
const { skeletonLoading } = toRefs(state)

const listRef = ref<HTMLElement | null>(null)
const scrollListRef = ref() // 滚动列表ref

/* 管理态(选择/全选/删除) */
const {
  checkList,
  checkboxAll,
  checkboxManageStatus,
  hasDataloading,
  checkListNum,
  showCheckBoxItem,
  checkboxIndeterminate,
  delDisabled,
  switchManageStatus,
  checkboxAllChange,
  handleCheckCancel,
  checkListClear,
  handleDelete,
  handleDeleteManual,
  handleUpdateChecklist,
} = useMessageCheckboxManage({ props, emit, scrollListRef })

// 存在最后一条未读消息 （仅获取第一页，默认为｛｝）
const lastUnreadItem = computed(() => {
  const unreadAll =
    props.data?.slice(0, props.pageSize).filter((f) => {
      // TODO: 发现后端返回的messageReadState字段不管已读还是未读值都未 1，导致这里判断不准确
      return f.messageReadState === 0
    }) || []
  return unreadAll[unreadAll.length - 1] || ({} as MessageRow)
})
// 显示更多，补充处理 <最后一条消息为新消息不展示没有更多>
const hasNoMoreComputed = computed(() => {
  const lastItem = props.data[props.data.length - 1] || ({} as MessageRow)
  return !props.hasMore && lastItem.messageSerialNumber !== lastUnreadItem.value?.messageSerialNumber
})
// 当前分类是否有未读消息数量
const unreadCount = computed(() => {
  return props.tabCurrent?.unreadCount
})
// 快捷指引消息数量
const quickGuideCount = computed(() => {
  return messageApiService.messageLimitView(unreadCount.value as number)
})
// 是否展示管理按钮
const showCheckManage = computed(() => {
  return !state.skeletonLoading && props.data && props.data.length > 0
})
// 未读分界线 item 组件实例(Vue3 函数 ref 收集)
const unReadLineRef = ref()
const setItemRef = (item: MessageRow) => (el: any) => {
  if (el && item.messageSerialNumber === lastUnreadItem.value?.messageSerialNumber) {
    unReadLineRef.value = el
  }
}
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
    if (val && dataVal && (dataVal as MessageRow[]).length > 0 && props.pageIndex <= 1) {
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
  state.skeletonLoading = hasDataloading.value || props.pageIndex > 1 ? false : val
}, 200)
onUnmounted(() => {
  // 清理未执行的防抖回调, 避免卸载后仍修改状态
  skeletonLoadingChangeThrottle.cancel()
})

defineExpose({ switchManageStatus, checkListClear, handleDeleteManual })
</script>

<style lang="scss">
/* 老项目全局工具类, 新项目无全局定义, 此处补齐 */
.w_full {
  width: 100%;
}
.flex {
  display: flex;
}
.c_666 {
  color: #666666;
}
.mr_4 {
  margin-right: 4px;
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

  &--empty {
    width: 100%;
    .k-empty__image {
      width: 140px;
      height: 140px;
    }
  }
}
</style>
