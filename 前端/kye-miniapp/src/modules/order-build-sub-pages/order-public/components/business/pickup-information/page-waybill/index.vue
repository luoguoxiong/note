<template>
  <div :class="[styles['pickup-information-container'], 'dialog_root_pickup', isShowDescPop ? 'pickup-in-c-h' : '']">
    <div :class="[styles['pickup-information-container_body']]">
      <CardBlock
        :tip="cardTip"
        title="委托书"
        :class="[styles['pick-up-card']]"
        id="pickupInformation_pickup"
        exposure-report-id="exp_express_pickup_file_v1"
      >
        <div :class="[styles['pickup-top-tip']]">若取货地址需要委托书/取货凭证，未上传将影响司机取货</div>
        <FileList
          :bizId="bizId"
          :bizCode="bizCode"
          :maxCount="maxCount"
          @afterRed="(file) => afterRed(file, pickUpUploadType.委托书)"
          @onDeleteFile="onDeleteFile"
          :list="list"
          @onClickAddFile="onClickAddFile"
          @onClickAddImage="onClickAddImage"
          @onReadFileError="onReadFileError"
          @previewFile="previewFile"
          @afterRedPC="afterRedPC"
          :isUseNew="true"
        />

        <template #right-slot>
          <span :class="[styles['desc-tip']]" @click="toShowDescPop">委托书说明</span>
        </template>
      </CardBlock>
      <CardBlock
        :tip="cargoImgTip"
        title="货物照片"
        :class="[styles['pick-up-card']]"
        id="pickupInformation_cargoImg"
        exposure-report-id="exp_express_pickup_file_v1"
      >
        <div :class="[styles['pickup-top-tip']]">货物全景、货物位置等，便于取货司机快速找到货物</div>
        <FileListImg
          :maxCount="cargoImgMaxCount"
          @afterRed="(file) => afterRed(file, pickUpUploadType.货物照片)"
          @onDeleteFile="onDeleteFile"
          @previewFile="previewFile"
          :list="cargoImgList"
          :fileTypes="['jpg', 'jpeg', 'png']"
          :is-only-image="true"
          bizCode="bizCode"
        />
      </CardBlock>
    </div>
    <div :class="[styles['pickup-up-footer']]" id="isElementShow">
      <KyButton text="提交" :loading="loading" @click="submit" :loading-text="loadingText" />
    </div>
    <PageCommon pageValidateName="pickupInformation" />
    <PickupDescPop v-model:show="isShowDescPop" v-if="isShowDescPop"></PickupDescPop>
  </div>
</template>

<script lang="ts" setup>
import KyButton from '@order-global-package-order-sub/components/base/ky-button/index.vue'
import CardBlock from '@order-public-sub-public/components/ui/card-block/index.vue'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'
import PickupDescPop from '../components/pickup-desc-pop/index.vue'
import FileList from '../components/file-list/index.vue'
import FileListImg from '../components/file-list-img/index.vue'
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { debounce, cloneDeep, isEqual, sortBy } from 'lodash-es'
import { STATUS, MaterialTypes, MaterialSource } from '@order-public-sub-public/constants'
import { getFileByMultiBizCodeAndBizId, setOrderFileTag } from '@order-public-sub-public/apis'
import {
  formatDate,
  getFileType,
  makeFileItem,
} from '@order-public-sub-public/components/business/pickup-information/components/upload-file/utils'
import { fileType } from '@order-public-sub-public/apis/pickup/type'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { pickUpUploadType } from '@order-public-sub-public/components/business/pickup-information/types/types'
import useUpload from '@order-public-sub-public/components/business/pickup-information/hooks/upload'
import { pollingCheckStatus } from '@order-public-sub-public/utils'
import { isH5FSEnv } from '@/public/utils'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { disableAlertUnload, enableAlertUnload, onChangeSingleFile } from '@order-public-sub-public/utils/upload'
import { useUnload, useDidShow } from '@tarojs/taro'
import {
  exp_express_pickup_upflash_v1,
  reportAddFile,
  reportAddImage,
  reportClickDeleteFile,
  reportClickLeaveDialog,
  reportLeavePage,
  reportReadFileFail,
  reportSubmit,
} from '@order-public-sub-public/components/business/pickup-information/report'
import { FileError } from '../../dispatch-information/types/types'
import { useInitMulitFielConfigChild } from '@order-public-sub-public/hooks/useInitFile'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { useRoute } from '@order-public-sub-public/vue-router/hooks/use-route'
import styles from '../page/index.module.scss'

