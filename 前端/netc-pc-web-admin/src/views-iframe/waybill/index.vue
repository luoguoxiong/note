<template>
  <Iframe menuCode="M3060" messageCode="pcSearch" routerName="waybill-v3" @message="getMessage"></Iframe>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Iframe from '../components/iframe/index.vue'
import { Any } from '@/types'
import { ElMessage } from 'element-plus'
import { createTask, createTaskV2 } from '@/views/admin/components/header/download/api'
import { usePcWebDownloadCenterStore } from '@/stores/pc-web/downloadCenter'
import eventBus, { EE_EVENT } from '@/views/admin/components/header/eventBus'
import { usePcWebCommonStore } from '@/stores/pc-web/common'

const router = useRouter()
const downloadCenterStore = usePcWebDownloadCenterStore()
const commonStore = usePcWebCommonStore()

const getMessage = ({ type, data }: { type: string; data: Any }) => {
  switch (type) {
    case 'toDownLoad':
      toDownLoad(data)
      break
    case 'toDownLoadWaybillMsg':
      toDownLoadWaybillMsg(data)
      break
    case 'exportExcel':
      exportExcel(data)
      break
    case 'openHeaderSetting':
      openHeaderSetting()
      break
    case 'toUserCusCode':
      toUserCusCode()
      break
    default:
  }
}

// 下载运单资料
const toDownLoad = async (data: Any) => {
  const { bizType, newParams, showToast } = data
  try {
    downloadCenterStore.setCreateTaskLoading(true)
    downloadCenterStore.setBizTypeLoading({ [bizType]: true })
    let res: Any = {}
    if (bizType === 10) {
      res = await createTaskV2(newParams)
    } else {
      res = await createTask(newParams)
    }
    if (res.code === 0) {
      commonStore.setDownloadCenterNeedUpdate(true)
    } else {
      eventBus.emit(EE_EVENT.DOWNLOAD_INTERFACE_ERROR_INTERRUPT)
      // 产品需要先关闭动画再弹出提示toast
      setTimeout(() => {
        if (showToast) ElMessage.error(res.msg || '网络错误，请稍后再试')
      }, 1000)
    }
  } finally {
    downloadCenterStore.setCreateTaskLoading(false)
    downloadCenterStore.setBizTypeLoading({ [bizType]: false })
  }
}

// 下载运单详情
const toDownLoadWaybillMsg = async (data: Any) => {
  const { newParams, showToast } = data
  if (newParams.waybillExportRequest?.smallQuery?.length > 0) {
    newParams.waybillExportRequest.generalQuery = {}
  }
  downloadCenterStore.setCreateTaskLoading(true)
  try {
    const res = await createTask(newParams)
    if (res.code === 0) {
      commonStore.setDownloadCenterNeedUpdate(true)
    } else {
      eventBus.emit(EE_EVENT.DOWNLOAD_INTERFACE_ERROR_INTERRUPT)
      setTimeout(() => {
        if (showToast) ElMessage.error(res.msg || '网络错误，请稍后再试')
      }, 1000)
    }
  } catch (e) {
    if (showToast) {
      ElMessage.error('网络错误，请稍后再试')
    }
  } finally {
    downloadCenterStore.setCreateTaskLoading(false)
  }
}

// 导出运单Excel
const exportExcel = async (data: Any) => {
  const { type, params, getCustomerCode, showToast, types } = data
  const newParams = {
    type,
    types,
    waybillExportRequest: {
      customerCodes: [],
      clientType: 10,
      ...params,
    },
  }
  if (!newParams.waybillExportRequest?.customerCodes?.length) {
    newParams.waybillExportRequest.customerCodes = [getCustomerCode]
  }
  if (newParams.waybillExportRequest?.smallQuery?.length > 0) {
    newParams.waybillExportRequest.generalQuery = {}
  }
  downloadCenterStore.setCreateTaskLoading(true)
  downloadCenterStore.setDownloadCenterWithoutCompress(false)
  downloadCenterStore.downloadCenterIsWaybillExportMultiple(false)
  try {
    const res = await createTaskV2(newParams)
    if (res.code === 0) {
      commonStore.setDownloadCenterNeedUpdate(true)
    } else {
      if (showToast) ElMessage.error(res.msg || '网络错误，请稍后再试')
    }
  } catch (e) {
    if (showToast) {
      ElMessage.error('网络错误，请稍后再试')
    }
  } finally {
    downloadCenterStore.setCreateTaskLoading(false)
  }
}

// 子应用打开表头设置（对齐老项目 $bus.emit('waybillV3OpenSetting')，new-client 监听）
const openHeaderSetting = () => {
  eventBus.emit(EE_EVENT.WAYBILL_V3_OPEN_SETTING)
}

// 子应用跳转客户编码页（/admin/user/cusCode 由路由守卫转成容器路径并补齐 realRoutePath）
const toUserCusCode = () => {
  router.push('/admin/user/cusCode')
}
</script>
