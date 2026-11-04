<template>
  <div class="upload-fileList upload-goodstype-file-list" :class="isNoBottom && 'no-bottom'" :id="getId">
    <div class="title-box">
      <div class="content-title">
        {{ title }}
        <span class="number-box">（{{ fileList.length }}/{{ maxCount }}）</span>
      </div>
      <slot name="rightSlot"></slot>
    </div>
    <div class="file-list-box">
      <UploadFile
        :bizCode="bizCode"
        :bizId="bizId"
        :listLength="fileList.length"
        @after-red="afterRed"
        @afterRedPC="afterRedPC"
        v-if="fileList.length < maxCount"
        :fileTypes="fileTypes"
        :isOnlyImage="isOnlyImage"
        :data-validate="dataValidate"
        @clickUpload="clickUpload"
      />
      <div class="image-box" v-for="(fileItem, index) of fileList" :key="fileItem.id">
        <div class="image-content" @click="previewFile(fileItem)">
          <Image
            v-if="fileItem.type === 'img'"
            :src="getIcon(fileItem)"
            class="image-item"
            @click="previewFile(fileItem)"
          />
          <div class="image-item" v-else>
            <Image :src="getIcon(fileItem)" class="image-item-default" @click="previewFile(fileItem)" />
          </div>
          <div class="loading-box" v-if="STATUS.UPLOADING === fileItem.status">
            <span class="progress">
              <span class="progress__bar"></span>
            </span>
          </div>
          <div class="fail-box" v-if="STATUS.FAIL === fileItem.status">
            <div class="fail-tip">上传失败</div>
          </div>
        </div>
        <div class="file-title">
          <span class="name">{{ getFileName(fileItem.fileName as string).name }}</span>
          <span class="type">.{{ getFileName(fileItem.fileName as string).suffix }}</span>
        </div>
        <SvgIcon
          v-if="[STATUS.SUCCESS, STATUS.FAIL].includes(fileItem.status as STATUS)"
          name=""
          imgUrl="https://ic-img.ky-express.com/netc/20251127_52177_!!1764251747150_32_32.svg+xml"
          class="image-delete-icon"
          @click.stop="toDeleteFile(fileItem, index)"
        ></SvgIcon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UploadFile from '../uploadFile/index.vue'
import { fileType } from '@order-public-sub-public/apis/pickup/type'
import {
  makeFileItem,
  formatDate,
  getFileType,
} from '@order-public-sub-public/components/business/pickup-information/components/upload-file/utils'
import useUpload from '@order-public-sub-public/components/business/pickup-information/hooks/upload'
import { getBatchId } from '@order-public-sub-public/configs'
import { useStore } from '@order-public-sub-public/store'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { STATUS, THUMBNAIL_ICONS } from '@order-public-sub-public/constants'
import { Image } from '@tarojs/components'
import { openPreviewFile, openPreviewImg } from '@order-public-sub-public/utils/upload'
import { enableAlertUnload, onChangeSingleFile } from '@order-public-sub-public/utils/upload'
import { clickDeleteGoodsTypeReport, clickGoodsTypeUploadReport } from '../../report'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
const { deleteFileFunAsync } = useUpload()
const piniaStore = useStore()

interface IFileListType {
  title: string
  maxCount?: number
  isNoBottom?: boolean
  fileTypes: string[]
  isOnlyImage: boolean
  list: fileType[]
  bizCode: string
  dataValidate: string
}
const props = withDefaults(defineProps<IFileListType>(), {
  title: '',
  maxCount: 3,
  isNoBottom: false,
  fileTypes: () => ['xls', 'xlsx', 'doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png'],
  isOnlyImage: false,
  bizCode: '',
  dataValidate: '',
})

const emits = defineEmits(['update:list', 'previewFile', 'afterRed', 'deleteFile'])

const getId = computed(() => {
  return props.dataValidate.replace('.', '_') + '_fileList'
})

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

