<template>
  <div class="tab" v-if="list.length > 0">
    <TabList :list="list" :value="value" @change="onChange" />
    <div class="add-label-wrap" @click="clickLabel">
      <SvgIcon name="add-blue" class="add-icon" v-if="!isEdit" />
      {{ !isEdit ? '添加标签' : '管理标签' }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import TabList from './TabList.vue'
import { AddressLabel } from '@order-public-sub-public/apis/address/types'

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  list: {
    type: Array<AddressLabel>,
    default: () => [],
  },
})

const isEdit = computed(() => props.list?.some((item) => !['10'].includes(item.labelCode)))
const emit = defineEmits(['update:value', 'addLabel'])
const onChange = (value: string) => {
  emit('update:value', value)
}
const clickLabel = () => {
  emit('addLabel', isEdit.value)
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

.tab {
  background: #fff;
  display: flex;
  padding: 0px 32px 14px;
  display: flex;
  .add-label-wrap {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-family: PingFang SC;
    font-size: 24px;
    font-weight: normal;
    letter-spacing: 0px;
    color: #8365f6;
    cursor: pointer;
    padding-left: 40px;
    /* #ifdef h5 */
    margin-top: -8px;
    /* #endif */
    .add-icon {
      margin-right: 5px;
      font-size: 20px;
    }
  }
}
</style>
