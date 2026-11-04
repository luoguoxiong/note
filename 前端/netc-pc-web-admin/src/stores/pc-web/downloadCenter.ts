/**
 * pc-web 旧基座 downloadCenter 模块 (Pinia 版)
 * 来源: netc-pc-web/src/store/modules/downloadCenter.js (namespaced: 'downloadCenter')
 *
 * 使用场景(标注):
 *  - 【下载任务】createTaskLoading 创建下载任务loading / bizTypeLoading 运单资料页多运单维度
 *    下载状态(1回单 2电子存根 10其他资料 12签收联) / getBizTypeLoading(bizType) /
 *    compressFileDownloading 压缩包下载状态Map(id->bool) + add/remove / getLoadingByCompressId(id)
 *    —— 下载中心、运单资料批量下载按钮loading
 *  - 【本地下载】localDownloadingCount 本地下载中文件数量 + add/minus / isLocalDownloading
 *    —— 本地文件直下计数(浏览器下载)
 *  - 【导出/悬浮框】withoutCompress 是否需要压缩 / isWaybillExportMultiple 运单列表导出是否200票以上 /
 *    isInterfaceErrorInterrupt 接口异常中断 / downloadAnimationFade 打包动效过渡隐藏 /
 *    downloadRrogress 下载进度 / showDownloadSuspended 下载悬浮框展示 / showDownloadPopover 提示气泡
 *    —— 下载中心悬浮窗与动效
 */
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

const SET_CREATE_TASK_LOADING = 'SET_CREATE_TASK_LOADING'
const SET_BIZ_TYPE_LOADING = 'SET_BIZ_TYPE_LOADING'

export const usePcWebDownloadCenterStore = defineStore('pcWebDownloadCenter', () => {
  // ==================== state (旧 downloadCenter.js state) ====================
  const createTaskLoading = ref(false) // 创建下载任务loading
  const localDownloadingCount = ref(0) // 本地下载中的文件数量
  const compressFileDownloading = ref<Record<string, boolean>>({}) // 压缩包下载状态
  const bizTypeLoading = reactive<Record<string | number, boolean>>({
    // 运单资料查看页，多运单维度下载状态
    1: false, // 下载回单
    2: false, // 电子存根
    10: false, // 其他资料
    12: false, // 签收联
  })
  const withoutCompress = ref(false) // 不需要压缩的
  const isWaybillExportMultiple = ref(false) // 是否运单列表导出200票以上
  const isInterfaceErrorInterrupt = ref(false) // 是否接口异常中断
  const downloadAnimationFade = ref(false) // 打包动效完成过渡隐藏
  const downloadRrogress = ref(0) // 下载进度
  const showDownloadSuspended = ref(false) // 下载悬浮框展示
  const showDownloadPopover = ref(false) // 下载提示气泡展示

  // ==================== getters (旧 downloadCenter.js getters) ====================
  const getBizTypeLoading = () => {
    return (bizType: string | number) => {
      return bizTypeLoading[bizType] || false
    }
  }
  // 本地是否下载中
  const isLocalDownloading = computed(() => {
    return !!localDownloadingCount.value
  })
  const getLoadingByCompressId = () => {
    return (id: string | number) => {
      return compressFileDownloading.value[id] || false
    }
  }

  // ==================== mutations (旧 downloadCenter.js mutations) ====================
  function SET_CREATE_TASK_LOADING_MUTATION(val: boolean) {
    createTaskLoading.value = val
  }
  function SET_BIZ_TYPE_LOADING_MUTATION(val: Record<string | number, boolean>) {
    Object.assign(bizTypeLoading, {
      ...bizTypeLoading,
      ...val,
    })
  }
  function addLocalDownloadingCount(val = 1) {
    localDownloadingCount.value += val
  }
  function minusLocalDownloadingCount(val = 1) {
    localDownloadingCount.value -= val
    if (localDownloadingCount.value < 0) localDownloadingCount.value = 0
  }
  // 压缩包下载状态，val为压缩包id
  function addCompressFileDownloading(val = '') {
    compressFileDownloading.value = {
      ...compressFileDownloading.value,
      [val]: true,
    }
  }
  function removeCompressFileDownloading(val = '') {
    const newData = { ...compressFileDownloading.value }
    delete newData[val]
    compressFileDownloading.value = newData
  }
  // 下载是否需要压缩
  function setDownloadCenterWithoutCompress(val: boolean) {
    withoutCompress.value = val
  }
  // 是否运单列表导出200票以上
  function downloadCenterIsWaybillExportMultiple(val: boolean) {
    isWaybillExportMultiple.value = val
  }
  // 接口异常中断
  function interfaceErrorInterrupt(val: boolean) {
    isInterfaceErrorInterrupt.value = val
  }
  function setDownloadCenterAnimationFade(val: boolean) {
    downloadAnimationFade.value = val
  }
  function setDownloadRrogress(val: number) {
    downloadRrogress.value = val
  }
  function setShowDownloadSuspended(val: boolean) {
    showDownloadSuspended.value = val
  }
  function setShowDownloadPopover(val: boolean) {
    showDownloadPopover.value = val
  }

  // ==================== actions (旧 downloadCenter.js actions, 与同名 mutation 一致) ====================
  function setCreateTaskLoading(data: boolean) {
    SET_CREATE_TASK_LOADING_MUTATION(data)
  }
  function setBizTypeLoading(data: Record<string | number, boolean>) {
    SET_BIZ_TYPE_LOADING_MUTATION(data)
  }

  return {
    // mutation-type 常量
    SET_CREATE_TASK_LOADING,
    SET_BIZ_TYPE_LOADING,
    // state
    createTaskLoading,
    localDownloadingCount,
    compressFileDownloading,
    bizTypeLoading,
    withoutCompress,
    isWaybillExportMultiple,
    isInterfaceErrorInterrupt,
    downloadAnimationFade,
    downloadRrogress,
    showDownloadSuspended,
    showDownloadPopover,
    // getters
    getBizTypeLoading,
    isLocalDownloading,
    getLoadingByCompressId,
    // mutations
    SET_CREATE_TASK_LOADING_MUTATION,
    SET_BIZ_TYPE_LOADING_MUTATION,
    addLocalDownloadingCount,
    minusLocalDownloadingCount,
    addCompressFileDownloading,
    removeCompressFileDownloading,
    setDownloadCenterWithoutCompress,
    downloadCenterIsWaybillExportMultiple,
    interfaceErrorInterrupt,
    setDownloadCenterAnimationFade,
    setDownloadRrogress,
    setShowDownloadSuspended,
    setShowDownloadPopover,
    // actions
    setCreateTaskLoading,
    setBizTypeLoading,
  }
})
