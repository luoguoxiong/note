<template>
  <view class="ky-upload">
    <!-- 默认插槽自定义内容   -->
    <view v-if="$slots.default" class="ky-upload__slot">
      <slot></slot>
      <template v-if="Number(maxCount) - fileList.length">
        <button v-if="state.ENV !== 'WEB'" class="ky-upload__input" @click="chooseImage" />
        <component v-else :is="renderInput" @change="onChange"></component>
      </template>
    </view>
    <!--  上传预览列表  -->
    <slot name="preview">
      <view v-for="(item, index) in fileList" :key="item.uid" class="ky-upload__preview" :class="[listType]">
        <view v-if="listType == 'picture' && !$slots.default" class="ky-upload__preview-img">
          <view v-if="item.status != 'success'" class="ky-upload__preview__progress">
            <template v-if="item.status != 'ready'">
              <view class="fail-icon" v-if="item.status == 'error'" color="#fff" />
              <view class="loading-icon" v-else name="loading" color="#fff" />
            </template>
            <view class="ky-upload__preview__progress__msg">{{ item.message }}</view>
          </view>

          <view v-if="deletable" class="close" @click="onDelete(item, index)">
            <slot name="delete-icon"> <view class="fail-icon">关闭</view></slot>
          </view>

          <img
            v-if="item.url"
            class="ky-upload__preview-img__c"
            :mode="mode"
            :src="item.url"
            @click="fileItemClick(item)"
          />
          <img
            v-if="item.path"
            class="ky-upload__preview-img__c"
            :mode="mode"
            :src="item.path"
            @click="fileItemClick(item)"
          />
          <view v-else class="ky-upload__preview-img__file">
            <view class="ky-upload__preview-img__file__name" @click="fileItemClick(item)">
              <view class="file__name_tips">{{ item.name }}</view>
            </view>
          </view>
          <view class="tips">{{ item.name }}</view>
        </view>
        <view v-else-if="listType == 'list'" class="ky-upload__preview-list">
          <view class="ky-upload__preview-img__file__name" :class="[item.status]" @click="fileItemClick(item)">
            <view class="ky-upload__preview-img__file__link" />
            <view class="file__name_tips">{{ item.name }}</view>
            <view
              v-if="deletable"
              color="#808080"
              class="ky-upload__preview-img__file__del"
              @click.stop="onDelete(item, index)"
            ></view>
          </view>

          <view
            v-if="item.status == 'uploading'"
            class="ky-upload-progress"
            size="small"
            :percentage="item.percentage"
            stroke-color="linear-gradient(270deg, rgba(18,126,255,1) 0%,rgba(32,147,255,1) 32.815625%,rgba(13,242,204,1) 100%)"
            :show-text="false"
          >
          </view>
        </view>
      </view>
    </slot>

    <!--  picture模式上传  -->
    <view
      v-if="listType == 'picture' && !$slots.default && Number(maxCount) - fileList.length"
      class="ky-upload__upload"
      :class="[listType]"
    >
      <slot name="upload-icon">
        <img
          class="upload-icon"
          src="https://ic-img.ky-express.com/netc/20230317_26163869242_!!1679035216961_64_64.png"
        />
      </slot>
      <!--  上传按钮    -->
      <button v-if="state.ENV !== 'WEB'" class="ky-upload__input" :class="{ disabled }" @click="chooseImage" />
      <component v-else :is="renderInput" @change="onChange"></component>
    </view>
  </view>
</template>

<script lang="ts" setup name="ky-upload">
import './index.scss'
import Taro from '@tarojs/taro'
import { reactive, ref, watch } from 'vue'
import { FileItem, UploadProps } from './types'
import { getMiniFileContent, readFileContent } from './utils'
import useH5Upload from './useH5Upload'

const props = withDefaults(defineProps<UploadProps>(), {
  accept: 'image/*',
  listType: 'picture',
  mode: 'aspectFit',
  fileList: [],
  // 文件列表
  modelValue: [],
  maxCount: 1,
  data: {},
})

console.log('props>>>>>', props)

const emit = defineEmits(['change', 'oversize', 'update:modelValue', 'delete', 'click-upload', 'failure'])
const fileList = ref(props.modelValue as Array<FileItem>)
const disabled = ref(false)
const uploadQueue = ref<Promise[]>([])
const state = reactive({
  ENV: Taro.getEnv(),
  ENV_TYPE: Taro.ENV_TYPE,
})

