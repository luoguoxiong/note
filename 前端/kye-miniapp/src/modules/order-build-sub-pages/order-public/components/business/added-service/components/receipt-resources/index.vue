<template>
  <div class="receipt-resources dialog_root_receipt_resources">
    <!-- <ky-navbar :leftArrow="true" title="回单资料" v-if="isWxMiniApp"></ky-navbar> -->
    <NoticeBar v-if="!isKYEPinchHit" leftIcon>收件人需为真实姓名，否则无法通过实名认证环节</NoticeBar>
    <div class="receipt-resources-block">
      <div class="receipt-resources-content template" v-if="!isKYEPinchHit">
        <div class="receipt-resources-content-top flex items-center">
          <span class="font-level2 mr-8">回单资料拍摄示例图</span>
        </div>
        <div
          class="templateUrlContent"
          @click="
            () => {
              openPreviewImg([templateUrl], templateUrl, 'dialog_root_receipt_resources')
              clk_express_receipt_button_v1('示例图', 'methods')
            }
          "
        >
          <img :src="templateUrl" class="templateUrl" />
          <div class="tipstext">为了确保签署流程顺利，请正向、清晰的拍摄回单资料</div>
        </div>
      </div>
      <div class="receipt-resources-content">
        <div class="receipt-resources-content-top flex items-center">
          <span class="font-level2 mr-8">回单资料</span>
          <!--          <span class="font-level5 receipt-resources-content-top-right">(最多可添加{{ fileCount }}份)</span>-->
          <span class="font-level5 receipt-resources-content-top-right"
            ><text :class="{ red: internalState.uploadList?.length }">{{ internalState.uploadList?.length }}</text
            >/<text>{{ fileCount }}</text
            >(每个文件最大{{ formatFileSize(maxSize) }})</span
          >
        </div>
        <div class="receipt-resources-body flex items-center">
          <div class="receipt-resources-body-tabs flex items-center justify-center">
            <div class="flex items-center" @click="uploadFiles">
              <img :src="uploadFileTabs1" class="receipt-resources-body-tabs-img mr-24" />
              <span class="tabs-text">添加文件</span>
            </div>
          </div>
          <p class="center-line"></p>
          <div class="receipt-resources-body-tabs flex items-center justify-center">
            <div class="flex items-center" @click="uploadImage">
              <img :src="uploadFileTabs2" class="receipt-resources-body-tabs-img mr-24" />
              <span class="tabs-text">添加图片</span>
            </div>
          </div>
          <div class="submit-loading" v-if="loading"></div>
        </div>
        <div class="receipt-resources-upload-content" v-if="internalState.uploadList.length > 0">
          <template v-for="item in internalState.uploadList" :key="item.id">
            <div class="receipt-resources-upload-list">
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
                    <image class="upload-list-img mr-24" :src="getIcon(item)" @touchstart="() => handlePreFile(item)" />
                  </template>
                  <template #title>
                    <div class="title-wrap">
                      <div @click="() => handlePreFile(item)" class="upload-list-title">
                        {{ isAmapMiniApp || isAliMiniApp ? item?.name?.replace('.JPEG', '') : item.name }}
                      </div>
                      <div @click="() => handlePreFile(item)" class="time-wrap">
                        <span class="upload__file-time" v-if="!item.angle_reg_type">{{
                          formateDate(item.creationDate, 'YYYY/MM/DD HH:mm')
                        }}</span>
                        <span class="upload__file-size ml-24" v-if="!item.angle_reg_type">{{
                          formatFileSize(item.size)
                        }}</span>
                        <div
                          v-if="item.angle_reg_type"
                          class="angletext"
                          id="exp_express_receipt_angle_v1"
                          :exposure-report="{
                            eventCode: 'exp_express_receipt_angle_v1',
                          }"
                        >
                          拍摄角度有误，请重新上传正向、清晰的照片
                        </div>
                      </div>
                    </div>
                  </template>

                  <template #value>
                    <div class="flex-align flex-end">
                      <div>
                        <div :style="{ color: '#FF706D' }" v-if="item.status === UploadStatusEnum['FAIL']">
                          <SvgIcon name="error-tip"></SvgIcon>上传失败
                        </div>
                        <!-- <div :style="{ color: '#00C58C' }" v-if="item.status === UploadStatusEnum['SUCCESS']">
                        <van-icon name="passed" />上传成功
                      </div> -->
                        <div v-if="item.status === UploadStatusEnum['UPLOADING']">
                          <ky-loading>上传中</ky-loading>
                        </div>
                        <div v-if="item.status === UploadStatusEnum['DELETING']">
                          <ky-loading>删除中</ky-loading>
                        </div>
                      </div>
                      <div class="flex-align">
                        <img
                          class="upload-list-del-icon ml-16"
                          :src="iconUpload"
                          v-if="item.angle_reg_type"
                          @click="replaceFile(item)"
                        />
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
        description="请尽快上传回单资料，避免影响取货时效，如未准备好可稍后自行上传"
      />
    </div>
    <div class="receipt-resources-bottom flex items-center">
      <template v-if="!isKYEPinchHit">
        <div class="font-level4" data-validate="receipt-resource-bottom-radio">
          <KyRadio
            type="check"
            v-model="internalState.checked"
            :radio-props="[{ name: true, text: '已阅读并同意' }]"
            :showCheckErrorTip="showCheckErrorTip"
            @change="handleRadioChange"
            @click="handleRadio"
          >
          </KyRadio>
        </div>
        <div class="receipt-resources-bottom-agreement font-level4" @click="togglePopup">《电子回单使用风险提示》</div>
      </template>
      <div class="receipt-resources-bottom-btn" :class="{ 'width-100': isKYEPinchHit }">
        <KyButton text="提交" :loading="loading" @click="handleSubmit" :loading-text="loadingText" />
      </div>
    </div>
    <ImagePreview
      v-model:show="internalState.showImagePre"
      :images="internalState.preImages"
      :currentUrl="internalState.currentUrl"
    ></ImagePreview>
  </div>
  <BottomPopup
    title="《电子回单使用风险提示》"
    class="receipt-resources-bottom-popup"
    :showFooter="true"
    v-model:show="internalState.popupVisible"
    @onClose="onClosed"
    @open="onOpen"
    id="receipt-resources-bottom-popup"
  >
    <Loading v-if="internalState.popupLoading" size="24px" class="netc-agreement__popup--loading">
      <span class="netc-agreement__popup--loading__text">加载中...</span>
    </Loading>
    <template v-else>
      <scroll-view
        :scroll-y="true"
        class="netc-agreement__popup--body"
        @scroll="handlerScroll"
        v-if="internalState.showContent"
      >
        <!-- <div v-html="internalState.content" id="waybill-terms" class="font-level3 agreement-content"></div> -->
        <rich-text :nodes="internalState.content" id="waybill-terms"></rich-text>
        <HistoryAgreement
          :code="internalState.agreementCode"
          v-if="internalState.isShowHistory"
          name="电子回单使用风险提示"
        ></HistoryAgreement>
      </scroll-view>
    </template>
    <template #footer>
      <div class="netc-agreement__popup--footer">
        <KyButton
          type="primary"
          :text="btnText"
          @click="onConfirm"
          class="confirm-button"
          :disabled="confirmDisabled"
        ></KyButton>
      </div>
    </template>
  </BottomPopup>
  <TaroToast />
