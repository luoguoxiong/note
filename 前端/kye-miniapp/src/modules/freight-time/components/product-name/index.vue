<template>
  <ProductNameBus
    class="freight-time-product-name"
    :visible="true"
    :moduleStyle="'unfold'"
    @clickTips="handleClickTips"
    :source="'freightTime'"
  >
    <template #input>
      <view class="product-name-input" id="productInfo_goodsType" data-validate="productInfo.goodsType">
        <div class="product-name-input-content" id="productNameInputContent" @click.stop>
          <KyInput
            dataValidate="productInfo.goodsType"
            placeholder="请输入托寄物名称"
            :no-padding="true"
            show-border
            :enableNative="false"
            :modelValue="goodsType"
            :maxlength="64"
            :inputDebounce="platformInputDebounceTime"
            :clearable="true"
            @focus="onFocusGoodsType"
            @update:model-value="onGoodsTypeChange"
            @blur="handleGoodsTypeBlur"
            @input="handleGoodsInput"
            @confirm="handleGoodsConfirm"
            @clear="handleClearGoodsType"
            :formatter="formatterGoodsType"
            :isError="popoverConfig.content"
          >
            <template #right>
              <span v-if="isWxPcAppletEnv" class="product-name-ext"
                >{{ goodsType.length > 64 ? 64 : goodsType.length }}/64</span
              >
              <span v-else class="product-name-ext">{{ goodsType.length }}/64</span>
            </template>
          </KyInput>
        </div>
        <div class="product-name-link-content flex flex-column" v-show="linkContentVisible">
          <div class="product-name-link-content-tag">
            <div
              class="product-name-link-name flex items-center space-between"
              v-for="item in internalState.linkGoodsList"
              :key="item.goodsCode"
              @click="handleLinkGoods(item)"
            >
              <span
                class="font-level3 product-name-link-content-tag-name"
                v-html="highlightText(exceedLetter(item.goodsType, 10), goodsType)"
              ></span>
              <span class="font-level3 color-assist second_category">{{ exceedLetter(item.secondCategory, 7) }} </span>
            </div>
          </div>
          <div
            class="product-name-link-content-close font-level3 flex items-center justify-center"
            @click="handleCloseLinkGoods"
          >
            关闭
          </div>
        </div>
      </view>
    </template>
  </ProductNameBus>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onUnmounted } from 'vue'
import ProductNameBus from '@order-global-package-freight-time/components/business/product-name-bus/index.vue'
import { isWxPcAppletEnv } from '@/public/utils'
import { linkContentVisible, setLinkContentVisible } from '@freight-time/components/product-name/useState'
import type { LinkGoods } from './types'
import { debounce } from 'lodash-es'
import { MAX_DEBOUNCE_TIME, MIN_DELAY_TIME } from '@freight-time/constants'
import { isDesktopMiniprogram } from '@order-global-package-freight-time/utils/native'
import { getLinkGoods, getGoodsRestrictCheck } from '@freight-time/api/index'
import { useFreightTimeStore } from '@freight-time/store'
import { openURL } from '@/modules/webview/utils'
import KyInput from '@order-global-package-freight-time/components/base/ky-input-base/input.vue'
import highlightText from '@order-global-package-freight-time/utils/highlightText'
import { openValidateKey, closeValidateKey } from '@freight-time/components/product-name/useGoodsTypeValidate'
import { useValidate } from '@freight-time/validate/useValidate'
import { getEnvConfig } from '@/public/config'
import { reportOther } from '@freight-time/report'

const { platformInputDebounceTime } = getEnvConfig()

const store = useFreightTimeStore()

const { validateObj, removeValidateKey } = useValidate()

const popoverConfig = computed(() => {
  return validateObj['productInfo.goodsType'] || {}
})

const goodsType = computed({
  get: () => store.getGoodsType,
  set: (val: string) => store.setGoodsType(val),
})

interface InternalState {
  linkGoodsList: LinkGoods[]
}

const internalState: InternalState = reactive({
  linkGoodsList: [],
})

const isDesktopMiniprogramFlag = isDesktopMiniprogram()

const isKeyBoardConfirm = ref(false)

const onGoodsTypeChange = debounce((value: string) => {
  fetchLinkGoods(value)
}, MAX_DEBOUNCE_TIME)

const fetchLinkGoods = async (value: string) => {
  if (value) {
    const { data } = await getLinkGoods({ goodsType: value })
    if (data && data?.length > 0) {
      setLinkContentVisible(true)

      internalState.linkGoodsList = data
    } else {
      setLinkContentVisible(false)
      internalState.linkGoodsList = []
    }
  } else {
    // 清空输入框后，清空列表和隐藏浮层
    setLinkContentVisible(false)
    internalState.linkGoodsList = []
  }
}

const onFocusGoodsType = () => {
  // 关闭气泡
  closeValidateKey()
}

const handleGoodsTypeBlur = () => {
  onGoodsTypeBlur()

  reportOther('other_express_single_consignment_v1', {
    fill_goodsname: goodsType.value,
  })
}

const onGoodsTypeBlur = () => {
  setTimeout(async () => {
    if (isKeyBoardConfirm.value) {
      isKeyBoardConfirm.value = false
      return
    }
    // handleCloseLinkGoods()
    try {
      // 校验托寄物
      await remoteCheckGoodsType()
    } catch (error) {
      console.error(error)
    }
  }, MIN_DELAY_TIME)
}

const handleGoodsInput = (value: string) => {
  removeValidateKey('productInfo.goodsType')
  store.setGoodsType(value)
}

/* 键盘完成事件 */
const handleGoodsConfirm = (value) => {
  store.setGoodsType(value)

  // 键盘完成事件后不需要触发失焦里面的代码
  isKeyBoardConfirm.value = true
}

const handleLinkGoods = async (item) => {
  store.setGoodsType(item.goodsType)
  handleCloseLinkGoods()
}

const handleCloseLinkGoods = () => {
  setLinkContentVisible(false)
}

const handleClearGoodsType = () => {
  removeValidateKey('productInfo.goodsType')
  // pc端点击清空按钮的时候，没有真正的清空
  if (isDesktopMiniprogramFlag) {
    store.setGoodsType('')
  }
}

const remoteCheckGoodsType = async () => {
  let goodsType = store.getGoodsType
  if (goodsType) {
    const orderInfo = store.getOrderInfo
    const {
      data: { goodsRestrictResult },
    } = await getGoodsRestrictCheck({
      orderInfo,
      waybillSource: '10',
    })
    if (goodsRestrictResult && goodsRestrictResult?.key === 'productInfo.goodsType') {
      openValidateKey(goodsRestrictResult?.content || '')
    }
  }
}

const handleClickTips = () => {
  const url = '/netc-h5-tools-optimize/contraband/contraband.html#/?showSend=0'
  openURL(url, {
    needLogin: true,
  })
}

const exceedLetter = (item: string, number = 4) => {
  if (item?.length > number) {
    return item.substring(0, number) + '...'
  }
  return item
}

const formatterGoodsType = (value: string) => {
  let str = value
  str = str?.replace(/[\r\n]/g, '')
  str = str?.replace(/(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]|/g, '')
  return str?.trim().slice(0, 64)
}

onUnmounted(() => {
  // 关闭托寄物联想框
  handleCloseLinkGoods()
})
</script>
