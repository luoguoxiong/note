<template>
  <div v-if="listLength" class="recent-address">
    <div class="recent-address__title" v-exposure-report="exp_express_single_recently_v1(title, state.list)">
      {{ title }}
    </div>

    <div class="recent-address__content">
      <ky-swipe-group lock moveEndClose>
        <ky-swipe-cell
          v-for="(item, index) in state.list"
          :key="item.id"
          :isAsynchronous="false"
          @open="openSwipe"
          @close="closeSwipe"
          :name="item.id"
        >
          <div class="list" @click="onSelect(item)" v-click-report="clk_express_single_recently_v1(title, item)">
            <div class="list__info">
              <div class="list__info__name">{{ item.person }}</div>
              <div v-if="item.mobile" class="list__info__mobile">
                {{ item.mobile }}
              </div>
              <div v-else class="list__info__mobile">
                {{ item.telephone }}<text v-if="item.extension">-{{ item.extension }}</text>
              </div>
              <div v-if="item.tag" class="list__info__flag">
                <span class="list__info__flag-text">上次使用</span>
              </div>
            </div>
            <div v-if="item.mobile && item.telephone" class="list__telephone">
              {{ item.telephone }}<span v-if="item.extension">-{{ item.extension }}</span>
            </div>
            <div v-if="item.companyName" class="list__companyName">{{ item.companyName }}</div>
            <div class="list__address">{{ fullAddressFn(item) }}</div>
          </div>
          <template #right>
            <div class="recent-address-delete" @click="onDelete(item.id, index)">删除</div>
          </template>
        </ky-swipe-cell>
      </ky-swipe-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import Taro from '@tarojs/taro'

// 方法
import { historyAddress, deleteHistoryAddress } from '@order-public-sub-public/apis/address'
import { exp_express_single_recently_v1, clk_express_single_recently_v1 } from './report/index'
import { getValueOrEmpty } from '@order-public-sub-public/utils'
import { HistoryAddressResponse } from '@order-public-sub-public/apis/address/types'
import { clickDeleteRecentAddressReport } from '@order-public-sub-public/report/sender'

interface ReactiveType {
  list: HistoryAddressResponse[]
}

const props = defineProps({
  addressType: {
    type: String || Number,
    default: '10',
  },
  title: {
    type: String,
    default: '最近寄件地址',
  },
  companyNameEdit: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['onSelect', 'onChange'])

const state = reactive<ReactiveType>({
  list: [],
})

const swipeLock = ref(false) // 滑动时不允许触发点击

const getHistoryAddressList = async () => {
  try {
    const { data } = await historyAddress({ addressType: props.addressType })
    state.list = data
  } catch (error) {
    console.log(error)
  }
}

/**
 * 选中
 */
const onSelect = (item: HistoryAddressResponse) => {
  // 当滑动出来的时候，禁止触发点击
  if (swipeLock.value) {
    return
  }
  const data = {
    person: getValueOrEmpty(item?.person),
    mobile: getValueOrEmpty(item?.mobile),
    telephone: getValueOrEmpty(item?.telephone),
    extension: getValueOrEmpty(item?.extension),
    province: getValueOrEmpty(item?.province),
    city: getValueOrEmpty(item?.city),
    county: getValueOrEmpty(item?.county),
    detailAddress: getValueOrEmpty(item?.detailAddress),
    companyName: props.companyNameEdit ? getValueOrEmpty(item?.companyName) : '',
  }

  emit('onSelect', data)
  scrollFn()
  emit('onChange')
}

// 选中，往上定位
const scrollFn = () => {
  // const orderInput = document.querySelector('.address-unfold')
  // if (orderInput) {
  //   setTimeout(() => {
  //     orderInput.scrollIntoView({
  //       block: 'start',
  //       behavior: 'smooth',
  //     })
  //   }, 100)
  // }
}

/**
 * 删除
 */
const onDelete = async (id: string, index?: number) => {
  try {
    const params = {
      removeId: id,
      addressType: props.addressType,
    }
    clickDeleteRecentAddressReport({
      addressType: props.addressType,
      no: index,
      id: id,
    })
    await deleteHistoryAddress(params)
    // state.list = state.list?.filter((item) => item.id !== id)
    getHistoryAddressList()
    closeSwipe()
    showToast('删除成功')
  } catch (error) {
    console.log('error', error)
  }
}

const fullAddressFn = (item: HistoryAddressResponse) => {
  const { province, city, county, detailAddress } = item || {}

  return `${getValueOrEmpty(province)}${getValueOrEmpty(city)}${getValueOrEmpty(county)}${getValueOrEmpty(
    detailAddress,
  )}`
}

const listLength = computed(() => state.list?.length > 0)

const openSwipe = () => {
  swipeLock.value = true
}

const closeSwipe = () => {
  swipeLock.value = false
}

onMounted(() => {
  getHistoryAddressList()
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
