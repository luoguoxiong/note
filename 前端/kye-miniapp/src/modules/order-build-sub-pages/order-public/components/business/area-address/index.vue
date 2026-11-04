<template>
  <div class="area-address">
    <BottomPopup
      v-bind="$attrs"
      v-model:show="state.show"
      title="城市/区域"
      @onClose="handleClose"
      class="area-address-popup"
    >
      <div class="">
        <!-- 搜索 -->
        <ky-input
          v-model="state.keyword"
          ref="searchRef"
          clear-trigger="always"
          placeholder="请输入省份/城市/市区搜索"
          :maxlength="15"
          clearable
          @update:model-value="onSearch"
        />
        <!-- 热门城市 -->
        <div class="hot-city">
          <div class="hot-city__title">热门城市</div>
          <div class="hot-city__list">
            <div
              class="hot-city__list__item"
              v-for="(item, index) in state.hotCityNameList"
              :key="index"
              :class="{ active: state.selectedValues[1] === item.id }"
              @click="handleSelectHot(item)"
            >
              {{ item.title }}
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- 选择列表 -->
        <div class="select">
          <div class="select__header van-hairline--bottom">
            <div class="select__header-item">省份</div>
            <div class="select__header-item">城市</div>
            <div class="select__header-item">区县</div>
          </div>
          <div class="select__body">
            <ky-picker
              ref="pickerRef"
              v-model="state.selectedValues"
              :poppable="false"
              :option-height="optionHeightVh"
              :show-toolbar="false"
              :visible-option-num="visibleOptionNum"
              :columns="collumnsRes"
              @change="onChange"
              @confirm="onPickerConfirm"
            />
          </div>
        </div>
      </div>
      <template #scroll-after>
        <!-- 确定按钮会展示出来，放在下面则层级更高，正常展示 -->
        <scroll-view :scroll-y="true" class="search__list" v-if="state.keyword && state.searchResultList.length > 0">
          <div
            class="search__list__item van-hairline--bottom"
            v-for="(item, index) in state.searchResultList"
            :key="index"
            v-html="highlightText(item.districtName, state.keyword)"
            @click="onSelectSearchItem(item)"
            @touchstart.passive="onTouchstart"
          ></div>
        </scroll-view>
      </template>
      <template #footer>
        <KyButton block @click="onConfirm" style="width: 100%">确定</KyButton>
      </template>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, nextTick, watch, computed } from 'vue'
import { showToast, PickerInstance } from '@order-public-sub-public/hooks/useShowToast'
import { debounce, cloneDeep } from 'lodash-es'
// 组件
import KyInput from '@order-public-sub-public/components/base/ky-input'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
// 方法
import { multilevelLinkage, hotCityNameList, mapAddressSearch } from '@order-public-sub-public/apis/address'
import highlightText from '@order-public-sub-public/utils/highlightText'
import { getValueOrEmpty } from '@order-public-sub-public/utils'
// 类型

import { ReactiveType, SelectSearchItem } from './types'

import { updateCommonDisabledScroll } from '@order-public-sub-public/hooks/address/useCommon'

defineOptions({
  name: 'area-address',
})

const optionHeightVh = ref('')
const visibleOptionNum = ref(6)
/**
 * @description: 兼容不同屏幕分辨率 地址联动展示不全场景
 * @return {*}
 */
const optionHeight = () => {
  const cWidth = window.innerWidth || document.documentElement.clientWidth
  const hHeight = window.innerHeight || document.documentElement.clientHeight
  // 高度优先 屏幕高度较小机型兼容（类型iPhone4）用使用px固定高度
  if (hHeight < 500) {
    optionHeightVh.value = '30px'
    visibleOptionNum.value = 3
    return
  } else if (hHeight < 610) {
    optionHeightVh.value = '40px'
    visibleOptionNum.value = 4
    return
  }

  let vw = '13vw'
  visibleOptionNum.value = 6
  if (cWidth > 700) {
    vw = '7vw'
    visibleOptionNum.value = 5
  } else if (cWidth > 600) {
    vw = '9vw'
  } else if (cWidth > 500) {
    vw = '11vw'
  } else {
    vw = '13vw'
  }
  optionHeightVh.value = vw
}

