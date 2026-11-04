<template>
  <div class="goods-delivery-detail dialog_root_goods_delivery_detail h-full flex flex-column">
    <div class="template-down font-level4" @click="handleDownloadTemplate">
      <SvgIcon name="tip-message-warn" class="tips-icon" />
      <span> 请先下载【发货明细清单】模板，填写后上传</span>
      <span class="down-text">下载模板</span>
      <SvgIcon :name="'right-arrow-warn-primary'" class="tips-arrow" />
    </div>
    <div class="goods-delivery-detail-block">
      <div class="goods-delivery-detail-content">
        <div class="goods-delivery-detail-content-top flex items-center">
          <span class="font-level2">发货明细清单</span>
          <span class="tips">{{ internalState.uploadList.length }}/{{ fileCount }}（每个文件最大10M）</span>
        </div>
        <div class="goods-delivery-detail-body flex items-center">
          <div class="goods-delivery-detail-body-tabs flex items-center justify-center">
            <div class="flex items-center" @click="uploadFiles">
              <img :src="uploadFileTabs1" class="goods-delivery-detail-body-tabs-img" />
              <span class="tabs-text">添加文件</span>
            </div>
          </div>
          <div class="goods-delivery-detail-body-tabs flex items-center justify-center">
            <div class="flex items-center" @click="uploadImage">
              <img :src="uploadFileTabs2" class="goods-delivery-detail-body-tabs-img" />
              <span class="tabs-text">添加图片</span>
            </div>
          </div>
        </div>
        <div class="goods-delivery-detail-upload-content" v-if="internalState.uploadList.length > 0">
          <template v-for="item in internalState.uploadList" :key="item.id">
            <div class="goods-delivery-detail-upload-list">
              <div class="upload-list-cell-content">
                <ky-cell
                  class="upload-list-cell items-center"
                  :class="{
                    uploadfailwidth:
                      item.status === UploadStatusEnum['FAIL'] ||
                      item.status === UploadStatusEnum['UPLOADING'] ||
                      item.status === UploadStatusEnum['DELETING'],
                  }"
                >
                  <template #icon>
                    <image class="upload-list-img" :src="getIcon(item)" @click="() => handlePreFile(item)" />
                  </template>
                  <template #title>
                    <div class="title-wrap">
                      <div @click="() => handlePreFile(item)" class="upload-list-title ellipsis">
                        {{ isAmapMiniApp || isAliMiniApp ? item?.name?.replace('.JPEG', '') : item.name }}
                      </div>
                      <div @click="() => handlePreFile(item)" class="time-wrap">
                        <span class="upload__file-time">{{ formateDate(item.creationDate, 'YYYY/MM/DD HH:mm') }}</span>
                        <span class="upload__file-size ml-24">{{ formatFileSize(item.size) }}</span>
                      </div>
                    </div>
                  </template>
                  <template #value>
                    <div class="flex-align flex-end">
                      <div>
                        <div :style="{ color: '#FF706D' }" v-if="item.status === UploadStatusEnum['FAIL']">
                          <SvgIcon name="error-tip"></SvgIcon>上传失败
                        </div>
                        <div v-if="item.status === UploadStatusEnum['UPLOADING']">
                          <ky-loading>上传中</ky-loading>
                        </div>
                        <div v-if="item.status === UploadStatusEnum['DELETING']">
                          <ky-loading>删除中</ky-loading>
                        </div>
                      </div>
                      <div class="flex-align">
                        <img class="upload-list-del-icon ml-16" :src="iconDel" @click="() => handleDelete(item)" />
                      </div>
                    </div>
                  </template>
                </ky-cell>
              </div>
            </div>
          </template>
        </div>
      </div>
      <KyEmpty
        v-if="internalState.uploadList.length <= 0"
        :type="EmptyTypeEnum.DATA"
        description="请上传发货明细清单"
      />
    </div>
    <div class="goods-delivery-detail-bottom">
      <KyButton text="提交" :loading="loading" @click="handleSubmit" :loading-text="loadingText" />
    </div>
    <ImagePreview
      v-model:show="internalState.showImagePre"
      :images="internalState.preImages"
      :currentUrl="internalState.currentUrl"
    ></ImagePreview>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed, ref } from 'vue'
