<template>
  <div
    :class="[
      styles['pickup-information-container'],
      'dialog_root_pickup',
      isShowDescPop || driverMessageModalShow ? 'pickup-in-c-h' : '',
    ]"
    id="order-page"
  >
    <!-- 顶部提示 -->
    <NoticeBar v-if="pickupInformationDimension.blockTips" leftIcon>{{
      pickupInformationDimension.orderTip || pickupInformationDimension.blockTips
    }}</NoticeBar>
    <!-- @scroll="handleScroll" :scroll-y="true" -->
    <div :class="[styles['pickup-information-container_body']]">
      <PickupInformation
        v-if="showForm"
        @clearForm="clearForm"
        :suggestList="suggestList"
        @telephoneChange="telephoneChange"
        @personChange="personChange"
        @mobileChange="mobileChange"
        @exitChange="exitChange"
        :telephoneValue="telephone"
        :personValue="person"
        :mobileValue="mobile"
        :extensionValue="ext"
        @onSelectSuggest="selectSuggest"
        :showItem="showItem"
        :editableItem="editableItem"
        @blur="blur"
        :keyword="currentKeyword"
      />
      <CardBlock
        :tip="cardTip"
        title="委托书"
        v-if="showItem.pickeData"
        :class="[styles['pick-up-card']]"
        id="pickupInformation_pickup"
        data-validate="pickupInformation.pickup"
        exposure-report-id="exp_express_pickup_file_v1"
      >
        <div :class="[styles['pickup-top-tip']]">若取货地址需要委托书/取货凭证，未上传将影响司机取货</div>
        <FileList
          :bizId="bizId"
          :bizCode="bizCode"
          :maxCount="maxCount"
          @afterRed="(file) => afterRed(file, pickUpUploadType.委托书)"
          @onDeleteFile="(file) => onDeleteFile(file, pickUpUploadType.委托书)"
          @afterRedPC="afterRedPC"
          :list="list"
          @onClickAddFile="onClickAddFile"
          @onClickAddImage="() => onClickAddImage(pickUpUploadType.委托书)"
          @onReadFileError="onReadFileError"
          :isUseNew="true"
        />
        <template #right-slot>
          <span :class="[styles['desc-tip']]" @click="toShowDescPop">委托书说明</span>
        </template>
      </CardBlock>
      <CardBlock
        :tip="cargoImgTip"
        title="货物照片"
        v-if="showItem.cargoImg"
        :class="[styles['pick-up-card']]"
        id="pickupInformation_cargoImg"
        data-validate="pickupInformation.cargoImg"
        exposure-report-id="exp_express_pickup_file_v1"
      >
        <div :class="[styles['pickup-top-tip']]">货物全景、货物位置等，便于取货司机快速找到货物</div>
        <FileListImg
          :maxCount="cargoImgMaxCount"
          @afterRed="(file) => afterRed(file, pickUpUploadType.货物照片)"
          @onDeleteFile="(file) => onDeleteFile(file, pickUpUploadType.货物照片)"
          @onClickAddImage="() => onClickAddImage(pickUpUploadType.货物照片)"
          :list="cargoImgList"
          :fileTypes="['jpg', 'jpeg', 'png']"
          :is-only-image="true"
          bizCode=""
          type="pickupInformation"
        />
      </CardBlock>
      <!-- 给取货司机捎句话：页内入口，弹窗“确定”仅暂存，随本页提交统一写入 -->
      <CardBlock
        v-if="showMessageToDriver"
        :class="[styles['pick-up-card'], styles['driver-message-card']]"
        title="给取货司机捎句话"
        @click="openDriverMessage"
      >
        <template #right-slot>
          <div :class="[styles['driver-message-right']]">
            <span
              :class="[styles['driver-message-text'], { [styles['driver-message-placeholder']]: !driverMessageText }]"
            >
              {{ driverMessageText || '请填写' }}
            </span>
            <SvgIcon name="right-arrow-gray" :class="[styles['driver-message-arrow']]" />
          </div>
        </template>
      </CardBlock>
      <DriverMessageModal
        v-if="showMessageToDriver"
        v-model:visible="driverMessageModalShow"
        reportPageCode="page_express_pickup_v1"
        :remark="driverMessageRemark"
        :highWords="driverMessageWords"
        @confirm="onDriverMessageConfirm"
      />
    </div>
    <div :class="[styles['pickup-up-footer']]" id="isElementShow">
      <KyButton text="提交" :loading="loading" @click="submit" :loading-text="loadingText" />
    </div>
    <PageCommon pageValidateName="pickupInformation" />
    <PickupDescPop v-model:show="isShowDescPop" v-if="isShowDescPop"></PickupDescPop>
  </div>
