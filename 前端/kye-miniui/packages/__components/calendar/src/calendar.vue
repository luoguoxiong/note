<template>
  <!-- @update:show="closePopup" -->
  <!-- 透传所有插槽，包括具名插槽 -->
  <!-- <Popup
    v-if="props.popupable"
    v-model:show="props.show"
    :hideNode="props.hideNode"
    position="bottom"
    :safeAreaInsetTop="props.safeAreaInsetTop"
    :safeAreaInsetBottom="props.safeAreaInsetBottom"
    :contentStyle="{
      height: props.height,
    }"
    @clickOverlay="closePopup"
  >
    <CalendarItem v-bind="$attrs" v-on="$listeners" @select="select" @confirm="confirm">
      <template #footer-tips>
        <slot name="footer-tips" />
      </template>
    </CalendarItem>
  </Popup>
  <CalendarItem v-else v-bind="$attrs" v-on="$listeners" @select="select" @confirm="confirm">
    <template #footer-tips>
      <slot name="footer-tips" />
    </template>
  </CalendarItem> -->
  <component
    :is="props.popupable ? `ky-${props.popupType}` : 'view'"
    v-model:show="props.show"
    :hideNode="props.hideNode"
    position="bottom"
    :safeAreaInsetTop="props.safeAreaInsetTop"
    :safeAreaInsetBottom="props.safeAreaInsetBottom"
    :contentStyle="{
      height: props.height,
    }"
    @clickOverlay="closePopup"
  >
    <CalendarItem v-bind="$attrs" v-on="$listeners" @select="select" @confirm="confirm">
      <template #footer-tips>
        <slot name="footer-tips" />
      </template>
    </CalendarItem>
  </component>
</template>

<script lang="ts" setup name="ky-calendar">
import { ref, useSlots, provide, computed } from 'vue'
import CalendarItem from './calendar-item.vue'
import { CalendarProps } from './types'

const props = withDefaults(
  defineProps<
    Pick<
      CalendarProps,
      'popupable' | 'popupType' | 'show' | 'hideNode' | 'safeAreaInsetTop' | 'safeAreaInsetBottom' | 'height'
    >
  >(),
  {
    popupable: true,
    popupType: 'popup',
    show: false,
    hideNode: true,
    safeAreaInsetTop: false,
    safeAreaInsetBottom: false,
    height: '90vh',
  },
)

const emit = defineEmits(['update:show', 'close', 'select', 'choose', 'confirm'])
const slots = useSlots()

const showPopup = () => {}

const closePopup = () => emit('update:show', false)
const select = (value) => emit('select', value)
const confirm = (value) => {
  emit('confirm', value)
  closePopup()
}
provide('popupable', props.popupable)
provide('closePopup', closePopup)
</script>

<style scoped lang="scss">
.ky-calendar {
}
</style>