</template>

<script setup lang="ts">
import { useOrderExposureReport } from '@order-public-sub-public/report/exposureReport'

import { getCurrentInstance, reactive, onMounted, computed, nextTick, ref } from 'vue'

import TaroToast from '@public/components/base/toast/toast.vue'
// import { isWxMiniApp } from '@/public/utils'
import Taro, { useUnload, useLoad, useDidShow } from '@tarojs/taro'
import { RequestBaseUrl } from '@order-public-sub-public/utils/env'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
// import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import { useRoute, useRouter, LocationQueryValue } from '@order-public-sub-public/vue-router/index'
import { isWechat, isAmapApp, isWxApplet } from '@order-public-sub-public/utils/device'
import { localCheckResult, AddedServiceConfig } from '@order-public-sub-public/types'
import { getFileSuffix, dataURLtoFile, formateDate } from '../../utils/index'
import {
  CustomerFile,
  UploadStatusEnum,
  UploadFile,
} from '@order-public-sub-public/components/business/added-service/types'
// import { nanoid } from 'nanoid'
import { getFileByMultiBizCodeAndBizId, fileUpload } from '@order-public-sub-public/apis/pickup/index'
// import { getUploadMaterials } from '@order-public-sub-public/apis/added-service/index'
import { UploadMaterialsParams } from '@order-public-sub-public/apis/added-service/types'

import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import KyRadio from '@order-public-sub-public/components/base/ky-radio/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import NoticeBar from '@order-public-sub-public/components/base/ky-noticebar/noticebar.vue'
import HistoryAgreement from '@order-public-sub-public/components/business/estimated-cost/components/history-agreement/index.vue'