</template>

<script lang="ts" setup>
import styles from './index.module.scss'
import KyButton from '@order-global-package-order-sub/components/base/ky-button/index.vue'
import CardBlock from '@order-public-sub-public/components/ui/card-block/index.vue'
import DriverMessageModal, {
  DriverMessageConfirmData,
} from '@order-public-sub-public/components/business/message-to-driver/components/DriverMessageModal.vue'
import {
  formatDriverMessageText,
  isMessageToDriverVisible,
} from '@order-public-sub-public/components/business/message-to-driver/utils'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import NoticeBar from '@order-public-sub-public/components/base/ky-noticebar/noticebar.vue'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'
import PickupDescPop from '../components/pickup-desc-pop/index.vue'
import FileList from '../components/file-list/index.vue'
import FileListImg from '../components/file-list-img/index.vue'
import { ref, onMounted, computed, reactive, onUnmounted } from 'vue'
import PickupInformation from '../components/pickup-form/index.vue'
import { debounce, cloneDeep, isEqual, sortBy } from 'lodash-es'

import {
  RecommendContactType,
  STATUS,
  ModuleType,
  ModuleStyle,
  MaterialTypes,
  Channel,
  MaterialSource,
  processCacheStrategy,
} from '@order-public-sub-public/constants'
import { getFileByMultiBizCodeAndBizId, getRecommendContact } from '@order-public-sub-public/apis'
import {
  makeFileItem,
  toUnitSize,
  getFileType,
  formatDate,
} from '@order-public-sub-public/components/business/pickup-information/components/upload-file/utils'
import { fileType, RecommendType } from '@order-public-sub-public/apis/pickup/type'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { useStore } from '@order-public-sub-public/store'
import { onBeforeRouteLeave, useRouter } from '@order-public-sub-public/vue-router/index'
import { useRoute } from '@order-public-sub-public/vue-router/hooks/use-route'
import {
  ChangeKeys,
  Delivery,
  OrderPickupInfo,
  PickupInformationConfig,
  PickupInformationDimension,
} from '@order-public-sub-public/types'
import {
  FieldKey,
  pickupFormConfig,
  pickUpUploadType,
} from '@order-public-sub-public/components/business/pickup-information/types/types'
import useValidate from './../hooks/useValidate'
import useEffect from '@order-public-sub-public/validate'
import useUpload from '@order-public-sub-public/components/business/pickup-information/hooks/upload'
import { filterAllSpace, pollingCheckStatus } from '@order-public-sub-public/utils'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { resetErrorClassByDom } from '@order-public-sub-public/validate/effect/effectBubble'
import { getBatchId, getChannel } from '@order-public-sub-public/configs'
import { tmpCacheKey } from '@public/hooks/useTmpCacheKey'
import { disableAlertUnload, enableAlertUnload, onChangeSingleFile } from '@order-public-sub-public/utils/upload'
import Taro, { useUnload, useDidShow } from '@tarojs/taro'
import {
  person as senderPerson,
  province as senderProvince,
  city as senderCity,
  county as senderCounty,
  detailAddress as senderDetailAddress,
} from '@order-public-sub-public/hooks/address/sender/state'
import {
  cargoImgShowReport,
  dialogReport,
  exp_express_pickup_upflash_v1,
  optCargoImgReport,
  reportAddFile,
  reportAddImage,
  reportClickDeleteFile,
  reportClickLeaveDialog,
  reportLeaveDialog,
  reportLeavePage,
  reportReadFileFail,
  reportSubmit,
} from '@order-public-sub-public/components/business/pickup-information/report'
import { FileError } from '../../dispatch-information/types/types'
import { useInitMulitFielConfigChild } from '@order-public-sub-public/hooks/useInitFile'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { isH5FSEnv, isWechatEnv } from '@/public/utils'
// import { useGoodsTypeUploadPageScroll } from '../hooks/useScroll'

