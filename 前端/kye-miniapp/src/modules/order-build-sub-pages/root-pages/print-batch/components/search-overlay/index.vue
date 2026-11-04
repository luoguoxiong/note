<template>
  <div class="search-overlay" v-show="showOverlay">
    <div class="search-overlay-content">
      <div class="search-overlay-content-all">
        <div class="search-overlay-content-all-concenter">
          <SelectButton v-model="roleValue" label="角色" :option="role" />
          <DateRange
            label="寄件日期"
            :startTime="creationStartDate"
            :endTime="creationEndDate"
            :oneYearWaybillPermission="oneYearWaybillPermission"
            @confirmDate="handleConfirmDate"
          />
          <SelectButton v-model="printStatus" label="打印状态" :option="printStatusArr" />
          <!-- 收件信息 -->
          <ReceiverInfo
            v-model="receiverInfoData"
            :receiveDepartmentType="receiveDepartmentType"
            :showOverlay="showOverlay"
          />
          <!-- 寄件信息 -->
          <SenderInfo
            v-model="senderInfo"
            :senderDepartmentType="senderDepartmentType"
            :orderDepartmentType="orderDepartmentType"
            :showOverlay="showOverlay"
          />
          <div>
            <div class="label">托寄物</div>
            <div class="row">
              <van-field
                v-model="goodsType"
                placeholder="请输入"
                class="screen-overlay__input"
                clearable
                :border="false"
                maxlength="30"
                autocomplete="off"
              />
            </div>
          </div>
          <div>
            <div class="label">自定义编码</div>
            <div class="row">
              <InputAssociate
                v-model="customValue"
                placeholder="请输入"
                clearable
                :border="false"
                maxlength="30"
                :option="customList"
                :associateFn="getWaybillLinkFn"
                placement="placement-top"
                @itemSelect="handleItemSelectCustom"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="search-overlay-content-footer">
        <KyButton class="reset" plain text="重置" @click="reset"></KyButton>
        <KyButton text="确定" @click="getParams"></KyButton>
      </div>
    </div>
    <div class="search-overlay-gray" @click="closeOverlay"></div>
  </div>
</template>

<script setup lang="ts">
import { showOverlay } from '@order-public-sub-root-pages/print-batch/hooks/useData'

import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import SelectButton from '@order-public-sub-root-pages/print-batch/components/search-overlay/components/select-button/index.vue'
import ReceiverInfo from '@order-public-sub-root-pages/print-batch/components/search-overlay/components/receiver-info/index.vue'
import SenderInfo from '@order-public-sub-root-pages/print-batch/components/search-overlay/components/sender-info/index.vue'
import InputAssociate from '@order-public-sub-root-pages/print-batch/components/search-overlay/components/input-associate/index.vue'
import DateRange from '@order-public-sub-root-pages/print-batch/components/search-overlay/components/date-range/index.vue'

import { defaultDateRange, roleArr, printStatusArr } from '@order-public-sub-root-pages/print-batch/constants'

import {
  departmentFilterNameType,
  inputAssociateItem,
  creationTime,
  screenDataType,
} from '@order-public-sub-root-pages/print-batch/hooks/type'

import { computed, ref, watch } from 'vue'

import { getWaybillLink } from '@order-public-sub-public/apis/print'
import dayjs from 'dayjs'

interface searchOverlayProps {
  departmentFilterNameList: departmentFilterNameType[]
  oneYearWaybillPermission: boolean
  boundCustomCode: boolean
  screenData: screenDataType
}

const props = defineProps<searchOverlayProps>()

// 下单人部门 类型& placeholder
const orderDepartmentType = computed(() => {
  return (props.departmentFilterNameList.find((i) => i.departmentType === 10) || {}) as departmentFilterNameType
})

// 下单人部门 类型& placeholder
const senderDepartmentType = computed(() => {
  return (props.departmentFilterNameList.find((i) => i.departmentType === 20) || {}) as departmentFilterNameType
})

// 收件人部门 类型& placeholder
const receiveDepartmentType = computed(() => {
  return (props.departmentFilterNameList.find((i) => i.departmentType === 30) || {}) as departmentFilterNameType
})

