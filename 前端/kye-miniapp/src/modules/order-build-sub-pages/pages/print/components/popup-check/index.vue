<template>
  <ky-popup v-model:show="visible" :closeOnClickOverlay="false" safeAreaInsetBottom position="bottom">
    <view class="popup-check-header">
      <text>面单类型</text>
      <view class="kye-miniapp-waybill-popup-close-box" @tap="onClosed">
        <image
          class="kye-miniapp-waybill-popup-close"
          src="https://ic-img.ky-express.com/netc/20250726_41452_!!1753521106143_64_64.png"
        ></image>
      </view>
    </view>
    <div class="type">
      <div
        v-for="item in templateList"
        :key="item.type"
        @click="handleChangeTemplate(item)"
        :class="['type-item', { active: currentTemplateValue === item.type }]"
      >
        <div class="radio-content">
          <SvgIcon
            class="icon-radio radio-checked"
            name="radio-checked-round"
            v-show="currentTemplateValue === item.type"
          />
          <SvgIcon class="icon-radio radio-checked" name="radio-round" v-show="currentTemplateValue !== item.type" />
        </div>
        <div class="type-item-text">{{ item.typeName }}</div>
        <span class="type-item-desc">{{ item.typeNameDes }}</span>
      </div>
    </div>
  </ky-popup>
</template>

<script lang="ts" setup>
import { useModel, computed } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { templateList } from '../../hooks/state'
import { btnListType } from '../../hooks/type'
import { printerForm } from '../../hooks/useData'

interface PopupProps {
  visible?: boolean
}
const props = withDefaults(defineProps<PopupProps>(), {
  visible: false,
})

const currentTemplateValue = computed(() => {
  return printerForm.templateList.length > 0 ? printerForm.templateList[0].type : ''
})

const emits = defineEmits<{
  (event: 'change', item: btnListType[], val: btnListType): void
  (event: 'update:visible', visible: boolean): void
}>()

const visible = useModel(props, 'visible')

const handleChangeTemplate = (item: btnListType) => {
  emits('change', [item], item)
  onClosed()
}

const onClosed = () => {
  console.log('关闭')
  emits('update:visible', false)
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
