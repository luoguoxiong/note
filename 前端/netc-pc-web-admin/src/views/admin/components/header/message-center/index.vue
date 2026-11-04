<template>
  <k-drawer
    title="消息中心"
    :class="['message-center__drawer', isOldClientMode() && 'message-center__drawer-hack']"
    v-model="state.visible"
    :modal="false"
    :size="620"
    append-to-body
    :has-footer="false"
    @confirm="handleConfirm"
  >
    <!--  消息中心分类  -->
    <el-tabs
      v-model="tabNameValue"
      class="message-center__tabs tab-wrapper"
      @tab-change="handleTabChange"
      v-show="tabLists && tabLists.length > 0"
    >
      <el-tab-pane
        v-for="(item, index) in tabLists"
        :key="index"
        :label="item.label"
        :name="item.value"
        :disabled="item.value === tabNameValue"
      >
        <template #label>
          <el-badge class="message-center__tabs-badge" :hidden="!item.hasNewMessage" is-dot>
            <span class="message-center__tabs-title">{{ item.label }}</span>
          </el-badge>
        </template>
      </el-tab-pane>
    </el-tabs>
    <!--  消息中心列表  -->
    <message-center-list
      v-if="state.visible"
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
  </k-drawer>
</template>

<script setup lang="ts">
/**
 * message-center-entry 消息中心抽屉入口
 * 来源: netc-pc-web/src/views/message-center-entry/index.vue
 *
 * 迁移说明:
 * - @vue/composition-api -> vue
 * - ky-drawer :visible.sync -> v-model:visible
 * - el-tab-pane slot="label" -> #label
 * - 分类切换由 tab-click 改为 tab-change(参数即新分类value): element-plus 的 tab-click 早于
 *   update:modelValue 触发(setCurrentName 内 await beforeLeave 后才 emit), 同步读 tabNameValue 是旧值
 * - root.$umpother({...}) -> window.$umpOtherReport('CLK', { eventCode }, { ...其余字段 })
 * - isOldClientMode: 老项目全局 mixin -> @/native/electron 函数导入
 *
 * 结构说明: 分类 tabs / 分页列表逻辑抽至 hooks/useMessageTabs、hooks/useMessagePageList,
 * 本组件保留抽屉开关、provide 注入与跨模块协调(行为不变)
 */
import { nextTick, provide, reactive, ref, watch } from 'vue'
import { KDrawer } from '@netc-design-pc/ui'
import MessageCenterList from './components/message-center-list.vue'
import messageApiService, { type MessageRow } from './service/messageApiService'
import useMessageCenterStore from './hooks/useMessageCenterStore'
import useMessageTabs from './hooks/useMessageTabs'
import useMessagePageList from './hooks/useMessagePageList'
import { isOldClientMode } from '@/native/electron'

defineOptions({ name: 'message-center-entry' })

/* 消息分类埋点名称 */
const itemType: Record<string, string> = {
  10: '服务通知',
  20: '其他消息',
  40: '福利专区',
  50: '快递消息',
  60: '支付通知',
}

const state = reactive({
  visible: false, // 抽屉是否展示
})

// 列表ref
const listRef = ref<any>(null)

/* 消息分类 tabs */
const {
  tabNameValue,
  tabLists,
  tabCurrent,
  messageType,
  updateMessageType,
  updateMessageUnread,
  updateMessageTypeManual,
  reset: resetTabs,
} = useMessageTabs()

/* 消息分页列表 */
const {
  loading,
  pageData,
  pageHasMore,
  handleMessageList,
  onLoad,
  resetForTabSwitch,
  reset: resetPageList,
  updateDataList,
} = useMessagePageList({ getTabValue: () => tabNameValue.value })

/* message-center store */
const { update_unread_message } = useMessageCenterStore()

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
  state.visible = val
}

/* 更新消息已读状态(由子级 inject 调用) */
const updateCurrentTab = () => undefined

// 消息抽屉开关函数
provide('switchVisibleCallback', switchVisibleCallback)
// 消息类型
provide('messageType', messageType)
// 更新消息已读状态
provide('updateCurrentTab', updateCurrentTab)

watch(
  () => state.visible,
  (val) => {
    if (val) {
      pageInit()
    } else {
      pageDataReset()
    }
  }
)

