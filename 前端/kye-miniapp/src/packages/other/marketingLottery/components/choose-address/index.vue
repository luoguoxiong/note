<template>
  <view class="address-popup" :style="{ visibility: show ? 'visible' : 'hidden' }">
    <view class="address-popup__bg" @click="onClose"></view>
    <view class="address-popup__warpper">
      <view class="header">
        <view class="left">公司地址</view>
        <view class="close" @click="onClose">
          <image src="https://erphostjs.kye-erp.com/crm/crm-marketing/wx-mini/icon_close.png"></image>
        </view>
      </view>
      <view class="content">
        <view class="search">
          <view class="search--left">
            <view class="search--search">
              <image src="https://erphostjs.kye-erp.com/crm/crm-marketing/wx-mini/icon_seach.png"></image>
            </view>
            <view class="search--input">
              <input 
                type="text" 
                :value="searchText" 
                @input="handleInputChange"
                placeholder="详细地址（例如xx街xx号xx）" 
                placeholder-style="color:#c8c9cc; font-size:28rpx" 
              />
            </view>
            <view v-if="searchText" class="search--clear" @click="handleClear">
              <image src="https://erphostjs.kye-erp.com/crm/crm-marketing/wx-mini/icon_clear.png"></image>
            </view>
          </view>
          <button class="search--right" :disabled="loading" @click="onSearch">确定</button>
        </view>
        <scroll-view 
          class="search-scroll-view" 
          :scroll-y="true"
          :enable-flex="true"
          :lower-threshold="50" 
          @scrolltolower="onScrollToLower"
        >
          <view class="search-list">
            <view 
              v-for="(item, index) in addressLikeList" 
              :key="'1' + index" 
              class="search-list--item" 
              @click="() => onSelect(item)"
            >
              <view class="title">
                <rich-text :nodes="item.districtNameHtml"></rich-text>
              </view>
              <view class="address">{{ item.address }}</view>
            </view>
            <view v-if="finished" class="search-list--no-more">没有更多了</view>
            <view v-if="loading" class="search-list--loading">加载中...</view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { ref, watch } from 'vue'
import Taro from '@tarojs/taro'
import MarketingLotteryAPI from '../../apis'

defineOptions({ name: 'ChooseAddress' })

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  select: [data: any]
}>()

// 状态
const searchText = ref('')
const addressLikeList = ref<any[]>([])
const finished = ref(false)
const loading = ref(false)

// 分页参数
let pageIndex = 1
const pageSize = 6
let resultList: any[] = []
let isLoadingMore = false  // 防止重复触发

// 重置数据
function resetData() {
  pageIndex = 1
  resultList = []
  addressLikeList.value = []
  finished.value = false
  isLoadingMore = false
}

// 防抖处理
let debounceTimer: any = null
function handleInputChange(e: any) {
  const value = e.detail.value
  searchText.value = value
  
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  debounceTimer = setTimeout(() => {
    if (value && value.length > 1) {
      resetData()
      getList(value)
    }
  }, 500)
}

// 清空搜索
function handleClear() {
  searchText.value = ''
}

// 搜索
function onSearch() {
  if (searchText.value && searchText.value.trim().length < 2) {
    return Taro.showToast({ icon: 'none', title: '地址需2个字起搜索，请重新输入' })
  }
  resetData()
  getList(searchText.value)
}

// 获取地址列表
async function getList(message: string) {
  if (!message) return
  
  loading.value = true
  try {
    const res = await MarketingLotteryAPI.mapPosition({
      message,
      pageSize,
      pageIndex
    })
    
    let list: any[] = []
    const responseData = res.data || res
    
    if (responseData && responseData.list) {
      list = responseData.list.map((item: any) => {
        item.doorNumber = item.keyword.substr(0, 50)
        item.companyAddr = `${item.province}${item.city}${item.district}${item.street}${item.doorNumber}`
        item.districtNameHtml = item.title.replace(
          new RegExp(message, 'g'),
          `<span style="color: #f6ad32">${message}</span>`
        )
        return item
      })
    }
    
    resultList = [...resultList, ...list]
    addressLikeList.value = resultList
    
    // 修复分页判断逻辑：当前已加载数量 >= 总数量，或者当前页没有数据
    const totalCount = responseData?.count || 0
    const hasNoData = !responseData || !responseData.list || responseData.list.length === 0
    finished.value = hasNoData
  } catch (error) {
    console.error('获取地址列表失败:', error)
    Taro.showToast({ icon: 'none', title: '获取地址失败' })
  } finally {
    loading.value = false
    isLoadingMore = false  // 重置加载状态
  }
}

// 滚动到底部加载更多
function onScrollToLower() {
  if (finished.value) {
    console.log('已经没有更多数据了')
    return
  }
  
  if (loading.value || isLoadingMore) {
    console.log('正在加载中，跳过本次请求')
    return
  }
  
  console.log('开始加载下一页，pageIndex:', pageIndex + 1)
  isLoadingMore = true
  ++pageIndex
  getList(searchText.value)
}

// 选择地址
function onSelect(item: any) {
  emit('select', item)
}

// 关闭弹窗
function onClose() {
  emit('close')
}

// 监听显示状态，重置数据
watch(() => props.show, (newShow) => {
  if (newShow) {
    console.log('地址弹窗打开，保持搜索文本:', searchText.value)
    // 不重置搜索文本，保持用户输入
    // resetData()
    pageIndex = 1
    resultList = []
    addressLikeList.value = []
    finished.value = false
    
    // 如果有搜索文本，自动重新搜索
    if (searchText.value && searchText.value.trim().length >= 2) {
      console.log('自动重新搜索:', searchText.value)
      getList(searchText.value)
    }
  }
})
</script>
