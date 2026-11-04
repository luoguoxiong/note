<!--
  AddrSelect 组件
  省市区街道四级联动选择器
-->
<template>
  <view class="addr-container">
    <view>
      <text class="f_s_24 title">热门城市</text>
      <view class="flex flex_w_w hot-city">
        <view
          v-for="item in hotCityArr"
          :key="item.text"
          :class="['hot-city-item', { 'hot-city-select': hotCityIndex === item.districtIDCity }]"
          @tap="() => hotCitySelect(item)"
        >
          {{ item.text }}
        </view>
      </view>
    </view>

    <text class="f_s_24 title addrSelect">省市区选择</text>
    <view class="flex flex_ai_c flex_jc_c f_s_32 c_333 p_tb_30">
      <text class="flex_1 flex flex_jc_c">省份</text>
      <text class="flex_1 flex flex_jc_c">城市</text>
      <text class="flex_1 flex flex_jc_c">区县</text>
      <text class="flex_1 flex flex_jc_c">街镇</text>
    </view>
    <view class="picker-group">
      <picker-view
        class="picker"
        indicator-class="picker-selected"
        :value="value"
        mask-class="picker-mask"
        @change="onChange"
      >
        <picker-view-column>
          <view
            v-for="(item, index) in provinceArr"
            :key="item.districtID"
            :class="[
              'f_s_30 picker-item flex flex_jc_c flex_ai_c',
              { 'picker-item-select': value[0] === index || provinceIndex === index },
            ]"
          >
            {{ item.districtName.length > 7 ? `${item.districtName.slice(0, 6)}...` : item.districtName }}
          </view>
        </picker-view-column>
        <picker-view-column>
          <view
            v-for="(item, index) in cityArr"
            :key="item.districtID"
            :class="[
              'f_s_30 picker-item flex flex_jc_c flex_ai_c',
              { 'picker-item-select': value[1] === index || cityIndex === index },
            ]"
          >
            {{ item.districtName.length > 7 ? `${item.districtName.slice(0, 6)}...` : item.districtName }}
          </view>
        </picker-view-column>
        <picker-view-column>
          <view
            v-for="(item, index) in areaArr"
            :key="item.districtID"
            :class="[
              'f_s_30 picker-item flex flex_jc_c flex_ai_c',
              { 'picker-item-select': value[2] === index || areaIndex === index },
            ]"
          >
            {{ item.districtName.length > 7 ? `${item.districtName.slice(0, 6)}...` : item.districtName }}
          </view>
        </picker-view-column>
        <picker-view-column>
          <view
            v-for="(item, index) in streetArr"
            :key="item.districtID"
            :class="['f_s_30 picker-item flex flex_jc_c flex_ai_c', { 'picker-item-select': value[3] === index }]"
          >
            {{ item.districtName.length > 7 ? `${item.districtName.slice(0, 6)}...` : item.districtName }}
          </view>
        </picker-view-column>
      </picker-view>
    </view>
    <view class="confirmButton">
      <view class="confirmContainer">
        <view class="confirmButtonName pri-color" @tap="onConfirm">确定</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Taro from '@tarojs/taro'
import AddressAPI from '@/subpackages-expand-customer/apis/address'

defineOptions({ name: 'AddrSelect' })

// Props
interface Props {
  onSelect?: (_data: any) => void
  resetAddress?: boolean
  selectedAddress?: any
}

const props = defineProps<Props>()

const emits = defineEmits(['select'])

