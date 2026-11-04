<template>
  <template v-if="initSuccess">
    <div :class="[styles['ky-receipt-container-page'], 'ky-receipt-container-page-org', 'dialog_root_dispatch']">
      <div :class="[styles['ky-receipt-container']]">
        <CardBlock :tip="cardTip" title="回单资料" v-if="showItem.deliveryData">
          <FileList
            :bizId="bizId"
            :bizCode="bizCode"
            @afterRed="afterRed"
            @afterRedPC="afterRedPC"
            @onDeleteFile="onDeleteFile"
            :list="list"
            :maxCount="maxCount"
            :type="'dispatchInformation'"
            @onClickAddFile="onClickAddFile"
            @onClickAddImage="onClickAddImage"
            @previewFile="previewFile"
          />
        </CardBlock>
        <KyEmpty
          :class="styles['ky-receipt-empty']"
          v-if="fileLoaded && !list.length"
          :type="EmptyTypeEnum.DATA"
          description="当前运单已选择跨越代打回单服务，请上传回单资料！"
        ></KyEmpty>
      </div>
      <div :class="[styles['footer']]" id="isElementShow">
        <KyButton text="提交" :loading="loading" @click="submit" :loading-text="loadingText" />
      </div>
      <PageCommon />
    </div>
  </template>
  <template v-else>
    <Skeleton />
  </template>
</template>

<script lang="ts" setup>
import FileList from '@order-public-sub-public/components/business/pickup-information/components/file-list/index.vue'
import KyButton from '@order-global-package-order-sub/components/base/ky-button/index.vue'
import CardBlock from '@order-public-sub-public/components/ui/card-block/index.vue'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import { getFileByMultiBizCodeAndBizId } from '@order-public-sub-public/apis'
import { cloneDeep, isEqual, sortBy } from 'lodash-es'
import { tmpCacheKey } from '@public/hooks/useTmpCacheKey'
import { computed, onMounted, reactive, ref, onUnmounted } from 'vue'
import { STATUS, MaterialSource, Channel, MaterialTypes, EmptyTypeEnum } from '@order-public-sub-public/constants'
import { pollingCheckStatus } from '@order-public-sub-public/utils/index'
import {
  makeFileItem,
  getFileType,
  formatDate,
} from '@order-public-sub-public/components/business/pickup-information/components/upload-file/utils'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { useRouter, useRoute } from '@order-public-sub-public/vue-router/index'
import useUpload from '@order-public-sub-public/components/business/pickup-information/hooks/upload'
import {
  FileError,
  dispatchFormConfig,
} from '@order-public-sub-public/components/business/dispatch-information/types/types'
import { initSuccess } from '../hooks/state'
import { useInitMulitFielConfigChild } from '@order-public-sub-public/hooks/useInitFile'
import { disableAlertUnload, enableAlertUnload, onChangeSingleFile } from '@order-public-sub-public/utils/upload'
import { isH5FSEnv } from '@/public/utils'
import { showTipPopReport, receiptButtonReport, receiptPageExposureReport, receiptPageBack } from '../hooks/report'
import { fileType } from '@order-public-sub-public/apis/pickup/type'
import styles from './index.module.scss'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'
import Taro, { useUnload } from '@tarojs/taro'
import { useToast } from '@public/hooks/useToast'
const { showToast: showToast2 } = useToast()

const { startConfig, removeLast, submitConfig, getData } = useInitMulitFielConfigChild()
const { deleteFileFunAsync } = useUpload()

const router = useRouter()
const route = useRoute()

const bizCode = ref('WEB_ORDER_RECEIPT_HELP_MATERIALS_TEMPORARY')
// bizId 取路由上的 waybillNumber
const bizId = ref('')

const list = ref<fileType[]>([])
const listHash = ref<fileType[]>([])
const maxCount = ref(9)
const loading = ref(false)
const loadingFile = ref(false)

const hasDialogTip = ref(false) //已经提醒过文件未上传弹框
const fileLoaded = ref(false) //文件数据是否加载完成，加载完成前不展示空态
const hasChangeed = ref(false)
const previewFileFlag = ref(false) //判断预览文件
const cardTip = computed(() => {
  const fileLength = list.value?.length || 0
  return `<span style="color: rgb(255,147,0)">${fileLength}</span>/${maxCount.value}（每个文件最大10M）`
})

//各组件的显示隐藏
const showItem = reactive<dispatchFormConfig>({
  deliveryData: true, //派货资料
})

onMounted(() => {
  // 清理可能残留的返回拦截，避免第二次进入页面未做任何改动时误弹离开提示
  try {
    Taro.disableAlertBeforeUnload()
  } catch (e) {
    console.warn('disableAlertBeforeUnload', e)
  }
  getHistoryFile()
  receiptPageExposureReport()
  initSuccess.value = true
})

//未上传的文件
const hasWaitFile = computed(() => {
  return list.value?.find((file) => file.status && [STATUS.WAIT, STATUS.UPLOADING, STATUS.FAIL].includes(file.status))
})

// 按钮文案
const loadingText = computed(() => {
  return loadingFile.value && list.value.length ? '上传中' : '提交'
})

