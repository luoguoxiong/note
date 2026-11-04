<template>
  <div class="waybill-wrap" id="waybill-wrap">
    <div class="input-content" ref="refInputBox">
      <div class="input-div" @click="showPopover">
        <!-- <span v-if="divInputList.length === 0">
          运单号/手机号/寄收人姓名/自定义编码/托寄物/寄收公司/寄收城市/标签/封装号/签回联
        </span> -->
        <el-carousel
          v-if="divInputList.length === 0"
          height="32px"
          direction="vertical"
          :autoplay="true"
          arrow="never"
          indicator-position="none"
          :interval="2000"
        >
          <el-carousel-item v-for="item in noticeItems" :key="item.text" @click="setPlaceholder(item.text)">
            <div class="placeholder-content">
              <div class="text">{{ item.text }}</div>
              <div class="icon">{{ item.iconText }}</div>
            </div>
          </el-carousel-item>
        </el-carousel>
        <div class="waybill-item" v-for="(item, index) in divInputList" :key="item + '$' + index">
          {{ item }}
          <div class="remove">
            <img :src="`./svg/close.svg`" alt="" @click.stop="removeItem(item, index)" srcset="" />
          </div>
        </div>

        <div class="clear-all" v-show="divInputList.length > 0">
          <img :src="`./svg/close2.svg`" alt="" @click.stop="removeAll" srcset="" />
        </div>
      </div>
      <el-popover
        :teleported="false"
        :show-arrow="false"
        :visible="showContent"
        popper-class="input-body"
        virtual-triggering
      >
        <div class="input-inner">
          <el-input
            v-model="refVal"
            @input="inputHandler"
            type="textarea"
            :placeholder="placeholder"
            @focus="getHistoryData"
            :spellcheck="false"
            ref="refTextArea"
            :autosize="true"
          ></el-input>
          <div style="height: 26px"></div>
          <div class="tip">
            <span v-show="!isOverMaxSearchLen">最多可查询{{ WAYBILLMAXSEARCHMAXLEN }}票，以逗号，空格或回车键隔开</span>
            <span v-show="isOverMaxSearchLen" class="over-text" style="color: #ff8c00">
              最多可查询{{ WAYBILLMAXSEARCHMAXLEN }}票运单</span
            >
            <span class="to-empty" v-show="refVal.length > 0" @click="clearInput">一键清空</span>
          </div>
        </div>
        <WaybillHistory
          :data="historys"
          @to-history="toHistory"
          @to-hot="toHot"
          @clear-history="clearHistory"
          v-if="refVal.length === 0"
        ></WaybillHistory>
        <WaybillSuggest
          v-if="refVal.length > 0 && currentSearchVal.length > 1 && suggests.length > 0"
          :data="suggests"
          :type="suggestType"
          :keyword="currentSearchVal"
          @select-suggest="onSelect"
          @select-app="handleSelectApp"
        ></WaybillSuggest>
      </el-popover>
    </div>

    <KButton type="primary" @click="toSearch">
      <img :src="`./svg/search.svg`" :style="{ width: '14px', marginRight: '4px' }" alt="" />
      搜索</KButton
    >
  </div>
  <!-- 联系商务 -->
  <CommonContact v-if="showBusiness" :visible="showBusiness" :isExclusive="isExclusive" @close="handleClose" />
</template>

<script setup lang="ts">
import { KButton } from '@netc-design-pc/ui'
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { searchHistoryLimit, searchHistoryDelete, getWaybillListNew } from '@/apis'
import { applicationInfoVO, WaybillHistoryIn, WaybillListRes } from '@/apis/home/types'
import WaybillHistory from './waybill-history/index.vue'
import WaybillSuggest from './waybill-suggest/index.vue'
import CommonContact from '@/components/side-navigation/common-contact.vue'
import {
  processAndFormatString,
  getArrayRemoveIndex,
  removeArrayItemByIndex,
  removeAfternthCommaOrNewline,
  getSearchByCursorPosition,
  replaceStringSection,
} from './word'
import { locationRouteV2, parentMessageSend } from '@/utils/appBridge'
import { SessionStorageManager } from '@/utils/storageManager'
import { debounce } from 'lodash-es'
import { baseReportInstance } from '@/reportUmp'
import { uuid } from '@/utils'
import { useHomeStore } from '@/hooks'

