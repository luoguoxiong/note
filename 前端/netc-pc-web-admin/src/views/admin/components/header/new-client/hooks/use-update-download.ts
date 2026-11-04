/**
 * useUpdateDownload 客户端更新下载状态机与进度处理 hook
 * 来源: netc-pc-web/src/views/new-client/update.vue (自 update.vue 拆分, 行为不变)
 *
 * 迁移说明(自 update.vue 移入):
 *  - 下载动画: @/components/create-download-task-animation/commonManager -> ../utils/download-animation
 *  - toDecimal2: @utils/commonUtil -> ../utils/format
 *  - 跨声壳下参数 JSON.stringify 传原生, as any 适配签名
 *
 * 注意: window.getProgress / getProgressNew / geDownloadResult / progressError
 * (见 src/shims-vue.d.ts) 的注册时机仍由 update.vue 的 onMounted 控制, 本 hook 仅提供回调实现
 */
import { computed, ref, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  cancelUpdateClient,
  existsVersionFile,
  isKuaShenClientMode,
  minimize,
  startSetup,
  updateClient,
} from '@/native/electron'
import { usePcWebCommonStore } from '@/stores/pc-web/common'
import * as downloadAnimationManager from '../utils/download-animation'
import { formatBytes, toDecimal2 } from '../utils/format'