import { Any } from '@public/utils/types'
import {
  agreementCheckHasRead,
  agreementSave,
  // getAgreementDefaultSelect,
  getHelpContent,
  AgreementType,
} from '@order-public-sub-public/hooks/useAgreeState'
import useEffect from '@order-public-sub-public/validate'
import { closeSkeleton } from '@order-public-sub-public/utils/skeleton'
import {
  THUMBNAIL_ICONS,
  EmptyTypeEnum,
  MaterialTypes,
  Channel,
  ModuleType,
  MaterialSource,
} from '@order-public-sub-public/constants'
import { tmpCacheKey } from '@public/hooks/useTmpCacheKey'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import ImagePreview from '@order-public-sub-public/components/business/image-preview/index.vue'
import { previewOtherFile } from '@order-public-sub-public/components/business/pickup-information/components/upload-file/utils'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
// import KyLoading from '@order-public-sub-public/components/base/ky-loading/index.vue'
import { fileType } from '@order-public-sub-public/apis/pickup/type'
import useUpload from '@order-public-sub-public/components/business/pickup-information/hooks/upload'
import { cloneDeep, debounce, isEqual, sortBy } from 'lodash-es'
import {
  clk_express_receipt_button_v1,
  clk_express_receipt_v1,
} from '@order-public-sub-public/components/business/added-service/hooks/report'
import { uploadPageExpressReport, uploadToPhoneOrPcClickReport, uploadToWXListClickReport } from './reports'
import { useInitMulitFielConfigChild, UploadFromChatOrSystem } from '@order-public-sub-public/hooks/useInitFile'
import { getChannel } from '@order-public-sub-public/configs'
import { pollingCheckStatus } from '@order-public-sub-public/utils'
import { useToast } from '@public/hooks/useToast'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import {
  chooseFiles,
  commonFileTypes,
  formatFileSize,
  isOverFilesize,
  onChangeSingleFile,
} from '@order-public-sub-public/utils/upload'

import { openPreviewFile, openPreviewImg } from '@order-public-sub-public/utils/upload'
import { isAmapMiniApp, isAliMiniApp } from '@public/utils'
import { openURL } from '@modules/webview/utils'
import { useStore } from '@order-public-sub-public/store'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { isWxPcAppletEnv, isQw, isH5FSEnv } from '@/public/utils'

const piniaStore = useStore()
const { showToast: showToastNew } = useToast()
useOrderExposureReport(['exp_express_receipt_angle_v1'])
const { pcUpload } = UploadFromChatOrSystem('receipt-resources')

const uploadFileTabs1 = 'https://ic-img.ky-express.com/netc/20250719_62611_!!1752917982441_176_176.png'
const uploadFileTabs2 = 'https://ic-img.ky-express.com/netc/20250719_32661_!!1752917982445_176_176.png'
const iconUpload = 'https://ic-img.ky-express.com/netc/20250619_55015_!!1750314342839_36_36.png'
const templateUrl = 'https://ic-img.ky-express.com/netc/20250710_35162_!!1752140954050_1532_904.png'
const IMAGE_TYPE = ['jpg', 'png', 'jpeg']
const FILE_TYPE = ['xls', 'xlsx', 'doc', 'docx', 'pdf', 'png', 'jpg', 'jpeg', 'webp']
const listHash = ref<fileType[]>([])
const imageUploadRef = ref()
const vm = getCurrentInstance()!
const { $native } = vm?.appContext.config.globalProperties
const isBackByConfirm = ref(false)
const loading = ref(false)
const loadingFile = ref(false)

const iconDel = 'https://ic-img.ky-express.com/netc/20250619_42512_!!1750313443302_36_37.png'
const route = useRoute()
const router = useRouter()

const { effectBubble } = useEffect()
const { startConfig, removeLast, getData, submitConfig } = useInitMulitFielConfigChild()

const { isKYEPinchHit = false, fromPage } = route.query

const showCheckErrorTip = ref(false)
const { deleteFileFunAsync, uploadAngle } = useUpload()
const replaceFileItem = ref<UploadFile>()
// 上传文件数量
const fileCount = ref<number>(15)
// 上传文件大小
const maxSize = ref<number>(1024 * 1024 * 10)
// 微信图片数量限制
// const wechatFileCount = ref<number>(9)
onMounted(() => {
  getMobileSource()
  // document.title = isKYEPinchHit ? '' : '回单资料'
  if (!isKYEPinchHit) {
    // 电子回单资料 上传数量为15 单张大小为10M
    fileCount.value = 15
    maxSize.value = 1024 * 1024 * 10
  } else {
    // 非电子回单保持之前的配置 上传数量15 单张大小4M
    fileCount.value = 9
    maxSize.value = 1024 * 1024 * 10
  }
})