// const { handleScroll } = useGoodsTypeUploadPageScroll()

const piniaStore = useStore()

const { startConfig, removeLast, submitConfig, getData } = useInitMulitFielConfigChild()
const { validateCollection, validateField } = useValidate()

const { effectBubble, remoteCheck } = useEffect()

const router = useRouter()
const route = useRoute()
const telephone = ref('')
const person = ref('')
const mobile = ref('')
const ext = ref('')
const suggestList = ref<RecommendType[]>()
const list = ref<fileType[]>([])
const listHash = ref<fileType[]>([])
const maxCount = ref(15)
const loading = ref(false)
const loadingFile = ref(false)
const initSuccess = ref(true)
const currentKeyword = ref('')
const hasDialogTip = ref(false) //已经提醒过文件未上传弹框
const hasChangeed = ref(false)

const cargoImgList = ref<fileType[]>([])
const cargoImgMaxCount = ref(5)

const { deleteFileFunAsync } = useUpload()
const { removeValidateKeyByType, closeTippyGloabl } = globalUseValidate()

onMounted(() => {
  disableAlertUnload()
  getHistoryFile()
  initItem()
  initDriverMessageDraft()
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
//各组件的显示隐藏
const showItem = reactive<pickupFormConfig>({
  picker: true, //取货人
  pickerMobile: true, //取货手机
  pickerPhone: true, //取货电话
  pickeData: true, //取货资料
  cargoImg: true,
})
// 各组件的是否可编辑
const editableItem = reactive<pickupFormConfig>({
  picker: true, //取货人
  pickerMobile: true, //取货手机
  pickerPhone: true, //取货电话
  pickeData: true, //取货资料
  cargoImg: true, //货物照片
})

const isShowDescPop = ref(false)
const toShowDescPop = () => {
  isShowDescPop.value = true
}

// 给取货司机捎句话：页内暂存态（draft），弹窗“确定”只写 draft，提交时才随取货资料一起写 store
const driverMessageModalShow = ref(false)
// 捎句话模块显隐：与下单页同一套铸剑配置（visible 优先、回退 v）
const showMessageToDriver = computed(() => isMessageToDriverVisible())
// draft 初始化自主 store 已提交内容（页面初始化时读取一次）
const driverMessageRemark = ref('')
const driverMessageWords = ref<string[]>([])
const initDriverMessageDraft = () => {
  const formData = piniaStore.order.moduleFormData(ModuleType['给司机捎句话'])
  driverMessageRemark.value = formData?.orderRemark || ''
  driverMessageWords.value = formData?.driverHighFrequencyWords || []
}
// 区块右侧外显内容（高频词 + 手动录入，中文逗号拼接）
const driverMessageText = computed(() => {
  const wordList = piniaStore.schema.moduleDimensionData(ModuleType['给司机捎句话'])?.driverHighFrequencyWordList || []
  return formatDriverMessageText(driverMessageRemark.value, driverMessageWords.value, wordList)
})
const openDriverMessage = () => {
  driverMessageModalShow.value = true
}
// 弹窗“确定”：仅更新 draft，不写 store
const onDriverMessageConfirm = (data: DriverMessageConfirmData) => {
  driverMessageRemark.value = data.orderRemark
  driverMessageWords.value = data.driverHighFrequencyWords
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
  return piniaStore.order.waybillNumber || getBatchId()
})
//展示表单
const showForm = computed(() => {
  return showItem.pickerPhone || showItem.pickerMobile || showItem.picker
})

// 按钮文案
const loadingText = computed(() => {
  return loadingFile.value && list.value.length ? '上传中' : '保存'
})

//初始化
const initItem = () => {
  const config = piniaStore.schema.moduleConfigData(ModuleType['取货资料'])?.fieldsConfig
  if (!Array.isArray(config)) {
    return
  }
  const data = piniaStore.order.moduleFormData(ModuleType['取货资料'])
  console.log(config, 'configconfig')

  config.forEach((i) => {
    const key = i.name
    if (key in showItem) {
      showItem[key] = i.visible
      editableItem[key] = i?.editable === false ? false : true
      if (key === 'cargoImg' && i.visible) {
        cargoImgShowReport()
      }
    }
  })
  person.value = data?.person || ''
  mobile.value = data?.mobile || ''
  telephone.value = data?.telephone || ''
  ext.value = data?.extension || ''
  clearHidden()
}

const pickUpOrderFormData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['取货资料'])
})

