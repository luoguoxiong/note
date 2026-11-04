/**
 * useMessageTabs 消息分类 tabs
 * 从 message-center-entry/index.vue 抽取(行为保持不变):
 * - tabLists / tabNameValue / tabCurrent / messageType
 * - 分类接口获取、未读刷新、手动已读标记
 * - tabs 滚动箭头 disabled class 绑定(老项目 DOM hack, 此处补充重复绑定去重与卸载清理)
 */
import { computed, onBeforeUnmount, reactive, toRefs } from 'vue'
import { messageCenterApi, type MessageTypeItem } from '../service/messageApiService'

export default function useMessageTabs() {
  const state = reactive({
    // 当前分类value
    tabNameValue: '' as string | number,
    // 分类 [{'label':'',value:'',isHaveNewMessage:false,unreadCount:0}]
    tabLists: [] as MessageTypeItem[],
  })
  const { tabNameValue, tabLists } = toRefs(state)

  // 当前tab数据
  const tabCurrent = computed(() => {
    return state.tabLists.find((f) => Number(f.value) === Number(state.tabNameValue)) || ({} as MessageTypeItem)
  })

  /* 消息类型(provide 给列表等子级) */
  const messageType = computed<string | number>(() => {
    return state.tabNameValue
  })

  /**
   * 获取消息分类
   */
  async function handleMessageType() {
    return await messageCenterApi.userMessage_getUserMessageType({
      channelCode: 'pc',
    })
  }

  /* tabs 滚动箭头 disabled class 绑定(老项目 DOM hack) */
  let navPrev: Element | null = null
  let navNext: Element | null = null
  let prevClickHandler: (() => void) | null = null
  let nextClickHandler: (() => void) | null = null
  let bindTimer: ReturnType<typeof setTimeout> | null = null

  const removeNavClickListener = () => {
    if (navPrev && prevClickHandler) {
      navPrev.removeEventListener('click', prevClickHandler)
    }
    if (navNext && nextClickHandler) {
      navNext.removeEventListener('click', nextClickHandler)
    }
    navPrev = null
    navNext = null
    prevClickHandler = null
    nextClickHandler = null
  }

  const createBindClassFn = (el: Element, el2: Element) => {
    return () => {
      const isHasDisabled = el.classList.contains('disabled')
      if (isHasDisabled) {
        el.classList.remove('disabled') // Remove the class if it exists
        el2.classList.add('disabled') // Remove the class if it exists
      } else {
        el.classList.add('disabled') // Remove the class if it exists
        el2.classList.remove('disabled') // Remove the class if it exists
      }
    }
  }

  /**
   * 绑定 tabs 滚动箭头 disabled class
   * 修复: 抽屉每次打开重复 addEventListener 导致监听器叠加, 重绑前先移除旧监听
   */
  const bindNavScrollClass = () => {
    if (bindTimer) {
      clearTimeout(bindTimer)
    }
    bindTimer = setTimeout(() => {
      const el2 = document.getElementsByClassName('el-tabs__nav-next')[0]
      const el = document.getElementsByClassName('el-tabs__nav-prev')[0]
      if (el2 && el) {
        el.classList.add('disabled')
        removeNavClickListener()
        prevClickHandler = createBindClassFn(el, el2)
        nextClickHandler = createBindClassFn(el2, el)
        navPrev = el
        navNext = el2
        el.addEventListener('click', prevClickHandler)
        el2.addEventListener('click', nextClickHandler)
      }
    }, 20)
  }

  onBeforeUnmount(() => {
    if (bindTimer) {
      clearTimeout(bindTimer)
      bindTimer = null
    }
    removeNavClickListener()
  })

  /* 更新消息tab */
  async function updateMessageType() {
    const res = await handleMessageType()
    if (res.code === 0 && res.data) {
      state.tabLists = res.data
      state.tabNameValue = res.data[0].value
    }
    bindNavScrollClass()
  }

  /* 更新消息tab列表未读消息 */
  async function updateMessageUnread() {
    const res = await handleMessageType()
    if (res.code === 0 && res.data) {
      // 后端分类可能下线, find 无匹配项时过滤掉(老项目会置入 undefined, 此处等价防御)
      state.tabLists = state.tabLists
        .map((f) => res.data.find((i: MessageTypeItem) => i.value === f.value))
        .filter((f): f is MessageTypeItem => !!f)
    }
  }

  /* 手动更新当前tab消息为已读 - 当前tab展示标记isHaveNewMessage已读（打开tab即认为已读） */
  function updateMessageTypeManual() {
    const currentTabIndex = state.tabLists.findIndex((f) => Number(f.value) === Number(state.tabNameValue))
    if (state.tabLists[currentTabIndex]) {
      state.tabLists[currentTabIndex]['isHaveNewMessage'] = false
    }
  }

  /* 重置分类(抽屉关闭时) */
  const reset = () => {
    state.tabNameValue = ''
    state.tabLists = []
  }

  return {
    tabNameValue,
    tabLists,
    tabCurrent,
    messageType,
    updateMessageType,
    updateMessageUnread,
    updateMessageTypeManual,
    reset,
  }
}