const { renderInput } = useH5Upload(props, { disabled })

watch(
  () => props.modelValue,
  () => {
    fileList.value = props.fileList
  },
)

const chooseImage = () => {
  if (disabled.value) {
    return
  }

  if (Taro.getEnv() == 'WEB') {
    let el = document.getElementById('taroChooseImage')
    if (el) {
      el?.setAttribute('accept', props.accept)
    } else {
      const obj = document.createElement('input')
      obj.setAttribute('type', 'file')
      obj.setAttribute('id', 'taroChooseImage')
      obj.setAttribute('accept', props.accept)
      obj.setAttribute('style', 'position: fixed; top: -4000px; left: -3000px; z-index: -300;')
      document.body.appendChild(obj)
    }
  }
  if (Taro.getEnv() == 'WEAPP') {
    // chooseMedia 目前只支持微信小程序原生，其余端全部使用 chooseImage API
    Taro.chooseMedia({
      /** 最多可以选择的文件个数 */
      count: props.multiple ? Number(props.maxCount) - fileList.value.length : 1,
      /** 文件类型 */
      mediaType: props.mediaType as any,
      /** 图片和视频选择的来源 */
      sourceType: props.sourceType,
      /** 拍摄视频最长拍摄时间，单位秒。时间范围为 3s 至 30s 之间 */
      maxDuration: props.maxDuration,
      /** 仅对 mediaType 为 image 时有效，是否压缩所选文件 */
      sizeType: props.sizeType,
      /** 仅在 sourceType 为 camera 时生效，使用前置或后置摄像头 */
      camera: props.camera,
      /** 接口调用失败的回调函数 */
      fail: (res: TaroGeneral.CallbackResult) => {
        emit('failure', res)
      },
      /** 接口调用成功的回调函数 */
      success: onChangeMedia,
    })
  } else {
    Taro.chooseImage({
      // 选择数量
      count: props.multiple ? Number(props.maxCount) - fileList.value.length : 1,
      // 可以指定是原图还是压缩图，默认二者都有
      sizeType: props.sizeType,
      sourceType: props.sourceType,
      success: onChangeImage,
      fail: (res: any) => {
        emit('failure', res)
      },
    })
  }
}

const onChangeMedia = async (res: Taro.chooseMedia.SuccessCallbackResult) => {
  // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
  const { tempFiles } = res
  const _files: Taro.chooseMedia.ChooseMedia[] = filterFiles<Taro.chooseMedia.ChooseMedia>(tempFiles)
  console.log('_files>>>2', _files)

  if (props.beforeRead) {
    props.beforeRead(new Array<File>().slice.call(_files)).then(async (f: Array<File> | boolean) => {
      const _files: File[] = filterFiles(new Array<File>().slice.call(f))
      if (!_files.length) res.tempFiles = []
      await readFile(_files)
    })
  } else {
    await readFile(_files)
  }
  console.log('onChangeMedia fileList', fileList.value)
  emit('change', {
    fileList: fileList.value,
  })
}
const onChangeImage = async (res: Taro.chooseImage.SuccessCallbackResult) => {
  // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
  const { tempFiles } = res
  const _files: Taro.chooseImage.ImageFile[] = filterFiles<Taro.chooseImage.ImageFile>(tempFiles)
  console.log('_files>>>1', _files)

  if (props.beforeRead) {
    props.beforeRead(new Array<File>().slice.call(_files)).then(async (f: Array<File> | boolean) => {
      const _files: File[] = filterFiles(new Array<File>().slice.call(f))
      if (!_files.length) res.tempFiles = []
      await readFile(_files)
      console.log('_files>>> read end')
    })
  } else {
    await readFile(_files)
    console.log('_files>>> read end')
  }
  console.log('onChangeImage fileList', fileList.value)
  emit('change', {
    fileList: fileList.value,
  })
}