// 热门城市数据
const hotCityArr = [
  {
    text: '北京',
    level: '2',
    parentText: '北京',
    districtIDCity: 'XZ2-174',
    districtIDProvince: 'XZ1-06',
    districtIDProvinceIndex: 1,
    districtIDCityIndex: 1,
  },
  {
    text: '上海',
    level: '2',
    parentText: '上海',
    districtIDCity: 'XZ2-040',
    districtIDProvince: 'XZ1-01',
    districtIDProvinceIndex: 9,
    districtIDCityIndex: 1,
  },
  {
    text: '广州',
    level: '2',
    parentText: '广东省',
    districtIDCity: 'XZ2-042',
    districtIDProvince: 'XZ1-31',
    districtIDProvinceIndex: 19,
    districtIDCityIndex: 1,
  },
  {
    text: '深圳',
    level: '2',
    parentText: '广东省',
    districtIDCity: 'XZ2-229',
    districtIDProvince: 'XZ1-31',
    districtIDProvinceIndex: 19,
    districtIDCityIndex: 3,
  },
  {
    text: '东莞',
    level: '2',
    parentText: '广东省',
    districtIDCity: 'XZ2-253',
    districtIDProvince: 'XZ1-31',
    districtIDProvinceIndex: 19,
    districtIDCityIndex: 17,
  },
  {
    text: '杭州',
    level: '2',
    parentText: '浙江省',
    districtIDCity: 'XZ2-213',
    districtIDProvince: 'XZ1-22',
    districtIDProvinceIndex: 11,
    districtIDCityIndex: 1,
  },
  {
    text: '成都',
    level: '2',
    parentText: '四川省',
    districtIDCity: 'XZ2-043',
    districtIDProvince: 'XZ1-08',
    districtIDProvinceIndex: 23,
    districtIDCityIndex: 1,
  },
  {
    text: '南京',
    level: '2',
    parentText: '江苏省',
    districtIDCity: 'XZ2-260',
    districtIDProvince: 'XZ1-14',
    districtIDProvinceIndex: 10,
    districtIDCityIndex: 1,
  },
]

// 状态
const hotCityIndex = ref<string | number>(-1)
const value = ref([0, 0, 0, 0])
const provinceArr = ref<any[]>([{ districtName: '请选择', districtID: '' }])
const cityArr = ref<any[]>([{ districtName: '请选择', districtID: '' }])
const areaArr = ref<any[]>([{ districtName: '请选择', districtID: '' }])
const streetArr = ref<any[]>([{ districtName: '请选择', districtID: '' }])
const provinceIndex = ref(0)
const cityIndex = ref(0)
const areaIndex = ref(0)
const streetIndex = ref(0)
const preventChange = ref(false)

// 获取省列表 - 只有在resetAddress变化时才重新请求
const initProvinceList = async () => {
  try {
    const res = await AddressAPI.getMultiLevelSubList({ districtLevel: 'province' })
    const data: any = res.data || res
    console.log('省列表数据:', data)
    if (data && data.districtList) {
      provinceArr.value = [{ districtName: '请选择', districtID: '' }, ...data.districtList]
      console.log('provinceArr:', provinceArr.value)
      console.log('省份列表索引映射:')
      provinceArr.value.forEach((province, index) => {
        console.log(`索引 ${index}: ${province.districtName} (ID: ${province.districtID})`)
      })
    }
  } catch (err) {
    console.error('获取省列表失败:', err)
  }
}

// 监听resetAddress变化 - 只有在resetAddress变化时才重新初始化
watch(
  () => props.resetAddress,
  async (newVal) => {
    if (newVal) {
      // 重置所有状态
      hotCityIndex.value = -1
      value.value = [0, 0, 0, 0]
      provinceArr.value = [{ districtName: '请选择', districtID: '' }]
      cityArr.value = [{ districtName: '请选择', districtID: '' }]
      areaArr.value = [{ districtName: '请选择', districtID: '' }]
      streetArr.value = [{ districtName: '请选择', districtID: '' }]
      provinceIndex.value = 0
      cityIndex.value = 0
      areaIndex.value = 0
      streetIndex.value = 0
      await initProvinceList()
    }
  },
  { immediate: true },
)

