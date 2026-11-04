/**
 * 下载中心-任务列表数据逻辑(查询/版本号轮询/分页/删除/重试/下载动作)
 * 来源: netc-pc-web/src/views/download/download-list-new.vue (2026-09 同步最新卡片式列表)
 *  - 状态: loading / listLoadingStatus / pagination / tableData / versionId / rowTotal /
 *          isRetryLoading / isUserAction / timer
 *  - emit(totalChange / user-action)由宿主组件传入
 *
 * 依赖组件本地化:
 *  - 老项目请求层 code!==0 默认 resolve, 新请求层 reject, deleteFile 失败后仍刷新列表(与老项目一致)
 *  - 旧表格方案特有的 selectFirstRow / onCurrentChange 已随卡片式列表移除
 *  - 旧 ky-table Pagination 的「跳至」jumper 文案 hack 保留(分页 UI 与老项目一致)
 */
import { nextTick, reactive, ref, watch, h } from 'vue'
import { KMessageBox, KMessage, KIcon } from '@netc-design-pc/ui'
import { WarningFilled } from '@netc-design-pc/icons'
import { debounce } from 'lodash-es'
import * as downloadCenterApi from '../api'
import { downloadFile as executeDownloadFile } from '../download-utils'
import { TASK_STATUS_VAL } from '../consts'

/** 下载列表行数据 */
export interface DownloadListRow {
  compressionId: string | number
  fileName: string
  fileType: string
  status: number
  process: number
  downStatus: number
  creationDate?: string | number
  [key: string]: any
}

interface QueryDataOptions {
  actionType?: string
  showLoading?: boolean
  /** 兼容旧 switchVisible 入参(卡片式列表无需选中行, 仅透传不使用) */
  needSelectRow?: boolean
}

interface UseDownloadListOptions {
  props: { activeTab: number; visible: boolean }
  emit: {
    (e: 'totalChange', data: { num: number; activeTab: number; actionType?: string }): void
    (e: 'user-action'): void
  }
}

