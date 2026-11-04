<template>
  <ky-popup :show="show" position="bottom" safeAreaInsetBottom @click-overlay="close">
    <view class="address-select">
      <view class="header">
        <view class="title">城市/区域/乡镇</view>
        <view class="close-icon" @click="close">
          <image src="https://ic-img.ky-express.com/netc/20260108_14587_!!1767855506029_36_36.png"></image>
        </view>
      </view>
      <view class="seach-input">
        <ky-input
          class="address-input"
          v-model="searchValue"
          placeholder="请输入省份/城市/市区/乡镇搜索"
          :clearable="true"
          :enableNative="false"
          :always-system="!isAmapMiniApp"
          :cursor-spacing="130"
          @input="onSearch"
        >
          <template #left>
            <image
              class="common-search-input__icon"
              mode="aspectFit"
              src="https://ic-img.ky-express.com/netc/20250716_10385_!!1752632075929_64_64.png"
            />
          </template>
        </ky-input>
      </view>
      <view class="search-list" v-show="searchList.length > 0">
        <scroll-view scroll-y="true" :showScrollbar="false" :enhanced="true" enable-flex class="ky-list">
          <view
            class="search-list-item"
            v-for="item in searchList"
            :key="item.districtID"
            @click="handleSearchItem(item)"
          >
            <HighlightText
              class="search-list-item__text-hightlight"
              :text="item.districAllName"
              :highlight="searchValue"
            />
          </view>
        </scroll-view>
      </view>
      <view class="hot-city" v-show="searchList.length === 0">
        <view class="hot-city__title">热门城市</view>
        <view class="hot-city__content">
          <view
            v-for="city in hotCitys"
            :key="city.districtId"
            :class="['hot-city__item', city.cityName === currentHotcity && 'hot-city__item--active']"
            @click="selectHotcity(city)"
          >
            {{ city.cityName }}
            <image
              v-show="city.cityName === currentHotcity"
              src="https://ic-img.ky-express.com/netc/20260108_68864_!!1767861010128_56_50.png"
            ></image>
          </view>
        </view>
      </view>
      <view class="dividing-line" v-show="searchList.length === 0"></view>
      <view class="address-wrapper" v-show="searchList.length === 0">
        <view class="tabs">
          <view
            :class="['tab', activeTab === index && 'active-tab']"
            v-for="(tab, index) in addressTabs.filter((i) => i.label)"
            :key="tab.label"
            @click="handleClickTab(index)"
          >
            {{ tab.label.length > 4 ? tab.label.substring(0, 4) + '...' : tab.label }}
          </view>
        </view>
        <view class="ky-list-wrapper">
          <scroll-view scroll-y="true" :showScrollbar="false" :enhanced="true" enable-flex class="ky-list">
            <view
              :class="['ky-list-item', selectAddress[activeTab] === item.districtName && 'ky-list-item-active']"
              v-for="item in addressList"
              :key="item.districtID"
              :id="selectAddress[activeTab] === item.districtName ? 'target' : ''"
              @click="clickAddress(item)"
            >
              {{ item.districtName }}
              <image
                v-show="selectAddress[activeTab] === item.districtName"
                src="https://ic-img.ky-express.com/netc/20260108_55437_!!1767863942006_48_34.png"
              ></image>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </ky-popup>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import HighlightText from '../../../../search/components/highlight-text/index.vue'
import './index.scss'
import { debounce } from 'lodash-es'
import { getMultiLevelSubList } from '@/packages/idcard/api'
import { AiAddrAnalysisRes, District } from '@/packages/idcard/api/types/web.basicBiz.address.getMultiLevelSubList'
import { areaSearch, hotCity } from '../../apis'
import { areaSearchRes, HotCitys } from '../../apis/types'
import { isAmapMiniApp } from '@/public/utils'

const props = withDefaults(
  defineProps<{
    show: boolean
    maxLevel?: 3 | 4
    selectedAddress?: string | string[]
  }>(),
  {
    show: false,
    maxLevel: 4,
    selectedAddress: '',
  },
)

const emit = defineEmits(['update:show', 'change'])

const provinces = ref<District[]>([])
const citys = ref<District[]>([])
const districts = ref<District[]>([])
const subdistricts = ref<District[]>([])
const LEVEL_CONFIG = {
  province: {
    paramKey: 'districtLevel',
    valueKey: 'commonDistrID',
    targetRef: provinces,
  },
  city: {
    paramKey: 'districtLevel',
    valueKey: 'commonDistrID',
    targetRef: citys,
    parentId: () => selectProvice.value,
  },
  zone: {
    paramKey: 'districtLevel',
    valueKey: 'commonDistrID',
    targetRef: districts,
    parentId: () => selectCity.value,
  },
  street: {
    paramKey: 'districtLevel',
    valueKey: 'commonDistrID',
    targetRef: subdistricts,
    parentId: () => selectDistrict.value,
  },
} as const