const state = reactive<ReactiveType>({
  show: false, // 弹窗
  keyword: '', // 搜索关键词
  selectedValues: [], // 选中的值
  searchResultList: [], // 搜索结果列表
  hotCityNameList: [], // 热门城市
  columns: [
    [{ districtID: '', districtName: '请选择' }],
    [{ districtID: '', districtName: '请选择' }],
    [{ districtID: '', districtName: '请选择' }],
  ],
})
const collumnsRes = ref([])

// 名字映射 districtName -> text  districtID -> value
const changeCollumns = (selectedData, collumnData) => {
  if (!collumnData?.[0]?.length) return []
  // 直接拿区数据
  const zone = cloneDeep(collumnData?.[2]?.map((item) => ({ text: item.districtName, value: item.districtID })))
  const city = cloneDeep(collumnData?.[1]?.map((item) => ({ text: item.districtName, value: item.districtID })))
  const province = cloneDeep(collumnData?.[0]?.map((item) => ({ text: item.districtName, value: item.districtID })))
  // 先处理市
  city.map((item) => {
    if (item.value === selectedData?.[1]) {
      item.children = zone
    } else {
      item.children = [{ value: '', text: '请选择' }]
    }
    return item
  })

  // 在处理省
  province.map((item) => {
    if (item.value === selectedData?.[0]) {
      item.children = city
    } else {
      item.children = [{ value: '', text: '请选择', children: [{ value: '', text: '请选择' }] }]
    }
  })

  return province
}

const emit = defineEmits(['onSelectSearchItem', 'onConfirm', 'getCurRef'])

// 触摸搜索列表需要隐藏软键盘
const searchRef = ref<InstanceType<typeof KyInput>>()
const onTouchstart = () => {
  if (searchRef.value) {
    searchRef.value.$el.querySelector('input').blur()
  }
}

/**
 * 打开弹窗
 * @param data
 */
const open = async (data: string[]) => {
  state.keyword = ''
  state.searchResultList = []
  state.show = true
  const [province, city, county] = data || []
  await updateSelection(province, 0, 'city')
  await updateSelection(city, 1, 'zone')
  setTimeout(async () => {
    await updateSelection(county, 2, 'district')
  }, 100)
  nextTick(async () => {
    // reportPerception('other_express_receiver_city_perception_v1')
  })
}

// 将文本转ID
const updateSelection = async (value: string, index: number, levelType: string) => {
  let values = state.columns[index]
  let indexInValues = values.findIndex((item) => item.districtName === value)

  if (indexInValues !== -1) {
    state.selectedValues[index] = values[indexInValues].districtID
    if (index !== 2) {
      // 请求下个级别的数据 省 -> 市
      await getMultilevelLinkageData({
        commonId: values[indexInValues].districtID,
        levelType,
      })
    }
    collumnsRes.value = changeCollumns(state.selectedValues, state.columns)
  }
}

/**
 * 选中搜索值
 */
const onSelectSearchItem = async (item: SelectSearchItem) => {
  const data = {
    province: getValueOrEmpty(item.province),
    city: getValueOrEmpty(item.city),
    county: getValueOrEmpty(item.county),
  }
  emit('onSelectSearchItem', data)
  state.show = false
  state.keyword = ''
}

/**
 * 选择城市
 * @param city
 */
const handleSelectHot = async (city: { provinceId: string; id: string }) => {
  const provinceParams = {
    commonId: city.provinceId,
    levelType: 'city',
  }
  const zoneParams = {
    commonId: city.id,
    levelType: 'zone',
  }
  // 选择热门城市需要重新获取省、区县的数据
  await getMultilevelLinkageData(provinceParams)
  await getMultilevelLinkageData(zoneParams)
  state.selectedValues = [city.provinceId, city.id, '']
  collumnsRes.value = changeCollumns(state.selectedValues, state.columns)
  setTimeout(() => {
    state.selectedValues = [city.provinceId, city.id, '']
  }, 200)
}

