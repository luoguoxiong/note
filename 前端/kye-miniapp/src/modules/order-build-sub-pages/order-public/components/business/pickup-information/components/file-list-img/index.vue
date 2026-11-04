<template>
  <div :class="[styles['file-img-list-box']]">
    <div :class="[styles['image-box']]" v-for="(fileItem, index) of fileList" :key="fileItem.id">
      <div :class="[styles['image-content']]" @click="previewFile(fileItem)">
        <image
          v-if="fileItem.type === 'img'"
          :src="getIcon(fileItem)"
          :class="[styles['image-item']]"
          @touchstart="previewFile(fileItem)"
          :show-menu-by-longpress="true"
        />
        <div :class="[styles['image-item']]" v-else>
          <image :src="getIcon(fileItem)" :class="[styles['image-item-default']]" @touchstart="previewFile(fileItem)" />
        </div>
        <div :class="[styles['common-position'], styles['loading-box']]" v-if="STATUS.UPLOADING === fileItem.status">
          <span :class="[styles['progress']]">
            <span :class="[styles['progress__bar']]"></span>
          </span>
        </div>
        <!-- <div class="common-position fail-box" v-if="STATUS.FAIL === fileItem.status" @click.stop="toReUpload">
          <SvgIcon img-url="https://ic-img.ky-express.com/netc/20260106_76314_!!1767663813955_32_32.svg+xml"></SvgIcon>
          <div class="fail-tip">重新上传</div>
        </div> -->
        <div :class="[styles['fail-box']]" v-if="STATUS.FAIL === fileItem.status">
          <div :class="[styles['fail-tip']]">上传失败</div>
        </div>
      </div>
      <!-- <div class="file-title" v-if="isShowName">
        <span class="name">{{ getFileName(fileItem.fileName as string).name }}</span>
        <span class="type">.{{ getFileName(fileItem.fileName as string).suffix }}</span>
      </div> -->
      <!-- 
        v-if="[STATUS.SUCCESS, STATUS.FAIL].includes(fileItem.status as STATUS)"
       -->
      <SvgIcon
        v-if="fileItem.status !== STATUS.UPLOADING && fileItem.status !== STATUS.DELETING"
        name=""
        imgUrl="https://ic-img.ky-express.com/netc/20251127_52177_!!1764251747150_32_32.svg+xml"
        :class="[styles['image-delete-icon']]"
        @click.stop="toDeleteFile(fileItem, index)"
      ></SvgIcon>
    </div>
    <!-- 
      @afterRedPC="afterRedPC"
     -->
    <UploadFile
      :bizCode="bizCode"
      :bizId="bizId"
      :listLength="fileList.length"
      @after-red="afterRed"
      v-if="fileList.length < maxCount"
      :fileTypes="fileTypes"
      :isOnlyImage="isOnlyImage"
      :data-validate="dataValidate"
      @onClickAddImage="onClickAddImage"
      :maxCount="maxCount"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UploadFile from '../upload-img/index.vue'
import { fileType } from '@order-public-sub-public/apis/pickup/type'
// import {
//   // makeFileItem,
//   formatDate,
//   getFileType,
// } from '@order-public-sub-public/components/business/pickup-information/components/upload-file/utils'
import useUpload from '@order-public-sub-public/components/business/pickup-information/hooks/upload'
import { getBatchId } from '@order-public-sub-public/configs'
import { useStore } from '@order-public-sub-public/store'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import { STATUS, THUMBNAIL_ICONS } from '@order-public-sub-public/constants'
import { Image } from '@tarojs/components'
// openPreviewFile
import { openPreviewImg } from '@order-public-sub-public/utils/upload'
// import { onChangeSingleFile } from '@order-public-sub-public/utils/upload'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import styles from './index.module.scss'

const { deleteFileFun } = useUpload()
const piniaStore = useStore()

interface IFileListType {
  maxCount?: number
  isNoBottom?: boolean
  fileTypes: string[]
  isOnlyImage: boolean
  list: fileType[]
  bizCode: string
  dataValidate?: string
  bizId?: string
  // isShowName?: boolean
}
const props = withDefaults(defineProps<IFileListType>(), {
  maxCount: 5,
  isNoBottom: false,
  fileTypes: () => ['xls', 'xlsx', 'doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png'],
  isOnlyImage: false,
  bizCode: '',
  dataValidate: '',
  bizId: '',
  // isShowName: false,
})

const emits = defineEmits(['update:list', 'afterRed', 'onDeleteFile', 'onClickAddImage'])

// const getId = computed(() => {
//   return props.dataValidate.replace('.', '_') + '_fileList'
// })

