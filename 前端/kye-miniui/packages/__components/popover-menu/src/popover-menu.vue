<template>
  <div class="ky-popover-menu">
    <Popover
      theme="light"
      v-model:show="popoverShow"
      :location="currentLocation"
      :offset="props.offset"
      v-bind="$attrs"
    >
      <template #reference>
        <div class="ky-popover-menu__dropdown" @click="togglePopover">
          <slot name="reference">
            <span class="ky-popover-menu__dropdown-text">更多</span>
            <img
              src="https://ic-img.ky-express.com/netc/20250115_64672831185_!!1736928997813_48_48.png"
              :class="['ky-popover-menu__dropdown-icon', { reversal: popoverShow }]"
            />
          </slot>
        </div>
      </template>
      <template #content>
        <div v-if="props.useButton" class="ky-popover-menu__list">
          <KyButton
            v-for="(menu, index) in props.menus"
            :key="`ky-popover-menu__list-item_${index}_${menu.label}`"
            :id="menu?.id"
            :open-type="menu?.openType"
            class="ky-popover-menu__list-itemBtn"
            @click="chooseMenu(menu)"
          >
            <img v-if="menu.icon" :src="menu.icon" class="ky-popover-menu__list-itemBtn-icon" />
            <span class="ky-popover-menu__list-itemBtn-text">{{ menu.label }}</span>
          </KyButton>
        </div>
        <div v-else class="ky-popover-menu__list">
          <div
            v-for="(menu, index) in props.menus"
            :key="`ky-popover-menu__list-item_${index}_${menu.label}`"
            class="ky-popover-menu__list-item"
            @click="chooseMenu(menu)"
          >
            <img v-if="menu.icon" :src="menu.icon" class="ky-popover-menu__list-item-icon" />
            <span class="ky-popover-menu__list-item-text">{{ menu.label }}</span>
          </div>
        </div>
      </template>
    </Popover>
  </div>
</template>

<script lang="ts" setup name="ky-popover-menu">
import { ref, computed } from 'vue'
import Popover from '@ky-miniui-lib/popover'
import KyButton from '@ky-miniui-lib/button'
import { PopoverMenuProps } from './types'

// const locations = [
//   "bottom",
//   "top",
//   "left",
//   "right",
//   "top-start",
//   "top-end",
//   "bottom-start",
//   "bottom-end",
//   "left-start",
//   "left-end",
//   "right-start",
//   "right-end",
// ]

const props = withDefaults(defineProps<PopoverMenuProps>(), {
  location: 'bottom-start',
  offset: [0, 10],
  useButton: false,
  menus: [],
})

const currentLocation = computed(() => props.location)

const emit = defineEmits(['chooseMenu'])

const popoverShow = ref(false)

const togglePopover = () => {
  // 打开前需要判断一下元素位置来设置弹窗的方向
  if (!popoverShow.value) {
    //
  }
  popoverShow.value = !popoverShow.value
}

const chooseMenu = (menu) => {
  const { type } = menu
  emit('chooseMenu', type, menu)
  togglePopover()
}

const closePopover = () => {
  popoverShow.value = false
}

defineExpose({
  closePopover,
})
</script>

<style lang="scss">
.ky-popover-menu {
  .ky-popover-box {
    padding: 0;
  }

  &__dropdown {
    display: flex;
    align-items: center;

    &-text {
      font-size: 24px;
      line-height: 34px;
      color: #24262b;
      margin-right: 4px;
    }

    &-icon {
      height: 24px;
      width: 24px;
      transition: transform 0.3s ease;

      &.reversal {
        transform: rotate(-180deg);
      }
    }
  }

  &__list {
    &-itemBtn {
      border: none;
      height: auto;

      .ky-button__wrap .ky-button__text {
        display: flex;
        align-items: center;

        .ky-popover-menu__list-itemBtn-icon {
          margin-right: 12px;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
        }
      }
    }

    &-item,
    &-itemBtn {
      padding: 0 24px;
      display: flex;
      align-items: center;

      &:active {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &-icon {
        margin-right: 12px;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
      }

      &-text {
        flex: 1;
        display: inline-block;
        padding: 24px 0;
        border-bottom: 1px solid #e6e8ed;
        font-size: 28px;
        line-height: 40px;
      }

      &:last-of-type &-text {
        border-bottom: none;
      }
    }
  }
}
</style>