console.log(orderDepartmentType.value, 'orderdepartmentType')
console.log(senderDepartmentType.value, 'senderDepartmentType')
console.log(receiveDepartmentType.value, 'receiveDepartmentType')

const role = computed(() => {
  if (!props.boundCustomCode) {
    return roleArr.filter((i) => i.id !== 30)
  }
  return roleArr
})

const roleValue = ref(50)
const printStatus = ref(30)
const goodsType = ref('')
const customValue = ref<inputAssociateItem>()
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

// 自定义编码数据
const customMap = ref({})

// 寄件时间-开始
const initTime = dayjs().subtract(defaultDateRange, 'day')
const creationStartDate = ref(initTime.format('YYYY/MM/DD'))
const creationEndDate = ref(dayjs().format('YYYY/MM/DD'))

const emit = defineEmits(['screenParams'])

const getParams = () => {
  console.log(receiverInfoData.value, 'receiverInfoData')
  console.log(senderInfo.value, 'senderInfoData')

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
  showOverlay.value = false
  console.log(emitParams, 'emitParams')

  emit('screenParams', emitParams)
  resetForm()
}

let customList = ref<inputAssociateItem[]>([])
const getWaybillLinkFn = (value: string) => {
  getWaybillLink({ keyword: value, pageSize: 5, clientType: '20', clientSearchType: '10', keywordType: 40 }).then(
    (res) => {
      console.log(res)
      const { data } = res
      customList.value = data?.map((i: any) => {
        return {
          id: Number(i.keywordType),
          name: i.keyword,
        }
      })
    },
  )
}

// 获取自定义编码数量
const handleItemSelectCustom = (item: inputAssociateItem) => {
  customMap.value = item
}

const handleConfirmDate = (data: creationTime) => {
  console.log(data)
  const { startDate, endDate } = data
  creationStartDate.value = startDate
  creationEndDate.value = endDate
}

watch(showOverlay, (value) => {
  console.log('12222222222', props.screenData)
  if (value) {
    // initData()
  }
})
// 留着备用 说不定产品回心转意
// const initData = () => {
//   const screenData = props.screenData
//   creationStartDate.value = screenData.creationStartDate
//   creationEndDate.value = screenData.creationEndDate
//   roleValue.value = screenData.waybillCustomerSource
//   printStatus.value = screenData.printStatus
//   goodsType.value = screenData.goodsType
//   customValue.value = screenData.customValue

//   const pickInfo = {
//     pickupPerson: screenData.pickupPerson,
//     pickupMobile: screenData.pickupMobile,
//     pickupCustomerName: screenData.pickupCustomerName,
//     pickupAddress: screenData.pickupAddress,
//     pickupCity: screenData.pickupCity,
//     pickupDepartmentId: screenData.pickupDepartmentId,
//   }
//   receiverInfoData.value = pickInfo

//   const deliveryInfo = {
//     deliveryPerson: screenData.deliveryPerson,
//     deliveryMobile: screenData.deliveryMobile,
//     deliveryCustomerName: screenData.deliveryCustomerName,
//     deliveryDepartmentId: screenData.deliveryDepartmentId,
//     deliveryAddress: screenData.deliveryAddress,
//     deliveryCity: screenData.deliveryCity,
//     orderMobile: screenData.orderMobile,
//     orderDepartmentId: screenData.orderDepartmentId,
//   }
//   senderInfo.value = deliveryInfo
// }

const reset = () => {
  const emitParams = {
    waybillCustomerSource: 50,
    creationStartDate: initTime.format('YYYY-MM-DD'),
    creationEndDate: dayjs().format('YYYY-MM-DD'),
    printStatus: 30,
    goodsType: '',
    customValue: { name: '', id: -1 },

    pickupPerson: '',
    pickupMobile: '',
    pickupCustomerName: '',
    pickupAddress: '',
    pickupCity: '',
    pickupDepartmentId: {
      name: '',
      id: -1,
    },

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
  emit('screenParams', emitParams)
  resetForm()
}

const resetForm = () => {
  roleValue.value = 50
  printStatus.value = 30
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

const closeOverlay = () => {
  showOverlay.value = false
  resetForm()
}
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
@import '@order-public-sub-root-pages/print-batch/base/common.scss';
</style>