export function useDownloadList({ props, emit }: UseDownloadListOptions) {
  const loading = ref(false) // 加载中tips
  const listLoadingStatus = ref<'ready' | 'loading' | 'loaded' | 'error'>('ready') // 列表接口加载状态
  const pagination = reactive<{
    pageIndex: number
    pageSize: number
    totalCount: number
    pageSizes?: number[]
    pagerCount?: number
  }>({
    pageIndex: 1,
    pageSize: 20,
    totalCount: 0,
    pagerCount: 5,
  })
  // 0初始,1压缩中 2压缩完成 3失败)
  const taskStatus: Record<number, number[]> = {
    1: [TASK_STATUS_VAL.INIT, TASK_STATUS_VAL.COMPRESSING, TASK_STATUS_VAL.COMPRESS_FAIL], //未完成的
    2: [TASK_STATUS_VAL.COMPRESS_SUCCESS], //已完成的
  }
  const tableData = ref<DownloadListRow[]>([])
  const versionId = ref('') // 后端数据版本号
  const rowTotal = ref(0) // 列表总条数
  const isRetryLoading = ref(false) // 重试按钮loading
  const isUserAction = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  // 分页 jumper 前缀文案(老项目 ky-table Pagination 将"前往"改为"跳至", element-plus 适配 .el-pagination__goto)
  watch(tableData, () => {
    nextTick(() => {
      const pageLists = document.getElementsByClassName('el-pagination__goto')
      for (let i = 0; i < pageLists.length; i++) {
        pageLists[i].textContent = '跳至'
      }
    })
  })

  async function deleteFile(row: DownloadListRow) {
    const { fileName, compressionId } = row
    await KMessageBox.confirm(
      h('div', { class: 'el-message-box__title' }, [
        h(
          KIcon,
          { class: 'el-message-box__status el-message-box-icon--warning', style: { display: 'inline-flex' } },
          {
            default: () => [h(WarningFilled)],
          }
        ),
        h('span', { style: { wordBreak: 'break-all' } }, [
          '确定要删除',
          h('span', { style: { color: 'var(--k-color-orange-05)' } }, '【' + fileName + '】'),
          '吗?',
        ]),
      ]),
      '',
      {
        customClass: 'custom-download-delete-confirm',
      }
    )
    userAction()
    try {
      const res = await downloadCenterApi.delCompressFile({
        compressionIdList: [compressionId],
      })
      if (res?.code === 0) {
        KMessage.success('删除成功')
      }
    } catch (e) {
      // 新请求层 code!==0 会 reject(老项目默认 resolve 并继续刷新列表), 此处保持继续刷新
      console.log('删除压缩文件接口出错::::', e)
    }
    if (timer) {
      clearTimeout(timer)
    }
    queryData()
  }

  function onDownloadFile(row: DownloadListRow) {
    userAction()
    executeDownloadFile(row)
  }

  // 重试任务
  function onRetry(row: DownloadListRow) {
    if (isRetryLoading.value) return
    isRetryLoading.value = true
    userAction()
    downloadCenterApi
      .retryTask({
        compressionId: row.compressionId,
      })
      .then((res) => {
        if (res.code === 0) {
          KMessage.success('操作成功')
        } else {
          KMessage.error('网络出小差啦，请稍后再试')
        }
      })
      .catch(() => {
        KMessage.error('网络出小差啦，请稍后再试')
      })
      .finally(() => {
        isRetryLoading.value = false
      })
  }

  // 旧 ky-table 分页交互(size-change/current-change -> pagination-change)
  function handleSizeChange(val: number) {
    pagination.pageSize = val
    pageChange(pagination)
  }

  function handlePageCurrentChange(val: number) {
    pagination.pageIndex = val
    pageChange(pagination)
  }

  const pageChange = debounce(async (data?: unknown) => {
    console.log('pageChange:::', data)
    loading.value = true
    listLoadingStatus.value = 'loaded'
    timer && clearTimeout(timer)
    userAction() // 分页时强制更新版本号、强制刷新列表
    queryData()
  }, 300)

  function resetData(data: QueryDataOptions = {}) {
    pagination.pageIndex = 1
    queryData(data)
  }

  async function queryData(data: QueryDataOptions = {}): Promise<void> {
    const { actionType = '', showLoading = true } = data
    if (listLoadingStatus.value === 'loading') return
    if (!tableData.value.length && showLoading) {
      loading.value = true
    }
    listLoadingStatus.value = 'loading'
    const pageIndex = pagination.pageIndex
    const oldVersionId = versionId.value
    const params = {
      page: pageIndex,
      pageSize: pagination.pageSize,
      versionId: oldVersionId,
      vo: {
        taskStatusList: taskStatus[props.activeTab],
      },
    }
    try {
      const res = await downloadCenterApi.getList(params)
      listLoadingStatus.value = 'loaded'
      if (pageIndex !== pagination.pageIndex) return // 轮训时请求下一页，如果当前页已经变了，就不更新数据
      if (res?.code === 0) {
        versionId.value = res.data.versionId
        const newTableData: DownloadListRow[] = res.data?.rows || []
        if (!newTableData.length && pageIndex > 1) {
          pagination.pageIndex = pageIndex - 1
          return queryData()
        }
        // 版本更新了才更新数据
        tableData.value = newTableData
        const total: number = res.data?.rowTotal || 0
        pagination.totalCount = total
        rowTotal.value = total
        emit('totalChange', {
          num: total,
          activeTab: props.activeTab,
          actionType,
        })
        if (isUserAction.value) {
          isUserAction.value = false
          return runPolling({ immediate: true }) // 用户触发的立即更新列表
        }
        runPolling()
      }
    } catch (e) {
      console.log('下载中心列表接口出错::::', e)
      listLoadingStatus.value = 'error'
    } finally {
      loading.value = false
    }
  }

  function runPolling({ immediate = false }: { immediate?: boolean } = {}): void {
    // 定时请求更新压缩进度、新压缩任务（当前drawer是可见的）
    if (props.visible) {
      if (timer) {
        clearTimeout(timer)
      }
      if (immediate) {
        queryData({ showLoading: false })
        return
      }
      timer = setTimeout(() => {
        queryData({ showLoading: false })
      }, 3000)
    }
  }

  // 用户操作的都需要重置数据id
  function userAction() {
    isUserAction.value = true
    emit('user-action')
  }

  return {
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
  }
}
