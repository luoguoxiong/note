<template>
  <view :class="['collapse-list', collapse && collapseable ? 'collapse-list--collapsed' : '']">
    <view class="collapse-list__value">
      {{ list?.join('、') }}
    </view>
    <view class="collapse-list__trigger" v-if="collapseable" @click="collapse = !collapse">
      {{ collapse ? '展开' : '收起' }}
      <image
        src="https://ic-img.ky-express.com/netc/20251105_75044_!!1762334207739_48_48.png"
        mode="aspectFit"
        class="collapse-list__icon"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import './index.scss'

defineOptions({ name: 'CollapseList' })

const props = defineProps({
  list: Array as () => Array<string>,
})

const collapse = ref(true)

const collapseable = computed(() => {
  return (props.list || []).length > 3
})
</script>
