<template>
  <view class="ad-popup" v-if="popupInfo">
    <FirstPopup
      v-if="popupInfo?.areaStyleCode === 'MP_POPUP_001'"
      :qtPageCode="qtPageCode"
      :animationData="animationData"
      :maskStyle="maskStyle"
      :popupInfo="popupInfo"
      :selected="selected"
      @onClickBtn="onClickBtn"
      @onSelected="onSelected"
      @onCancel="onCancel"
    />
    <SecondPopup
      v-if="popupInfo?.areaStyleCode === 'MP_POPUP_002'"
      :qtPageCode="qtPageCode"
      :animationData="animationData"
      :maskStyle="maskStyle"
      :popupInfo="popupInfo"
      :selected="selected"
      @onClickBtn="onClickBtn"
      @onSelected="onSelected"
      @onCancel="onCancel"
    />
    <ThirdPopup
      v-if="popupInfo?.areaStyleCode === 'MP_POPUP_003'"
      :qtPageCode="qtPageCode"
      :animationData="animationData"
      :maskStyle="maskStyle"
      :popupInfo="popupInfo"
      :selected="selected"
      @onClickBtn="onClickBtn"
      @onSelected="onSelected"
      @onCancel="onCancel"
    />
  </view>
</template>

<script lang="ts" setup>
import Taro from '@tarojs/taro'
import { computed, ref } from 'vue'
import { confirmByUserAdv, reportEvent } from '../api'
import { IdetailList } from '../type'
import { usePopupCloseAnimation } from './hook'
import FirstPopup from './firstPopup.vue'
import SecondPopup from './secondPopup.vue'
import ThirdPopup from './thirdPopup.vue'
import { advertisementJump, getReportSorce } from '../utils'
import { EntrySectionProps } from './type'

// const popupInfo = ref<IdetailList>()

const props = defineProps<EntrySectionProps>()

const { animationData, maskStyle, updateCloseAnimationData } = usePopupCloseAnimation()

const selected = ref(false) // 是否不再提醒

const emits = defineEmits(['update:modelValue'])

const popupInfo = computed({
  get() {
    return props.modelValue
  },
  set(value?: IdetailList) {
    emits('update:modelValue', value)
  },
})

const onClickBtn = async (btnObj) => {
  if (popupInfo.value?.advertisementCode) {
    confirmByUserAdv({
      advertisementCodeList: [popupInfo.value?.advertisementCode],
      eventType: 1,
      buttonIndex: btnObj.buttonIndex,
      noLongerRemindFlag: selected.value ? 1 : 0,
      ...getReportSorce(),
    })
    reportEvent({
      adCodes: [popupInfo.value?.advertisementCode],
      eventType: popupInfo.value.areaStyleCode === 'MP_POPUP_001' ? 4 : 1,
      buttonName: btnObj.buttonText,
      ...getReportSorce(),
    })
    emits('update:modelValue', undefined)
    advertisementJump(btnObj)
  }
  selected.value = false
}

const onSelected = () => {
  selected.value = !selected.value
}

const closePopup = () => {
  if (
    popupInfo.value?.advertisementPopupDto.pushToStyle &&
    Taro.getCurrentPages().slice(-1)[0].route === 'pages/index/index'
  ) {
    updateCloseAnimationData('M2075').then(() => {
      emits('update:modelValue', undefined)
    })
  } else {
    emits('update:modelValue', undefined)
  }
  selected.value = false
}

const onCancel = async () => {
  if (popupInfo.value?.advertisementCode) {
    confirmByUserAdv({
      advertisementCodeList: [popupInfo.value?.advertisementCode],
      eventType: 2,
      noLongerRemindFlag: selected.value ? 1 : 0,
      ...getReportSorce(),
    })
    reportEvent({
      adCodes: [popupInfo.value?.advertisementCode],
      eventType: 2,
      ...getReportSorce(),
    })
    closePopup()
  }
}

const $closePopup = () => {
  emits('update:modelValue', undefined)
}

defineExpose({
  closePopup: $closePopup,
})
</script>

<style lang="scss">
.ad-popup {
  .text-content__p {
    margin: 0;
    padding: 0;
  }
  .text-content__ol {
    list-style-position: inside;
    padding-left: 0px;
    margin: 0;
  }
  .text-content__ul {
    list-style-position: inside;
    padding-left: 0px;
    margin: 0;
  }
  .ql-align-left {
    text-align: left;
  }
  .ql-align-center {
    text-align: center;
  }
  .ql-align-right {
    text-align: right;
  }
  .ql-indent-1 {
    padding-left: 2em;
  }
  .ql-indent-2 {
    padding-left: 4em;
  }
  .ql-indent-3 {
    padding-left: 6em;
  }
  .ql-indent-4 {
    padding-left: 8em;
  }
  .ql-indent-5 {
    padding-left: 10em;
  }
  .ql-indent-6 {
    padding-left: 12em;
  }
}
</style>