const isFormSame = () => {
  const isSame =
    person.value === pickUpOrderFormData.value?.person &&
    mobile.value.replace(/\s+/g, '') === pickUpOrderFormData.value?.mobile &&
    telephone.value === pickUpOrderFormData.value?.telephone &&
    ext.value === pickUpOrderFormData.value?.extension
  return isSame
}

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
  const isSame = isFormSame()
  // 弹窗条件：（1.存在文件未上传 || 2.存在变更的表单数据 || 2.文件数据有差异 也需要弹框） && 首次弹
  const newOldEqual = !isEqual(sortBy([...list.value, ...cargoImgList.value]), sortBy(listHash.value))
  const needDialog = (hasWaitFile.value || !isSame || newOldEqual) && !hasDialogTip.value
  return needDialog
}

const beforeLeaveChange = () => {
  cancelValidateDebounce()
  reportLeavePage()
  const needDialog = checkNeedDialog()
  if (needDialog) {
    reportClickLeaveDialog('confirm')
    return false
  } else {
    const isFormSender = route.query?.formPage === 'sender-page'
    const cacheStrategy = isFormSender ? processCacheStrategy.强制不缓存 : null //bug622650
    remoteCheck('pickupInformation', undefined, ModuleStyle.跳转, cacheStrategy).catch((e) => {
      console.warn(e)
    })
  }
}

//文件未上传的流程逻辑
const saveDialogHandle = async () => {
  try {
    await showNeedSaveDialog()
    reportClickLeaveDialog('confirm')
  } catch (e) {
    reportClickLeaveDialog('cancel')
    router.back()
  } finally {
    hasDialogTip.value = true
  }
}

//取消远程校验的
const cancelValidateDebounce = () => {
  setTimeout(() => {
    handleValidate.cancel()
  })
}

//清空隐藏元素的值
const clearHidden = () => {
  if (!showItem.picker) {
    person.value = ''
  }
  if (!showItem.pickerMobile) {
    mobile.value = ''
  }
  if (!showItem.pickerPhone) {
    telephone.value = ''
    ext.value = ''
  }
  updateFormData()
}

//离开页面的提示弹框
const showNeedSaveDialog = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        await showKyDialog({
          zIndex: 1000,
          title: '温馨提示',
          message: '您是否要保存当前数据？',
          cancelButtonText: '否',
          showCancelButton: true,
          confirmButtonText: '是',
        })
        dialogReport('是')
        await submit()
        resolve(true)
      } catch (e) {
        dialogReport('否')
        reject(e)
      }
    }, 100)
  })
}

