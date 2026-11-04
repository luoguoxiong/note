<template>
  <div class="sender-info">
    <div class="label">寄件信息</div>
    <div class="row">
      <van-field
        v-model="deliveryPerson"
        placeholder="寄件人姓名"
        class="screen-overlay__input"
        clearable
        :border="false"
        maxlength="20"
        autocomplete="off"
        @input="handleInput(deliveryPerson, 'deliveryPerson')"
        @clear="handleInput(deliveryPerson, 'deliveryPerson')"
      />
      <van-field
        v-model="deliveryMobile"
        placeholder="寄件人手机号"
        class="screen-overlay__input"
        clearable
        :border="false"
        maxlength="11"
        autocomplete="off"
        @input="handleInput(deliveryMobile, 'deliveryMobile')"
        @clear="handleInput(deliveryMobile, 'deliveryMobile')"
      />
    </div>
    <div class="row">
      <van-field
        v-model="deliveryCustomerName"
        placeholder="寄件公司名称"
        class="screen-overlay__input half"
        clearable
        :border="false"
        maxlength="30"
        autocomplete="off"
        @input="handleInput(deliveryCustomerName, 'deliveryCustomerName')"
        @clear="handleInput(deliveryCustomerName, 'deliveryCustomerName')"
      />
      <InputAssociate
        v-model="deliveryDepartmentId"
        placeholder="寄件人部门"
        clearable
        :associateFn="linkDepartmentNameAndCodeSender"
        :border="false"
        maxlength="30"
        placement="top-start"
        :option="senderOption"
        @itemSelect="handleItemSelectSender"
        key="sender"
      />
    </div>
    <div class="row">
      <van-field
        v-model="deliveryCity"
        placeholder="寄件城市"
        class="screen-overlay__input"
        clearable
        :border="false"
        maxlength="30"
        autocomplete="off"
        @input="handleInput(deliveryCity, 'deliveryCity')"
        @clear="handleInput(deliveryCity, 'deliveryCity')"
      />
    </div>
    <div class="row">
      <van-field
        v-model="deliveryAddress"
        placeholder="寄件地址"
        class="screen-overlay__input"
        clearable
        :border="false"
        maxlength="30"
        autocomplete="off"
        @input="handleInput(deliveryAddress, 'deliveryAddress')"
        @clear="handleInput(deliveryAddress, 'deliveryAddress')"
      />
    </div>
    <div class="row">
      <van-field
        v-model="orderMobile"
        placeholder="下单人手机号"
        class="screen-overlay__input half"
        clearable
        :border="false"
        maxlength="30"
        autocomplete="off"
        @input="handleInput(orderMobile, 'orderMobile')"
        @clear="handleInput(orderMobile, 'orderMobile')"
      />
      <InputAssociate
        v-model="orderDepartmentId"
        :associateFn="linkDepartmentNameAndCodeOrder"
        placeholder="下单人部门"
        clearable
        :border="false"
        maxlength="30"
        placement="top-start"
        :option="orderOption"
        @itemSelect="handleItemSelectOrder"
        key="order"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { linkDepartmentNameAndCode } from '@order-public-sub-public/apis/print'

import { inputAssociateItem, departmentFilterNameType } from '@order-public-sub-root-pages/print-batch/hooks/type'

import InputAssociate from '@order-public-sub-root-pages/print-batch/components/search-overlay/components/input-associate/index.vue'

interface inputAssociateProps {
  modelValue: {
    deliveryPerson: string
    deliveryMobile: string
    deliveryCustomerName: string
    deliveryDepartmentId: inputAssociateItem
    deliveryAddress: string
    deliveryCity: string
    orderMobile: string
    orderDepartmentId: inputAssociateItem
  }
  senderDepartmentType: departmentFilterNameType
  orderDepartmentType: departmentFilterNameType
  showOverlay: boolean
}

const props = defineProps<inputAssociateProps>()

// const handleInput = debounce(() => {
//   console.log('121212')
//   props.associateFn()
// }, 300)

// 收件信息相关
const deliveryPerson = ref('')
const deliveryMobile = ref('')
const deliveryCustomerName = ref('')
const deliveryDepartmentId = ref<inputAssociateItem>({
  name: '',
  id: -1,
})
const deliveryAddress = ref('')
const deliveryCity = ref('')
const orderMobile = ref('')
const orderDepartmentId = ref<inputAssociateItem>({
  name: '',
  id: -1,
})

const senderOption = ref<inputAssociateItem[]>([])

watch(
  () => props.modelValue,
  () => {
    deliveryPerson.value = props.modelValue.deliveryPerson
    deliveryMobile.value = props.modelValue.deliveryMobile
    deliveryCustomerName.value = props.modelValue.deliveryCustomerName
    deliveryDepartmentId.value = props.modelValue.deliveryDepartmentId
    deliveryAddress.value = props.modelValue.deliveryAddress
    deliveryCity.value = props.modelValue.deliveryCity
    orderMobile.value = props.modelValue.orderMobile
    orderDepartmentId.value = props.modelValue.orderDepartmentId
  },
)

const linkDepartmentNameAndCodeSender = (value: string) => {
  const params = {
    keyword: value,
    departmentType: props.senderDepartmentType.departmentType,
  }
  linkDepartmentNameAndCode(params).then((res) => {
    const { data } = res
    senderOption.value = data?.map((i: any) => {
      return {
        id: i.departmentId,
        name: i.departmentName,
      }
    })
  })
}

const orderOption = ref<inputAssociateItem[]>([])
const linkDepartmentNameAndCodeOrder = (value: string) => {
  const params = {
    keyword: value,
    departmentType: props.orderDepartmentType.departmentType,
  }
  linkDepartmentNameAndCode(params).then((res) => {
    const { data } = res
    orderOption.value = data?.map((i: any) => {
      return {
        id: i.departmentId,
        name: i.departmentName,
      }
    })
  })
}

const emit = defineEmits(['update:modelValue'])

const handleItemSelectSender = (item: inputAssociateItem) => {
  console.log(item, 'handleItemSelect')
  const childObject = { ...props.modelValue, deliveryDepartmentId: item }
  emit('update:modelValue', childObject)
}

const handleItemSelectOrder = (item: inputAssociateItem) => {
  console.log(item, 'handleItemSelect')
  const childObject = { ...props.modelValue, orderDepartmentId: item }
  emit('update:modelValue', childObject)
}

const handleInput = (value: string, key: string) => {
  console.log(value, key)
  const childObject = { ...props.modelValue, [key]: value }
  emit('update:modelValue', childObject)
}

watch(
  () => props.showOverlay,
  (value) => {
    if (value) {
      initData()
    }
  },
)

const initData = () => {
  deliveryPerson.value = props.modelValue.deliveryPerson
  deliveryMobile.value = props.modelValue.deliveryMobile
  deliveryCustomerName.value = props.modelValue.deliveryCustomerName
  deliveryDepartmentId.value = props.modelValue.deliveryDepartmentId
  deliveryAddress.value = props.modelValue.deliveryAddress
  deliveryCity.value = props.modelValue.deliveryCity
  orderMobile.value = props.modelValue.orderMobile
  orderDepartmentId.value = props.modelValue.orderDepartmentId
}
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

// @import'./index.scss';
@import '@order-public-sub-root-pages/print-batch/base/common.scss';
</style>
