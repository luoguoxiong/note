/**
 * useMessagePageList 消息分页列表
 * 从 message-center-entry/index.vue 抽取(行为保持不变):
 * - pageData / pageHasMore / loading
 * - 列表请求(以最后一条消息作为翻页锚点)、加载更多、数据回写
 */
import { reactive, toRefs } from 'vue'
import { messageCenterApi, type MessageRow } from '../service/messageApiService'

/* 列表分页初始数据 */
const initialPageData = {
  page: 1,
  pageSize: 100,
  pageTotal: 0,
  rowTotal: 0,
  rows: [] as MessageRow[], // 消息列表
}

interface HandleListOptions {
  rowParams?: MessageRow | Record<string, any> | null
  renderBefore?: (() => void) | null
}

export default function useMessagePageList({ getTabValue }: { getTabValue: () => string | number }) {
  const state = reactive({
    loading: false, // 列表loading
    pageData: { ...initialPageData, rows: [] as MessageRow[] },
    pageHasMore: true, // 是否有下一页
  })
  const { loading, pageData, pageHasMore } = toRefs(state)

  /**
   * 获取列表
   * @param options.rowParams 默认取当前列表最后一条
   */
  async function handleMessageList({ rowParams = null, renderBefore = null }: HandleListOptions = {}) {
    try {
      state.loading = true
      const { pageSize, page, rows } = state.pageData
      // 获取下一页取当前分页最后一条数据
      const lastRow = rowParams || rows[rows.length - 1]
      const { messagePushTime: endMessagePushTime = '', messageIndex: endMessageIndex = '' } = (lastRow ||
        {}) as MessageRow
      const params = {
        channelCode: 'pc',
        pageSize,
        page,
        messageTypeList: [Number(getTabValue())],
        endMessagePushTime,
        endMessageIndex,
      }
      const res = await messageCenterApi.userMessage_pageList(params)
      if (renderBefore && typeof renderBefore === 'function') {
        renderBefore()
      }
      if (res.code === 0 && res.data) {
        state.pageData = {
          ...res.data,
          page: state.pageData.page,
          pageSize: state.pageData.pageSize,
          rows: state.pageData.rows.concat(res.data.rows || []),
        }
        if (params.page > 1 && (!res.data.rows || res.data.rows?.length === 0)) {
          state.pageHasMore = false
        }
      }
    } catch (e) {
      console.log(e)
    } finally {
      state.loading = false
    }
  }

  /**
   * 加载下一页事件函数
   */
  const onLoad = () => {
    if (state.pageHasMore) {
      state.pageData.page += 1
      handleMessageList()
    } else {
      console.log('没有下一页')
    }
  }

  /* tab切换重置分页(rows 保留供 renderBefore 前的锚点兜底) */
  const resetForTabSwitch = () => {
    state.pageData = {
      ...initialPageData,
      rows: state.pageData.rows,
    }
    state.pageHasMore = true
  }

  /* 初始化列表及分页(抽屉关闭时) */
  const reset = () => {
    state.pageData = { ...initialPageData, rows: [] }
    state.pageHasMore = true
  }

  /**
   * 更新当前消息列表数据
   * @param rows
   */
  const updateDataList = (rows: MessageRow[]) => {
    if (rows) {
      state.pageData.rows = rows
    }
  }

  return {
    loading,
    pageData,
    pageHasMore,
    handleMessageList,
    onLoad,
    resetForTabSwitch,
    reset,
    updateDataList,
  }
}