const { startConfig, removeLast, submitConfig, getData } = useInitMulitFielConfigChild()

const router = useRouter()
const route = useRoute()
const list = ref<fileType[]>([])
const listHash = ref<fileType[]>([])
const maxCount = ref(15)
const loading = ref(false)
const loadingFile = ref(false)
const initSuccess = ref(true)
const hasDialogTip = ref(false) //已经提醒过文件未上传弹框
const hasChangeed = ref(false)
const previewFileFlag = ref(false) //判断预览文件

const cargoImgList = ref<fileType[]>([])
const cargoImgMaxCount = ref(5)

const { deleteFileFunAsync } = useUpload()

onMounted(() => {
  disableAlertUnload()
  getHistoryFile()
  umpOtherReport('OTHER', {
    eventCode: 'other_express_pickup_perception_v1',
  })
})

//是否有未上传的文件
const hasWaitFile = computed(() => {
  const statusList = [STATUS.WAIT, STATUS.UPLOADING, STATUS.FAIL]
  return (
    list.value?.find((file) => file.status && statusList.includes(file.status)) ||
    cargoImgList.value?.find((file) => file.status && statusList.includes(file.status))
  )
})

const isShowDescPop = ref(false)
const toShowDescPop = () => {
  isShowDescPop.value = true
}

//提示文案
const cardTip = computed(() => {
  const fileLength = list.value?.length || 0
  const fileMsg = `<text ${fileLength && 'style="color:#FF9300"'}>${fileLength}</text>`
  return `${fileMsg}/${maxCount.value}（每个文件最大10M）`
})

const cargoImgTip = computed(() => {
  const fileLength = cargoImgList.value?.length || 0
  const fileMsg = `<text ${fileLength && 'style="color:#FF9300"'}>${fileLength}</text>`
  return `${fileMsg}/${cargoImgMaxCount.value}（每个图片最大10M）`
})

//获取store的运单号
const waybillNumber = computed(() => {
  console.log(route.query, 'route.queryroute.query')
  return route.query?.waybillNumber ?? ''
})

// 按钮文案
const loadingText = computed(() => {
  return loadingFile.value && list.value.length ? '上传中' : '保存'
})

useUnload(() => {
  beforeLeaveChange()
})
useDidShow(() => {
  umpOtherReport('EXP', {
    eventCode: 'page_express_single_entrusted_pickup_v1',
  })
})
/**
 * 检查是否需要弹框
 */
const checkNeedDialog = () => {
  // 弹窗条件：（1.存在文件未上传 || 2.存在变更的表单数据 || 2.文件数据有差异 也需要弹框） && 首次弹
  const newOldEqual = !isEqual(sortBy([...list.value, ...cargoImgList.value]), sortBy(listHash.value))
  const needDialog = (hasWaitFile.value || newOldEqual) && !hasDialogTip.value
  return needDialog
}

const beforeLeaveChange = () => {
  reportLeavePage()
  const needDialog = checkNeedDialog()
  if (needDialog) {
    reportClickLeaveDialog('confirm')
    return false
  } else {
  }
}

const uploadFiles = async (type?: pickUpUploadType) => {
  const promiseAll: Promise<any>[] = []
  const { configData, getBizCode } = await getData()
  console.log(configData, 'configData, getBizCode')
  const isCargoUpload = type === pickUpUploadType.货物照片
  let fileList = list
  if (isCargoUpload) {
    fileList = cargoImgList
  }
  await setBizIdAndCode()
  fileList.value.forEach((item) => {
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
      bizCode: isCargoUpload ? getBizCode(MaterialTypes.货物照片) : getBizCode(MaterialTypes.取货资料),
      bizId: configData?.value?.bizId,
      orderNo: waybillNumber.value,
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
            exp_express_pickup_upflash_v1(item)
            res = 'uploadFail'
          }
        } catch (error) {
          item.status = STATUS['FAIL']
          exp_express_pickup_upflash_v1(item)
          res = 'uploadFail'
        }
        return res
      })(item),
    )
  })
  return Promise.all(promiseAll)
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
//上传文件后的钩子
const afterRed = (file: fileType[], type: pickUpUploadType) => {
  file = file.map((item) => makeFileItem(item))

  if (type === pickUpUploadType.委托书) {
    list.value = file.concat(list.value)
  } else {
    cargoImgList.value = file.concat(cargoImgList.value)
  }

  uploadFiles(type)

  beforeLeaveCheck()
}