const clickUpload = () => {
  clickGoodsTypeUploadReport(props.title)
}

//预览文件
const previewFile = (file: fileType) => {
  console.log(file)
  clickDeleteGoodsTypeReport(props.title)
  const { type, url = '' } = file
  const urls = props.list.filter((item) => ['img', 'image'].includes(item.type)).map((x) => x.url)
  console.log(urls, url, 'lllllllllll', type)
  switch (type) {
    case 'image':
      // previewImage(file)
      openPreviewImg(urls, url, 'upload-goodstype-file-list')
      break
    case 'img':
      openPreviewImg(urls, url, 'upload-goodstype-file-list')
      break
    case 'pdf':
      emits('previewFile')
      openPreviewFile(url, type)
      break
    default:
      openPreviewFile(url, type)
  }
}

//上传文件后的钩子
const afterRed = (file: fileType[]) => {
  file = file.map((item) => makeFileItem(item))
  fileList.value.push(...file)
  uploadFiles(fileList.value).then((re) => {
    emits('afterRed')
  })
}

//上传文件后
const afterRedPC = (file) => {
  console.log('🚀 ~ afterRedPC ~ afterRedPC:', file)
  if (fileList.value.length > props.maxCount) {
    return showToast(`最多可添加${props.maxCount}份文件`)
  }
  const newFile = file?.map((item) => {
    const firstUrl = item?.visit
    if (firstUrl) {
      item.status = STATUS['SUCCESS']
      item.url = firstUrl
      item.fileName = item.name || item.originalName
      item.updateTime = formatDate(item.updationDate)
      if (item.type) {
        // 使用文件中心返回的类型
        item.type = item.type = getFileType(item)
      }
    } else {
      item.status = STATUS['FAIL']
    }
    return item
  })
  fileList.value = fileList.value.concat(newFile)
  // enableAlertUnload()
}

const uploadFiles = async (files: fileType[]) => {
  console.log(files, 'ddddddddddddd')
  const promiseAll: Promise<any>[] = []
  files.forEach((item) => {
    if (item.status !== STATUS['WAIT'] && item.status !== STATUS['FAIL']) return
    item.status = STATUS['UPLOADING']
    const file = {
      path: item.path,
      name: item.name,
    }
    const formData = {
      orderNo: waybillNumber.value,
      bizCode: props.bizCode,
      bizId: waybillNumber.value,
    }
    promiseAll.push(
      (async (item) => {
        let res = null
        try {
          const r = (await onChangeSingleFile(file, formData)) as any
          const firstUrl = r?.url
          const id = r?.id
          if (firstUrl) {
            item.status = STATUS['SUCCESS']
            item.url = firstUrl
            item.id = id
            item.fileName = r.name || r.originalName
            item.size = r.size
          } else {
            item.status = STATUS['FAIL']
            res = 'uploadFail'
          }
        } catch (error) {
          item.status = STATUS['FAIL']
          res = 'uploadFail'
        }
        return res
      })(item),
    )
  })
  return Promise.all(promiseAll)
}

const getFileName = (fileName: string) => {
  // eslint-disable-next-line no-useless-escape
  const [, name, suffix] = fileName.match(/^(.+)\.([^\.]+)$/) || []
  return {
    name,
    suffix,
  }
}

const toDeleteFile = async (fileItem: fileType, index: number) => {
  fileList.value.splice(index, 1)
  await deleteFileFunAsync([fileItem])
  emits('deleteFile')
}

const getIcon = (fileItem: fileType) => {
  const { type = '', url } = fileItem
  if (type === 'img') {
    return url
  }
  console.log(type, 'dddddddddd')
  return THUMBNAIL_ICONS[type] || THUMBNAIL_ICONS.default
}

const reloadUpdateFailFile = () => {
  uploadFiles(fileList.value)
}

defineExpose({
  reloadUpdateFailFile,
})
</script>

<style lang="scss">
@import '@order-public-sub-public/styles/index.scss';
@import './index.scss';
</style>