//选择建议
const selectSuggest = (value: RecommendType) => {
  const { contactName, contactMobile, contactPhone, extension } = value
  telephone.value = contactPhone
  mobile.value = contactMobile
  person.value = contactName
  ext.value = extension
  suggestList.value = []
  validate({ key: undefined, onlyClearEffect: true })
  beforeLeaveCheck()
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
      // bizCode: bizCode.value,
      // bizId: bizId.value,
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
  setTimeout(() => {
    Taro.pageScrollTo({
      selector: `#pickupInformation_cargoImg`,
      duration: 200,
      // offsetTop: -80,
    })
  }, 100)
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

//获取历史文件
const getHistoryFile = async () => {
  try {
    const channel = getChannel()
    await startConfig(
      tmpCacheKey.value || waybillNumber.value,
      channel === Channel.修改运单 ? MaterialSource.修改运单 : undefined,
      true,
      [MaterialTypes.取货资料, MaterialTypes.货物照片],
    )
    await setBizIdAndCode()
    const { configData, getBizCode } = await getData()
    let listParams = [
      {
        bizId: bizId.value,
        bizCode: bizCode.value,
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
const onDeleteFile = async (file: fileType, type: pickUpUploadType) => {
  setTimeout(async () => {
    try {
      deleteFileFunAsync([file])
      console.log('onDeleteFile')
      beforeLeaveCheck()
    } catch (e) {
      console.warn('onDeleteFile:', e)
    }
  }, 100)
  if (type === pickUpUploadType.委托书) {
    reportClickDeleteFile(file)
  } else {
    optCargoImgReport('del')
  }
}

//提交
const submit = debounce(async () => {
  try {
    loading.value = true
    await validate({ notCacheStrategy: true })
    await uploadFiles()
    await uploadFiles(pickUpUploadType.货物照片)
    const delList = listHash.value.filter((v) => {
      return !list.value.find((m) => m.id === v.id) && !cargoImgList.value.find((m) => m.id === v.id)
    })
    console.log(delList, 'delListdelListdelList')
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
    updateFormData()
    submitDriverMessage()
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
    if (e.key && !e.passed) {
      Taro.pageScrollTo({
        selector: `#${e.key.replace('.', '_')}`,
        duration: 200,
        offsetTop: -80,
      })
    }
  }
}, 300)

//拼接埋点数据对象
const getSubmitResultReportData = () => {
  return {
    trust_name: person.value,
    trust_tel: telephone.value + (ext.value ? '-' + ext.value : ''),
    trust_number: mobile.value,
    file_number: list.value.filter((v) => v.type !== 'img').length,
    pic_number: list.value.filter((v) => v.type === 'img').length,
  }
}

//显示不同的成功提示语
const showSuccessMessage = () => {
  let msg = '保存成功'
  const fileNum = list.value?.length + cargoImgList.value?.length
  const hasFormData = person.value || mobile.value || telephone.value || ext.value
  if (fileNum > 0) {
    msg = hasFormData ? '文件与信息保存成功' : `已成功上传${fileNum}份文件`
  }
  showToast(msg)
}
//提交表单数据
const updateFormData = () => {
  piniaStore.order.updateOrderByType({
    type: ModuleType['取货资料'],
    data: {
      mobile: filterAllSpace(mobile.value),
      telephone: telephone.value,
      person: person.value,
      extension: ext.value,
      pickup: list.value?.length,
      cargoImgUploadNum: cargoImgList.value?.length,
    },
  })
  listHash.value = cloneDeep([...list.value, ...cargoImgList.value])
}
// 捎句话 draft 仅在本页【提交】成功后写入 store（初始化/显隐清理路径不得调用，避免覆盖下单页已填内容）
const submitDriverMessage = () => {
  if (!showMessageToDriver.value) return
  piniaStore.order.updateOrderByType({
    type: ModuleType['给司机捎句话'],
    data: {
      orderRemark: driverMessageRemark.value,
      driverHighFrequencyWords: driverMessageWords.value,
    },
  })
  // 补一次捎句话远程校验（预加载运单），失败不阻塞提交结果
  remoteCheck('messageToDriver').catch((e) => {
    console.warn('messageToDriver remoteCheck fail:', e)
  })
}
//路由钩子，离开页面,判断文件未上传，弹框提示
onBeforeRouteLeave(() => {
  const isSame = isFormSame()
  const newOldEqual = !isEqual(sortBy(list.value), sortBy(listHash.value))
  const needDialog = (hasWaitFile.value || !isSame || newOldEqual) && !hasDialogTip.value
  if (needDialog) {
    saveDialogHandle()
    return false
  }
})
//清空表单
const clearForm = () => {
  mobile.value = ''
  telephone.value = ''
  ext.value = ''
  person.value = ''
  setTimeout(() => {
    handleValidate.cancel()
    removeValidateKeyByType('pickupInformation')
    closeTippyGloabl()
    beforeLeaveCheck()
  })
}
//查询建议防抖
const handleGetSuggest = debounce((keyword: string, searchType: RecommendContactType) => {
  getSuggest(keyword, searchType)
}, 300)

//校验防抖
const handleValidate = debounce((key: FieldKey) => {
  validate({ key: key }).catch((err) => {
    console.warn(err)
  })
}, 200)

// 获取建议列表
const getSuggest = async (keyword: string, searchType: RecommendContactType) => {
  currentKeyword.value = keyword
  try {
    const { person, province, city, county, detailAddress } = piniaStore.order.moduleFormData(ModuleType['寄方信息'])

    // 判断用户从寄件人信息页可能修改了寄件人名称和地址的情况下跳转过来需要获取修改的临时值
    // 跨子包（寄件人页在 order-build、取货页在 order-build-sub-pages）时 sender 临时 state 不共享，优先读 query 桥接值
    const isFormSender = route.query?.formPage === 'sender-page'
    const senderTempPerson = (route.query?.senderPerson as string) ?? senderPerson.value
    const senderTempAddress =
      (route.query?.senderAddress as string) ||
      `${senderProvince.value}${senderCity.value}${senderCounty.value}${senderDetailAddress.value}`
    const deliveryPerson = isFormSender ? senderTempPerson : person
    const deliveryAddress = isFormSender ? senderTempAddress : `${province}${city}${county}${detailAddress}`

    const { data } = await getRecommendContact({
      deliveryPerson: deliveryPerson,
      deliveryAddress: deliveryAddress,
      keyword: filterAllSpace(keyword),
      searchType,
    })
    suggestList.value = data || []
  } catch (e) {
    console.warn(e)
  }
}
//电话输入
const telephoneChange = (value: string, type?: string) => {
  telephone.value = value
  console.log('telephoneChange', value)

  if (type !== 'focus') {
    beforeLeaveCheck()
  }
}
//分机号输入
const exitChange = (value: string, type?: string) => {
  ext.value = value
  console.log('exitChange', value)
  if (type !== 'focus') {
    beforeLeaveCheck()
  }
}
//姓名输入
const personChange = (value: string, type?: string) => {
  person.value = value
  handleGetSuggest(value, RecommendContactType.联系人)
  console.log('personChange', value)
  if (type !== 'focus') {
    beforeLeaveCheck()
  }
}
//手机号输入
const mobileChange = (value: string, type?: string) => {
  mobile.value = value
  handleGetSuggest(value, RecommendContactType.联系人手机)
  console.log('mobileChange', value)
  if (type !== 'focus') {
    beforeLeaveCheck()
  }
}

//失焦
const blur = (key: FieldKey) => {
  handleValidate(key)
}
//触发校验，先是本地校验，然后是远程校验
const validate = async (params: { key?: FieldKey; onlyClearEffect?: boolean; notCacheStrategy?: boolean }) => {
  const { key, onlyClearEffect, notCacheStrategy } = params
  const formData = {
    person: person.value,
    mobile: filterAllSpace(mobile.value),
    telephone: telephone.value,
    pickup: list.value?.length,
    cargoImg: cargoImgList.value?.length,
  }
  //校验结果
  let resultList: any = []
  if (key) {
    //单个校验
    const result = await validateField(key, formData)
    resultList.push(result)
  } else {
    //全局校验
    resultList = await validateCollection(formData)
  }
  if (onlyClearEffect) {
    console.log('测试的数据', resultList)
    return resetErrorClassByDom(resultList)
  }
  //有本地校验没通过的
  const failPass = resultList.find((i) => !i.passed)
  console.log(resultList, 'resultList')
  if (failPass) {
    resultList = resultList.filter((v) => !v.passed)
    await effectBubble(resultList)
  }
  //变动的值
  const changeKey = key ? `pickupInformation.${key}` : 'pickupInformation'
  //需要远程校验的场景,为了优化只有远程校验姓名
  const needRemote = (key === 'person' || !key) && formData.person
  if (needRemote) {
    const pageType = key === 'person' || notCacheStrategy ? ('page' as ModuleStyle) : undefined
    await remoteCheck(
      changeKey as ChangeKeys,
      {
        pickupInformation: formData,
      },
      pageType,
    )
  }
}
const pickupInformationDimension = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['取货资料']) || {}
})

const onClickAddFile = () => {
  reportAddFile()
}

const onClickAddImage = (type: pickUpUploadType) => {
  if (type === pickUpUploadType.委托书) {
    reportAddImage()
  } else {
    optCargoImgReport('add')
  }
  if (isWechatEnv) {
    Taro.hideKeyboard()
  }
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
})
</script>

<style lang="scss"></style>
