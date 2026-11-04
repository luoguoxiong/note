/**
 * useMessageCheckboxManage 消息列表管理态(选择/全选/删除)
 * 从 message-center-entry/components/message-center-list.vue 抽取(行为保持不变):
 * - checkList / checkboxAll / checkboxManageStatus / hasDataloading
 * - 全选联动、删除(含删除后延迟刷新)、手动勾选切换
 * - 补充: 删除延迟刷新定时器在组件卸载时清理, 避免卸载后仍触发刷新请求
 */
import { computed, inject, onUnmounted, reactive, toRefs, watch, type Ref } from 'vue'
import { KMessageBox, KMessage } from '@netc-design-pc/ui'
import { messageCenterApi, type MessageRow } from '../service/messageApiService'

interface ManageEmit {
  (e: 'updateDataList', rows: MessageRow[]): void
  (e: 'onRefresh', callback?: () => void): void
}

interface UseMessageCheckboxManageOptions {
  props: {
    data: MessageRow[]
    pageIndex: number
  }
  emit: ManageEmit
  // 滚动列表ref(删除后置顶滚动)
  scrollListRef: Ref<any>
}

export default function useMessageCheckboxManage({ props, emit, scrollListRef }: UseMessageCheckboxManageOptions) {
  // 消息类型(由 message-center-entry provide)
  const messageType = inject<Ref<string | number>>('messageType')

  const state = reactive({
    checkList: [] as string[],
    checkboxAll: false, // 是否全选
    checkboxManageStatus: 'view', // checkbox管理状态 <view,edit>
    hasDataloading: false, // 已存在数据下的loading <仅删除时使用>
  })
  const { checkList, checkboxAll, checkboxManageStatus, hasDataloading } = toRefs(state)

  // 选中数量
  const checkListNum = computed(() => {
    return state.checkList?.length || 0
  })
  // item选项是否展示checkbox
  const showCheckBoxItem = computed(() => {
    return state.checkboxManageStatus === 'edit'
  })
  // checkbox 部分选中
  const checkboxIndeterminate = computed(() => {
    return (state.checkList?.length || 0) > 0 && (state.checkList?.length || 0) < (props.data?.length || 0)
  })
  // 删除按钮是否置灰
  const delDisabled = computed(() => {
    return state.checkList?.length === 0
  })

  watch(
    () => props.data,
    (val) => {
      // 当前全选场景，加载分页>去除全选
      if (state.checkboxAll && val?.length > state.checkList?.length) {
        state.checkboxAll = false
      }
    }
  )

  watch(checkboxIndeterminate, (val) => {
    if (val) {
      state.checkboxAll = false
    } else {
      if (props.data?.length > 0 && props.data?.length === state.checkList?.length) {
        state.checkboxAll = true
      }
    }
  })
  watch(
    () => state.checkList,
    () => {
      if (state.checkList?.length > 0 && state.checkList?.length === props.data?.length) {
        state.checkboxAll = true
      }
      if (state.checkList?.length === 0) {
        state.checkboxAll = false
      }
    }
  )

  // 删除后延迟刷新定时器(组件卸载时清理, 避免卸载后仍触发刷新请求)
  let refreshTimer: ReturnType<typeof setTimeout> | null = null
  onUnmounted(() => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  })

  const switchManageStatus = (val: string) => {
    state.checkboxManageStatus = val
    if (val === 'edit') {
      window.$umpOtherReport(
        'OTHER',
        { eventCode: 'clk_web_home_manage_v1' },
        {
          region_code: 'message_manage',
          page_code: 'page_home_tabulation_v1',
        }
      )
    }
  }

  /**
   * 全选操作变更
   */
  const checkboxAllChange = (val: any) => {
    if (val) {
      state.checkList = props.data?.map((f) => f.messageSerialNumber)
    } else {
      state.checkList = []
    }
  }
  /**
   * 取消操作
   */
  const handleCheckCancel = () => {
    switchManageStatus('view')
    checkListClear()
    state.checkboxAll = false
  }
  /* 清空选中*/
  const checkListClear = () => {
    state.checkList = []
  }
  /* 删除消息列表选中数据 */
  const handleDelete = () => {
    if (delDisabled.value) {
      KMessage.warning('请选择要删除的消息')
      return
    }
    KMessageBox.confirm('删除后，消息将无法恢复。', '您确定要删除所选消息吗？', {}).then(async () => {
      const params = {
        messageSerialNumbers: [] as string[],
        messagePushTimeList: [] as string[],
        messageType: Number(messageType?.value),
      }
      // checkListItems-当前选中列表数组
      const checkListItems = state.checkList.map((c) => {
        return props.data.find((f) => f.messageSerialNumber === c) || ({} as MessageRow)
      })
      checkListItems.forEach((f) => {
        params.messageSerialNumbers.push(f.messageSerialNumber)
        params.messagePushTimeList.push(f.messagePushTime)
      })

      const res = await messageCenterApi.userMessage_batchDel(params)
      if (res.code === 0 && res.data) {
        state.hasDataloading = true
        // 后端刷新存在延迟
        window.$umpOtherReport(
          'OTHER',
          { eventCode: 'clk_web_home_delete_v1' },
          {
            region_code: 'message_manage',
            button_name: !checkboxIndeterminate.value ? '全选' : '非全选',
            page_code: 'page_home_tabulation_v1',
          }
        )
        refreshTimer = setTimeout(() => {
          KMessage.success('删除成功')
          handleCheckCancel()
          // 刷新数据前置顶scrollTop,避免分页加载问题
          if (scrollListRef.value && scrollListRef.value.scrollRef) {
            scrollListRef.value.scrollRef.scrollTop = 0
          }
          emit('onRefresh', () => {
            state.hasDataloading = false
          })
        }, 2500)
      }
    })
  }
  /**
   * 后端刷新存在延迟-手动删除列
   */
  const handleDeleteManual = (checkedList: string[]) => {
    const dataListCopy = [...props.data]
    checkedList.forEach((c) => {
      dataListCopy.forEach((f, i) => {
        if (c === f.messageSerialNumber) {
          dataListCopy.splice(i, 1)
        }
      })
    })
    emit('updateDataList', dataListCopy)
  }

  const handleUpdateChecklist = (singleCheckbox: string) => {
    // 选中的checkbox
    // 如果还没有的话，就push，如果存在存在的话就去掉
    if (singleCheckbox && typeof singleCheckbox === 'string' && state.checkList?.includes(singleCheckbox)) {
      if (state.checkList && state.checkList.length === 0) {
        return
      }
      const result = state.checkList.filter((item) => item !== singleCheckbox)

      state.checkList = result
    } else if (singleCheckbox && typeof singleCheckbox === 'string') {
      state.checkList.push(singleCheckbox)
    }
  }

  return {
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
  }
}
