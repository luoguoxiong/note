<template>
  <view class="idcard-addr-container">
    <!-- Hot Cities Section -->
    <view>
      <text class="title">热门城市</text>
      <view class="hot-city">
        <view
          v-for="item in hotCityArr"
          :key="item.id"
          :class="`hot-city-item ${hotCityIndex === item.id && 'hot-city-select'}`"
          @click="() => hotCitySelect(item)"
        >
          {{ item.title }}
        </view>
      </view>
    </view>

    <!-- Address Picker Section -->
    <text class="title addrSelect">省市区选择</text>
    <view class="picker-select-title">
      <text class="title-item">省份</text>
      <text class="title-item">城市</text>
      <text class="title-item">区县</text>
      <text v-if="isHasStreetArrLen" class="title-item">街镇</text>
    </view>

    <view class="picker-group">
      <picker-view
        class="picker"
        indicator-class="picker-selected"
        :value="pickerValue"
        @change="onChange"
        mask-class="picker-mask"
      >
        <picker-view-column>
          <view
            v-for="(item, index) in provinceArr"
            :key="item.districtID"
            :class="`picker-item ${
              pickerValue[0] === index && 'picker-item-select'
            } ${provinceIndex === index && 'picker-item-select'}`"
          >
            {{ item.districtName.length > 7 ? `${item.districtName.slice(0, 6)}...` : item.districtName }}
          </view>
        </picker-view-column>

        <picker-view-column>
          <view
            v-for="(item, index) in cityArr"
            :key="item.districtID"
            :class="`picker-item ${
              pickerValue[1] === index && 'picker-item-select'
            } ${cityIndex === index && 'picker-item-select'}`"
          >
            {{ item.districtName.length > 7 ? `${item.districtName.slice(0, 6)}...` : item.districtName }}
          </view>
        </picker-view-column>

        <picker-view-column>
          <view
            v-for="(item, index) in areaArr"
            :key="item.districtID"
            :class="`picker-item ${
              pickerValue[2] === index && 'picker-item-select'
            } ${areaIndex === index && 'picker-item-select'}`"
          >
            {{ item.districtName.length > 7 ? `${item.districtName.slice(0, 6)}...` : item.districtName }}
          </view>
        </picker-view-column>

        <picker-view-column v-if="isHasStreetArrLen">
          <view
            v-for="(item, index) in streetArr"
            :key="item.districtID"
            :class="`picker-item ${
              pickerValue[3] === index && 'picker-item-select'
            } ${streetIndex === index && 'picker-item-select'}`"
          >
            {{ item.districtName.length > 7 ? `${item.districtName.slice(0, 6)}...` : item.districtName }}
          </view>
        </picker-view-column>
      </picker-view>
    </view>

    <ConfirmButton extranlClass="idcard-comfirm-btn" name="确定" @btnCb="onConfirm" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import Taro from '@tarojs/taro'
import { hotCity } from './const'
import { useIdAddressStore } from '@/packages/idcard/store/idAddress'
import ConfirmButton from '../confirmButton'
import type { HotCity, District, AddrSelectProps } from './types'
import type { getMultiLevelSubListAPITypes } from '@/packages/idcard/api/types/index'

const emits = defineEmits(['select'])

const props = defineProps<AddrSelectProps>()

const hotCityArr = ref<HotCity[] | any>(hotCity())
const hotCityIndex = ref<string>('')
const pickerValue = ref<number[]>([0, 0, 0, 0])

const provinceArr = ref<District[]>([{ districtName: '请选择', districtID: '' }])
const cityArr = ref<District[]>([{ districtName: '请选择', districtID: '' }])
const areaArr = ref<District[]>([{ districtName: '请选择', districtID: '' }])
const streetArr = ref<District[]>([{ districtName: '请选择', districtID: '' }])

const provinceIndex = ref(0)
const cityIndex = ref(0)
const areaIndex = ref(0)
const streetIndex = ref(0)

const preventChange = ref(false)

const { getMultiLevelSubList } = useIdAddressStore()

const setDefaultAddress = async (objResult: AddrSelectProps['defaultAddress']) => {
  if (!objResult) return

  try {
    preventChange.value = true
    hotCityIndex.value = objResult.cityId

    const [provinceRes, cityRes, areaRes, streetRes] = await Promise.all([
      getMultiLevelSubList({ districtLevel: 'province' }),
      getMultiLevelSubList({ commonDistrID: objResult.provinceId }),
      getMultiLevelSubList({ commonDistrID: objResult.cityId }),
      getMultiLevelSubList({ commonDistrID: objResult.countyId }),
    ])

    // 使用解构赋值
    const { data: provinceData }: getMultiLevelSubListAPITypes.AddressGetMultiLevelSubListResponse = provinceRes
    const { data: cityData }: getMultiLevelSubListAPITypes.AddressGetMultiLevelSubListResponse = cityRes
    const { data: areaData }: getMultiLevelSubListAPITypes.AddressGetMultiLevelSubListResponse = areaRes
    const { data: streetData }: getMultiLevelSubListAPITypes.AddressGetMultiLevelSubListResponse = streetRes

    if (cityData?.districtList) {
      cityArr.value = [{ districtName: '请选择', districtID: '' }, ...cityData.districtList]
    }
    if (areaData?.districtList) {
      areaArr.value = [{ districtName: '请选择', districtID: '' }, ...areaData.districtList]
    }
    if (streetData?.districtList) {
      streetArr.value = [{ districtName: '请选择', districtID: '' }, ...streetData.districtList]
    }

    const tempDefault_province = provinceData.districtList?.findIndex(
      (item) => item.districtID === objResult.provinceId,
    )
    const tempDefault_city = cityData.districtList?.findIndex((item) => item.districtID === objResult.cityId)
    const tempDefault_area = areaData.districtList?.findIndex((item) => item.districtID === objResult.countyId)
    const tempDefault_street = streetData.districtList?.findIndex((item) => item.districtID === objResult.townId)

    setTimeout(() => {
      provinceIndex.value = tempDefault_province + 1
      cityIndex.value = tempDefault_city + 1
      areaIndex.value = tempDefault_area + 1
      streetIndex.value = tempDefault_street + 1
      pickerValue.value = [tempDefault_province + 1, tempDefault_city + 1, tempDefault_area + 1, tempDefault_street + 1]
      preventChange.value = false
    }, 100)
  } catch (error) {
    console.error('设置默认地址错误:', error)
    preventChange.value = false
  }
}

const hotCitySelect = async (item: HotCity | any) => {
  try {
    // 1. 设置当前选中的热门城市
    hotCityIndex.value = item.id
    preventChange.value = true

    // 2. 查找对应的省份信息
    const provinceItem = item.value?.find((obj) => obj.level === 'province')
    if (!provinceItem) {
      throw new Error('未找到对应的省份信息')
    }

    // 3. 并行获取数据
    const [{ data: cityData }, { data: areaData }] = await Promise.all([
      // 获取该省份下的城市列表
      getMultiLevelSubList({ commonDistrID: provinceItem.id }),
      // 获取当前城市的区县列表
      getMultiLevelSubList({ commonDistrID: item.id }),
    ])

    // 4. 更新城市列表（添加"请选择"选项）
    cityArr.value = [{ districtName: '请选择', districtID: '' }, ...(cityData.districtList || [])]

    // 5. 更新区县列表（添加"请选择"选项）
    areaArr.value = [{ districtName: '请选择', districtID: '' }, ...(areaData.districtList || [])]

    // 6. 查找省份索引（从1开始，0是"请选择"）
    const provinceIdx = provinceArr.value.findIndex((p) => p.districtID === provinceItem.id)

    // 7. 查找城市索引（从1开始，0是"请选择"）
    const cityIdx = cityData.districtList?.findIndex((c) => c.districtID === item.id) ?? -1

    console.log('级联数据加载结果:', {
      省份索引: provinceIdx,
      城市索引: cityIdx,
      城市列表: cityArr.value,
      区县列表: areaArr.value,
    })

    // 8. 确保索引有效
    if (provinceIdx < 0 || cityIdx < 0) {
      throw new Error('未找到匹配的省份或城市')
    }

    await nextTick()
    setTimeout(() => {
      // 9. 更新选择器值和索引
      pickerValue.value = [provinceIdx, cityIdx + 1, 0, 0]
      provinceIndex.value = provinceIdx
      cityIndex.value = cityIdx + 1
      areaIndex.value = 0
      streetIndex.value = 0

      // 10. 重置街道数据
      streetArr.value = [{ districtName: '请选择', districtID: '' }]
    }, 300)
  } catch (error) {
    console.error('选择热门城市出错:', error)
    Taro.showToast({
      title: '数据加载失败，请重试',
      icon: 'none',
    })
  } finally {
    preventChange.value = false
  }
}

const onSelectCity = async (item: District) => {
  if (!item?.districtID) return

  const { data } = await getMultiLevelSubList({ commonDistrID: item?.districtID })
  if (data?.districtList) {
    cityArr.value = [{ districtName: '请选择', districtID: '' }, ...data.districtList]
  }
}

const onSelectArea = async (item: District) => {
  if (!item?.districtID) return

  const { data } = await getMultiLevelSubList({ commonDistrID: item?.districtID })
  if (data?.districtList) {
    areaArr.value = [{ districtName: '请选择', districtID: '' }, ...data.districtList]
  }
}

const onSelectStreet = async (item: District) => {
  if (!item?.districtID) return

  const { data } = await getMultiLevelSubList({ commonDistrID: item?.districtID })
  if (data?.districtList) {
    streetArr.value = [{ districtName: '请选择', districtID: '' }, ...data.districtList]
  }
}

const onChange = (e: { detail: { value: number[] } }) => {
  if (preventChange.value) return

  const newValues = e.detail.value
  const oldValues = pickerValue.value

  console.log('新选择的值:', newValues)
  console.log('旧值:', oldValues)

  // 判断哪一级发生了变化
  const changedLevel = getChangedLevel(oldValues, newValues)

  // 根据变化的级别重置下级选项
  switch (changedLevel) {
    case 0: // 省变化
      handleProvinceChange(newValues)
      break
    case 1: // 市变化
      handleCityChange(newValues)
      break
    case 2: // 区县变化
      handleDistrictChange(newValues)
      break
    case 3: // 街道变化
      handleStreetChange(newValues)
      break
  }
}

// 辅助函数：找出变化的级别
const getChangedLevel = (oldValues: number[], newValues: number[]) => {
  for (let i = 0; i < oldValues.length; i++) {
    if (oldValues[i] !== newValues[i]) {
      return i
    }
  }
  return -1 // 没有变化
}

// 处理省变化
const handleProvinceChange = (values: number[]) => {
  provinceIndex.value = values[0]

  // 重置下级所有选项
  cityIndex.value = 0
  areaIndex.value = 0
  streetIndex.value = 0

  // 更新选择器值
  pickerValue.value = [values[0], 0, 0, 0]

  // 初始化下级选项
  cityArr.value = [{ districtName: '请选择', districtID: '' }]
  areaArr.value = [{ districtName: '请选择', districtID: '' }]
  streetArr.value = [{ districtName: '请选择', districtID: '' }]

  // 加载市级数据
  onSelectCity(provinceArr.value[values[0]])
}

// 处理市变化
const handleCityChange = (values: number[]) => {
  cityIndex.value = values[1]
  hotCityIndex.value = cityArr.value[values[1]].districtID

  // 重置下级选项
  areaIndex.value = 0
  streetIndex.value = 0

  // 更新选择器值
  pickerValue.value = [values[0], values[1], 0, 0]

  // 初始化下级选项
  areaArr.value = [{ districtName: '请选择', districtID: '' }]
  streetArr.value = [{ districtName: '请选择', districtID: '' }]

  // 加载区县数据
  onSelectArea(cityArr.value[values[1]])
}

// 处理区县变化
const handleDistrictChange = (values: number[]) => {
  areaIndex.value = values[2]

  // 重置下级选项
  streetIndex.value = 0

  // 更新选择器值
  pickerValue.value = [values[0], values[1], values[2], 0]

  // 初始化下级选项
  streetArr.value = [{ districtName: '请选择', districtID: '' }]

  // 加载街道数据
  onSelectStreet(areaArr.value[values[2]])
}

// 处理街道变化
const handleStreetChange = (values: number[]) => {
  streetIndex.value = values[3]
  pickerValue.value = values
}

const onConfirm = () => {
  if (pickerValue.value[0] === 0) {
    Taro.showToast({ icon: 'none', title: '请选择省' })
    return
  }
  if (pickerValue.value[1] === 0) {
    Taro.showToast({ icon: 'none', title: '请选择市' })
    return
  }
  if (pickerValue.value[2] === 0) {
    Taro.showToast({ icon: 'none', title: '请选择区县' })
    return
  }
  if (pickerValue.value[3] === 0 && isHasStreetArrLen.value) {
    Taro.showToast({ icon: 'none', title: '请选择街道' })
    return
  }

  emits('select', {
    province: provinceArr.value[pickerValue.value[0]],
    city: cityArr.value[pickerValue.value[1]],
    area: areaArr.value[pickerValue.value[2]],
    street: streetArr.value[pickerValue.value[3]] || { districtName: '', districtID: '' },
  })
}

const isHasStreetArrLen = computed(() => streetArr.value.length > 1)

// Initialize provinces
onMounted(() => {
  getMultiLevelSubList({ districtLevel: 'province' }).then(({ data }) => {
    if (data?.districtList) {
      provinceArr.value = [{ districtName: '请选择', districtID: '' }, ...data.districtList]
    }
  })
})

// Watch for default address changes
watch(
  () => props.defaultAddress,
  (newVal) => {
    if (newVal) {
      console.log('🚀 ~ 11111111111 newVal:', newVal)
      setDefaultAddress(newVal)
    }
  },
  { immediate: true },
)
</script>

<style lang="scss">
@import './index.scss';
</style>