const uploadFiles = async () => {
  const promiseAll: Promise<any>[] = []
  list.value.forEach((item) => {
    if (item.status !== STATUS['WAIT'] && item.status !== STATUS['FAIL']) return
    item.status = STATUS['UPLOADING']
    const file = {
      path: item.path,
      name: item.name,
    }
    if (isH5FSEnv) {
      file.type = item.type
      file.file = item.file
    }
    const formData = {
      bizId: bizId.value,
      bizCode: bizCode.value,
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

//获取历史文件
const getHistoryFile = async () => {
  try {
    await startConfig(
      tmpCacheKey.value || bizId.value || (route.query?.waybillNumber as string),
      MaterialSource.查件,
      true,
      [MaterialTypes.跨越代打],
    )
    const { configData, getBizCode } = await getData()
    console.log(configData, getBizCode, 'getBizCode')
    bizId.value = configData.value?.bizId || ''
    bizCode.value = getBizCode(MaterialTypes.跨越代打) || ''
    let listParams = [
      {
        bizId: configData.value?.bizId || '',
        bizCode: getBizCode(MaterialTypes.跨越代打),
      },
    ]
    const { data } = await getFileByMultiBizCodeAndBizId({
      list: listParams,
    })
    let fileList = data
    if (!Array.isArray(fileList)) {
      return
    }
    fileList = fileList.map((i) => makeFileItem(i))
    list.value = fileList
    listHash.value = cloneDeep(fileList)
  } catch (e) {
    console.warn(e)
  } finally {
    fileLoaded.value = true
  }
}
//提交
const submit = async () => {
  // 没有已上传的文件时，拦截提交并提示
  receiptButtonReport('提交')
  if (!list.value.length) {
    showToast2({
      title: '当前运单已选择跨越代打回单服务，请上传回单资料！',
      icon: 'none',
      toastId: 'page-route-toast-id',
    })
    return
  }
  loading.value = true
  try {
    await uploadFiles()
    const delList = listHash.value.filter((v) => {
      return !list.value.find((m) => m.id === v.id)
    })
    await deleteFileFunAsync(delList)
    try {
      loadingFile.value = true
      await pollingCheckStatus(1, list.value)
      loadingFile.value = false
    } catch (error) {
      loadingFile.value = false
      loading.value = false
      return
    }
    await submitConfig()
    listHash.value = cloneDeep(list.value)
    showSuccessMessage()
    disableAlertUnload()
    setTimeout(() => {
      loading.value = false
      router.back()
    }, 300)
  } catch (e) {
    console.warn('submit', e)
    loading.value = false
  }
}
//显示不同的成功提示语
const showSuccessMessage = () => {
  let msg = '保存成功'
  // const fileNum = list.value?.length
  // if (fileNum > 0) {
  //   msg = `已成功上传${fileNum}份文件`
  // }
  showToast(msg)
}

// //删除前校验：不能删除最后一个文件
// const deleteValidate = async () => {
//   if (list.value.length <= 1) {
//     showToast('当前运单已选择跨越代打服务，不允许删除全部文件')
//     return false
//   }
//   return true
// }

//删除文件
const onDeleteFile = async (file: fileType) => {
  receiptButtonReport('删除' + (file.type === 'img' ? '图片' : '文件'))
  console.log('kkkkkkkkkasdfsaf')
  setTimeout(async () => {
    try {
      deleteFileFunAsync([file])
      beforeLeaveCheck()
    } catch (e) {
      console.warn('onDeleteFile:', e)
    }
  }, 100)
}
//上传文件后的钩子
const afterRed = (file: fileType[]) => {
  file = file.map((item) => makeFileItem(item))
  list.value = file.concat(list.value)

  uploadFiles()
  beforeLeaveCheck()
}

const afterRedPC = (_list) => {
  list.value = _list?.map((item) => {
    const firstUrl = item?.visit
    if (firstUrl) {
      item.status = STATUS['SUCCESS']
      item.url = firstUrl
      item.id = item.id
      item.fileName = item.name || item.originalName
      item.size = item.size
      item.updateTime = formatDate(item.updationDate)
      if (item.type) {
        // 使用文件中心返回的类型
        item.type = getFileType(item)
      }
    } else {
      item.status = STATUS['FAIL']
    }
    return item
  })
  enableAlertUnload()
}

const onClickAddFile = () => {
  receiptButtonReport('上传文件')
}

const onClickAddImage = () => {
  receiptButtonReport('上传图片')
}

onUnmounted(() => {
  // 优先清理返回拦截，避免后续逻辑异常导致拦截残留到下次进入
  disableAlertUnload()
  removeLast()
  hasChangeed.value = false
  previewFileFlag.value = false
})

/**
 * 检查是否需要弹框
 */
const checkNeedDialog = () => {
  // 弹窗条件：（1.存在文件未上传 || 2.文件数据有差异）&& 首次弹
  const newOldEqual = !isEqual(sortBy(list.value), sortBy(listHash.value))
  const needDialog = (hasWaitFile.value || newOldEqual) && !hasDialogTip.value
  return needDialog
}

const beforeLeaveCheck = () => {
  if (previewFileFlag.value) {
    // pdf预览需要要拦截提示语
    previewFileFlag.value = false
    return
  }

  const needDialog = checkNeedDialog()
  if (needDialog) {
    // 如果需要注册弹框，只需注册一次
    showTipPopReport('跨越代打')
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
const previewFile = () => {
  previewFileFlag.value = true
}

useUnload(() => {
  receiptPageBack()
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
