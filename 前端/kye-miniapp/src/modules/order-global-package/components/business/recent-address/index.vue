<template>
  <div v-if="hasList" class="recent-address">
    <div class="recent-address__title">
      <span>{{ title }}</span>
      <div class="del-status">
        <SvgIcon name="delete" class="icon" v-if="!state.delStatus" @click="changeClearStatus(true)" />
        <div class="text-del" v-else>
          <span @click="clear">清空</span>
          <span @click="done">完成</span>
        </div>
      </div>
    </div>
    <div class="recent-address__content">
      <ky-swipe-group lock moveEndClose>
        <ky-swipe-cell v-for="(item, index) in state.list" :key="item.id" :isAsynchronous="false" @open="openSwipe"
          @close="closeSwipe" :name="item.id">
          <div class="list" @click="onSelect(item, index)">
            <div class="list__info">
              <div class="list__info__name">{{ item.person }}</div>
              <div v-if="item.mobile" class="list__info__mobile">
                {{ item.mobile }}
              </div>
              <div v-else class="list__info__mobile">
                {{ item.telephone }}<span v-if="item.extension">-{{ item.extension }}</span>
              </div>
              <div v-if="item.tag" class="list__info__flag">
                <span class="list__info__flag-text">上次使用</span>
              </div>
            </div>
            <div v-if="item.mobile && item.telephone" class="list__telephone">
              {{ item.telephone }}<span v-if="item.extension">-{{ item.extension }}</span>
            </div>
            <div v-if="item.companyName" class="list__companyName">{{ item.companyName }}</div>
            <div class="list__address" :class="{ 'freight-time-address': isFreightTime }">{{ fullAddressFn(item) }}</div>
          </div>
          <template #right>
            <div class="recent-address-delete" @click="onDelete(item.id)">删除</div>
          </template>
        </ky-swipe-cell>
      </ky-swipe-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { showToast } from '../../../hooks/useShowToast'
import SvgIcon from '../../ui/svg-icon/index.vue'
import './index.scss'

// API / 工具函数
import { historyAddress, freightHistoryAddress, deleteHistoryAddress, freightDeleteHistoryAddress } from '../../../apis/address'
import { getValueOrEmpty } from '../../../utils'
import { HistoryAddressResponse } from '../../../apis/address/types'

// TODO: 埋点/上报依赖过深，暂未接入，后续按需补回：
//  - KyReport 组件 (exp_express_single_recently_v1 / regionCode=sender_info)
//  - umpOtherReport (clk_express_single_recently_v1)
//  - clickDeleteRecentAddressReport / clickDeleteAllRecentAddressReport

/** 地址类型常量 */
const ADDRESS_TYPE = {
  SENDER: '10',
  RECEIVE: '20',
} as const

/** 运费时效接口 type 映射 */
const FREIGHT_TYPE = {
  SENDER: 0,
  RECEIVE: 1,
} as const

interface ReactiveType {
  list: HistoryAddressResponse[]
  delStatus: boolean
}

const props = defineProps({
  addressType: {
    type: [String, Number],
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
  isFreightTime: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits(['onSelect', 'onChange', 'clearAll'])

const state = reactive<ReactiveType>({
  list: [],
  delStatus: false,
})

const swipeLock = ref(false) // 滑动时不允许触发点击

const getHistoryAddressList = async () => {
  try {
    if (props.isFreightTime) {
      const { data } = await freightHistoryAddress({
        type: props.addressType === ADDRESS_TYPE.SENDER ? FREIGHT_TYPE.SENDER : FREIGHT_TYPE.RECEIVE,
      })
      state.list = data
    } else {
      const { data } = await historyAddress({ addressType: props.addressType })
      state.list = data
    }
  } catch (error) {
    console.log(error)
    showToast('加载失败，请重试')
  }
}

/**
 * 选中
 */
const onSelect = (item: HistoryAddressResponse, index: number) => {
  // 当滑动出来的时候，禁止触发点击
  if (swipeLock.value) {
    return
  }
  const data = {
    id: item.id,
    no: index + 1,
    person: getValueOrEmpty(item?.person),
    mobile: getValueOrEmpty(item?.mobile),
    telephone: getValueOrEmpty(item?.telephone),
    extension: getValueOrEmpty(item?.extension),
    province: getValueOrEmpty(item?.province),
    city: getValueOrEmpty(item?.city),
    county: getValueOrEmpty(item?.county || item?.district),
    detailAddress: getValueOrEmpty(item?.detailAddress),
    companyName: props.companyNameEdit ? getValueOrEmpty(item?.companyName) : '',
  }

  emit('onSelect', data)
  emit('onChange')
}

/**
 * 删除单条
 */
const onDelete = async (id: string) => {
  try {
    const addressTypeStr = String(props.addressType)
    if (props.isFreightTime) {
      await freightDeleteHistoryAddress({ id, addressType: addressTypeStr })
    } else {
      await deleteHistoryAddress({ removeId: id, addressType: addressTypeStr })
    }
    await getHistoryAddressList()
    closeSwipe()
    showToast('删除成功')
  } catch (error) {
    console.log('error', error)
    showToast('删除失败，请重试')
  }
}

const fullAddressFn = (item: HistoryAddressResponse) => {
  const { province, city, county, detailAddress } = item || {}

  return `${getValueOrEmpty(province)}${getValueOrEmpty(city)}${getValueOrEmpty(county)}${getValueOrEmpty(
    detailAddress,
  )}`
}

const hasList = computed(() => state.list?.length > 0)

const openSwipe = () => {
  swipeLock.value = true
}

const closeSwipe = () => {
  swipeLock.value = false
}

const changeClearStatus = (status: boolean) => {
  state.delStatus = status
}

/**
 * 清空全部，返回是否成功
 */
const onDeleteAll = async (): Promise<boolean> => {
  const addressTypeStr = String(props.addressType)
  try {
    if (props.isFreightTime) {
      await freightDeleteHistoryAddress({
        addressType: addressTypeStr,
        clean: true,
        delFrom: 'H5-FreightTime',
      })
    } else {
      await deleteHistoryAddress({
        clean: true,
        addressType: addressTypeStr,
        delFrom: 'H5',
      })
    }
    await getHistoryAddressList()
    return true
  } catch (error) {
    console.log('error', error)
    return false
  }
}

const clear = async () => {
  changeClearStatus(false)
  emit('clearAll')
  const success = await onDeleteAll()
  showToast(success ? '清空成功' : '清空失败，请重试')
}

const done = () => {
  changeClearStatus(false)
}

onMounted(() => {
  getHistoryAddressList()
})
</script>