const { isExclusive } = useHomeStore()
const COMMA = ','
const WAYBILLMAXSEARCHMAXLEN = 100
// 是否展示输入框
const showContent = ref(false)

// 输入框祖先节点
const refInputBox = ref()

// 文本输入框节点
const refTextArea = ref()

// 文本输入框值
const refVal = ref('')

// 当前查询的关键字
const currentSearchVal = ref('')

// 记录光标坐在位置
const cursorPositionIndex = ref(0)

const historys = ref<WaybillHistoryIn[]>([])

const suggests = ref<WaybillListRes[] | applicationInfoVO[]>([])

const suggestsMap = ref<Map<string, WaybillListRes>>(new Map())

const suggestType = ref<'WAYBILL' | 'APPLICATION'>('WAYBILL')

const placeholder = ref('运单号/手机号/寄收人姓名/自定义编码/托寄物/寄收公司/寄收城市/标签/封装号/签回联')

// 是否超出最大查询范围
const isOverMaxSearchLen = ref(false)

const noticeItems = ref([
  {
    text: '输入单号, 秒查物流轨迹',
    iconText: '极速查',
  },
  {
    text: '试试搜: 查询网点、时效运费',
    iconText: '帮您找',
  },
  {
    text: '试试搜: 帮我查到北京的快件',
    iconText: '秒懂您',
  },
])

const showBusiness = ref(false)

const searchIntentionMap = new Map<number, string>([
  [0, '网点查询'],
  [1, '违禁品查询'],
  [2, '联系商务'],
  [3, '查件'],
  [4, '支付开票'],
  [5, '人工客服'],
  [6, '运费时效'],
  [7, '其他意图'],
  [8, '下单'],
  [9, '实名认证'],
])

const getSearchIntention = (intentType?: number) => {
  if (typeof intentType !== 'number') return '其他意图'
  return searchIntentionMap.get(intentType) || '其他意图'
}

const getSearchResultIntention = (applicationInfoList: applicationInfoVO[], waybillLinkList: WaybillListRes[]) => {
  if (applicationInfoList.length) return getSearchIntention(applicationInfoList[0]?.intentType)
  if (waybillLinkList.length) return '查件'
  return '其他意图'
}

const reportSearchKeyword = (keyword: string, searchIntention = '其他意图') => {
  baseReportInstance.add('work_id', uuid())
  window.$umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_homepage_search_keyword',
      region_code: 'search_bar',
    },
    {
      region_name: '搜索栏',
      page_code: 'page_homepage_v1',
      event_name: '客户端首页_搜素框_输入关键字',
      search_keyword: keyword,
      search_intention: searchIntention,
      work_id: baseReportInstance.get('work_id'),
    }
  )
}

const handleClose = () => {
  showBusiness.value = false
}

const setPlaceholder = (item: string) => {
  placeholder.value = item
}

const showPopover = () => {
  showContent.value = true
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_search_bar_trigger_cursor_v1',
    },
    {
      region_code: 'search_bar',
    }
  )
}

const clearInput = () => {
  refVal.value = ''
  isOverMaxSearchLen.value = false
  nextTick(() => {
    refTextArea.value.focus()
  })
}

const linkToSearch = (searchData: WaybillListRes[]) => {
  SessionStorageManager.save('searchValue', searchData)
  sessionStorage.setItem('click_id', baseReportInstance.get('click_id'))

  // todo跳转到运单查询
  locationRouteV2.push({
    path: '/admin/waybill-v3',
    query: {
      source: 'homePage',
      needQuerySave: 'false',
      pre_click_id: baseReportInstance.get('click_id'),
    },
  })
}
const toHistory = (history: WaybillHistoryIn) => {
  refVal.value = history.searchKey
  linkToSearch([
    {
      keyword: history.searchKey,
      keywordType: history.searchType,
    },
  ])
  showContent.value = false
  // todo跳转到运单查询
}