import { useUnload } from '@tarojs/taro'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import ImagePreview from '@order-public-sub-public/components/business/image-preview/index.vue'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { isAmapApp, isWxApplet } from '@order-public-sub-public/utils/device'
import {
  getFileSuffix,
  dataURLtoFile,
  formateDate,
} from '@order-public-sub-public/components/business/added-service/utils/index'
import {
  CustomerFile,
  UploadStatusEnum,
  UploadFile,
} from '@order-public-sub-public/components/business/added-service/types'
import { getFileByMultiBizCodeAndBizId } from '@order-public-sub-public/apis/pickup/index'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { Any } from '@public/utils/types'
import {
  THUMBNAIL_ICONS,
  EmptyTypeEnum,
  MaterialTypes,
  Channel,
  MaterialSource,
  fileBizCode,
} from '@order-public-sub-public/constants'
import { tmpCacheKey } from '@public/hooks/useTmpCacheKey'
import { getChannel } from '@order-public-sub-public/configs'
import { useInitMulitFielConfigChild, UploadFromChatOrSystem } from '@order-public-sub-public/hooks/useInitFile'
import useUpload from '@order-public-sub-public/components/business/pickup-information/hooks/upload'
import { cloneDeep, debounce, isEqual, sortBy } from 'lodash-es'
import { fileType } from '@order-public-sub-public/apis/pickup/type'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import {
  chooseFiles,
  commonFileTypes,
  formatFileSize,
  isOverFilesize,
  onChangeSingleFile,
  openPreviewFile,
  openPreviewImg,
  disableAlertUnload,
  enableAlertUnload,
} from '@order-public-sub-public/utils/upload'
import { downLoadFile } from '@order-public-sub-public/utils/downLoadFile'
import { pollingCheckStatus } from '@order-public-sub-public/utils'
import { isWxPcAppletEnv, isH5FSEnv } from '@/public/utils'
import { useStore } from '@order-public-sub-public/store'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { isAmapMiniApp, isAliMiniApp } from '@public/utils'

const piniaStore = useStore()
const router = useRouter()

const { pcUpload } = UploadFromChatOrSystem('goods-delivery-detail')

const uploadFileTabs1 = 'https://ic-img.ky-express.com/netc/20250719_62611_!!1752917982441_176_176.png'
const uploadFileTabs2 = 'https://ic-img.ky-express.com/netc/20250719_32661_!!1752917982445_176_176.png'
const iconDel = 'https://ic-img.ky-express.com/netc/20250619_42512_!!1750313443302_36_37.png'

const DOWNLOAD_TEMPLATE_URL =
  'https://api.ky-express.com/router/download/excel_import_template/157813543308609755/5u149534b85d38419395886ffede4bff15?params=813d56958a15e2922ff24303c8ea65eda79bddd8a46bbbe10aee06a7f64e2a4d'

const IMAGE_TYPE = ['jpg', 'png', 'jpeg', 'webp']

const listHash = ref<fileType[]>([])
const loading = ref(false)
const hasChangeed = ref(false)

const { startConfig, removeLast, getData, submitConfig } = useInitMulitFielConfigChild()
const { deleteFileFunAsync } = useUpload()

// 上传文件数量
const fileCount = ref<number>(5)
// 上传文件大小（字节）
const maxSize = ref<number>(1024 * 1024 * 10)

interface InternalState {
  uploadList: UploadFile[]
  showImagePre: boolean
  preImages: string[]
  currentUrl: string
}

const internalState: InternalState = reactive({
  uploadList: [],
  showImagePre: false,
  preImages: [],
  currentUrl: '',
})