interface TFileType {
  size: number
  type?: string
  fileType?: string
  originalFileObj?: any
  tempFilePath?: string
  thumbTempFilePath?: string
  path?: string
}
const readFile = async <T extends TFileType>(files: T[]) => {
  console.log('readFile>>>')
  for (const file of files) {
    const index: number = files.indexOf(file)
    let fileType = file.type
    let filepath = (file.tempFilePath || file.path) as string
    const fileItem = reactive(new FileItem())
    fileItem.message = 'ready'
    if (file.fileType) {
      fileType = file.fileType
    } else {
      const imgReg = /\.(png|jpeg|jpg|webp|gif)$/i
      if (!fileType && (imgReg.test(filepath) || filepath.includes('data:image'))) {
        fileType = 'image'
      }
    }

    fileItem.path = filepath
    fileItem.name = filepath
    fileItem.status = 'ready'
    fileItem.message = '等待上传'
    fileItem.type = fileType
    if (Taro.getEnv() == 'WEB') {
      const formData = new FormData()
      for (const [key, value] of Object.entries(props?.data)) {
        formData.append(key, value)
      }
      formData.append(props.name, file.originalFileObj as Blob)
      fileItem.name = file.originalFileObj?.name
      fileItem.type = file.originalFileObj?.type
      fileItem.formData = formData
      fileItem.originalFileObj = file.originalFileObj
      // TODO content 需支持resultType字段按需返回-file, dataUrl(base64) text
      fileItem.content = file.originalFileObj
      fileItem.base64 = await readFileContent(file.originalFileObj || file, 'dataUrl')
      console.log('fileItem.base64', fileItem.base64)
    } else {
      fileItem.formData = props?.data
      const filePath = file?.tempFilePath || file?.path
      if (filePath) {
        fileItem.base64 = await getMiniFileContent(filePath)
      }
    }
    if (props.isPreview) {
      fileItem.url = fileType == 'video' ? file.thumbTempFilePath : filepath
    }
    fileList.value.push(fileItem)
    // executeUpload(fileItem, index)
  }
}

const filterFiles = <T extends TFileType>(files: T[]) => {
  const maxCount = (props.maxCount as number) * 1
  const maximize = (props.maximize as number) * 1
  const oversizes = new Array<T>()
  files = files.filter((file: T) => {
    if (file.size > maximize) {
      oversizes.push(file)
      return false
    } else {
      return true
    }
  })
  if (oversizes.length) {
    emit('oversize', oversizes)
  }
  let currentFileLength = files.length + fileList.value.length
  if (currentFileLength > maxCount) {
    files.splice(files.length - (currentFileLength - maxCount))
  }
  return files
}

const clearUploadQueue = (index = -1) => {
  if (index > -1) {
    uploadQueue.value.splice(index, 1)
  } else {
    uploadQueue.value = []
    fileList.value = []
    emit('update:fileList', fileList.value)
  }
}
// const submit = () => {
//   Promise.all(uploadQueue.value).then((res) => {
//     res.forEach((i) => i.uploadTaro(Taro.uploadFile, Taro.getEnv()))
//   })
// }

const deleted = (file: FileItem, index: number) => {
  fileList.value.splice(index, 1)
  emit('delete', {
    file,
    fileList: fileList.value,
    index,
  })
}

const onDelete = (file: FileItem, index: number) => {
  if (disabled.value) return
  clearUploadQueue(index)
  deleted(file, index)
  // funInterceptor(props.beforeDelete, {
  //   args: [file, fileList.value],
  //   done: () => deleted(file, index)
  // })
}

const fileItemClick = (fileItem: FileItem) => {
  emit('click-upload', { fileItem })
}

/* h5 onChange */
const onChange = async (event: InputEvent) => {
  if (props.disabled || disabled.value) {
    return
  }
  const $el = event.target as HTMLInputElement
  let { files } = $el
  console.log('h5 change files', files)
  if (props.beforeRead) {
    props.beforeRead(files).then(async (f: Array<File>) => await changeReadFile(f))
  } else {
    await changeReadFile(files)
  }

  console.log('h5 change fileList', fileList.value)
  emit('change', {
    fileList: fileList.value,
    event,
  })

  // if (props.clearInput) {
  //   clearInput($el)
  // }
}

const changeReadFile = async (f: any) => {
  const _files: File[] = filterFiles(new Array<File>().slice.call(f))
  await readFile(_files)
}
</script>

<style scoped lang="scss">
.ky-upload {
}
</style>