const toHot = (path: string) => {
  locationRouteV2.push({
    path: path,
    query: {
      needQuerySave: 'false',
      pre_click_id: baseReportInstance.get('click_id'),
    },
  })
  showContent.value = false
}

const clearHistory = async () => {
  try {
    const { code } = await searchHistoryDelete()
    if (code === 0) {
      historys.value = []
    }
  } catch (error) {
    console.log(error)
  }
}

const inputHandler = debounce(async (nextValue: string) => {
  // 记录当前光标位置
  const cursorPosition = refTextArea.value.ref.selectionStart
  cursorPositionIndex.value = cursorPosition
  // 判断是否输入溢出自动换行
  // const curHeight = refTextArea.value.ref.scrollHeight
  // if (nextValue[nextValue.length - 1] !== '\n' && refTextAreaLastHeight.value < curHeight) {
  //   // 如果最后一个输入字符是逗号，则截取倒数第二个逗号的位置插入换行符
  //   if (nextValue[nextValue.length - 1] === COMMA) {
  //     const lastSecond = getSecondLastCommaIndex(nextValue)
  //     const str = nextValue.substring(0, lastSecond + 1)
  //     const str2 = nextValue.substring(lastSecond + 1, nextValue.length)
  //     nextValue = str + '\n' + str2
  //   } else {
  //     const lastCommaIndex = nextValue.lastIndexOf(COMMA)
  //     const lastBackIndex = nextValue.lastIndexOf('\n')
  //     // 如果上次输入的逗号位置，比回车靠后，则拼接字符串
  //     if (lastCommaIndex > lastBackIndex) {
  //       const str = nextValue.substring(0, lastCommaIndex + 1)
  //       const str2 = nextValue.substring(lastCommaIndex + 1, nextValue.length)
  //       nextValue = str + '\n' + str2
  //     }
  //   }
  // }
  // refTextAreaLastHeight.value = refTextArea.value.ref.scrollHeight

  // 按照规则格式化
  nextValue = processAndFormatString(nextValue)

  const { isOver100, newString } = removeAfternthCommaOrNewline(nextValue, WAYBILLMAXSEARCHMAXLEN)

  isOverMaxSearchLen.value = isOver100

  // currentSearchVal.value = lastElement

  // 由于操作了用户输入的内容，系统光标会回到末尾，所以需要记录操作位置，并回到初始位置
  refVal.value = newString

  const [left, right] = getSearchByCursorPosition(newString, cursorPosition)
  currentSearchVal.value = newString.substring(left, right)
  if (currentSearchVal.value.length < 2) {
    reportSearchKeyword(newString)
  }
  setTimeout(() => {
    refTextArea.value.ref.focus()
    refTextArea.value.ref.setSelectionRange(cursorPosition, cursorPosition)
  }, 0)
}, 500)

const onSelect = (Wabillkeyword: WaybillListRes) => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_home_searchresult_v1',
      region_code: 'search_bar',
    },
    {
      region_name: '搜索栏',
      page_code: 'page_homepage_v1',
      event_name: '客户端首页_首页搜素栏搜索结果_点击',
      clk_content: Wabillkeyword.keyword,
      type_name: '猜你想找',
      work_id: baseReportInstance.get('work_id'),
    }
  )
  suggestsMap.value.set(Wabillkeyword.keyword, Wabillkeyword)
  const [left, right] = getSearchByCursorPosition(refVal.value, cursorPositionIndex.value)
  const newString = replaceStringSection(refVal.value, left, right, Wabillkeyword.keyword)
  refVal.value = newString
  suggests.value = []
  refTextArea.value.focus()
}

const handleSelectApp = (item: applicationInfoVO) => {
  suggests.value = []
  showContent.value = false
  const { keywordCode } = item
  if (keywordCode === 'contact') {
    showBusiness.value = true
    return
  }
}

const removeAll = () => {
  refVal.value = ''
  isOverMaxSearchLen.value = false
}

