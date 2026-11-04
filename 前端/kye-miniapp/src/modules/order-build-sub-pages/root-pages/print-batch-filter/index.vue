<template>
  <div class="search-overlay">
    <div class="search-overlay-content">
      <div class="search-overlay-content-all">
        <div class="search-overlay-content-all-concenter">
          <SelectButton v-model="roleValue" label="角色" :option="role" />
          <DateRange
            :duration="0.3"
            label="寄件日期"
            :startTime="creationStartDate"
            :endTime="creationEndDate"
            :oneYearWaybillPermission="oneYearWaybillPermission"
            @confirmDate="handleConfirmDate"
          />
          <SelectButton v-model="printStatus" label="打印状态" :option="printStatusArr" />
          <!-- 收件信息 -->
          <div>
            <div class="screen-popup__item">
              <div class="label">收件信息</div>
              <div class="screen-popup__form">
                <ImagineInput
                  :keywordType="150"
                  :maxlength="20"
                  v-model="receiverInfoData.pickupPerson"
                  placeholder="收件人姓名"
                />
                <ImagineInput
                  :isRelative="false"
                  :keywordType="170"
                  v-model="receiverInfoData.pickupMobile"
                  placeholder="收件人手机号"
                  :maxlength="11"
                  type="tel"
                />
              </div>
            </div>
            <div class="screen-popup__item addr-input">
              <div class="screen-popup__form">
                <ImagineInput
                  v-model="receiverInfoData.pickupCustomerName"
                  :keywordType="280"
                  placeholder="收件公司名称"
                  maxlength="30"
                />

                <ImagineInput
                  v-model="receiverInfoData.pickupDepartmentId.name"
                  :keywordType="30"
                  maxlength="30"
                  :placeholder="receiveDepartmentType.departmentName"
                  :isDepartmen="true"
                  @clear="
                    (item) =>
                      handleSetAssociate(item, { key: 'pickupDepartmentId', type: 'receiverInfoData', clear: true })
                  "
                  :isRelative="false"
                  @setAssociate="
                    (item) => handleSetAssociate(item, { key: 'pickupDepartmentId', type: 'receiverInfoData' })
                  "
                />
              </div>
            </div>
            <div class="screen-popup__item addr-input">
              <div class="screen-popup__form">
                <van-field
                  class="screen-overlay__input"
                  v-model="receiverInfoData.pickupCity"
                  placeholder="收件城市"
                  :border="false"
                  maxlength="30"
                  autocomplete="off"
                />
              </div>
            </div>
            <div class="screen-popup__item addr-input">
              <div class="screen-popup__form">
                <van-field
                  v-model="receiverInfoData.pickupAddress"
                  placeholder="收件地址"
                  class="screen-overlay__input"
                  :border="false"
                  maxlength="30"
                  autocomplete="off"
                />
              </div>
            </div>
          </div>
          <!-- 寄件信息 -->
          <div>
            <div class="screen-popup__item">
              <div class="label">寄件信息</div>
              <div class="screen-popup__form">
                <ImagineInput
                  :keywordType="160"
                  :maxlength="20"
                  v-model="senderInfo.deliveryPerson"
                  placeholder="寄件人姓名"
                />
                <ImagineInput
                  :keywordType="180"
                  v-model="senderInfo.deliveryMobile"
                  placeholder="寄件人手机号"
                  :maxlength="11"
                  type="tel"
                  :isRelative="false"
                />
              </div>
            </div>
            <div class="screen-popup__item addr-input">
              <div class="screen-popup__form">
                <ImagineInput
                  v-model="senderInfo.deliveryCustomerName"
                  :keywordType="290"
                  placeholder="寄件公司名称"
                  maxlength="30"
                />

                <ImagineInput
                  v-model="senderInfo.deliveryDepartmentId.name"
                  :keywordType="20"
                  maxlength="30"
                  placeholder="寄件人部门"
                  :isDepartmen="true"
                  :isRelative="false"
                  @clear="
                    (item) => handleSetAssociate(item, { key: 'deliveryDepartmentId', type: 'senderInfo', clear: true })
                  "
                  @setAssociate="
                    (item) => handleSetAssociate(item, { key: 'deliveryDepartmentId', type: 'senderInfo' })
                  "
                />
              </div>
            </div>
            <div class="screen-popup__item addr-input">
              <div class="screen-popup__form">
                <van-field
                  class="screen-overlay__input"
                  v-model="senderInfo.deliveryCity"
                  placeholder="寄件城市"
                  :border="false"
                  maxlength="30"
                  autocomplete="off"
                />
              </div>
            </div>
            <div class="screen-popup__item addr-input">
              <div class="screen-popup__form">
                <van-field
                  v-model="senderInfo.deliveryAddress"
                  placeholder="寄件地址"
                  class="screen-overlay__input"
                  :border="false"
                  maxlength="30"
                  autocomplete="off"
                />
              </div>
            </div>
          </div>
          <div class="screen-popup__item addr-input">
            <div class="screen-popup__form">
              <ImagineInput
                :keywordType="200"
                :maxlength="11"
                type="tel"
                v-model="senderInfo.orderMobile"
                placeholder="下单人手机号"
              />
              <ImagineInput
                :isRelative="false"
                :keywordType="10"
                v-model="senderInfo.orderDepartmentId.name"
                placeholder="下单人部门"
                :isDepartmen="true"
                @clear="
                  (item) => handleSetAssociate(item, { key: 'orderDepartmentId', type: 'senderInfo', clear: true })
                "
                @setAssociate="(item) => handleSetAssociate(item, { key: 'orderDepartmentId', type: 'senderInfo' })"
                :maxlength="30"
              />
            </div>
          </div>
          <div>
            <div class="label">托寄物</div>
            <div class="screen-popup__item addr-input">
              <div class="screen-popup__form">
                <ImagineInput v-model="goodsType" :isFull="true" :keywordType="110" placeholder="请输入托寄物名称" />
              </div>
            </div>
          </div>
          <div>
            <div class="label">自定义编码</div>
            <div class="screen-popup__item addr-input">
              <div class="screen-popup__form">
                <ImagineInput
                  v-model="customValue.name"
                  :isFull="true"
                  :keywordType="40"
                  placeholder="请输入"
                  maxlength="30"
                  :isCustomerCode="true"
                  @setCustomerCode="(item) => handleSetCustomerCode(item)"
                  @clear="(item) => handleSetCustomerCode(item, { clear: true })"
                  :extraImagineParams="{ clientType: '20', clientSearchType: '10' }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="search-overlay-content-footer">
        <KyButton class="reset" plain text="重置" @click="reset"></KyButton>
        <KyButton text="确定" @click="getParams"></KyButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import SelectButton from '@order-public-sub-root-pages/print-batch/components/search-overlay/components/select-button/index.vue'
