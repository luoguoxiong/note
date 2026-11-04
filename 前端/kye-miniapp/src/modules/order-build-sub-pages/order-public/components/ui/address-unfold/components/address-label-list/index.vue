<template>
  <div class="address-label-list">
    <div class="block">
      <TabList :list="list" :value="value" v-if="list.length" @change="change" />
      <span class="address-place" v-else>地址标签(选填)</span>
      <div class="add-label-btn" :class="{ labelBtnDisabled: list.length >= 5 }" @click="clickLabel">
        <span class="add-plus">+</span>
        添加
      </div>
    </div>
  </div>
  <AddAddressLabel ref="dialog" @save="save" :recognition-type="recognitionTypeTitle" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import TabList from '@order-public-sub-public/components/business/address-book/components/tab/TabList.vue'
import AddAddressLabel from '@order-public-sub-public/components/business/address-book/components/add-address-label/index.vue'
import { AddressLabel } from '@order-public-sub-public/apis/address/types'
// 方法
import { addressLabelSave } from '@order-public-sub-public/apis/address'
import { EAddressPermissionTab } from '@order-public-sub-public/components/business/address-book/types'
import { useStore } from '@order-public-sub-public/store'
import { debounce } from 'lodash-es'
import { pageUseAddress } from '@order-public-sub-public/constants'
import {
  clk_express_book_address_settag_v1,
  clk_express_sender_control_v1,
} from '@order-public-sub-public/components/business/address-book/page/report/index'
// 组件
const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  usePage: {
    // 是页面 来源
    type: String,
    default: '',
  },
})
const store = useStore()
const emit = defineEmits(['change'])
const dialog = ref()
const list = ref<AddressLabel[]>([])
const getLabels = async () => {
  try {
    // 获取地址标签
    const data = store.globalData.addressLabelList
    list.value = (data || [])?.filter(
      (item) =>
        ![EAddressPermissionTab.全部地址, EAddressPermissionTab.共享地址, EAddressPermissionTab.我的地址].includes(
          item.labelCode as EAddressPermissionTab,
        ),
    )
  } catch (error) {
    list.value = []
  }
}

const recognitionTypeTitle = computed(() => {
  if (props.usePage === pageUseAddress.ADDRESSBOOKSENDER) {
    return '寄件'
  } else if (props.usePage === pageUseAddress.ADDRESSBOOKRECEIVE) {
    return '收件'
  } else {
    return ''
  }
})

const change = (value: string) => {
  try {
    const data = store.globalData.addressLabelList
    const name = data?.filter((i) => i.labelCode === value)
    clk_express_book_address_settag_v1(name?.[0]?.labelName, recognitionTypeTitle.value)
  } catch (error) {
    console.log('error ', error)
  }
  emit('change', value)
}

const setAddressLabelListStore = (newOne: AddressLabel) => {
  const list = store.globalData.addressLabelList
  list?.push(newOne)
  // 缓存起来store 避免多次调用
  store.globalData.setAddressLabelList({
    list,
  })
}

const save = debounce(
  async (labelName: string) => {
    try {
      const { data } = await addressLabelSave({ labelName })
      setAddressLabelListStore(data)
      showToast('保存成功')
      dialog.value.close()
      await getLabels()
      emit('change', data?.labelCode || '')
    } catch (error) {
      showToast(error as string)
    }
  },
  500,
  {
    leading: true,
    trailing: false,
  },
)

const clickLabel = () => {
  try {
    clk_express_sender_control_v1(props.usePage === pageUseAddress.ADDRESSBOOKRECEIVE ? 20 : 10, '添加标签')
  } catch (error) {
    console.error(error)
  }
  if (list.value?.length >= 5) {
    showToast('最多可添加5个标签')
    return
  }
  dialog.value?.open()
}

onMounted(() => {
  getLabels()
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