const removeItem = (item: string, index: number) => {
  const removeItemCount = getArrayRemoveIndex(divInputList.value, item, index)
  const textareaArr = refVal.value.split('\n').map((item) => item.split(COMMA))
  const newArray = removeArrayItemByIndex(textareaArr, item, removeItemCount)
  refVal.value = processAndFormatString(newArray.map((item) => item.join(COMMA)).join('\n'))
}

// 监听window节点，判断点击的是否在输入框祖先节点内
const handleClick = (e: Event) => {
  if (showContent.value) {
    const clickedElement = e.target
    if (!refInputBox.value.contains(clickedElement)) {
      showContent.value = false
    }
  }
}

const getHistoryData = async () => {
  try {
    const { code, data } = await searchHistoryLimit()
    if (code === 0) {
      historys.value = data
    }
  } catch (error) {
    console.log(error)
  }
}

const toSearch = () => {
  if (divInputList.value.length > 100) {
    parentMessageSend.warning('最多可查询100票运单')
    return
  }
  const searchList = divInputList.value.map((item) => {
    return {
      keyword: item,
      keywordType: `${suggestsMap.value.has(item) ? suggestsMap.value.get(item)?.keywordType : 30}`,
    }
  })
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_search_bar_button_v1',
    },
    {
      region_code: 'search_bar',
      region_name: '搜索栏',
      page_code: 'page_homepage_v1',
      event_name: '客户端首页_搜索按钮_点击',
      clk_content: searchList.map((i) => i.keyword).join(','),
      type_name: '搜索',
      work_id: baseReportInstance.get('work_id'),
    }
  )
  if (refVal.value.length === 0) {
    parentMessageSend.warning('请输入运单号/手机号/寄收人姓名/自定义编码/托寄物/寄收公司/寄收城市/标签/封装号/签回联')
  } else {
    linkToSearch(searchList)
  }
}

// 输入的运单号数组
const divInputList = computed(() => {
  return refVal.value.split(/[,\n]+/).filter(function (item) {
    return item.trim() !== ''
  })
})

// 如果展示textarea，自动获取焦点
watch([showContent], () => {
  if (showContent.value) {
    setTimeout(() => {
      refTextArea.value.focus()
      const textAreaValueLen = refTextArea.value.ref.value.length
      refTextArea.value.ref.setSelectionRange(textAreaValueLen, textAreaValueLen)
    }, 0)
  }
})

// 监听输入框的搜索值
watch(currentSearchVal, async (newVal, oldVal) => {
  if (newVal !== oldVal && newVal !== '' && newVal.length >= 2) {
    suggests.value = []
    try {
      const { code, data } = await getWaybillListNew({
        keyword: newVal,
        pageSize: 10,
        clientType: 10,
        clientSearchType: 10,
      })
      if (code === 0) {
        const { applicationInfoList, waybillLinkList } = data
        reportSearchKeyword(newVal, getSearchResultIntention(applicationInfoList, waybillLinkList))
        if (applicationInfoList.length) {
          suggests.value = applicationInfoList
          suggestType.value = 'APPLICATION'
        } else if (waybillLinkList.length) {
          suggests.value = waybillLinkList
          suggestType.value = 'WAYBILL'
        }
        if (waybillLinkList.length) {
          window.$umpOtherReport(
            'OTHER',
            {
              eventCode: 'clk_home_searchfor_v1',
              region_code: 'search_bar',
            },
            {
              region_name: '搜索栏',
              page_code: 'page_homepage_v1',
              event_name: '客户端首页_首页搜素栏搜索结果_查看',
              search_result: waybillLinkList
                .slice(0, 5)
                .map((item) => item.keyword)
                .join(','),
            }
          )
        }
      } else {
        reportSearchKeyword(newVal)
      }
    } catch (error) {
      reportSearchKeyword(newVal)
      console.log(error)
    }
  }
})

onMounted(() => {
  document.addEventListener('mousedown', handleClick)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClick)
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>

<style lang="scss">
@import './el-reset.scss';
</style>