const searchValue = ref('')
const searchList = ref<areaSearchRes[]>([])
const currentHotcity = ref('')
const activeTab = ref(0)
const addressTabs = ref([{ label: '请选择' }, { label: '' }, { label: '' }, { label: '' }])
const selectAddress = ref(['', '', '', ''])
const selectProvice = ref('')
const selectCity = ref('')
const selectDistrict = ref('')
const selectSubDistrict = ref('')
const hotCitys = ref<HotCitys[]>([])
let restoreAddressRequestId = 0

const isDistrictMode = computed(() => props.maxLevel === 3)

const addressList = computed(() => {
  if (activeTab.value === 0) {
    return provinces.value
  } else if (activeTab.value === 1) {
    return citys.value
  } else if (activeTab.value === 2) {
    return districts.value
  } else {
    return [
      {
        districtID: '',
        districtName: '暂不选择',
        adminCode: '',
      },
    ].concat(subdistricts.value)
  }
})

watch(
  () => selectAddress.value[1],
  (val) => {
    if (val !== currentHotcity.value && val !== currentHotcity.value + '市') {
      currentHotcity.value = ''
    }
  },
)

const close = () => {
  emit('update:show', false)
}

const getSelectedAddressParts = () => {
  const { selectedAddress } = props
  const parts = Array.isArray(selectedAddress) ? selectedAddress : selectedAddress.split('/')

  return parts
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
}

const isSameDistrictName = (source = '', target = '') => {
  if (source === target) return true

  return `${source}市` === target || source === `${target}市`
}

const isSameAddressPrefix = (source: string[], target: string[]) => {
  return source.every((item, index) => isSameDistrictName(item, target[index]))
}

const resetAddressState = () => {
  searchValue.value = ''
  searchList.value = []
  currentHotcity.value = ''
  activeTab.value = 0
  addressTabs.value = [{ label: '请选择' }, { label: '' }, { label: '' }, { label: '' }]
  selectAddress.value = ['', '', '', '']
  selectProvice.value = ''
  selectCity.value = ''
  selectDistrict.value = ''
  selectSubDistrict.value = ''
}

const restoreSelectedDistrictAddress = async () => {
  if (!isDistrictMode.value) return

  const selectedAddressParts = getSelectedAddressParts()
  if (selectedAddressParts.length < 3) return

  const requestId = ++restoreAddressRequestId

  try {
    const data = await areaSearch({ keyWord: selectedAddressParts[2] })
    if (requestId !== restoreAddressRequestId || data.code !== 0) return

    const matchedAddress = data.data.find((item) =>
      isSameAddressPrefix(
        selectedAddressParts,
        item.districAllName.split('/').map((name) => name.trim()),
      ),
    )
    if (!matchedAddress || matchedAddress.districIdList.length < 3) return

    resetAddressState()
    selectedAddressParts.forEach((name, index) => {
      selectAddress.value[index] = name
      addressTabs.value[index].label = name
    })

    selectProvice.value = matchedAddress.districIdList[0]
    selectCity.value = matchedAddress.districIdList[1]
    selectDistrict.value = matchedAddress.districIdList[2]
    activeTab.value = 2
    getDistricts()
  } catch (error) {
    console.log('restore selected district address error', error)
  }
}

const debouncedSearch = debounce(async () => {
  try {
    if (!searchValue.value) {
      searchList.value = []
      return
    }
    const params = { keyWord: searchValue.value }
    const data = await areaSearch(params)
    if (data.code === 0) {
      searchList.value = data.data
    }
    console.log('data', data)
  } catch (error) {
    console.log('error', error)
  }
}, 400)

const onSearch = () => {
  debouncedSearch()
}

const selectHotcity = (city: HotCitys) => {
  currentHotcity.value = city.cityName
  selectAddress.value[0] = city.provinceName
  selectAddress.value[1] = city.cityName + '市'
  selectAddress.value[2] = ''
  selectAddress.value[3] = ''
  addressTabs.value[0].label = city.provinceName
  addressTabs.value[1].label = city.cityName + '市'
  addressTabs.value[2].label = '请选择'
  addressTabs.value[3].label = ''
  selectProvice.value = city.provinceId
  selectCity.value = city.districtId
  activeTab.value = 2
  getDistricts()
}