// 恢复之前选择的状态
const restoreSelectedState = async () => {
  if (!props.selectedAddress) return

  const { province, city, area, street } = props.selectedAddress

  try {
    // 恢复省份
    const foundProvinceIndex = provinceArr.value.findIndex((p) => p.districtID === province.districtID)
    if (foundProvinceIndex > 0) {
      provinceIndex.value = foundProvinceIndex
      value.value[0] = foundProvinceIndex

      // 恢复城市
      const cityRes = await AddressAPI.getMultiLevelSubList({ commonDistrID: province.districtID })
      const cityData: any = cityRes.data || cityRes
      if (cityData && cityData.districtList) {
        cityArr.value = [{ districtName: '请选择', districtID: '' }, ...cityData.districtList]
        const foundCityIndex = cityArr.value.findIndex((c) => c.districtID === city.districtID)
        if (foundCityIndex > 0) {
          cityIndex.value = foundCityIndex
          value.value[1] = foundCityIndex

          // 恢复区县
          const areaRes = await AddressAPI.getMultiLevelSubList({ commonDistrID: city.districtID })
          const areaData: any = areaRes.data || areaRes
          if (areaData && areaData.districtList) {
            areaArr.value = [{ districtName: '请选择', districtID: '' }, ...areaData.districtList]
            const foundAreaIndex = areaArr.value.findIndex((a) => a.districtID === area.districtID)
            if (foundAreaIndex > 0) {
              areaIndex.value = foundAreaIndex
              value.value[2] = foundAreaIndex

              // 恢复街镇
              const streetRes = await AddressAPI.getMultiLevelSubList({ commonDistrID: area.districtID })
              const streetData: any = streetRes.data || streetRes
              if (streetData && streetData.districtList) {
                streetArr.value = [{ districtName: '请选择', districtID: '' }, ...streetData.districtList]
                const foundStreetIndex = streetArr.value.findIndex((s) => s.districtID === street.districtID)
                if (foundStreetIndex > 0) {
                  streetIndex.value = foundStreetIndex
                  value.value[3] = foundStreetIndex
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('恢复选择状态失败:', err)
  }
}

// 组件挂载时，如果没有resetAddress，则尝试恢复状态
onMounted(async () => {
  if (!props.resetAddress) {
    // 如果没有resetAddress且还没有初始化省列表，则初始化
    if (provinceArr.value.length === 1) {
      await initProvinceList()
    }
    // 尝试恢复之前选择的状态
    await restoreSelectedState()
  }
})

// 热门城市选择
const hotCitySelect = async (item: any) => {
  preventChange.value = true
  hotCityIndex.value = item.districtIDCity

  console.log('选择热门城市:', item.text, 'provinceIndex:', item.districtIDProvinceIndex)
  console.log('当前省份列表:', provinceArr.value)

  try {
    const [cityRes, areaRes] = await Promise.all([
      AddressAPI.getMultiLevelSubList({ commonDistrID: item.districtIDProvince }),
      AddressAPI.getMultiLevelSubList({ commonDistrID: item.districtIDCity }),
    ])

    const cityData: any = cityRes.data || cityRes
    const areaData: any = areaRes.data || areaRes

    if (cityData && cityData.districtList) {
      cityArr.value = [{ districtName: '请选择', districtID: '' }, ...cityData.districtList]
    }
    if (areaData && areaData.districtList) {
      areaArr.value = [{ districtName: '请选择', districtID: '' }, ...areaData.districtList]
    }

    setTimeout(() => {
      // 根据省份ID动态查找正确的索引，而不是依赖硬编码的索引
      const actualProvinceIndex = provinceArr.value.findIndex((p) => p.districtID === item.districtIDProvince)
      const actualCityIndex = cityArr.value.findIndex((c) => c.districtID === item.districtIDCity)

      console.log('设置索引 - 原始省份索引:', item.districtIDProvinceIndex, '实际省份索引:', actualProvinceIndex)
      console.log('设置索引 - 原始城市索引:', item.districtIDCityIndex, '实际城市索引:', actualCityIndex)
      console.log('对应省份:', provinceArr.value[actualProvinceIndex])

      if (actualProvinceIndex > 0) {
        provinceIndex.value = actualProvinceIndex
        cityIndex.value = actualCityIndex > 0 ? actualCityIndex : 0
        value.value = [actualProvinceIndex, actualCityIndex > 0 ? actualCityIndex : 0, 0, 0]
      }
      preventChange.value = false
    }, 100)
  } catch (err) {
    preventChange.value = false
    console.error('热门城市选择失败:', err)
  }
}

// 获取省下面的所有城市
const onSelectCity = async (item: any) => {
  try {
    const res = await AddressAPI.getMultiLevelSubList({ commonDistrID: item.districtID })
    const data: any = res.data || res
    if (data && data.districtList) {
      const districtList = await Promise.all(
        data.districtList.map(async (res: any) => {
          if (!res.districtName) {
            const result: any = await AddressAPI.getMultiLevelSubList({ commonDistrID: res.districtID })
            return result?.districtList || []
          }
          return res
        }),
      )

      const arr = [{ districtName: '请选择', districtID: '' }, ...districtList.flat()].filter(
        (e: any) => e.districtName,
      )
      cityArr.value = arr
    }
  } catch (err) {
    console.error('获取城市列表失败:', err)
  }
}

// 获取市下面的区
const onSelectArea = async (item: any) => {
  try {
    const res = await AddressAPI.getMultiLevelSubList({ commonDistrID: item.districtID })
    const data: any = res.data || res
    if (data && data.districtList) {
      areaArr.value = [{ districtName: '请选择', districtID: '' }, ...data.districtList]
    }
  } catch (err) {
    console.error('获取区列表失败:', err)
  }
}

// 获取区下面的街道
const onSelectStreet = async (item: any) => {
  try {
    const res = await AddressAPI.getMultiLevelSubList({ commonDistrID: item.districtID })
    const data: any = res.data || res
    if (data && data.districtList) {
      streetArr.value = [{ districtName: '请选择', districtID: '' }, ...data.districtList]
    }
  } catch (err) {
    console.error('获取街道列表失败:', err)
  }
}

// picker change 事件
const onChange = async (e: any) => {
  if (preventChange.value) return
  const val = e.detail.value

  if (provinceIndex.value !== val[0]) {
    provinceIndex.value = val[0]
    cityIndex.value = 0
    value.value = [val[0], 0, 0, 0]
    cityArr.value = [{ districtName: '请选择', districtID: '' }]
    areaArr.value = [{ districtName: '请选择', districtID: '' }]
    streetArr.value = [{ districtName: '请选择', districtID: '' }]
    await onSelectCity(provinceArr.value[val[0]])
  }

  if (cityIndex.value !== val[1]) {
    cityIndex.value = val[1]
    areaIndex.value = 0
    hotCityIndex.value = cityArr.value[val[1]].districtID
    areaArr.value = [{ districtName: '请选择', districtID: '' }]
    streetArr.value = [{ districtName: '请选择', districtID: '' }]
    value.value = [val[0], val[1], 0, 0]
    await onSelectArea(cityArr.value[val[1]])
  }

  if (areaIndex.value !== val[2]) {
    areaIndex.value = val[2]
    streetIndex.value = 0
    streetArr.value = [{ districtName: '请选择', districtID: '' }]
    value.value = [val[0], val[1], val[2], 0]
    await onSelectStreet(areaArr.value[val[2]])
  }

  if (streetIndex.value !== val[3]) {
    streetIndex.value = val[3]
    value.value = [val[0], val[1], val[2], val[3]]
  }
}

// 确定选择
const onConfirm = () => {
  if (value.value[0] === 0) {
    Taro.showToast({ title: '请选择省份', icon: 'none' })
    return
  }
  if (value.value[1] === 0) {
    Taro.showToast({ title: '请选择城市', icon: 'none' })
    return
  }
  if (value.value[2] === 0) {
    Taro.showToast({ title: '请选择区县', icon: 'none' })
    return
  }
  if (value.value[3] === 0) {
    Taro.showToast({ title: '请选择街镇', icon: 'none' })
    return
  }

  // props.onSelect &&
  // props.onSelect({
  //   province: provinceArr.value[value.value[0]],
  //   city: cityArr.value[value.value[1]],
  //   area: areaArr.value[value.value[2]],
  //   street: streetArr.value[value.value[3]],
  // })

  emits('select', {
    province: provinceArr.value[value.value[0]],
    city: cityArr.value[value.value[1]],
    area: areaArr.value[value.value[2]],
    street: streetArr.value[value.value[3]],
  })
}
</script>

<style lang="scss">
@import './index.scss';
</style>
