<template>
  <div
    class="custom-encode-select"
    :data-validate="`kaCustomerMap.customerFieldValue.${info.kyField}`"
    :id="`kaCustomerMap_customerFieldValue_${info.kyField}`"
  >
    <div class="product-name-input-content">
      <KyInput
        :data-validate="`kaCustomerMap.customerFieldValue.${info.kyField}`"
        :placeholder="getPlaceholder"
        :no-padding="true"
        show-border
        v-model="inputTextInfo.msg"
        clearable
        @focus="onFocusInputText"
        @update:model-value="onInputTextChange"
        @blur="handleInputBlur"
        @onClearInput="onClearInput"
        @confirm="handleConfirm"
        @input="handleGoodsInput"
        :cursor-spacing="200"
        ref="kyInputRef"
        :always-system="true"
        :enableWxNative="true"
        :inputDebounce="600"
      >
        <template #right v-if="!contentVisible || !isInFocus">
          <SvgIcon class="down-icon-box" name="down-icon" @click="toFoucsInput"></SvgIcon>
        </template>
      </KyInput>
    </div>
    <div class="product-name-link-content flex flex-column" v-if="contentVisible && isInFocus">
      <scroll-view
        class="product-name-link-content-tag"
        :scroll-y="true"
        :scroll-into-view="scrollIntoId"
        scroll-with-animation
        v-if="selectList.length"
        ref="contentListRef"
      >
        <view
          class="product-name-link-name flex items-center space-between"
          v-for="item in selectList"
          :key="item.code"
          :id="`encode_item_${item.code}`"
          @click="handleSelectItem(item)"
        >
          <text
            class="font-level3 product-name-link-content-tag-name"
            v-html="highlightText(item.msg, inputTextInfo.msg ?? '')"
          ></text>
        </view>
        <div class="no-more" v-if="selectList.length >= 10">
          <div>没有更多了~</div>
        </div>
      </scroll-view>
      <kyEmpty
        v-else
        style="padding: 0; padding-bottom: 10px"
        :type="EmptyTypeEnum.CUSTOM"
        :custom-config="{
          image: 'https://ic-img.ky-express.com/netc/20250619_5081_!!1750313034323_560_560.png',
          description: '未找到相关结果',
        }"
      ></kyEmpty>
      <div class="product-name-link-content-close font-level3 flex items-center justify-center" @click="handleClosePop">
        关闭
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import KyInput from '@order-public-sub-public/components/base/ky-input'
import { ref, computed, onMounted, nextTick } from 'vue'
// import highlightText from '@/utils/highlightText'
import highlightText from '@order-public-sub-public/utils/highlightText'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import { EmptyTypeEnum, MIN_DELAY_TIME } from '@order-public-sub-public/constants'
import { isDesktopMiniprogram } from '@order-public-sub-public/utils/native'
import { kaCustomerMapItem, customerFieldDetailListType } from '@order-public-sub-public/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { hideKeyboardUtil } from '@order-public-sub-public/utils/common'
import { useDidHide } from '@tarojs/taro'
import { debounce } from 'lodash-es'
import { getEnvConfig } from '@/public/config'

const isDesktopMiniprogramFlag = isDesktopMiniprogram()

interface IProps {
  info: kaCustomerMapItem
}

const props = defineProps<IProps>()

const contentListRef = ref<HTMLDivElement | null>(null)

const emit = defineEmits(['toggle'])

let blurTimeout: any = null

const inputTextInfo = ref<Partial<customerFieldDetailListType>>({})
const tempInputTextInfo = ref<Partial<customerFieldDetailListType>>({})

onMounted(() => {
  let tempInfoMap = props.info.customerFieldDetailList?.find(
    (v: customerFieldDetailListType) => v.msg === props.info.customerFieldValue,
  )

  // 如果返回的不是空
  if (props.info?.customerFieldValue) {
    // 如果返回的值 不在列表中，需要往列表中添加一个数据
    if (!tempInfoMap) {
      let tempMap: customerFieldDetailListType = {
        msg: props.info.customerFieldValue,
        code: 999,
      }
      inputTextInfo.value = { ...tempMap }
      tempInputTextInfo.value = { ...tempMap }
      selectList.value.push(tempMap)
    } else {
      inputTextInfo.value = { ...tempInfoMap }
      tempInputTextInfo.value = { ...tempInfoMap }
    }
  }
})

const isInFocus = ref(false)