// 选择省市区
const onChange = (value: any) => {
  const index = value.columnIndex
  if (index >= 2) {
    return
  }
  state.selectedValues = value.selectedValue
  // 省为空, 重置城市和区县
  if (!state.selectedValues?.[0]) {
    state.selectedValues = ['', '', '']
    state.columns[1] = [{ districtID: '', districtName: '请选择' }]
  } else {
    state.columns[2] = [{ districtID: '', districtName: '请选择' }]
  }

  // 城市为空, 重置 区县
  if (!state.selectedValues?.[1]) {
    state.selectedValues[2] = ''
    state.columns[2] = [{ districtID: '', districtName: '请选择' }]
  }

  const params = {
    commonId: value.selectedValue?.[index],
    levelType: ['province', 'city', 'zone'][index + 1],
  }
  getMultilevelLinkageData(params)
}

/**
 * 搜索
 */

const onSearch = debounce(async (value: string) => {
  state.keyword = value
  if (!state.keyword || state.keyword?.length < 2) {
    state.searchResultList = []
    return false
  }

  try {
    const { data } = await mapAddressSearch({ keyword: state.keyword })
    state.searchResultList = data?.districtVOList || []
  } catch (error) {
    console.log('error', error)
  }
}, 300)

/**
 * 获取热门城市
 */
const getHotCityNameList = async () => {
  try {
    const { data } = await hotCityNameList()
    state.hotCityNameList = data || []
  } catch (error) {
    console.log('error')
  }
}

/**
 * 获取省市区数据
 */
const getMultilevelLinkageData = async (
  params = {
    commonId: '',
    levelType: 'province',
  },
) => {
  try {
    const { data } = await multilevelLinkage(params)
    const index = {
      province: 0,
      city: 1,
      zone: 2,
    }[data.districtLevel]

    const districtList = data.districtList || []
    state.columns[index as number] = [{ districtID: '', districtName: '请选择' }, ...districtList]
    state.selectedValues = state.selectedValues.map((item, i) => (i === index ? '' : item))
    collumnsRes.value = changeCollumns(state.selectedValues, state.columns)
  } catch (error) {
    console.log('error', error)
  }
}

const pickerRef = ref<PickerInstance>()
const onConfirm = () => {
  pickerRef.value?.handleConfirm()
}

const onPickerConfirm = (value) => {
  const [province, city, zone] = value?.selectedOptions || []

  if (!province?.value) {
    return showToast('请选择省份')
  } else if (!city?.value) {
    return showToast('请选择城市')
  } else if (!zone?.value) {
    return showToast('请选择区县')
  }

  emit('onConfirm', {
    province: getValueOrEmpty(province.text),
    city: getValueOrEmpty(city.text),
    county: getValueOrEmpty(zone.text),
  })
  state.show = false
}

const showComp = computed(() => state.show)
watch(showComp, (val) => {
  if (process.env.TARO_ENV === 'weapp') {
    if (val) {
      wx.setPageStyle({
        style: {
          overflow: 'hidden',
        },
      })
    } else {
      wx.setPageStyle({
        style: {
          overflowY: 'scroll',
        },
      })
    }
  } else if (process.env.TARO_ENV === 'alipay') {
    // if (val) {
    //   my.setPageScrollable({
    //     scrollable: false
    //   })
    // } else {
    //   my.setPageScrollable({
    //     scrollable: true
    //   })
    // }
  }
})

onMounted(() => {
  optionHeight()
  getHotCityNameList()
  getMultilevelLinkageData()
  setTimeout(() => {
    console.log(state.columns, 'kkkkkk')
  }, 2000)
})

defineExpose({ open })

const handleClose = () => {
  console.log(pickerRef.value, 'pickerRef.value')
  // pickerRef.value?.confirm()
  state.show = false
  updateCommonDisabledScroll()
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