const bizId = computed(() => piniaStore.order.waybillNumber)

// 按钮文案
const loadingText = computed(() => {
  return internalState.uploadList.length ? '上传中' : '提交'
})

onMounted(() => {
  getUploadList()
})

const getUploadList = async () => {
  const channel = getChannel()
  await startConfig(
    tmpCacheKey.value || bizId.value,
    channel === Channel.修改运单 ? MaterialSource.修改运单 : undefined,
  )
  const { configData, getBizCode } = await getData()
  const listParams = [
    {
      bizId: configData?.value?.bizId,
      bizCode: getBizCode(MaterialTypes.发货明细) || fileBizCode.发货明细临时,
    },
  ]
  const { data } = await getFileByMultiBizCodeAndBizId({
    list: listParams,
  })
  if (data && data.length > 0) {
    const resultList = data.map((item) => {
      const suffix = getFileSuffix(item.originalName)
      const img = ['jpg', 'png', 'jpeg'].includes(suffix?.toLowerCase())
      const type = img ? 'img' : suffix
      return {
        ...item,
        size: item?.size,
        type,
        suffix,
        status: UploadStatusEnum['SUCCESS'],
      }
    }) as unknown as UploadFile[]
    internalState.uploadList = resultList
    listHash.value = cloneDeep(data)
  }
}

const maxLen = () => {
  const count = fileCount.value - internalState.uploadList.length
  return count <= 0 ? 1 : count >= fileCount.value ? fileCount.value : count
}

const uploadFiles = async () => {
  if (isAmapApp) {
    return showToast('受小程序功能限制，无法添加文件，请通过“添加图片”上传')
  }
  if (internalState.uploadList.length >= fileCount.value) {
    showToast(`最多可添加${fileCount.value}份文件`)
    return
  }
  const counts = maxLen()
  let res
  // 微信pc、企业微信pc、手机微信小程序
  if (isWxPcAppletEnv || isWxApplet) {
    const { configData, getBizCode } = await getData()
    const fileTypeList = isWxPcAppletEnv ? [...commonFileTypes, ...IMAGE_TYPE] : [...commonFileTypes]
    res = await pcUpload(
      {
        multiple: isWxPcAppletEnv ? true : false,
        count: counts,
        accept: fileTypeList.map((i) => `.${i}`).join(','),
      },
      {
        bizCode: getBizCode(MaterialTypes.发货明细) || fileBizCode.发货明细临时,
        bizId: configData?.value?.bizId,
      },
      maxSize.value / (1024 * 1024),
      counts,
      isWxPcAppletEnv ? 'pc' : 'mobile',
    )
    if (res?.type === 'from-chat') {
      _chooseFiles()
    } else {
      const list = res?.data?.map((r) => {
        r.status = UploadStatusEnum['SUCCESS']
        r.url = r?.visit
        r.id = r?.id
        r.size = r.size
        r.name = r.name || r.originalName
        r.path = r?.visit
        if (r.type) {
          const suffix = getFileSuffix(r.originalName)
          const img = ['jpg', 'png', 'jpeg'].includes(suffix?.toLowerCase())
          r.type = img ? 'img' : suffix
          r.suffix = suffix
        }
        return r
      })
      if (list.length > fileCount.value) {
        internalState.uploadList = list.slice(0, fileCount.value)
        showToast(`最多可添加${fileCount.value}份文件`)
      } else {
        internalState.uploadList = list
      }
      beforeLeaveCheck()
    }
  } else {
    _chooseFiles()
  }
}

const _chooseFiles = async () => {
  const counts = maxLen()
  const res = await chooseFiles({
    maxSize: 10,
    type: 'file',
    extension: commonFileTypes,
    maxCount: counts,
  })
  afterRead(res, 'file')
}

const uploadImage = async () => {
  if (internalState.uploadList.length >= fileCount.value) {
    showToast(`最多可添加${fileCount.value}份文件`)
    return
  }
  const counts = maxLen()
  const res = await chooseFiles({
    maxSize: 10,
    type: 'image',
    extension: IMAGE_TYPE,
    maxCount: counts,
  })
  afterRead(res, 'img')
}