//获取历史文件
const getHistoryFile = async () => {
  try {
    await startConfig(waybillNumber.value as string, MaterialSource.查件, true, [
      MaterialTypes.取货资料,
      MaterialTypes.货物照片,
    ])
    await setBizIdAndCode()
    const { configData, getBizCode } = await getData()
    let listParams = [
      {
        bizId: configData?.value?.bizId,
        bizCode: getBizCode(MaterialTypes.取货资料),
      },
      {
        bizId: configData?.value?.bizId,
        bizCode: getBizCode(MaterialTypes.货物照片),
      },
    ]
    const { data } = await getFileByMultiBizCodeAndBizId({
      list: listParams,
    })
    let fileList: fileType[] = data
    if (!fileList) {
      return
    }
    if (!Array.isArray(fileList)) {
      return
    }
    let tempList = fileList.filter((v) => v.bizCode === getBizCode(MaterialTypes.取货资料)).map((i) => makeFileItem(i))
    list.value = tempList
    listHash.value = cloneDeep(fileList)

    cargoImgList.value = fileList
      .filter((v) => v.bizCode === getBizCode(MaterialTypes.货物照片))
      .map((i) => makeFileItem(i))
  } catch (e) {
    console.warn(e)
  } finally {
    initSuccess.value = true
  }
}
// //删除文件
const onDeleteFile = async (file: fileType) => {
  reportClickDeleteFile(file)
  setTimeout(async () => {
    try {
      deleteFileFunAsync([file])
      console.log('onDeleteFile')
      beforeLeaveCheck()
    } catch (e) {
      console.warn('onDeleteFile:', e)
    }
  }, 100)
}

//提交
const submit = debounce(async () => {
  try {
    loading.value = true
    await uploadFiles()
    await uploadFiles(pickUpUploadType.货物照片)
    const delList = listHash.value.filter((v) => {
      return !list.value.find((m) => m.id === v.id) && !cargoImgList.value.find((m) => m.id === v.id)
    })
    await deleteFileFunAsync(delList)
    try {
      loadingFile.value = true
      await pollingCheckStatus(1, [...cargoImgList.value, ...list.value])
      loadingFile.value = false
    } catch (error) {
      loadingFile.value = false
      loading.value = false
      return
    }
    await submitConfig()
    await setOrderFileTag({
      operateSource: '20',
      waybillNumber: waybillNumber.value as string,
      pickupProxyFlag: list.value?.length ? '10' : '20',
      goodsCargoPhotoFlag: cargoImgList.value?.length ? '10' : '20',
    })
    updateFormData()
    showSuccessMessage()
    disableAlertUnload()
    reportSubmit({
      ...getSubmitResultReportData(),
      request_result: '成功',
      failure_reason: '',
    })
    setTimeout(() => {
      loading.value = false
      router.back()
    }, 300)
  } catch (e) {
    reportSubmit({
      ...getSubmitResultReportData(),
      request_result: '失败',
      failure_reason: JSON.stringify(e),
    })
    console.log('测试', e)
    loading.value = false
  }
}, 300)

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
        item.type = item.type = getFileType(item)
      }
    } else {
      item.status = STATUS['FAIL']
      exp_express_pickup_upflash_v1(item)
    }
    return item
  })
  enableAlertUnload()
}

//拼接埋点数据对象
const getSubmitResultReportData = () => {
  return {
    file_number: list.value.filter((v) => v.type !== 'img').length,
    pic_number: list.value.filter((v) => v.type === 'img').length,
  }
}

//显示不同的成功提示语
const showSuccessMessage = () => {
  let msg = '保存成功'
  const fileNum = list.value?.length + cargoImgList.value?.length
  if (fileNum > 0) {
    msg = `已成功上传${fileNum}份文件`
  }
  showToast(msg)
}
//提交表单数据
const updateFormData = () => {
  listHash.value = cloneDeep([...list.value, ...cargoImgList.value])
}

const onClickAddFile = () => {
  reportAddFile()
}

const onClickAddImage = () => {
  reportAddImage()
}

const onReadFileError = (params: FileError) => {
  reportReadFileFail(params)
}

/**
 * 抽取获取bizid bizcode的逻辑
 * 因为要传入公共组件用于pc上传
 */
const bizId = ref('')
const bizCode = ref('')
const setBizIdAndCode = async () => {
  const { configData, getBizCode } = await getData()
  bizId.value = configData?.value?.bizId
  bizCode.value = getBizCode(MaterialTypes.取货资料)
}

onUnmounted(() => {
  removeLast()
  disableAlertUnload()
  previewFileFlag.value = false
})

const previewFile = () => {
  previewFileFlag.value = true
}
</script>

<style lang="scss"></style>
