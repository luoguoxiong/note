<template>
  <div :class="[styles['upload'], 'flex', 'flex-items-center']" v-if="!isUseNewUpload">
    <div :class="[styles['order-upload__select--item'], 'divider-x']" @click="selectFiles">
      <img :class="[styles['order-upload__img']]" :src="uploadFileTabs1" alt="" />
      <div class="order-upload__text">添加文件</div>
    </div>
    <p :class="[styles['center-line']]"></p>
    <div :class="[styles['order-upload__select--item']]" @click="selectImages">
      <img :class="[styles['order-upload__img']]" :src="uploadFileTabs2" alt="" />
      <div class="order-upload__text">添加图片</div>
    </div>
  </div>
  <div :class="[styles['pickup-new-upload']]" v-else>
    <div @click="selectFiles" :class="[styles['pickup-upload-item']]">
      <SvgIcon img-url="https://ic-img.ky-express.com/netc/20260105_15713_!!1767614118598_24_24.svg+xml"></SvgIcon>
      <span :class="[styles['pickup-upload-text']]">添加文件</span>
    </div>
    <div @click="selectImages" :class="[styles['pickup-upload-item']]">
      <SvgIcon img-url="https://ic-img.ky-express.com/netc/20260105_92244_!!1767614163393_24_24.svg+xml"></SvgIcon>
      <span :class="[styles['pickup-upload-text']]">添加图片</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isWxPcApplet, isWechat, isAmapApp, isWxApplet } from '@order-global-package-order-sub/utils/device'
import { ref, onMounted } from 'vue'
import { $native } from '@order-public-sub-public/utils/index'
import { toArray, getFileSuffix, dataURLtoFile } from '@order-public-sub-public/components/business/added-service/utils'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { STATUS } from '@order-public-sub-public/constants'
import { CustomerFile } from '@order-public-sub-public/components/business/added-service/types'
import { fileType as fileContentType } from '@order-public-sub-public/apis/pickup/type'

import { uploadFileProps } from '@order-public-sub-public/components/business/pickup-information/components/upload-file/types'
import { FileError } from '@order-public-sub-public/components/business/dispatch-information/types/types'
import { chooseFiles, formatFileSize, isOverFilesize } from '@order-public-sub-public/utils/upload'
import { uuid } from '@order-public-sub-public/utils/index'
import { useGlobalPopover } from '@order-global-package-order-sub/components/business/popover-effect/hooks/useUpdate'
import { isWxPcAppletEnv, isQw, isH5FSEnv } from '@/public/utils'

import { UploadFromChatOrSystem } from '@order-public-sub-public/hooks/useInitFile'
import { disableAlertUnload } from '@order-public-sub-public/utils/upload'
import { useToast } from '@public/hooks/useToast'
import Taro from '@tarojs/taro'
import { uploadPageExpressReport, uploadToPhoneOrPcClickReport, uploadToWXListClickReport } from '../../report'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import styles from './index.module.scss'

const { showToast: showToastNew } = useToast()
const { pcUpload } = UploadFromChatOrSystem()

const { removeValidateSinge } = useGlobalPopover()
const source = ref('')
// 定义允许的文件类型
// const acceptedFileTypes = ref('.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg')
const uploadFileTabs1 = 'https://ic-img.ky-express.com/netc/20250719_62611_!!1752917982441_176_176.png'
const uploadFileTabs2 = 'https://ic-img.ky-express.com/netc/20250719_32661_!!1752917982445_176_176.png'

const props = withDefaults(defineProps<uploadFileProps>(), {
  maxSize: 1024 * 1024 * 10,
  fileType: () => ['xls', 'xlsx', 'doc', 'docx', 'pdf'],
  imgType: () => ['jpg', 'png', 'jpeg'],
  maxCount: 15,
  listLength: 0,
  maxCountImage: 15,
  isUseNewUpload: false,
})

const emit = defineEmits(['afterRed', 'afterRedPC', 'onClickAddFile', 'onClickAddImage', 'onReadFileError'])

onMounted(() => {
  getSource()
})
// 选择文件之前
const onBeforeRead = async (api?: string) => {
  if (api) {
    const data: any = await $native.checkApi({ api: api })
    if (+data.result === 0) {
      const message = api === 'chooseImage' ? '当前机型暂不支持上传图片' : '当前机型暂不支持上传文件'
      showToast(message)
      return false
    }
  }
  if (props.listLength >= props.maxCount) {
    showToast(`最多可添加${props.maxCount}份文件`)
    return false
  }
  return true
}

const beforeRead = () => {
  let result = false
  return new Promise<undefined>((reslove, reject) => {
    ;(async () => {
      result = await onBeforeRead()
      if (result) {
        reslove(undefined)
      } else {
        reject()
      }
    })()
  })
}
//获取环境
const getSource = async () => {
  const result = await $native.getSource()
  source.value = result.source
}

const onClickAddFile = () => {
  emit('onClickAddFile')
}

