<template>
  <!-- :class="{ 'loading-height': loading }" -->
  <section class="download-list-new-box" v-loading="loading" element-loading-text="加载中">
    <div v-if="tableData.length" class="download-list-new-inner">
      <!-- :class="{ 'download-list-new-height': activeTab === 1 }" -->
      <div class="download-list-new" v-show="!loading">
        <div class="download-list-new-item" v-for="(row, index) in tableData" :key="index">
          <div class="download-list-new-item-left download-list-new-item-flex">
            <img class="download-list-new-item-img" :src="downloadListItemIcon(row.fileType)" />
            <div class="download-list-new-item-content">
              <div class="download-list-new-item-content-title">
                <span class="download-list-new-item-content-title-name">{{ row.fileName }}</span>
                <div
                  class="download-list-new-item-content-tag"
                  :class="{ 'no-tag': row.downStatus === 0, 'yes-tag': row.downStatus === 1 }"
                  v-if="activeTab === 2"
                >
                  {{ row.downStatus !== 0 ? '已下载' : '未下载' }}
                </div>
              </div>
              <div class="download-list-new-item-content-time">
                创建时间：{{
                  row.creationDate ? dayjs(parseInt(String(row.creationDate))).format('YYYY-MM-DD HH:mm:ss') : ''
                }}
              </div>
            </div>
          </div>
          <div class="download-list-new-item-right download-list-new-item-flex">
            <div class="download-list-new-item-progress" v-if="activeTab === 1">
              <progress-item
                :key="row.compressionId"
                :taskStatus="row.status"
                :percentage="row.process"
                @onRetry="onRetry(row)"
              ></progress-item>
            </div>
            <div class="download-list-new-item-operation">
              <div class="download-list-new-item-operation-box" v-if="activeTab === 2" @click="onDownloadFile(row)">
                <k-icon><Download /></k-icon>
              </div>
              <div class="download-list-new-item-operation-box" @click="deleteFile(row)">
                <k-icon><Delete /></k-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
      <download-list-pagination
        v-show="!loading"
        :pagination="pagination"
        @size-change="handleSizeChange"
        @current-change="handlePageCurrentChange"
      />
    </div>

    <KEmpty v-if="!tableData.length && !loading" class="download-list-new-none-data" />
  </section>
</template>

<script setup lang="ts">
/**
 * 下载中心-任务列表(进行中/已完成) —— 卡片式列表
 * 来源: netc-pc-web/src/views/download/download-list-new.vue (2026-09 同步最新版)
 * 相比旧表格方案的变化:
 *  - el-table + 骨架屏 + 状态列/操作列子组件 -> 卡片列表 + v-loading
 *  - 空态 none-data -> KEmpty(@netc-design-pc/ui)
 *  - 下载/删除操作 -> k-icon + @netc-design-pc/icons (Download/Delete)
 *  - 状态展示内联: tab1 为压缩进度条(progress), tab2 为已下载/未下载 tag
 *  - 列表数据逻辑(查询/版本号轮询/分页/删除/重试/下载) -> hooks/useDownloadList
 */
import dayjs from 'dayjs'
import { KEmpty, KIcon } from '@netc-design-pc/ui'
import { Delete, Download } from '@netc-design-pc/icons'
import fileImg from './img/img.png'
import { useDownloadList } from './hooks/useDownloadList'
import progressItem from './progress.vue'
import downloadListPagination from './download-list-pagination.vue'

defineOptions({ name: 'download-list' })

const props = withDefaults(
  defineProps<{
    activeTab?: number
    visible?: boolean
  }>(),
  {
    activeTab: 1,
    visible: false,
  }
)

const emit = defineEmits<{
  (e: 'totalChange', data: { num: number; activeTab: number; actionType?: string }): void
  (e: 'user-action'): void
}>()

const {
  loading,
  tableData,
  pagination,
  queryData,
  resetData,
  handleSizeChange,
  handlePageCurrentChange,
  deleteFile,
  onDownloadFile,
  onRetry,
} = useDownloadList({ props, emit })

/**
 * 下载中心数据图标
 * @param type 数据格式类型
 */
function downloadListItemIcon(type: string) {
  const iconCollections: Record<string, string> = {
    zip: 'https://ic-img.ky-express.com/netc/20260108_64146_!!1767838440659_128_128.png',
    png: fileImg,
    jpg: fileImg,
    xlsx: 'https://ic-img.ky-express.com/netc/20260107_84877_!!1767790964272_160_160.png',
  }
  return iconCollections[type] || iconCollections.zip
}

defineExpose({ resetData, queryData })
</script>

<style lang="scss" scoped>
.download-list-new-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.download-list-new-none-data {
  height: 90%;
  :deep(.k-empty__image) {
    width: 160px;
    height: 160px;
  }
}
.download-list-new-box {
  height: 100%;
}
// .loading-height {
//   min-height: 78vh;
// }
.download-list-new {
  // height: calc(100vh - 210px);
  flex: 1;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #dde1e7;
    border-radius: 3px;
    border: 1px solid transparent;
    background-clip: padding-box;
  }
  &-item {
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #e6e8ed;
    margin-bottom: 8px;
    padding: 8px 10px;
    height: 58px;
    box-sizing: border-box;
    &-left {
      flex: 1;
    }
    &-progress {
      width: 182px;
    }
    &-flex {
      display: flex;
      align-items: center;
    }
    &-img {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }
    &-content {
      flex: 1;
      width: 0;
      &-tag {
        width: 44px;
        height: 18px;
        background: #ffffff;
        box-sizing: border-box;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 12px;
        border-radius: 2px;
        flex-shrink: 0;
      }
      .no-tag {
        border: 1px solid #fdc7bd;
        color: #f73f31;
      }
      .yes-tag {
        border: 1px solid #d3d5db;
        color: #686b75;
      }
      &-title {
        display: flex;
        align-items: center;
        &-name {
          color: #24262b;
          font-size: 13px;
          font-weight: 600;
          line-height: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      &-time {
        font-size: 12px;
        line-height: 18px;
        color: #8c8f99;
        margin-top: 4px;
      }
    }
    &-operation {
      display: flex;
      align-items: center;
      gap: var(--k-spacing-8);
      &-box {
        width: 24px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--k-color-purple-05);
        .k-icon {
          font-size: 16px;
        }
        &:hover {
          background: #f0ecfd;
        }
        &:focus {
          background: #d1c6f0;
        }
      }
    }
  }
}
// .download-list-new-height {
//   height: calc(100vh - 180px);
// }
</style>

<style lang="scss">
/* v-loading 遮罩样式(挂抽屉 body 内, 沿用老项目视觉) */
.download-list-new-box .el-loading-mask .el-loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;

  .path {
    stroke-width: 4px;
  }

  svg {
    height: 24px;
    width: 24px;
  }

  .el-loading-text {
    font-size: 18px;
    line-height: 26px;
    margin: 0 0 0 4px;
    color: #8c8f99;
  }
}
// 删除确认框样式
.custom-download-delete-confirm {
  .el-message-box__header {
    display: none;
  }
  .el-message-box__content {
    margin: 0 !important;
    padding: 0 !important;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
