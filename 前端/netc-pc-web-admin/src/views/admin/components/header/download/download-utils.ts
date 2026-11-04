/**
 * 下载中心下载执行工具(私有实现)
 * 来源: netc-pc-web/src/utils/downloadCenter.js 中 downloadFile 及其依赖
 * (getExtendName / updateCompressionStatusService / downloadFileByUrls,
 *  materialPage 等页面级创建任务逻辑不在下载中心组件群范围, 未迁移)
 *
 * vuex -> Pinia 映射:
 *  - downloadCenter/addLocalDownloadingCount    -> usePcWebDownloadCenterStore().addLocalDownloadingCount
 *  - downloadCenter/addCompressFileDownloading   -> usePcWebDownloadCenterStore().addCompressFileDownloading
 *  - downloadCenter/minusLocalDownloadingCount   -> usePcWebDownloadCenterStore().minusLocalDownloadingCount
 *  - downloadCenter/removeCompressFileDownloading -> usePcWebDownloadCenterStore().removeCompressFileDownloading
 */
import { ElMessage } from 'element-plus'
import { isClientMode, isOldClientMode, downLoadFile } from '@/native/electron'
import { usePcWebDownloadCenterStore } from '@/stores/pc-web/downloadCenter'
import { DOWNLOAD_API_EXTEND_NAME_MAP } from './consts'
import { getFileUrl, updateCompressionStatus } from './api'

/** 下载行数据 */
export interface DownloadRow {
  fileName?: string
  compressionId?: string | number
  engFileName?: string
  [key: string]: any
}

// ==================== 下载api扩展名 (旧 getExtendName) ====================

/** 获取下载api需要的后缀 */
const getExtendName = (fileName = ''): string => {
  if (!fileName) return fileName
  const extendName = fileName.match(/\.([a-z0-9]+)$/i)?.[1] || ''
  const _extendName = DOWNLOAD_API_EXTEND_NAME_MAP[extendName] || extendName || 'zip'
  return _extendName
}

// ==================== 浏览器下载 (旧 commonUtil.downloadFileByUrls) ====================

function createIFrame(url: string, triggerDelay: number, removeDelay: number) {
  setTimeout(() => {
    if (!url) {
      return
    }
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none' // 防止影响页面
    iframe.style.height = '0' // 防止影响页面
    iframe.src = url
    document.body.appendChild(iframe)
    setTimeout(() => {
      iframe.remove()
    }, removeDelay)
  }, triggerDelay)
}

/** 浏览器 iframe 方式下载文件 */
export async function downloadFileByUrls(urls: string[]) {
  urls.forEach((url, index) => {
    createIFrame(url, index * 100, 1000)
  })
}

// ==================== 下载执行 ====================

const callDownloadApiDelay = isOldClientMode() ? 1000 : 100

const updateCompressionStatusService = ({ compressionId }: { compressionId?: string | number }) => {
  updateCompressionStatus({
    compressionId,
  }).catch((e: unknown) => {
    console.log('updateCompressionStatus error', e)
  })
}

/** 执行下载动作(旧 utils/downloadCenter.downloadFile) */
export const downloadFile = async (row: DownloadRow = {}) => {
  const { fileName, compressionId, engFileName } = row
  const downloadCenterStore = usePcWebDownloadCenterStore()
  try {
    const res = await getFileUrl({ compressionId })
    const url = res?.data
    if (!isOldClientMode()) {
      // 新壳、浏览器
      updateCompressionStatusService({ compressionId })
    }
    const downList = [url]
    const _fileName = engFileName || fileName
    const extendName = getExtendName(fileName || '')
    console.log('extendName::::', extendName)
    if (isClientMode()) {
      downloadCenterStore.addLocalDownloadingCount(1)
      downloadCenterStore.addCompressFileDownloading(String(compressionId ?? ''))
      console.log(
        'isLocalDownloading start:::',
        downloadCenterStore.isLocalDownloading,
        downloadCenterStore.compressFileDownloading
      )
      setTimeout(async () => {
        let res = await downLoadFile(url, extendName, _fileName || '')
        if (typeof res === 'string') {
          res = JSON.parse(res)
        }
        // 旧壳code是字符串，旧壳保存弹窗取消msg返回空字符
        // 新壳保存弹窗取消有bug，promise没回调
        if (String(res?.code) === '0' && res.msg) {
          ElMessage({
            message: `${_fileName} 已下载完成，请到选择的储存位置查看`,
            type: 'success',
            duration: 4000,
          })
          if (isOldClientMode()) {
            // 旧壳
            updateCompressionStatusService({ compressionId })
          }
        }
        console.log(
          'isLocalDownloading end222:::',
          downloadCenterStore.isLocalDownloading,
          downloadCenterStore.compressFileDownloading
        )
        downloadCenterStore.minusLocalDownloadingCount(1)
        downloadCenterStore.removeCompressFileDownloading(String(compressionId ?? '')) // 注：新壳2.2.1不支持 保存对话框 关闭后走到这里，所以不会执行这里的代码
      }, callDownloadApiDelay)
    } else {
      await downloadFileByUrls(downList) // 浏览器
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '网络错误，请稍后再试')
    if (isClientMode()) {
      downloadCenterStore.minusLocalDownloadingCount(1)
      downloadCenterStore.removeCompressFileDownloading(String(compressionId ?? ''))
    }
  } finally {
    console.log(
      'isLocalDownloading end:::',
      downloadCenterStore.isLocalDownloading,
      downloadCenterStore.compressFileDownloading
    )
  }
}