const afterRead = (file: any, type?: string) => {
  const uploadFile = (Array.isArray(file) ? file : [file]).map((item: any) => {
    const res: Any = {
      fileName: item?.name,
      size: item?.size,
      fileType: item?.type,
      filePath: item?.path,
      uid: item.path + item.name,
    }
    if (isH5FSEnv) {
      res.base64 = item.base64 || item.data
    }
    return res
  })
  onAfterRead(uploadFile, type)
}

const onAfterRead = (fileList: CustomerFile[] | CustomerFile, type?: string) => {
  const uploadFileList = Array.isArray(fileList) ? fileList : [fileList]
  const fileTypeList = [...IMAGE_TYPE, ...commonFileTypes]
  const resultUploadList: UploadFile[] = []
  if (internalState.uploadList.length + uploadFileList.length > fileCount.value) {
    showToast(`最多可添加${fileCount.value}份文件`)
    return
  }
  uploadFileList.forEach((item: any) => {
    const suffix = getFileSuffix(item.fileName)
    if (!fileTypeList.includes(suffix) && suffix !== 'jpeg') {
      const fileTypeListFilter = type === 'img' ? IMAGE_TYPE : commonFileTypes
      showToast(`只允许上传${fileTypeListFilter.join('/')}文件`)
      return
    }
    if (isOverFilesize(item, maxSize.value)) {
      showToast(`文件大小限制为${formatFileSize(maxSize.value)}`)
      return
    }
    const file = {
      id: item.uid,
      suffix,
      creationDate: Date.now(),
      originalName: item.fileName,
      name: item.fileName,
      size: item.size,
      status: UploadStatusEnum['WAIT'],
      type: type || (item.fileType?.includes('image') ? 'img' : 'file'),
      path: item.filePath,
    } as UploadFile
    if (isH5FSEnv) {
      file.file = dataURLtoFile(`data:application/${suffix};base64,${item.base64 || item.data}`, item.fileName)
    }
    resultUploadList.push(file)
  })
  internalState.uploadList = [...internalState.uploadList, ...resultUploadList]
  beforeLeaveCheck()
  handleUpload()
}

const handleUpload = async () => {
  const promiseAll: Promise<Any>[] = []
  const { configData, getBizCode } = await getData()
  internalState.uploadList.forEach((item) => {
    if (item.status !== UploadStatusEnum['WAIT'] && item.status !== UploadStatusEnum['FAIL']) return
    item.status = UploadStatusEnum['UPLOADING']
    const file = {
      path: (item as Any).path,
      name: (item as Any).name,
    }
    if (isH5FSEnv) {
      file.type = item.type
      file.file = item.file
    }
    const formData = {
      bizCode: getBizCode(MaterialTypes.发货明细) || fileBizCode.发货明细临时,
      bizId: configData?.value?.bizId,
      remark: (item as Any).uid,
    }
    promiseAll.push(
      (async (item) => {
        let res = null
        try {
          const r = (await onChangeSingleFile(file, formData)) as Any
          const firstUrl = r?.url
          const id = r?.id
          if (firstUrl) {
            item.status = UploadStatusEnum['SUCCESS']
            item.url = firstUrl
            item.id = id
            item.size = r.size
            item.name = r.name || r.originalName
          }
          if (r.type) {
            item.type = r.type
          }
        } catch (error) {
          item.status = UploadStatusEnum['FAIL']
          res = 'uploadFail'
        }
        return res
      })(item),
    )
  })
  return Promise.all(promiseAll)
}