import DateRange from '@order-public-sub-root-pages/print-batch/components/search-overlay/components/date-range/index.vue'
import ImagineInput from '@order-public-sub-root-pages/print-batch-filter/components/ImagineInput/index.vue'
import DBFactory from '@order-public-sub-public/utils/db/dbFactory'
import { cloneDeep } from 'lodash-es'
import { $native } from '@order-public-sub-public/utils'
import { isDesktopMiniprogram } from '@order-public-sub-public/utils/native'

import { defaultDateRange, roleArr, printStatusArr } from '@order-public-sub-root-pages/print-batch/constants'

import {
  departmentFilterNameType,
  inputAssociateItem,
  creationTime,
} from '@order-public-sub-root-pages/print-batch/hooks/type'

import { computed, ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { localStorage } from '@order-public-sub-public/utils/storage'
import Taro from '@tarojs/taro'

const initData = ref<{
  boundCustomCode: boolean
  oneYearWaybillPermission: boolean
  departmentFilterNameList: Array<{
    departmentType: number
    departmentName: string
  }>
}>({
  boundCustomCode: false,
  departmentFilterNameList: [],
  oneYearWaybillPermission: false,
})

onMounted(async () => {
  const PrintBatchFilterDB = new DBFactory('order-config-100', 'print-batch-filter')
  const printBatchFilterOptions = await PrintBatchFilterDB.getItem('print_batch_filter_options')
  if (printBatchFilterOptions) {
    initData.value.boundCustomCode = printBatchFilterOptions.boundCustomCode
    initData.value.departmentFilterNameList = printBatchFilterOptions.departmentFilterNameList
    initData.value.boundCustomCode = printBatchFilterOptions?.boundCustomCode
  }
  const printBatchFilterParams = await PrintBatchFilterDB.getItem('print_batch_filter_params')
  if (printBatchFilterParams) {
    setScreenValue(printBatchFilterParams)
  }
  const syncPrintBatchParams = await PrintBatchFilterDB.getItem('sync_print_batch_params')
  printStatus.value = syncPrintBatchParams?.printStatus || printBatchFilterParams?.printStatus || 20
})

// 设置筛选项
const setScreenValue = (obj = {}) => {
  roleValue.value = obj.waybillCustomerSource
  printStatus.value = obj.printStatus
  goodsType.value = obj.goodsType
  customValue.value = obj.customValue
  receiverInfoData.value = {
    pickupPerson: obj.pickupPerson,
    pickupMobile: obj.pickupMobile,
    pickupCustomerName: obj.pickupCustomerName,
    pickupCity: obj.pickupCity,
    pickupAddress: obj.pickupAddress,
    pickupDepartmentId: obj.pickupDepartmentId,
  }

  senderInfo.value = {
    deliveryPerson: obj.deliveryPerson,
    deliveryMobile: obj.deliveryMobile,
    deliveryCustomerName: obj.deliveryCustomerName,
    deliveryDepartmentId: obj.deliveryDepartmentId,
    deliveryAddress: obj.deliveryAddress,
    deliveryCity: obj.deliveryCity,
    orderMobile: obj.orderMobile,
    orderDepartmentId: obj.orderDepartmentId,
  }

  creationStartDate.value = obj.creationStartDate
  creationEndDate.value = obj.creationEndDate
}

// 收件人部门 类型& placeholder
const receiveDepartmentType = computed(() => {
  return (initData.value.departmentFilterNameList.find((i) => i.departmentType === 30) ||
    {}) as departmentFilterNameType
})

const role = computed(() => {
  if (!initData.value.boundCustomCode) {
    return roleArr.filter((i) => i.id !== 30)
  }
  return roleArr
})

const roleValue = ref(10)
const printStatus = ref(20)
const goodsType = ref('')
const customValue = ref<inputAssociateItem>({
  id: -1,
  name: '',
})
// 收件信息相关
const receiverInfoData = ref({
  pickupPerson: '',
  pickupMobile: '',
  pickupCustomerName: '',
  pickupCity: '',
  pickupAddress: '',
  pickupDepartmentId: {
    name: '',
    id: -1,
  },
})

// 寄件信息相关
const senderInfo = ref({
  deliveryPerson: '',
  deliveryMobile: '',
  deliveryCustomerName: '',
  deliveryDepartmentId: {
    name: '',
    id: -1,
  },
  deliveryAddress: '',
  deliveryCity: '',
  orderMobile: '',
  orderDepartmentId: {
    name: '',
    id: -1,
  },
})

// 寄件时间-开始
const initTime = dayjs().subtract(defaultDateRange, 'day')
const creationStartDate = ref(initTime.format('YYYY/MM/DD'))
const creationEndDate = ref(dayjs().format('YYYY/MM/DD'))

const getParams = async () => {
  const emitParams = {
    waybillCustomerSource: roleValue.value,
    creationStartDate: creationStartDate.value,
    creationEndDate: creationEndDate.value,
    printStatus: printStatus.value,
    goodsType: goodsType.value,
    customValue: customValue.value,

    pickupPerson: receiverInfoData.value.pickupPerson,
    pickupMobile: receiverInfoData.value.pickupMobile,
    pickupCustomerName: receiverInfoData.value.pickupCustomerName,
    pickupAddress: receiverInfoData.value.pickupAddress,
    pickupCity: receiverInfoData.value.pickupCity,
    pickupDepartmentId: receiverInfoData.value.pickupDepartmentId,

    deliveryPerson: senderInfo.value.deliveryPerson,
    deliveryMobile: senderInfo.value.deliveryMobile,
    deliveryCustomerName: senderInfo.value.deliveryCustomerName,
    deliveryDepartmentId: senderInfo.value.deliveryDepartmentId,
    deliveryAddress: senderInfo.value.deliveryAddress,
    deliveryCity: senderInfo.value.deliveryCity,
    orderMobile: senderInfo.value.orderMobile,
    orderDepartmentId: senderInfo.value.orderDepartmentId,
  }
  const PrintBatchFilterDB = new DBFactory('order-config-100', 'print-batch-filter')
  // cloneDeep fix : Failed to execute 'put' on 'IDBObjectStore': #<Object> could not be cloned.
  await PrintBatchFilterDB?.setItem(
    'print_batch_filter_params',
    cloneDeep({
      ...emitParams,
      isOperation: true,
    }),
  )
  await PrintBatchFilterDB?.setItem(
    'sync_print_batch_params',
    cloneDeep({
      printStatus: printStatus.value,
    }),
  )
  await PrintBatchFilterDB?.setItem('print_batch_filter_options', {
    boundCustomCode: false,
    departmentFilterNameList: [],
    oneYearWaybillPermission: false,
  })
  // 兼容pc小程序
  if (isDesktopMiniprogram()) {
    localStorage?.setItem('print_batch_filter_listener', JSON.stringify({ search: true }))
  }
  // resetForm()
  Taro.navigateBack()
}

const handleConfirmDate = (data: creationTime) => {
  console.log(data)
  const { startDate, endDate } = data
  creationStartDate.value = startDate
  creationEndDate.value = endDate
}

const handleSetAssociate = (item: { departmentId: number }, field: { key: string; type: string; clear: boolean }) => {
  if (field.type === 'receiverInfoData') {
    const key = field.key as 'pickupDepartmentId'
    if (field.clear) {
      receiverInfoData.value[key] = {
        id: -1,
        name: '',
      }
      return
    }
    receiverInfoData.value[key].id = item.departmentId
    return
  }
  if (field.type === 'senderInfo') {
    const key = field.key as 'orderDepartmentId' | 'deliveryDepartmentId'
    if (field.clear) {
      senderInfo.value[key] = {
        id: -1,
        name: '',
      }
      return
    }
    senderInfo.value[key].id = item.departmentId
    return
  }
}

const handleSetCustomerCode = (item: { id: number }, option: { clear: boolean }) => {
  if (option?.clear) {
    customValue.value = {
      name: '',
      id: -1,
    }
    return
  }
  customValue.value.id = item.id
}

const reset = async () => {
  resetForm()
}

const resetForm = () => {
  roleValue.value = 10
  printStatus.value = 20
  goodsType.value = ''
  customValue.value = { name: '', id: -1 }
  receiverInfoData.value = {
    pickupPerson: '',
    pickupMobile: '',
    pickupCustomerName: '',
    pickupCity: '',
    pickupAddress: '',
    pickupDepartmentId: {
      name: '',
      id: -1,
    },
  }
  receiverInfoData.value.pickupAddress = ''

  senderInfo.value = {
    deliveryPerson: '',
    deliveryMobile: '',
    deliveryCustomerName: '',
    deliveryDepartmentId: {
      name: '',
      id: -1,
    },
    deliveryAddress: '',
    deliveryCity: '',
    orderMobile: '',
    orderDepartmentId: {
      name: '',
      id: -1,
    },
  }

  creationStartDate.value = initTime.format('YYYY-MM-DD')
  creationEndDate.value = dayjs().format('YYYY-MM-DD')
}
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
@import '@order-public-sub-root-pages/print-batch/base/common.scss';
</style>
