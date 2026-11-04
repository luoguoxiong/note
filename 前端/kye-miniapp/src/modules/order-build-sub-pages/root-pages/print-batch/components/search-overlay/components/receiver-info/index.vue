<template>
  <div class="receiver-info">
    <div class="label">收件信息</div>
    <div class="row">
      <van-field
        v-model="pickupPerson"
        placeholder="收件人姓名"
        class="screen-overlay__input"
        clearable
        :border="false"
        maxlength="20"
        autocomplete="off"
        @input="handleInput(pickupPerson, 'pickupPerson')"
        @clear="handleInput(pickupPerson, 'pickupPerson')"
      />
      <van-field
        v-model="pickupMobile"
        placeholder="收件人手机号"
        class="screen-overlay__input"
        clearable
        :border="false"
        maxlength="11"
        autocomplete="off"
        @input="handleInput(pickupMobile, 'pickupMobile')"
        @clear="handleInput(pickupMobile, 'pickupMobile')"
      />
    </div>
    <div class="row">
      <van-field
        v-model="pickupCustomerName"
        placeholder="收件公司名称"
        class="screen-overlay__input half"
        clearable
        :border="false"
        maxlength="30"
        autocomplete="off"
        @input="handleInput(pickupCustomerName, 'pickupCustomerName')"
        @clear="handleInput(pickupCustomerName, 'pickupCustomerName')"
      />
      <InputAssociate
        v-model="pickupDepartmentId"
        :placeholder="receiveDepartmentType.departmentName"
        clearable
        :border="false"
        maxlength="30"
        :associateFn="linkDepartmentNameAndCodeFn"
        placement="bottom-start"
        :option="receiveDepartmentTypeList"
        @itemSelect="handleItemSelect"
        key="receive"
      />
    </div>
    <div class="row">
      <van-field
        v-model="pickupCity"
        placeholder="收件城市"
        class="screen-overlay__input"
        clearable
        :border="false"
        maxlength="30"
        autocomplete="off"
        @input="handleInput(pickupCity, 'pickupCity')"
        @clear="handleInput(pickupCity, 'pickupCity')"
      />
    </div>
    <div class="row">
      <van-field
        v-model="pickupAddress"
        placeholder="收件地址"
        class="screen-overlay__input"
        clearable
        :border="false"
        maxlength="30"
        autocomplete="off"
        @input="handleInput(pickupAddress, 'pickupAddress')"
        @clear="handleInput(pickupAddress, 'pickupAddress')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { linkDepartmentNameAndCode } from '@order-public-sub-public/apis/print'

import InputAssociate from '@order-public-sub-root-pages/print-batch/components/search-overlay/components/input-associate/index.vue'
import { inputAssociateItem } from '@order-public-sub-root-pages/print-batch/hooks/type'

interface inputAssociateProps {
  modelValue: {
    pickupPerson: string
    pickupMobile: string
    pickupCustomerName: string
    pickupDepartmentId: inputAssociateItem
    pickupCity: string
    pickupAddress: string
  }
  receiveDepartmentType: {
    departmentType: number
    departmentName: string
  }
  showOverlay: boolean
}

const props = defineProps<inputAssociateProps>()

// 收件信息相关
const pickupPerson = ref('')
const pickupMobile = ref('')
const pickupCustomerName = ref('')
const pickupDepartmentId = ref<inputAssociateItem>({
  name: '',
  id: -1,
})
const pickupCity = ref('')
const pickupAddress = ref('')

let receiveDepartmentTypeList = ref<inputAssociateItem[]>([])

watch(
  () => props.modelValue,
  () => {
    pickupPerson.value = props.modelValue.pickupPerson
    pickupMobile.value = props.modelValue.pickupMobile
    pickupCustomerName.value = props.modelValue.pickupCustomerName
    pickupDepartmentId.value = props.modelValue.pickupDepartmentId
    pickupCity.value = props.modelValue.pickupCity
    pickupAddress.value = props.modelValue.pickupAddress
  },
)

const linkDepartmentNameAndCodeFn = (value: string) => {
  const params = {
    keyword: value,
    departmentType: props.receiveDepartmentType.departmentType,
  }
  linkDepartmentNameAndCode(params).then((res) => {
    console.log(res)
    const { data } = res
    receiveDepartmentTypeList.value = data?.map((i: any) => {
      return {
        id: i.departmentId,
        name: i.departmentName,
      }
    })
  })
}

const emit = defineEmits(['update:modelValue'])

const handleItemSelect = (item: inputAssociateItem) => {
  console.log(item, 'handleItemSelect')
  const childObject = { ...props.modelValue, pickupDepartmentId: item }
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
  pickupPerson.value = props.modelValue.pickupPerson
  pickupMobile.value = props.modelValue.pickupMobile
  pickupCustomerName.value = props.modelValue.pickupCustomerName
  pickupDepartmentId.value = props.modelValue.pickupDepartmentId
  pickupCity.value = props.modelValue.pickupCity
  pickupAddress.value = props.modelValue.pickupAddress
}
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

// @import'./index.scss';
@import '@order-public-sub-root-pages/print-batch/base/common.scss';
</style>