const contentVisible = ref(false)

const selectList = ref<customerFieldDetailListType[]>(props.info.customerFieldDetailList ?? [])

const scrollIntoId = ref('')

const initSelectList = () => {
  selectList.value = [...(props.info.customerFieldDetailList! ?? [])]
}

const onInputTextChange = (value: string) => {
  // 如果清空了
  if (!value) {
    inputTextInfo.value = {}
    tempInputTextInfo.value = {}
    emit('toggle', {})
  }
  selectList.value = props.info.customerFieldDetailList!.filter((v: customerFieldDetailListType) => {
    return v.msg.includes(value)
  })
}

const toBlur = () => {
  if (tempInputTextInfo.value?.msg && inputTextInfo.value?.msg) {
    inputTextInfo.value = { ...tempInputTextInfo.value }
  } else if (!inputTextInfo.value?.msg || !tempInputTextInfo.value?.msg) {
    // 如果清空输入框了 都置空
    inputTextInfo.value = {}
    tempInputTextInfo.value = {}
    emit('toggle', {})
  }
  setTimeout(() => {
    contentVisible.value = false
    isInFocus.value = false
  }, MIN_DELAY_TIME)
}

const handleInputBlur = () => {
  // 只有电脑小程序才需要延迟处理blur，正常不需要
  blurTimeout = setTimeout(
    () => {
      toBlur()
    },
    isDesktopMiniprogramFlag ? 200 : 100,
  )
}

const formatterInputText = (value: string) => {
  let str = value
  str = str.replace(/[\r\n]/g, '')
  str = str.replace(/(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]|/g, '')
  return str.trim()
}

const onFocusInputText = () => {
  if (blurTimeout) {
    clearTimeout(blurTimeout)
    blurTimeout = null
  }
  clickSelectItem()
  initSelectList()
  isInFocus.value = true
  contentVisible.value = true
  nextTick(() => {
    let index = selectList.value.findIndex((v: customerFieldDetailListType) => v.msg === inputTextInfo.value.msg)
    if (index !== -1) {
      contentListRef.value?.scrollTo({
        // 计算滚动的高度 100px item的高度 (100 / 2 / 37.5) 转成rem逻辑
        // 乘以根节点 计算 px值
        top: (index - 1) * (100 / 2 / 37.5) * parseFloat(document.documentElement.style.fontSize),
        left: 0,
      })
    }
  })
}

const onClearInput = () => {
  inputTextInfo.value = {}
  tempInputTextInfo.value = {}
  emit('toggle', {})
}

const handleSelectItem = (item: customerFieldDetailListType) => {
  inputTextInfo.value = { ...item }
  tempInputTextInfo.value = { ...item }
  console.log(inputTextInfo.value, item, 'inputvalue')
  contentVisible.value = false
  isInFocus.value = false
  emit('toggle', inputTextInfo.value)
}

const handleClosePop = () => {
  contentVisible.value = false
}

const getPlaceholder = computed(() => {
  return !inputTextInfo.value.msg && contentVisible.value ? '搜索' : `请选择${props.info.customerFieldName}`
})

let kyInputRef = ref<HTMLElement | null | any>()
const toFoucsInput = () => {
  setTimeout(() => {
    if (kyInputRef.value && kyInputRef.value.inputRef) {
      kyInputRef.value.inputRef.focus()
    }
  }, 150)
}
// ios 点击键盘完成
const handleConfirm = () => {
  // 和H5保持一致 ios点击键盘完成，关闭键盘
  hideKeyboardUtil()
}

const { platformInputDebounceTime } = getEnvConfig()

/* 输入实时内容处理 */
const handleGoodsInput = (value) => {
  _onFormatter(value)
}
/* 格式化数据 */
const _onFormatter = debounce((value) => {
  if (formatterInputText && inputTextInfo.value) {
    inputTextInfo.value.msg = formatterInputText(value)
  }
}, platformInputDebounceTime)

/**
 * 点击选中选择列表里面的元素 需要定位到选择的item
 */
const clickSelectItem = () => {
  setTimeout(() => {
    scrollIntoId.value = ''
    const item =
      selectList.value.find((v: any) => v.msg === inputTextInfo.value.msg) || ({} as customerFieldDetailListType)
    if (item?.code) {
      scrollIntoId.value = 'encode_item_' + item.code
    }
  }, 200)
}
useDidHide(() => {
  contentVisible.value = false
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
