<template>
  <BottomPopup
    @onClose="closePopup"
    :showFooter="false"
    v-model:show="popupVisible"
    title="委托书/取货凭证说明"
    :show-scrollbar="false"
  >
    <div :class="[styles['pickup-desc-img']]">
      <img
        :class="[styles['img']]"
        src="https://ic-img.ky-express.com/netc/20260105_41642_!!1767606721442_1404_680.png"
        alt=""
      />
    </div>
  </BottomPopup>
</template>

<script setup lang="ts">
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import { computed, ref } from 'vue'
import styles from './index.module.scss'

const props = withDefaults(
  defineProps<{
    show: boolean
  }>(),
  {
    show: false,
  },
)

const emits = defineEmits(['update:show'])

const popupVisible = computed({
  get() {
    return props.show
  },
  set(newValue) {
    emits('update:show', newValue)
  },
})

const closePopup = () => {
  popupVisible.value = false
}
</script>

<style lang="scss"></style>
