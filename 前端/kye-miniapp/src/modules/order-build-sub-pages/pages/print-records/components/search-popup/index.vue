<template>
  <ky-popup
    v-bind="$attrs"
    position="top"
    :duration="0"
    class="search-top-popup"
    @click-overlay="onClose"
    :style="{
      top: `0px`,
    }"
  >
    <!-- top: `${isALIPAY ? 0 : status.appHeaderHeight}px`, -->
    <!-- 内容 -->
    <view class="history-header">
      <KyImage
        class="history-header-back"
        src="https://ic-img.ky-express.com/netc/20250118_30166203715_!!1737183846496_80_80.png"
        @tap="onClose"
      />
      <view class="history-header-input">
        <ky-input
          v-bind="$attrs"
          placeholder="请输入运单号"
          :clearable="true"
          border
          v-model="keyword"
          autocomplete="off"
          ref="searchRef"
          @focus="inputFocus"
          @blur="inputFocusShow = false"
          @update:model-value="onKeyWordChange"
        >
          <template #left>
            <KyImage
              class="history-header-input-left-icon"
              src="https://ic-img.ky-express.com/netc/20250726_7430_!!1753512234972_64_64.png"
            />
          </template>
        </ky-input>
        <ky-button type="primary" size="small" class="history-header-input__button" @click="onConfirm">搜索</ky-button>
      </view>
    </view>

    <view class="container-search-box">
      <view :class="{ container__body: true, 'no-padding': noPadding }">
        <!-- 联想 -->
        <view class="display-type-link">
          <view class="display-type-link-header" v-if="waybillLink.length">联想搜索</view>
          <scroll-view scroll-y="true" class="display-type-link-content">
            <view
              class="display-type-link-content-item"
              v-for="(item, index) in waybillLink"
              :key="'0_' + index"
              @click="waybillClick(item)"
            >
              <KyImage
                class="display-type-link-content-item-icon"
                src="https://ic-img.ky-express.com/default/20250723_58160_!!1753276565459_64_64.png"
              />
              <view
                class="suggest-menu__waybill"
                v-html="highlightText(item.keyword, keyword ? keyword.toUpperCase() : '')"
              ></view>
              <ky-tag class="text-tag" size="5" bgColor="#fff" borderColor="#D3D5DB" textColor="#8C8F99">运单号</ky-tag>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </ky-popup>
</template>

<script setup lang="ts">
// import KyInput from '@order-public-sub-public/components/base/ky-input'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
// import { Field } from 'vant'
import { ref, onMounted } from 'vue'
import { getWaybillLinkResponse } from '@order-public-sub-public/apis/print/types'
import { getWaybillLinkList } from '@order-public-sub-public/apis'
import highlightText from '@order-public-sub-public/utils/highlightText'
import { debounce } from '@order-public-sub-public/utils'
import Taro from '@tarojs/taro'
import { useNavigationStatus } from '@/public/hooks/useNavigationStatus'
import KyImage from '@public/components/base/ky-image/index.vue'
// 判断当前是否是微信的环境
const isALIPAY: boolean = Taro.getEnv() === Taro.ENV_TYPE.ALIPAY
const status = useNavigationStatus()
interface PropsType {
  noPadding?: boolean
}
const keyword = ref('')
const props = withDefaults(defineProps<PropsType>(), {
  noPadding: false,
})
console.log(props)
const emit = defineEmits(['onClose', 'onConfirm'])
const onKeyWordChange = debounce(() => {
  handleChange(keyword.value)
}, 200)
/**
 * 关闭
 */
const onClose = () => emit('onClose')
const onConfirm = () => {
  emit('onConfirm', keyword.value)
}
const searchRef = ref<HTMLElement | null>(null)
const inputFocusShow = ref(false)
const waybillLink = ref<getWaybillLinkResponse[]>([])
const inputFocus = () => {
  inputFocusShow.value = true
}
const handleChange = async (value: string) => {
  const keyword = value?.replace(/\s+/g, '')
  if (!keyword) {
    waybillLink.value = []
    return
  }
  try {
    let res = await getWaybillLinkList({ keyword, pageSize: 10, clientType: '20', clientSearchType: '10' })
    const list = res.data.filter((item: getWaybillLinkResponse) => item?.keywordType === '10')
    waybillLink.value = list
  } catch (err) {
    console.log(err)
    waybillLink.value = []
  }
}
const waybillClick = (item: getWaybillLinkResponse) => {
  console.log(item, 'onClick')
  emit('onConfirm', item?.keyword)
}
onMounted(() => {
  console.log(999, searchRef)
  searchRef.value?.focus()
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
