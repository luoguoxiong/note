<template>
  <scroll-view
    class="t-l-w"
    :scroll-y="false"
    :scroll-x="true"
    enable-flex
    :class="{ 'd-s-s-bar': isDesktopMiniprogramFlag }"
    ref="parenetRef"
    :scroll-into-view-offset="200"
    :scroll-with-animation="true"
    :scroll-into-view="activeId"
  >
    <div
      v-for="item in list"
      :key="item.labelCode"
      @click="(e) => onChange(e, item.labelCode)"
      :class="['tab-i-l', { activeLabel: item.labelCode === value }]"
      :id="`l-i-${item.labelCode}`"
    >
      {{ item.labelName }}
    </div>
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref, onActivated, onMounted, nextTick, watch } from 'vue'
import { AddressLabel } from '@order-public-sub-public/apis/address/types'
import { isDesktopMiniprogram } from '@order-public-sub-public/utils/native'
import { debounce } from 'lodash-es'

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  list: {
    type: Array<AddressLabel>,
    default: () => [
      {
        labelName: '全部',
        labelCode: '10',
        labelSort: 20,
        sortFlag: false,
      },
    ],
  },
})

const emit = defineEmits(['change'])
const activeId = ref()
const isDesktopMiniprogramFlag = isDesktopMiniprogram()

onActivated(() => {
  setActive()
})

watch(
  () => props.value,
  () => setActive(),
)

onMounted(() => {
  setActive()
})

const setActive = async () => {
  await nextTick()
  // centerItemInFlexContainer()
  activeId.value = `l-i-` + props.value
}

const onChange = debounce(
  async (_e, value: string) => {
    emit('change', value)
  },
  200,
  {
    leading: true,
  },
)
</script>
<style lang="scss">
.t-l-w {
  flex: 1;
  display: flex;
  overflow-y: hidden;
  overflow-x: scroll;
  white-space: nowrap;
  height: 55px;

  .tab-i-l {
    flex-shrink: 0;
    flex-basis: 1;
    // margin-bottom: 13px;
    padding: 12px 16px;
    border-radius: 12px;
    background: #f1f2f7;
    font-size: 24px;
    text-align: center;
    margin-right: 16px;
    color: #55596c;
    cursor: pointer;
    display: inline-block;
    &.activeLabel {
      background: #f2effe;
      color: #8365f6;
    }
  }
}
.t-l-w::-webkit-scrollbar {
  display: none;
  opacity: 0;
}
.d-s-s-bar {
  position: relative;
  &::-webkit-scrollbar {
    position: absolute;
    bottom: 0;
    // display: initial;
    height: 10px;
    border-radius: 10px;

    /* #ifdef h5 */
    width: 0.1rem;
    height: 0.1rem;
    display: block;
    opacity: 1;

    /* #endif */
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: transparent;
    transition: background-color 1s linear;
  }
  &:hover {
    &::-webkit-scrollbar {
      height: 10px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
    }
    &::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }
}
</style>