interface InternalState {
  source: string
  uploadList: UploadFile[]
  popupVisible: boolean
  popupLoading: boolean
  showContent: boolean
  isScrollToBottom: boolean
  content: string
  timer: number | undefined
  checked: boolean
  mobileSource: string
  showImagePre: boolean
  preImages: string[]
  currentUrl: string
  isShowHistory: boolean
  agreementCode: string
}

const internalState: InternalState = reactive({
  source: 'other',
  uploadList: [],
  popupVisible: false,
  popupLoading: true,
  showContent: true,
  isScrollToBottom: false,
  content: '',
  timer: undefined,
  checked: false,
  mobileSource: '0',
  showImagePre: false,
  preImages: [],
  currentUrl: '',
  agreementCode: '',
  isShowHistory: false,
})

const bizId = computed(() => piniaStore.order.waybillNumber)

// 按钮文案
const loadingText = computed(() => {
  return loadingFile.value && internalState.uploadList.length ? '上传中' : '提交'
})

const getSource = async () => {
  const { source } = (await $native?.getSource()) || {}
  internalState.source = source
}

useDidShow(() => {
  umpOtherReport('OTHER', {
    eventCode: 'other_express_receipt_v1',
  })
})

onMounted(() => {
  closeSkeleton()
  getSource()
  getUploadList()
  getAgreement()
  // window.my.disableAlertBeforeUnload()
})
const getBase64Image = (src: string) => {
  return new Promise((resolve) => {
    let img = new Image()
    img.src = src
    img.onload = function () {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, img.width, img.height)
      const ext = 'png'
      const dataURL = canvas.toDataURL('image/' + ext)
      resolve(dataURL)
    }
  })
}

const onBeforeRead = async (api?: string) => {
  if (api) {
    const data: Any = await $native?.checkApi({ api: api })
    if (+data.result === 0) {
      const message = api === 'chooseImage' ? '当前机型暂不支持上传图片' : '当前机型暂不支持上传文件'
      showToast(message)
      return false
    }
  }
  if (internalState.uploadList.length > fileCount.value && !(replaceFileItem.value && replaceFileItem.value.id)) {
    showToast(`最多可添加${fileCount.value}份文件`)
    return false
  }
  return true
}

const afterRead = (file: any, type?: string) => {
  let uploadFile: CustomerFile[] = (Array.isArray(file) ? file : [file]).map((item) => {
    const res = {
      fileName: item?.name,
      size: item?.size,
      fileType: item?.type,
      filePath: item?.path,
      uid: item.path + item.name,
      // data: item.content?.replace(/^data:.+;base64,/, ''),
    }
    if (isH5FSEnv) {
      res.base64 = item.base64 || item.data
    }
    return res
  })
  beforeLeaveCheck()
  onAfterRead(uploadFile, type)
}

const onAfterRead = (fileList: CustomerFile[] | CustomerFile, type?: string) => {
  const uploadFileList = Array.isArray(fileList) ? fileList : [fileList]
  const fileType = [...IMAGE_TYPE, ...commonFileTypes]

  let resultUploadList: UploadFile[] = []
  let angleUploadList: UploadFile[] = []
  if (
    internalState.uploadList.length + (uploadFileList.length || 0) > fileCount.value &&
    !(replaceFileItem.value && replaceFileItem.value.id)
  ) {
    showToast(`最多可添加${fileCount.value}份文件`)
    return
  }
  uploadFileList.forEach((item) => {
    const suffix = getFileSuffix(item.fileName)
    if (!fileType.includes(suffix) && suffix !== 'jpeg') {
      const fileTypeListFilter = type === 'img' ? IMAGE_TYPE : commonFileTypes
      showToastNew({
        title: `只允许上传${fileTypeListFilter.join('/')}文件`,
        icon: 'none',
      })
      return
    }
    if (isOverFilesize(item, maxSize.value)) {
      showToast(`文件大小限制为${formatFileSize(maxSize.value)}`)
      return
    }
    const file: UploadFile = {
      id: item.uid,
      suffix,
      creationDate: Date.now(),
      originalName: item.fileName,
      name: item.fileName,
      size: item.size,
      status: UploadStatusEnum['WAIT'],
      type: type || (item.fileType?.includes('image') ? 'img' : 'file'),
      path: item.filePath,
    }
    if (isH5FSEnv) {
      file.file = dataURLtoFile(`data:application/${suffix};base64,${item.base64 || item.data}`, item.fileName)
    }
    const index = (internalState.uploadList || []).findIndex((v) => {
      return replaceFileItem.value && v.id === replaceFileItem.value.id
    })
    if (replaceFileItem.value && replaceFileItem.value.id && index !== -1) {
      internalState.uploadList.splice(index, 1, file)
      replaceFileItem.value = undefined
    } else {
      resultUploadList.push(file)
    }
    angleUploadList.push(file)
  })

  internalState.uploadList = [...internalState.uploadList, ...resultUploadList]
  if (!isKYEPinchHit) {
    uploadAngle(angleUploadList, internalState.uploadList)
  }
  jugehasWaitFile()
  handleUpload()
}
const maxLen = () => {
  const count = fileCount.value - internalState.uploadList.length
  let counts = count <= 0 ? 1 : count >= fileCount.value ? fileCount.value : count
  // if (isWechat) {
  //   if (counts > wechatFileCount.value) {
  //     counts = wechatFileCount.value
  //   }
  // }
  return counts
}
const replaceFile = async (file: UploadFile) => {
  clk_express_receipt_button_v1('重新上传', 'methods')
  // 因为实时上传，重新上传要删除之前的文件
  deleteFileFunAsync([file] as unknown as fileType[])
  replaceFileItem.value = file
  // eslint-disable-next-line no-nested-ternary
  let counts = maxLen()
  const res = await chooseFiles({
    maxSize: 10,
    type: 'image',
    extension: IMAGE_TYPE,
    maxCount: counts,
  })
  afterRead(res || [], 'img')
}