//获取store的运单号
const waybillNumber = computed(() => {
  return piniaStore.order.waybillNumber || getBatchId()
})

console.log(waybillNumber)

// const fileList = ref<fileType[]>([])
const fileList = computed({
  get() {
    return props.list
  },
  set(newList) {
    console.log(newList, 'ddddddddd')
    emits('update:list', newList)
  },
})

const onClickAddImage = () => {
  // clickGoodsTypeUploadReport(props.title)
  emits('onClickAddImage')
}

//预览文件
const previewFile = (file: fileType) => {
  console.log(file)
  const { type, url = '' } = file
  const urls: any = props.list.filter((item) => ['img', 'image'].includes(item.type as string))?.map((x) => x.url)
  switch (type) {
    case 'image':
      // previewImage(file)
      openPreviewImg(urls, url, styles['file-img-list-box'], true)
      break
    case 'img':
      openPreviewImg(urls, url, styles['file-img-list-box'], true)
      break
    // case 'pdf':
    //   emits('previewFile')
    //   openPreviewFile(url, type)
    //   break
    // default:
    //   openPreviewFile(url, type)
  }
}

//上传文件后的钩子
const afterRed = (file: fileType[]) => {
  // file = file?.map((item) => makeFileItem(item))
  // fileList.value.push(...file)
  // uploadFiles(fileList.value).then((re) => {
  //   emits('afterRed')
  // })
  const num = props.maxCount - props.list.length
  if (file?.length > num) {
    if (num > 0 && file.length) {
      emits('afterRed', file.slice(0, num))
    }
    return showToast(`最多可添加${props.maxCount}份文件`)
  }
  emits('afterRed', file)
}

//上传文件后
// const afterRedPC = (file) => {
//   if (fileList.value.length > props.maxCount) {
//     return showToast(`最多可添加${props.maxCount}份文件`)
//   }
//   const newFile = file?.map((item) => {
//     const firstUrl = item?.visit
//     if (firstUrl) {
//       item.status = STATUS['SUCCESS']
//       item.url = firstUrl
//       item.fileName = item.name || item.originalName
//       item.updateTime = formatDate(item.updationDate)
//       if (item.type) {
//         // 使用文件中心返回的类型
//         item.type = item.type = getFileType(item)
//       }
//     } else {
//       item.status = STATUS['FAIL']
//     }
//     return item
//   })
//   fileList.value = fileList.value.concat(newFile)
//   // enableAlertUnload()
// }

// const uploadFiles = async (files: fileType[]) => {
//   console.log(files, 'ddddddddddddd')
//   const promiseAll: Promise<any>[] = []
//   files.forEach((item) => {
//     if (item.status !== STATUS['WAIT'] && item.status !== STATUS['FAIL']) return
//     item.status = STATUS['UPLOADING']
//     const file = {
//       path: item.path,
//       name: item.name,
//     }
//     const formData = {
//       orderNo: waybillNumber.value,
//       bizCode: props.bizCode,
//       bizId: waybillNumber.value,
//     }
//     promiseAll.push(
//       (async (item) => {
//         let res = null
//         try {
//           const r = (await onChangeSingleFile(file, formData)) as any
//           const firstUrl = r?.url
//           const id = r?.id
//           if (firstUrl) {
//             item.status = STATUS['SUCCESS']
//             item.url = firstUrl
//             item.id = id
//             item.fileName = r.name || r.originalName
//             item.size = r.size
//           } else {
//             item.status = STATUS['FAIL']
//             res = 'uploadFail'
//           }
//         } catch (error) {
//           item.status = STATUS['FAIL']
//           res = 'uploadFail'
//         }
//         return res
//       })(item),
//     )
//   })
//   return Promise.all(promiseAll)
// }

// const getFileName = (fileName: string) => {
//   // eslint-disable-next-line no-useless-escape
//   const [, name, suffix] = fileName?.match(/^(.+)\.([^\.]+)$/) || []
//   return {
//     name,
//     suffix,
//   }
// }

const toDeleteFile = async (fileItem: fileType, index: number) => {
  fileList.value.splice(index, 1)
  deleteFileFun(fileItem, props.list)
  emits('onDeleteFile', fileItem)
}

const getIcon = (fileItem: fileType) => {
  const { type = '', url } = fileItem
  if (type === 'img') {
    return url
  }
  console.log(type, 'dddddddddd')
  return THUMBNAIL_ICONS[type] || THUMBNAIL_ICONS.default
}

// const reloadUpdateFailFile = () => {
//   uploadFiles(fileList.value)
// }

// defineExpose({
//   reloadUpdateFailFile,
// })
</script>

<style lang="scss"></style>