/* 监听tab变更-前端手动变更是否有新消息 */
watch(tabNameValue, async (val, oldValue) => {
  listRef.value?.switchManageStatus('view')
  // 第一次渲染无需更新当前tab未读消息
  if (val && oldValue && oldValue !== '0') {
    await updateMessageUnread() // 更新tab列表下未读消息
  }
  // 手动更新当前分类是否有未读消息
  updateMessageTypeManual()
})

/**
 * 初始化页面
 */
async function pageInit() {
  await updateMessageType()
  await handleMessageList()
  await update_unread_message_handler()
}

/**
 * 初始化列表
 */
const pageDataReset = () => {
  resetPageList() // 初始化列表及分页
  resetTabs() // 初始化分类
}

/**
 * tab切换事件
 * @param name 切换后的分类value(tab-change 事件参数)
 * @param report 是否上报埋点(列表刷新复用本函数时不上报)
 */
const handleTabChange = async (name: string | number, report = true) => {
  resetForTabSwitch()
  listRef.value?.checkListClear()
  // 重新获取列表，rowParams不取最后一条
  await handleMessageList({
    rowParams: {},
    renderBefore: () => {
      // 赋值前清空列表,用于优化缺省图，调用接口后再展示缺省图
      pageData.value.rows = []
    },
  })
  await update_unread_message_handler()

  if (report && name) {
    window.$umpOtherReport(
      'CLK',
      { eventCode: 'clk_home_web_category_v1' },
      {
        region_code: 'message_center',
        button_name: itemType[name as string],
        page_code: 'page_home_message_v1',
      }
    )
  }
}

/* 未读消息已阅 - 消息中心条数上报 */
const update_unread_message_handler = async () => {
  await nextTick()
  try {
    // 最新一条消息数据
    const lastMessageItem = pageData.value.rows[0] || ({} as MessageRow)
    const { messagePushTime, messageIndex: readIndex } = lastMessageItem
    await messageApiService.userMessage_readStateUpdate({
      messageType: Number(messageType.value),
      messagePushTime,
      readIndex,
    }) // 上报当前分类未读消息
    await update_unread_message() // 更新总未读消息
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}

/* 刷新列表数据 */
const onRefreshList = async (callback?: () => void) => {
  await handleTabChange(tabNameValue.value, false)
  // 更新tab消息数量
  await updateMessageUnread()
  // 手动视为新消息已读
  updateMessageTypeManual()
  callback && callback()
}

/**
 * tab 是否有未读消息
 */
// const tabHasNewCheck = (item: MessageTypeItem) => {
//   const unreadCount = messageApiService.messageLimitView(item.unreadCount ?? '')
//   return item.isHaveNewMessage ? unreadCount : ''
// }

defineExpose({ showDrawer })
</script>

<style lang="scss">
.message-center__drawer {
  // 设置 drawer-body 无padding
  --k-drawer-body-padding: 0;
  .message-center__tabs {
    position: relative;
    /* 老项目全局 .tab-wrapper 样式(common.scss), 新项目无全局定义, 此处补齐 */
    padding: 0 20px;

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
      .el-badge__content {
        scale: 0.9;
        right: 2px;
        top: -2px;
        background-color: var(--k-color-red-05);
        border: none;
      }
    }

    &-title {
      font-size: 14px;
    }

    .el-tabs__header {
      margin-bottom: 0;
    }

    /* 老项目全局 .tab-wrapper 样式(common.scss), 新项目无全局定义, 此处补齐 */
    .el-tabs__item {
      padding: 0 18px;
      height: 50px;
      line-height: 50px;
      font-size: 15px;
      color: #03050d;
      font-weight: bold;

      &.is-active {
        color: #8365f6;
        box-shadow: none !important;
      }
    }

    .el-tabs__active-bar {
      height: 4px;
      border-radius: 4px;
    }

    .el-tabs__nav-prev,
    .el-tabs__nav-next {
      line-height: 54px;
      color: #333333;
      font-size: 12px;

      &:not(.disabled) {
        display: block;
      }

      &.disabled {
        display: none;
      }
    }

    .el-tabs__nav-wrap::after {
      content: none;
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

  /* hack oldClient */
  &.message-center__drawer-hack {
    .el-drawer__body {
      overflow: hidden;
    }

    .message-center__list {
      height: calc(100vh - 176px) !important;
    }
  }
}
</style>
