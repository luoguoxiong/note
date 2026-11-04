<template>
  <div class="project-location" @click.stop v-if="visible">
    <div class="project-location-container">
      <!-- 区域/楼层 -->
      <div class="left" @click="open" v-if="areaVisible">
        <KyCell data-validate="sender.projectArea" class="area-name-pos" id="sender_projectArea">
          <template #title>
            <div class="placeholder" v-if="!areaText" :class="{ 'validate-error': popoverConfig?.content }">
              {{ areaPlaceholder }}
            </div>
            <div v-else class="area-number">{{ areaText }}</div>
          </template>
        </KyCell>
      </div>
      <div class="line" v-if="areaVisible && shopVisible"></div>
      <!-- 门牌号 -->
      <div class="project-location-right" v-if="shopVisible">
        <KyField
          data-validate="sender.projectNumber"
          class="house-number"
          :placeholder="housePlaceholder"
          clearable
          :maxlength="20"
          :inputDebounce="600"
          :enableWxNative="true"
          :modelValue="projectNumber"
          @onInput="onInput"
          @onBlur="onBlur"
        />
      </div>
    </div>

    <BottomPopup
      noPadding
      customClass="project-location-area-floor-popup"
      v-model:show="showPopup"
      :title="popupTitle"
      @onConfirm="onConfirm"
      @onClose="showPopup = false"
    >
      <AreaFloor :areaList="areaList" :areaLabel="areaLabel" :floorLabel="floorLabel"></AreaFloor>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
// 组件
import KyField from '@order-public-sub-public/components/base/ky-field/index.vue'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import AreaFloor from '../components/area-floor/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import {
  selectValue,
  areaList,
  showPopup,
  areaValue,
  areaText,
  locationValue,
  projectNumber,
  visible,
  areaVisible,
  shopVisible,
  areaLabel,
  floorLabel,
  areaPlaceholder,
  housePlaceholder,
  popupTitle,
  sendExtend,
} from '../hooks/state'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { remoteCheckData, updateOrderByType } from '../hooks/useUpdate'
import { computed } from 'vue'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
import { debounce } from 'lodash-es'
import { getEnvConfig } from '@/public/config'
// import { closeTippy, resetErrorClassByDom } from '@order-public-sub-public/validate/effect/effectBubble'
const { validateObj, removeValidateKey } = globalUseValidate()
const { platformInputDebounceTime } = getEnvConfig()

const onInput = debounce((value: string) => {
  updateOrderByType({
    data: {
      ...sendExtend.value,
      projectNumber: value || '',
    },
  })
}, platformInputDebounceTime)

const popoverConfig = computed(() => {
  return validateObj['sender.projectArea' as keyof validateObj] || {}
})

const onBlur = () => {
  remoteCheckData('sender.projectNumber')
}

const open = () => {
  selectValue.value = [
    areaValue.value || areaList.value?.[0]?.value || '',
    locationValue.value || areaList.value?.[0]?.locationList?.[0]?.value || '',
  ]
  showPopup.value = true
  removeValidateKey('sender.projectArea')
  // resetErrorClassByDom([{ key: 'sender.projectArea', passed: true, content: '' }])
  // closeTippy()
}

const close = () => {
  showPopup.value = false
}

const onConfirm = () => {
  if (!selectValue.value[0]) {
    showToast(`请选择${areaLabel.value}/${floorLabel.value}`)
    return
  }
  updateOrderByType({
    data: {
      projectNumber: projectNumber.value || '',
      projectArea: selectValue.value[0],
      projectLocation: selectValue.value[1],
    },
  })
  close()
  remoteCheckData('sender.projectArea')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