export const useUpdateDownload = ({
  versionInfo,
  emit,
}: {
  versionInfo: Ref<Record<string, any> | null>
  emit: {
    (e: 'submitUpdate'): void
  }
}) => {
  const commonStore = usePcWebCommonStore()

  // status: 0下载失败,1强升下载中,2强升，3强升下载完成,4已经是最新，5,弱升级,6弱升下载完成,7弱升下载中
  const status = ref(-1)
  const percentage = ref(0)
  const currSize = ref<string | number>('')
  const totalSize = ref<string | number>('')
  const modalShow = ref(false)
  const cancelDialog = ref(false)
  const setUpIng = ref(false)

  const bgImage = computed(() => {
    switch (status.value) {
      case 0:
        return 'https://ic-img.ky-express.com/netc/20221019_14063189542_!!1666161665513_1000_374.png'
      case 1:
      case 2:
      case 5:
      case 7:
        return 'https://ic-img.ky-express.com/netc/20221018_31963189523_!!1666094371514_1000_372.png'
      case 3:
      case 6:
        return 'https://ic-img.ky-express.com/netc/20221018_91063189552_!!1666094410324_1000_372.png'
      default:
        return ''
    }
  })

  const downalMessageModal = computed(() => {
    const s = status.value
    return s === 0 || s === 3 || s === 6 || s === 1
  })

  const closeIcon = computed(() => {
    const s = status.value
    return s !== 1 && s !== 2 && s !== 3
  })

  const setClientMinimize = () => {
    minimize()
  }

  const restoreProgress = () => {
    percentage.value = 0
    totalSize.value = 0
    currSize.value = 0
  }

  // 切换弹框
  const switchModal = (s: number) => {
    modalShow.value = s !== -1 && s !== 7
    status.value = s
  }

  const openCancelDialog = () => {
    cancelDialog.value = true
    modalShow.value = true
  }

  const quitUpdate = () => {
    localStorage.removeItem('versionInfo')
    cancelUpdateClient(undefined as any)
    // 延迟处理视觉效果
    cancelDialog.value = false
    switchModal(-1)
    setTimeout(() => {
      restoreProgress()
      commonStore.setClientUpdateIng(false)
    }, 300)
  }

  const continueUpdate = () => {
    modalShow.value = false
    cancelDialog.value = false
  }

  const onStartSetup = () => {
    setUpIng.value = true
    startSetup((versionInfo.value as Record<string, any>).versionNo as any).catch(() => {
      ElMessage.error('安装失败，请重新下载')
      switchModal(-1)
      setUpIng.value = false
    })
  }

  const progressError = () => {
    status.value = 0
    modalShow.value = true
    restoreProgress()
    commonStore.setClientUpdateIng(false)
  }

  const getProgress = (data: any) => {
    const { progress, currSize: cSize, totalSize: tSize } = data
    percentage.value = progress
    totalSize.value = tSize
    currSize.value = toDecimal2(cSize)

    commonStore.setClientUpdateIng(true)
    if (progress === 100 && String(cSize) === String(tSize)) {
      if (!parseInt(cSize)) {
        status.value = 0
        return
      }
      const s = status.value === 1 ? 3 : 6
      switchModal(s)
      cancelDialog.value = false
      restoreProgress()
      localStorage.removeItem('versionInfo')
      commonStore.setClientUpdateIng(false)
      return
    }
    if (status.value !== 7 && localStorage.getItem('versionInfo')) {
      status.value = 7
      modalShow.value = false
    }
  }

  const getProgressNew = (data: any) => {
    if (typeof data === 'string') {
      data = JSON.parse(data).data
    }
    const { progress } = data
    let { currSize: cSize, totalSize: tSize } = data
    cSize = formatBytes(cSize, 2).replace('MB', '')
    tSize = formatBytes(tSize, 2).replace('MB', '')
    if (cSize.indexOf('KB') > -1) {
      tSize = '0.01'
    }
    getProgress({
      progress,
      totalSize: tSize,
      currSize: cSize,
    })
  }

  const getUpdateResult = (res: any) => {
    if (typeof res === 'string') {
      res = JSON.parse(res)
    }
    commonStore.setClientUpdateIng(false)
    if (res.code === 1) {
      progressError()
    } else {
      getProgress({
        progress: 100,
        totalSize: String(totalSize.value).replace('MB', ''),
        currSize: String(totalSize.value).replace('MB', ''),
      })
    }
  }

  // 下载动画
  const downloadAnimation = () => {
    const { height: bodyHeight } = document.body.getBoundingClientRect()
    downloadAnimationManager.play({
      targetPosition: {
        top: bodyHeight,
        left: 0,
      },
      iconUrl: 'https://ic-img.ky-express.com/netc/20230726_75263189534_!!1690359074837_127_123.png',
    })
  }

  const submitUpdate = async (param?: any) => {
    if (param?.versionNo) {
      versionInfo.value = param
    }
    const info = versionInfo.value as Record<string, any>
    const { upgradeMode, versionLink, versionNo } = info
    let params: Record<string, any> | string = {
      versionNo,
    }
    if (isKuaShenClientMode()) {
      params = JSON.stringify(params)
    }
    const existFile = await existsVersionFile(params as any)
    localStorage.removeItem('versionInfo')
    if (existFile) {
      switchModal(String(upgradeMode) === '10' ? 3 : 6)
      return
    }
    if (!versionLink) return
    let updateParam: Record<string, any> | string = {
      url: versionLink,
      versionNo,
    }
    if (isKuaShenClientMode()) {
      updateParam = JSON.stringify(updateParam)
    }
    updateClient(updateParam as any)
    modalShow.value = false
    if (String(upgradeMode) !== '10') {
      modalShow.value = false
      downloadAnimation()
    } else {
      modalShow.value = true
    }
    status.value = String(upgradeMode) === '10' ? 1 : 7
    emit('submitUpdate')
    // 跨声3.0壳子，保存版本信息用于刷新后恢复
    if (param?.versionNo || String(upgradeMode) !== '10') {
      localStorage.setItem('versionInfo', JSON.stringify(versionInfo.value))
    }
  }

  return {
    status,
    percentage,
    currSize,
    totalSize,
    modalShow,
    cancelDialog,
    setUpIng,
    bgImage,
    downalMessageModal,
    closeIcon,
    switchModal,
    setClientMinimize,
    openCancelDialog,
    quitUpdate,
    continueUpdate,
    onStartSetup,
    progressError,
    getProgress,
    getProgressNew,
    getUpdateResult,
    submitUpdate,
  }
}