const handleDelete = async (file: UploadFile) => {
  try {
    await showKyDialog({
      title: '温馨提示',
      message: '删除后将无法恢复，您确定要删除吗？',
      cancelButtonText: '取消',
      showCancelButton: true,
      confirmButtonText: '删除',
    })
  } catch (e) {
    return
  }
  const { id, url } = file
  internalState.uploadList = internalState.uploadList.filter((item) => item.id !== id)
  setTimeout(async () => {
    try {
      if (url?.indexOf('http') !== -1) {
        deleteFileFunAsync([file] as unknown as fileType[])
      }
      beforeLeaveCheck()
    } catch (e) {
      console.warn('handleDelete:', e)
    }
  }, 100)
  showToast('删除成功')
}

const getIcon = (file: UploadFile) => {
  if (file.type === 'img' || IMAGE_TYPE.includes(file.suffix)) {
    return file.url
  }
  return THUMBNAIL_ICONS[file.suffix] || THUMBNAIL_ICONS.default
}

// const updateDeliveryDetailFileCount = (count: number) => {
//   const restrictData = piniaStore.globalData.restrictData
//   const goodsRestrict = restrictData?.goodsRestrict
//   piniaStore.globalData.setRestrictData({
//     restrictData: {
//       goodsRestrict: {
//         ...goodsRestrict,
//         goodsDeliveryDetailFileCount: count,
//       },
//     },
//   })
// }

const handleSubmit = debounce(async () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_goods_upload_files_v1',
    },
    {
      button_name: '返回',
    },
  )
  try {
    loading.value = true
    await handleUpload()
    const delList = listHash.value.filter((v) => {
      return !internalState.uploadList.find((m) => m.id === v.id)
    })
    await deleteFileFunAsync(delList)
    try {
      await pollingCheckStatus(1, internalState.uploadList as unknown as fileType[])
    } catch (error) {
      loading.value = false
      return
    }
    const successCount = internalState.uploadList.filter((item) => item.status === UploadStatusEnum['SUCCESS']).length
    await submitConfig()
    // updateDeliveryDetailFileCount(successCount)
    listHash.value = cloneDeep(internalState.uploadList as unknown as fileType[])
    successCount && showToast(`已上传 ${successCount} 份文件`)
    disableAlertUnload()
    setTimeout(() => {
      router.back()
    }, 200)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}, 200)

// 是否有未上传的文件
const hasWaitFile = computed(() => {
  return internalState.uploadList?.find(
    (file: UploadFile) =>
      file.status &&
      [UploadStatusEnum['WAIT'], UploadStatusEnum['UPLOADING'], UploadStatusEnum['FAIL']].includes(file.status),
  )
})

// 检查是否有未保存数据（存在未上传文件 或 文件列表有差异）
const checkNeedDialog = () => {
  const uploadListIds = internalState.uploadList.map((item) => item.id)
  const listHashIds = listHash.value.map((item) => item.id)
  const newOldEqual = !isEqual(sortBy(uploadListIds), sortBy(listHashIds))
  return hasWaitFile.value || newOldEqual
}

const beforeLeaveCheck = () => {
  const needDialog = checkNeedDialog()
  if (needDialog) {
    // 如果需要注册弹框，只需注册一次
    if (hasChangeed.value) {
      return
    }
    hasChangeed.value = true
    enableAlertUnload()
  } else {
    disableAlertUnload()
    hasChangeed.value = false
  }
}
useUnload(() => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_goods_upload_return_v1',
    },
    {
      button_name: '返回',
    },
  )
  removeLast()
})

const handlePreFile = (file: UploadFile) => {
  const { type, url } = file
  const urls = internalState.uploadList.filter((item) => ['img', 'image'].includes(item.type)).map((x) => x.url)
  switch (type) {
    case 'img':
    case 'image':
      openPreviewImg(urls, url, 'dialog_root_goods_delivery_detail')
      break
    case 'pdf':
      openPreviewFile(url, type)
      break
    default:
      openPreviewFile(url as string, type)
  }
}

const handleDownloadTemplate = () => {
  downLoadFile(DOWNLOAD_TEMPLATE_URL, 'xlsx', '发货明细清单.xlsx')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