const handleSearchItem = (val: areaSearchRes) => {
  console.log(val)
  searchValue.value = ''
  const address = val.districAllName.split('/')
  addressTabs.value = [{ label: '请选择' }, { label: '' }, { label: '' }, { label: '' }]
  selectProvice.value = ''
  selectCity.value = ''
  selectDistrict.value = ''
  selectSubDistrict.value = ''
  selectAddress.value = ['', '', '', '']
  for (let i = 0; i < val.districIdList.length; i++) {
    selectAddress.value[i] = address[i].trim()
    addressTabs.value[i].label = address[i].trim()
    if (i === 0) {
      selectProvice.value = val.districIdList[i]
      addressTabs.value[i + 1].label = '请选择'
    } else if (i === 1) {
      selectCity.value = val.districIdList[i]
      addressTabs.value[i + 1].label = '请选择'
    } else if (i === 2) {
      selectDistrict.value = val.districIdList[i]
      addressTabs.value[i + 1].label = '请选择'
    } else {
      selectSubDistrict.value = val.districIdList[i]
    }
  }
  searchList.value = []
  if (isDistrictMode.value && val.districIdList.length >= 3) {
    selectAddress.value[3] = ''
    addressTabs.value[3].label = ''
    selectSubDistrict.value = ''
    emit('change', [...selectAddress.value], selectDistrict.value, '')
    activeTab.value = 2
    getDistricts()
    return
  }
  if (val.districIdList.length === 4) {
    emit('change', [...selectAddress.value], selectDistrict.value, selectSubDistrict.value)
    activeTab.value = 3
    getSubDistricts()
    return
  }
  handleClickTab(val.districIdList.length)
}

const clickAddress = (address: District) => {
  const currentLevel = activeTab.value

  // 如果当前层级已选中相同地址，直接返回
  if (address.districtName === selectAddress.value[currentLevel]) {
    return
  }

  // 更新当前层级的选中地址
  selectAddress.value[currentLevel] = address.districtName

  // 更新 tab 标签：当前层设为选中名，下一层设为“请选择”，后续清空
  addressTabs.value[currentLevel].label = address.districtName
  if (currentLevel + 1 < addressTabs.value.length) {
    addressTabs.value[currentLevel + 1].label = '请选择'
    for (let i = currentLevel + 2; i < addressTabs.value.length; i++) {
      addressTabs.value[i].label = ''
    }
  }

  // 清空后续层级的 selectAddress
  for (let i = currentLevel + 1; i < selectAddress.value.length; i++) {
    selectAddress.value[i] = ''
  }

  // 更新对应的 ID（用于请求下级）
  if (currentLevel === 0) {
    selectProvice.value = address.districtID
    getCitys()
  } else if (currentLevel === 1) {
    selectCity.value = address.districtID
    getDistricts()
  } else if (currentLevel === 2) {
    selectDistrict.value = address.districtID
    if (isDistrictMode.value) {
      selectSubDistrict.value = ''
      emit('change', [...selectAddress.value], selectDistrict.value, '')
      return
    }
    getSubDistricts()
  } else if (currentLevel === 3) {
    selectSubDistrict.value = address.districtID
    // 触发最终 change 事件
    emit('change', [...selectAddress.value], selectDistrict.value, selectSubDistrict.value)
  }

  // 自动跳转到下一级（前三级）
  if (currentLevel < 3) {
    activeTab.value = currentLevel + 1
  }
}

const handleClickTab = (index: number) => {
  if (isDistrictMode.value && index > 2) return

  activeTab.value = index
  if (index === 1) {
    getCitys()
  } else if (index === 2) {
    getDistricts()
  } else if (index === 3) {
    getSubDistricts()
  }
}

watch(
  () => props.show,
  (show) => {
    if (show) {
      void restoreSelectedDistrictAddress()
    }
  },
)
const fetchDistricts = async (level: keyof typeof LEVEL_CONFIG) => {
  const config = LEVEL_CONFIG[level]
  // 构建请求参数
  const params: Record<string, string | number> = {
    // districtLevel: level,
  }

  if (level === 'province') {
    params.districtLevel = 'province'
  }

  // 如果有父级 ID，添加进去
  if ('parentId' in config && config.parentId()) {
    params[config.valueKey] = config.parentId!()
  }

  try {
    const data = await getMultiLevelSubList(params)
    if (data.code === 0) {
      config.targetRef.value = data.data.districtList || []
    } else {
      config.targetRef.value = []
      console.warn(`获取 ${level} 列表失败:`, data.msg)
    }
  } catch (error) {
    config.targetRef.value = []
    console.error(`请求 ${level} 列表异常:`, error)
  }
}
const getProvinces = () => fetchDistricts('province')
const getCitys = () => fetchDistricts('city')
const getDistricts = () => fetchDistricts('zone')
const getSubDistricts = () => fetchDistricts('street')

const getHotCity = async () => {
  const data = await hotCity()
  console.log('获取热门城市成功:', data)
  if (data.code === 0) {
    hotCitys.value = data.data?.hotCity
  }
}

const setData = (data: AiAddrAnalysisRes) => {
  console.log('setData', data)
}

onMounted(() => {
  getProvinces()
  getHotCity()
})

defineExpose({ setData })
</script>