const uploadFiles = async () => {
  const fileType = [...IMAGE_TYPE, ...commonFileTypes]
  clk_express_receipt_button_v1('添加文件', 'methods')
  if (isAmapApp) {
    return showToast('受小程序功能限制，无法添加文件，请通过“添加图片”上传')
  }
  if (internalState.uploadList.length >= fileCount.value && !(replaceFileItem.value && replaceFileItem.value.id)) {
    showToast(`最多可添加${fileCount.value}份文件`)
    return false
  }
  const counts = maxLen()
  let res
  // 如果是微信pc，企业微信pc，手机微信小程序
  // 手机企业微信小程序不支持
  // if (isWxPcAppletEnv || (isWxApplet && !isQw)) {
  if (isWxPcAppletEnv || isWxApplet) {
    try {
      uploadPageExpressReport()
    } catch (error) {}
    if (typeof Taro?.disableAlertBeforeUnload === 'function') {
      try {
        Taro?.disableAlertBeforeUnload()
      } catch (error) {}
    }
    const { configData, getBizCode } = await getData()
    const fileTypeList = isWxPcAppletEnv ? [...commonFileTypes, 'pdf', 'jpg', 'png', 'jpeg'] : [...commonFileTypes]
    console.log(fileTypeList.map((i) => `.${i}`).join('/'), 'fileTypeList')
    res = await pcUpload(
      {
        multiple: isWxPcAppletEnv ? true : false,
        count: counts,
        accept: fileTypeList.map((i) => `.${i}`).join(','),
      },
      {
        bizCode: isKYEPinchHit ? getBizCode(MaterialTypes.跨越代打) : getBizCode(MaterialTypes.电子回单),
        bizId: configData?.value?.bizId,
      },
      maxSize.value / (1024 * 1024),
      counts,
      isWxPcAppletEnv ? 'pc' : 'mobile',
    )
    if (res?.type === 'from-chat') {
      _chooseFiles()
      console.log('kkkkkkkkkkkkkasdfsaf')
      uploadToWXListClickReport()
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
          const type = img ? 'img' : suffix
          // 使用文件中心返回的类型
          r.type = type
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

      if (!isKYEPinchHit) {
        uploadAngle(list, internalState.uploadList)
      }
      beforeLeaveCheck()
      uploadToPhoneOrPcClickReport()
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
  clk_express_receipt_button_v1('添加图片', 'methods')
  if (internalState.uploadList.length >= fileCount.value && !(replaceFileItem.value && replaceFileItem.value.id)) {
    showToast(`最多可添加${fileCount.value}份文件`)
    return false
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

const getUploadList = async () => {
  const channel = getChannel()
  await startConfig(
    tmpCacheKey.value || bizId.value,
    channel === Channel.修改运单 ? MaterialSource.修改运单 : undefined,
  )
  const { configData, getBizCode } = await getData()
  let listParams = [
    {
      bizId: configData?.value?.bizId,
      bizCode: isKYEPinchHit ? getBizCode(MaterialTypes.跨越代打) : getBizCode(MaterialTypes.电子回单),
    },
  ]
  const { data } = await getFileByMultiBizCodeAndBizId({
    list: listParams,
  })
  if (data && data.length > 0) {
    listHash.value = data.map((x) => {
      return { id: x.id }
    })
    let resultList = data.map((item) => {
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
  }
}

const handleUpload = async () => {
  const promiseAll: Promise<Any>[] = []
  const { configData, getBizCode } = await getData()
  internalState.uploadList.forEach((item) => {
    if (item.status !== UploadStatusEnum['WAIT'] && item.status !== UploadStatusEnum['FAIL']) return
    item.status = UploadStatusEnum['UPLOADING']
    // const remark = nanoid()
    // const params = {
    //   bizCode: isKYEPinchHit ? getBizCode(MaterialTypes.跨越代打) : getBizCode(MaterialTypes.电子回单),
    //   bizId: configData?.value?.bizId,
    //   type: item.type,
    //   file: item.file,
    //   base64: item.base64,
    //   fileName: item.file.name,
    //   fileType: item.file.type,
    //   preview: false,
    //   // remark,
    // }
    const file = {
      path: item.path,
      name: item.name,
    }

    if (isH5FSEnv) {
      file.type = item.type
      file.file = item.file
    }
    const formData = {
      bizCode: isKYEPinchHit ? getBizCode(MaterialTypes.跨越代打) : getBizCode(MaterialTypes.电子回单),
      bizId: configData?.value?.bizId,
      remark: item.uid,
    }
    promiseAll.push(
      (async (item) => {
        let res = null
        try {
          const r = (await onChangeSingleFile(file, formData)) as Any
          // const returnItem = (data || []).find((v: Any) => v.lastOperate === 1) || {}
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
            // 使用文件中心返回的类型
            item.type = r.type
          }
          if (!isKYEPinchHit) {
            const sourceFileId = r?.id || r?.[0].id || ''
            await uploadMaterials('add', sourceFileId)
          }
        } catch (error) {
          item.status = UploadStatusEnum['FAIL']
          // error.error = true
          res = 'uploadFail'
        }
        return res
      })(item),
    )
  })
  return Promise.all(promiseAll)
}

const handleDelete = async (file: UploadFile) => {
  clk_express_receipt_button_v1('删除图片', 'methods')
  let resultList: UploadFile[] = internalState.uploadList
  const { id, url } = file
  // 如果是等待中或者已经失败的文件，直接删除
  if (file.status === UploadStatusEnum['WAIT'] || file.status === UploadStatusEnum['FAIL']) {
    internalState.uploadList = resultList.filter((item) => item.id !== id)
  }
  try {
    if (url?.indexOf('http') !== -1) {
      file.status = UploadStatusEnum['DELETING']
      internalState.uploadList = resultList.filter((item) => item.id !== id)
    }
    deleteFileFunAsync([file] as unknown as fileType[])
    beforeLeaveCheck()
    jugehasWaitFile()
  } catch (e) {
    console.warn(e)
  }
}

const uploadMaterials = async (type: string, fileId: string) => {
  const params: UploadMaterialsParams = {
    materialType: 10,
    waybillNumber: bizId.value,
    uploadSource: 10,
    updateFlag: true,
  }
  if (type === 'delete') {
    params.delFileIdList = [fileId]
  }
  if (type === 'add') {
    params.tempFileIdList = [fileId]
  }
  // await getUploadMaterials(params)
}

const getIcon = (file: UploadFile) => {
  if (file.type === 'img' || IMAGE_TYPE.includes(file.suffix)) {
    return file.url
  }
  return THUMBNAIL_ICONS[file.suffix] || THUMBNAIL_ICONS.default
}

const hasBack = ref(false)
const goBack = () => {
  if (hasBack.value) return
  router.back()
  hasBack.value = true
}

const isSubmitting = ref(false)
const _submitConfig = async (fromPage: LocationQueryValue) => {
  if (isSubmitting.value === true) return
  isSubmitting.value = true
  await submitConfig(fromPage)
  setTimeout(() => {
    isSubmitting.value = false
  }, 1100)
}
const handleSubmit = debounce(async () => {
  clk_express_receipt_button_v1('提交', 'methods')
  const fieldsConfig = piniaStore.schema.moduleConfigData(ModuleType['增值服务'])?.fieldsConfig || []
  const isReceiptFile = fieldsConfig.filter((item) => item.name === 'receiptFile' && item.visible).length > 0

  if (internalState.uploadList.length <= 0 && (isKYEPinchHit || isReceiptFile)) {
    showToast(isReceiptFile && !isKYEPinchHit ? '请上传电子回单资料' : '请上传回单资料')
    return
  }
  try {
    loading.value = true
    if (internalState.checked || isKYEPinchHit) {
      await handleUpload()
      const delList = listHash.value.filter((v) => {
        return !internalState.uploadList.find((m) => m.id === v.id)
      })
      await deleteFileFunAsync(delList)
      try {
        loadingFile.value = true
        await pollingCheckStatus(1, internalState.uploadList as unknown as fileType[])
        loadingFile.value = false
      } catch (error) {
        loadingFile.value = false
        loading.value = false
        return
      }
      isBackByConfirm.value = true
      await _submitConfig(fromPage as LocationQueryValue)
      // window.my.disableAlertBeforeUnload()
      showToast('保存成功')
      setTimeout(() => {
        listHash.value = cloneDeep(internalState.uploadList).map((item) => {
          return {
            id: item.id,
          }
        })
        try {
          if (typeof Taro?.disableAlertBeforeUnload === 'function') {
            try {
              Taro?.disableAlertBeforeUnload()
            } catch (error) {}
          }
        } catch (error) {}
        goBack()
      }, 800)
    } else {
      togglePopup()
      // const validateResult: localCheckResult[] = [
      //   {
      //     key: 'receipt-resource-bottom-radio',
      //     passed: false,
      //     content: '请先阅读并勾选协议',
      //     bubbleConfig: { placement: 'top-start', offset: [0, 12] },
      //   },
      // ]

      try {
        // await effectBubble(validateResult)
        // await _submitConfig(fromPage as LocationQueryValue)
      } catch (error) {
        console.error(error)
      }
    }
    loading.value = false
  } catch (error) {
    loading.value = false
    console.error(error)
  }
}, 200)

const btnText = computed(() => {
  if (internalState.checked) return '我知道了'
  return internalState.isScrollToBottom ? '同意此协议，下次不再提醒' : `请滑动阅读此协议`
})

// 确认按钮是否置灰
const confirmDisabled = computed(() => {
  return !internalState.isScrollToBottom && !internalState.checked
})

const onClosed = () => {
  internalState.isScrollToBottom = false
  internalState.popupVisible = false

  //初始化滚动条
  internalState.showContent = false
  nextTick(() => {
    internalState.showContent = true
  })
}

const handlerScroll = (e: Any) => {
  if (internalState.checked) return
  if (e.target.scrollHeight - e.target.scrollTop <= 420) {
    internalState.isScrollToBottom = true
  }
}

const getAgreement = async () => {
  // const { data: isChecked } = await getAgreementDefaultSelect({ type: 2 })
  // internalState.checked = isChecked

  internalState.popupLoading = true
  try {
    const {
      content = '',
      status,
      historyVisible,
      code,
    } = await getHelpContent({ types: AgreementType.Receipt.toString() }, false)
    internalState.popupLoading = false
    internalState.content = content
      .replace(/<spanyes[^>]*>/g, '<span>')
      .replace(/<\/spanyes[^>]*>/gi, '</span>')
      .replace(/<!--\[if !supportLists\]-->/g, '')
      .replace(/<!--\[endif\]-->/g, '')
    internalState.checked = status === 1
    internalState.isShowHistory = historyVisible
    internalState.agreementCode = code
  } catch (error) {
    clearTimeout(internalState.timer)
    internalState.timer = setTimeout(() => {
      internalState.popupVisible = false
    }, 1000)
  }
}

const onConfirm = () => {
  clk_express_receipt_button_v1('提交', 'methods')
  // 点击同意此协议 表示已阅读
  if (!internalState.checked && internalState.isScrollToBottom) {
    internalState.popupVisible = false
    closeTippy()
    // 上报已阅读
    toRecordRead()
    internalState.checked = true
    showCheckErrorTip.value = false

    return
  }

  internalState.popupVisible = false
}

const getMobileSource = () => {
  $native &&
    $native.getSource().then((res: Any) => {
      internalState.mobileSource = res.source === 'miniprogram' ? '1' : '0'
    })
}

const toRecordRead = async () => {
  try {
    const params = {
      type: AgreementType.Receipt,
    }
    agreementCheckHasRead(params)
    agreementSave({ ...params, status: 1 })
  } catch (error) {
    console.error(error)
  }
}

const togglePopup = () => {
  internalState.popupVisible = true
  // getAgreement()
}

const handleRadio = async () => {
  closeTippy()
  internalState.checked = !internalState.checked
  agreementSave({ type: AgreementType.Receipt, status: internalState.checked ? 1 : 0 })
  showCheckErrorTip.value = !internalState.checked

  if (!internalState.checked) {
    const validateResult: localCheckResult[] = [
      {
        key: 'receipt-resource-bottom-radio',
        passed: false,
        content: '请先阅读并勾选协议',
        bubbleConfig: { placement: 'top-start', offset: [0, 12] },
      },
    ]

    try {
      await effectBubble(validateResult)
    } catch (error) {
      console.error(error)
    }
  }
}

const handleRadioChange = async (value: boolean) => {
  console.log('🚀 ~ handleRadioChange ~ value:', value)
  // await agreementSave({ type: AgreementType.Receipt, status: value ? 1 : 0 })
}

//是否有未上传的文件
const hasWaitFile = computed(() => {
  return internalState.uploadList?.find(
    (file: UploadFile) =>
      file.status &&
      [UploadStatusEnum['WAIT'], UploadStatusEnum['UPLOADING'], UploadStatusEnum['FAIL']].includes(file.status),
  )
})

useUnload(() => {
  jugehasWaitFile()
  removeLast()
})

/**
 * 判断是否还有差异文件
 */
const jugehasWaitFile = () => {
  const uploadListIds = internalState.uploadList.map((item) => item.id)
  const listHashIds = listHash.value.map((item) => item.id)
  const newOldEqual = !isEqual(sortBy(uploadListIds), sortBy(listHashIds))
  // 弹窗条件：（1.存在文件未上传 2.文件数据有差异
  if (!hasWaitFile.value && !newOldEqual) {
    try {
      Taro?.disableAlertBeforeUnload()
    } catch (error) {}
  }
}

const showNeedSaveDialog = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        await showKyDialog({
          title: '温馨提示',
          zIndex: 1000,
          message: '您是否要保存当前数据？',
          cancelButtonText: '否',
          showCancelButton: true,
          confirmButtonText: '是',
        })
        await handleSubmit()
        resolve(true)
      } catch (e) {
        reject(e)
      }
    }, 100)
  })
}