// 原生选择文件
const selectFiles = async () => {
  uploadPageExpressReport()
  removeValidateSinge()
  if (isAmapApp) {
    return showToast('受小程序功能限制，无法添加文件，请通过“添加图片”上传')
  }
  if (!overMaxCount()) return
  // const systemInfo = Taro.getSystemInfoSync()
  // let _version = systemInfo.version
  // const version = _version?.split('.')?.[0] as unknown as number
  // 如果是微信pc，企业微信pc，手机微信小程序
  // 手机企业微信小程序不支持
  console.log((isWxPcAppletEnv || isWxApplet) && !isQw, 'kkkkkkkkkkkkk', isWxPcAppletEnv)
  // if (isWxPcAppletEnv || (isWxApplet && !isQw)) {
  if (isWxPcAppletEnv || isWxApplet) {
    disableAlertUnload()
    const fileTypeList = isWxPcAppletEnv ? [...props.fileType, 'pdf', 'jpg', 'png', 'jpeg'] : [...props.fileType]
    console.log(fileTypeList, 'fileTypeList', fileTypeList.map((i) => `.${i}`).join(','))
    const res: any = await pcUpload(
      {
        multiple: isWxPcAppletEnv ? true : false,
        count: props.maxCount,
        accept: fileTypeList.map((i) => `.${i}`).join(','),
      },
      {
        bizCode: props.bizCode,
        bizId: props.bizId,
      },
      10,
      props.maxCount - props.listLength,
      isWxPcAppletEnv ? 'pc' : 'mobile',
    )
    if (res?.type === 'from-chat') {
      _chooseFiles()
      uploadToWXListClickReport()
    } else {
      emit('afterRedPC', res?.data || [])
      uploadToPhoneOrPcClickReport()
    }
  } else {
    _chooseFiles()
  }
}

const _chooseFiles = async () => {
  const fileType = props.fileType
  const res = await chooseFiles({ extension: fileType, maxCount: props.maxCount, type: 'file' })
  onClickAddFile()
  const readRes = onAfterRead(res, 'file')
  if (readRes) {
    emit('onReadFileError', readRes)
  }
}
//判断是否超出最大数量
const overMaxCount = () => {
  const count = props.maxCount - props.listLength
  if (count <= 0) {
    showToast(`最多可添加${props.maxCount}份文件`)
    return false
  }
  return true
}

const onClickAddImage = () => {
  emit('onClickAddImage')
}
// 高德小程序重复上传计数
// const localCounting = ref(0)

// 原生选择图片
const selectImages = async () => {
  removeValidateSinge()
  if (!overMaxCount()) return
  onClickAddImage()
  const count = props.maxCount - props.listLength
  const maxCount = props.maxCountImage
  let res: any = null
  let counts = count <= 0 ? 1 : count >= props.maxCount ? maxCount : count
  if (isWechat) {
    if (counts > 9) {
      counts = 9
    }
  }
  if (props.maxCount === 1) {
    counts = 1
  }
  try {
    res = await chooseFiles({
      maxSize: 10,
      maxCount: counts,
      type: 'image',
      extension: props.imgType,
    })
  } catch (e) {
    console.log('报错了', e)
  }

  const readRes = onAfterRead(res || [], 'img')
  if (readRes) {
    emit('onReadFileError', readRes)
  }
}
// 选择文件之后
const onAfterRead = (fileList: CustomerFile[] | CustomerFile, type?: string) => {
  console.log('获取的数据', fileList)
  const list: fileContentType[] = []
  const uploadFileList = toArray(fileList)
  const fileTypeList: string[] = [...props.imgType, ...props.fileType]
  for (let i = 0; i < uploadFileList.length; i++) {
    if (uploadFileList[i]?.fileSize === 0) {
      const request_result = '您上传的资料存在空文件，请确认后重新上传'
      showToast(request_result)
      return { file: uploadFileList[i], request_result }
    }
  }

  let fileError: FileError | undefined = undefined
  uploadFileList.forEach((v) => {
    v.fileName = v.name
    v.fileType = v.type
    const suffix = getFileSuffix(v.name)
    if (!fileTypeList.includes(suffix) && suffix !== 'jpeg') {
      const fileTypeListFilter = type === 'img' ? props.imgType : props.fileType
      const request_result = `只允许上传${fileTypeListFilter.join('/')}文件`
      fileError = { file: v, request_result }
      return showToastNew({
        title: request_result,
        icon: 'none',
      })
    }
    if (isOverFilesize(v, props.maxSize)) {
      const request_result = `文件大小限制为${formatFileSize(props.maxSize)}`
      fileError = { file: v, request_result }
      return showToastNew({
        title: request_result,
        icon: 'none',
      })
    }
    const file = {
      suffix,
      creationDate: Date.now(),
      originalName: v.name,
      size: v.size || v.fileSize,
      status: STATUS.WAIT,
      type: type || (v.fileType?.includes('image') ? 'img' : 'file'),
      path: v.path,
      id: v.id || uuid(),
    }
    if (isH5FSEnv) {
      file.file = dataURLtoFile(`data:application/${suffix};base64,${v.base64 || v.data}`, v.name)
    }
    list.push(file)
  })
  console.log('list', list)
  emit('afterRed', list)
  return fileError
}
</script>

<style lang="scss"></style>
