<template>
  <div :class="[styles['pickup-cargo-uploader']]" :id="dataValidate.replace('.', '_')">
    <div :class="[styles['pickup-cargo-uploader-box']]" @click="toShowPop">
      <div :class="[styles['pickup-cargo-svg']]">
        <SvgIcon
          name=""
          imgUrl="https://ic-img.ky-express.com/netc/20251127_38925_!!1764251693271_48_48.svg+xml"
          :class="[styles['gray-add']]"
        ></SvgIcon>
        <span :class="[styles['pickup-cargo-text']]">添加图片</span>
      </div>
    </div>
    <!-- <BottomPopup
      v-model:show="showSelectPop"
      :showFooter="false"
      :showTitle="false"
      @on-close="showSelectPop = false"
      noPadding
    >
      <div class="upload-select-box">
        <div class="upload-btn" @click="selectFiles" v-if="!isOnlyImage">上传文件</div>
        <div class="upload-btn" @click="selectImages(['camera'])">拍摄</div>
        <div class="upload-btn" @click="selectImages(['album'])">从手机相册中选择</div>
        <div class="line"></div>
        <div class="upload-btn" @click="showSelectPop = false">取消</div>
      </div>
    </BottomPopup> -->
  </div>
</template>

<script setup lang="ts">
import { fileType as fileContentType } from '@order-public-sub-public/apis/pickup/type'
import { FileError } from '@order-public-sub-public/components/business/dispatch-information/types/types'
import { toArray, getFileSuffix, dataURLtoFile } from '@order-public-sub-public/components/business/added-service/utils'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import { STATUS } from '@order-public-sub-public/constants'
import { CustomerFile } from '@order-public-sub-public/components/business/added-service/types'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { isWechat } from '@order-global-package-order-sub/utils/device'
// import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
// import { ref } from 'vue'
// import { isWxPcAppletEnv } from '@/public/utils'
// import { UploadFromChatOrSystem } from '@order-public-sub-public/hooks/useInitFile'
import { uuid } from '@order-public-sub-public/utils/index'
import { chooseFiles, formatFileSize, isOverFilesize } from '@order-public-sub-public/utils/upload'
import { useGlobalPopover } from '@order-global-package-order-sub/components/business/popover-effect/hooks/useUpdate'

import { isH5FSEnv } from '@/public/utils'
import styles from './index.module.scss'

const { removeValidateSinge } = useGlobalPopover()

interface IUploaderFileProps {
  maxSize?: number
  maxCount?: number
  fileTypes?: string[] //文件类型
  listLength: number
  isOnlyImage: boolean
  dataValidate: string
  bizCode: string
  bizId: string
}

type UploadSourceType = 'album' | 'camera'
// interface UploadSourceType {}

// 原生的时候需要选择上传方式
// const showSelectPop = ref(false)

// const { pcUpload } = UploadFromChatOrSystem('goodsTypeFiles')

const emit = defineEmits(['onReadFileError', 'afterRed', 'afterRedPC', 'onClickAddImage'])

const props = withDefaults(defineProps<IUploaderFileProps>(), {
  maxSize: 1024 * 1024 * 10,
  maxCount: 5,
  fileTypes: () => ['jpg', 'jpeg', 'png'],
  fileList: () => [],
  listLength: 0,
  isOnlyImage: true,
  bizCode: '',
  bizId: '',
})

const toShowPop = () => {
  // 如果只是上传图片
  if (props.isOnlyImage) {
    selectImages()
  } else {
    // showSelectPop.value = true
  }
  onClickAddImage()
  removeValidateSinge()
}

const onClickAddImage = () => {
  emit('onClickAddImage')
}

// 原生选择文件
// const selectFiles = async () => {
//   if (isAmapApp) {
//     return showToast('受小程序功能限制，无法添加文件，请通过“添加图片”上传')
//   }
//   if (!overMaxCount()) return
//   showSelectPop.value = false
//   if (isWxPcAppletEnv) {
//     // disableAlertUnload()
//     // const res: any = await pcUpload(
//     //   {
//     //     multiple: true,
//     //     count: props.maxCount,
//     //     accept: [...props.fileTypes, 'pdf', 'jpg', 'png', 'jpeg'].map((i) => `.${i}`).join(','),
//     //   },
//     //   {
//     //     bizCode: props.bizCode,
//     //     bizId: props.bizId,
//     //   },
//     //   10,
//     //   props.maxCount - props.listLength,
//     // )
//     // if (res?.type === 'from-chat') {
//     //   _chooseFiles()
//     // } else {
//     //   emit('afterRedPC', res?.data || [])
//     // }
//   } else {
//     _chooseFiles()
//   }
// }

// const _chooseFiles = async () => {
//   const fileType = props.fileTypes
//   const res = await chooseFiles({ extension: fileType, maxCount: props.maxCount, type: 'file' })
//   const readRes = onAfterRead(res, 'file')
//   if (readRes) {
//     emit('onReadFileError', readRes)
//   }
// }

//判断是否超出最大数量
const overMaxCount = () => {
  const count = props.maxCount - props.listLength
  if (count === 0) {
    showToast(`最多可添加${props.maxCount}份文件`)
    return false
  }
  return true
}

// 选择文件之后
const onAfterRead = (fileList: CustomerFile[] | CustomerFile, type?: string) => {
  console.log('获取的数据', fileList)
  const list: fileContentType[] = []
  const uploadFileList = toArray(fileList)
  const fileTypeList: string[] = props.fileTypes
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
      const request_result = `只允许上传${fileTypeList.join('/')}文件`
      fileError = { file: v, request_result }
      return showToast(request_result)
    }
    if (isOverFilesize(v, props.maxSize)) {
      const request_result = `文件不能超过${formatFileSize(props.maxSize, 0)}，请重新上传`
      fileError = { file: v, request_result }
      return showToast(request_result)
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

// 原生选择图片
const selectImages = async (sourceType: UploadSourceType[] = ['album', 'camera']) => {
  if (!overMaxCount()) return
  // showSelectPop.value = false
  const count = props.maxCount - props.listLength
  const maxCount = props.maxCount
  let res: any = null
  if (props.maxCount === 1) {
    res = await chooseFiles({
      maxSize: props.maxSize,
      maxCount: props.maxCount,
      type: 'image',
      sourceType,
      extension: props.fileTypes,
    })
  } else {
    // eslint-disable-next-line no-nested-ternary
    let counts = count <= 0 ? 1 : count >= props.maxCount ? maxCount : count
    if (isWechat) {
      if (counts > props.maxCount) {
        counts = props.maxCount
      }
    }
    console.log(counts, 'counts')
    try {
      res = await chooseFiles({
        maxSize: props.maxSize,
        maxCount: counts,
        type: 'image',
        sourceType,
        extension: props.fileTypes,
      })
    } catch (e) {
      console.log('报错了', e)
    }
  }
  const readRes = onAfterRead(res || [], 'img')
  if (readRes) {
    console.error(222)
    emit('onReadFileError', res)
  }
}
</script>

<style lang="scss"></style>