const handlePreFile = (file: UploadFile) => {
  const { type, url } = file
  const urls = internalState.uploadList.filter((item) => ['img', 'image'].includes(item.type)).map((x) => x.url)
  switch (type) {
    case 'img':
      // previewImage(file)
      openPreviewImg(urls, url, 'dialog_root_receipt_resources')
      break
    case 'image':
      // previewImage(file)
      openPreviewImg(urls, url, 'dialog_root_receipt_resources')
      break
    case 'pdf':
      // previewPdf(file)
      // openURL(url)
      openPreviewFile(url, type)
      break
    default:
      // previewOtherFile(url as string)
      openPreviewFile(url as string, type)
  }
}

const previewImage = async (file: UploadFile, isTmp?: boolean) => {
  if (!Array.isArray(internalState.uploadList)) {
    return
  }
  const imagesList = internalState.uploadList.filter((item) => item?.type === 'img')
  const urlList = imagesList.map((item) => item.url)
  if (!urlList) {
    return
  }
  clk_express_receipt_v1('示例图')
  if (isTmp) {
    const url = await getBase64Image(templateUrl)
    internalState.preImages = [url] as string[]
    internalState.showImagePre = true
    internalState.currentUrl = templateUrl as string
  } else {
    internalState.preImages = urlList as string[]
    internalState.showImagePre = true
    internalState.currentUrl = file.url as string
  }
}

