<template>
  <KDrawer
    title="下载中心"
    :modal="false"
    append-to-body
    :size="600"
    :has-footer="false"
    v-model="drawerVisible"
    class="download-center-drawer"
    @close="closeDrawer"
  >
    <div class="main">
      <div class="tabs">
        <div
          class="tab-item"
          :class="{ activeTab: tab.value === activeTab }"
          v-for="tab in tabList"
          :key="tab.value"
          @click="changeTab(tab.value)"
        >
          {{ tab.label }}
          <span v-if="tab.num">({{ tab.num }})</span>
        </div>
      </div>
      <div class="tip" v-if="activeTab === 2">
        <k-icon color="var(--k-color-orange-05)"><Warning /></k-icon>
        <span>
          <span class="highlight">压缩完成的文件请尽快下载，</span>
          超过7天后，自动清理已完成的记录
        </span>
      </div>
      <section v-show="activeTab === 1" class="download-center-drawer__list">
        <download-list
          :activeTab="1"
          :visible="drawerVisible"
          ref="onGoingRef"
          @totalChange="updateChange"
          @user-action="onUserAction"
        ></download-list>
      </section>
      <section v-show="activeTab === 2" class="download-center-drawer__list">
        <download-list
          :activeTab="2"
          :visible="drawerVisible"
          ref="onDoneRef"
          @totalChange="updateChange"
          @user-action="onUserAction"
        ></download-list>
      </section>
    </div>
  </KDrawer>
</template>

<script setup lang="ts">
/**
 * 下载中心-抽屉(进行中/已完成 列表容器)
 * 来源: netc-pc-web/src/views/download/download.vue
 *
 * 改用 @netc-design-pc/ui KDrawer(基于 element-plus el-drawer 封装):
 *  - v-model="drawerVisible" 直接绑定 KDrawer -> el-drawer modelValue
 *  - 自定义头部经 #header 作用域插槽(close)实现旧「关闭图标+标题」布局
 *  - 头部/主体穿透样式锚点由 .ky-drawer 改为 .download-center-drawer
 *    (避免与 header/shared/ky-drawer 的 .ky-drawer 根类名互相污染)
 *  - 字体图标 iconfont icon-close / el-icon-warning-outline ->
 *    el-icon + @element-plus/icons-vue (class 名保留)
 */
import { nextTick, reactive, ref } from 'vue'
import { Warning } from '@netc-design-pc/icons'
import { KDrawer, KIcon } from '@netc-design-pc/ui'
import downloadList from './download-list.vue'

defineOptions({ name: 'download' })

/** switchVisible 入参(与老项目一致) */
interface SwitchVisibleData {
  actionType?: string
  needSelectRow?: boolean
  [key: string]: any
}

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'user-action'): void
}>()

/** download-list 暴露实例(通过 defineExpose 暴露 resetData/queryData) */
interface DownloadListInstance {
  resetData: (data?: SwitchVisibleData) => void
  queryData: (data?: SwitchVisibleData) => void
}

const drawerVisible = ref(false)
const activeTab = ref(1)
const tabList = reactive([
  {
    label: '进行中',
    value: 1,
    num: 0,
  },
  {
    label: '已完成',
    value: 2,
    num: 0,
  },
])

const onGoingRef = ref<DownloadListInstance | null>(null)
const onDoneRef = ref<DownloadListInstance | null>(null)

function closeDrawer() {
  // drawerVisible.value = false
  emit('close')
}

function switchVisible(data: SwitchVisibleData = {}) {
  drawerVisible.value = !drawerVisible.value
  nextTick(() => {
    if (drawerVisible.value) {
      console.log('switchVisible', onGoingRef.value)
      onGoingRef.value?.resetData(data)
      onDoneRef.value?.resetData(data)
    }
  })
}

function changeTab(value: number) {
  activeTab.value = value
  const ref = value === 1 ? onGoingRef.value : onDoneRef.value
  ref && ref.queryData()
}

function updateChange(e: { num: number; activeTab: number; actionType?: string }) {
  const { num, activeTab: tab, actionType } = e
  const index = tabList.findIndex((i) => i.value === tab)
  //进行中数量变化，刷新已完成的
  // console.log('updateChange::', e)
  tabList[index].num = num

  if (actionType === 'openDownload' && tab === 1 && activeTab.value !== tab && num) activeTab.value = 1 // 下载中列表有数据的默认会被选中
  if (actionType === 'openDownload' && tab === 2 && !tabList[0].num)
    if (activeTab.value !== tab && num) {
      activeTab.value = 2 // 已完成列表有数据的且下载中无数据，默认选中下载完成
    } else if (!num) {
      // 两个tab 都无数据，选中正在下载
      activeTab.value = 1
    }
}

function onUserAction() {
  emit('user-action')
}

defineExpose({ switchVisible, drawerVisible })
</script>

<style lang="scss" scoped>
:global(.download-center-drawer .el-drawer__body) {
  overflow: hidden;
}
.download-center-drawer {
  &__list {
    margin-top: var(--k-spacing-16);
    flex: 1;
    overflow-y: hidden;
  }
}
.main {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.footer {
  padding-top: 25px;
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #fff;
}
.tabs {
  display: flex;
  font-family: PingFang SC;
  // margin-bottom: 16px;
  .tab-item {
    padding: 6px 12px;
    font-size: 14px;
    color: #03050d;
    box-sizing: border-box;
    border-width: 1px 0px 1px 1px;
    border-style: solid;
    border-color: #d9d9d9;
    cursor: pointer;
    border-radius: 4px 0 0 4px;
    &:last-child {
      border-right-width: 1px;
      border-radius: 0 4px 4px 0;
    }
  }
  .activeTab {
    border: 1px solid #8365f6;
    color: #8365f6;
  }
}
.tip {
  margin-top: var(--k-spacing-16);
  display: flex;
  align-items: center;
  gap: var(--k-spacing-4);
  font-size: 14px;
  line-height: 1;
  color: #666666;
  .highlight {
    color: var(--k-color-orange-05);
  }
}
</style>