const previewPdf = (file: UploadFile) => {
  const { url } = file
  if (!url) {
    return showToast('该文件上传后才可预览')
  }
  router.push({
    name: 'pdf',
    query: {
      url,
    },
  })
}

const beforeLeaveCheck = () => {
  try {
    // TODO 放最外层原生方法里面
    Taro?.enableAlertBeforeUnload({
      message: '您有未保存的数据，您确定离开吗?',
      success: function (res) {
        console.log('返回拦截注册成功', res)
      },
      fail: function (err) {
        console.log('返回拦截注册失败', err)
      },
    })
  } catch (error) {
    console.log(error)
  }
}
useLoad(() => {
  hasBack.value = false
})

useUnload(() => {
  clk_express_receipt_button_v1('返回', 'methods')
})

const onOpen = () => {
  // 兼容大屏幕 例如iPad屏幕过大直接一屏展示完全 无法滑动
  const query = Taro.createSelectorQuery()
  query.select('#receipt-resources-bottom-popup .container__body').boundingClientRect()
  query.select('#waybill-terms').boundingClientRect()
  query.exec((res) => {
    if (res && res[0] && res[1]) {
      const containerHeight = res[0].height
      const textHeight = res[1].height
      console.log('containerHeight', containerHeight, 'textHeight', textHeight)
      if (containerHeight > textHeight) {
        internalState.isScrollToBottom = true
      }
    }
  })
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
.red {
  color: #ff9300;
}
</style>
