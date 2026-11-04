<template>
  <!-- 历史尺寸 -->
  <div class="select-size-content-list" :class="sizeType">
    <div class="select-size-title flex items-center space-between">
      <span class="font-level4 color-assist">长*宽*高*件数(cm)*单件重量(kg)</span>
      <div
        :class="['batch-toggle', { disabled: !isSelectAllStatus && batchDisabled }]"
        @click="() => emit('toggleBatch')"
      >
        <image
          :src="
            !isSelectAllStatus && batchDisabled
              ? 'https://ic-img.ky-express.com/netc/20260924_36753_!!1790243818040_48_48.png'
              : isSelectAllStatus
                ? 'https://ic-img.ky-express.com/netc/20260924_38774_!!1790239981232_24_24.png'
                : 'https://ic-img.ky-express.com/netc/20260924_69093_!!1790239954002_24_24.png'
          "
          class="batch-icon"
        />
        {{ isSelectAllStatus ? '退出操作' : '批量操作' }}
      </div>
    </div>
    <template v-for="(item, index) in selectSkuSize" :key="item.id">
      <div
        :class="['select-size-block', { 'is-batch': isSelectAllStatus }]"
        @touchstart="handleTouch(true, 'select-size-block', index)"
        @touchend="handleTouch(false, 'select-size-block', index)"
        @click.stop="() => handleSelect(item.id)"
      >
        <!-- 批量态单选框：卡片左侧垂直居中 -->
        <span class="batch-radio" v-if="isSelectAllStatus">
          <SvgIcon v-if="selectedIds?.has(mySizeKey(item.id))" name="radio-checked" class="radio-icon" />
          <SvgIcon v-else name="radio-unchecked" class="radio-icon" />
        </span>
        <div class="select-size-block-main">
          <div class="select-size-block-top flex items-center space-between">
            <div class="select-size-icon flex items-center">
              <span class="icon-content"><SvgIcon name="select-size-icon-new" class="size-icon" /></span>
              <span class="size-no" v-html="highlightText(item.goodsType, searchKey)"></span>
            </div>
            <div class="operate-content">
              <!-- 删除：deleteEnable 为 true 正常可删，其他场景置灰不可点击；平台/权限不可操作时隐藏 -->
              <div v-if="canDelete" class="my-size delete" @click.stop="() => handleDelete(item)">
                <SvgIcon v-if="isSelectAllStatus || !item.deleteEnable" name="delete" class="svg-icon-disabled" />
                <SvgIcon v-else name="delete" />
              </div>
            </div>
          </div>
          <div class="select-size-block-content flex space-between">
            <div class="select-size-items">
              <div class="select-size-items-content font-level4">
                {{ item?.goodsLength }}*{{ item?.goodsWidth }}*{{ item?.goodsHeight }}*1<template
                  v-if="item?.goodsWeight"
                  >*{{ item?.goodsWeight }}</template
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { SelectSize } from '@order-public-sub-public/apis/product-info/types'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import highlightText from '@order-global-package-order-sub/utils/highlightText'
import { mySizeKey } from '../../hooks/useSelectSizeBatch'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'

const props = withDefaults(
  defineProps<{
    selectSkuSize: SelectSize[]
    sizeType?: string
    searchKey?: string
    /** 批量态开关 */
    isSelectAllStatus?: boolean
    /** 已选中卡片集合（跨 tab 共享） */
    selectedIds?: Set<string>
    /** 是否展示删除入口（支付宝/高德端或 mySizeOptFlag=false 时隐藏） */
    canDelete?: boolean
    /** 货物信息已达上限时批量操作置灰 */
    batchDisabled?: boolean
  }>(),
  {
    selectSkuSize: () => [],
    searchKey: '',
    isSelectAllStatus: false,
    selectedIds: () => new Set<string>(),
    canDelete: true,
    batchDisabled: false,
  },
)

const emit = defineEmits(['handleSelect', 'handleDelete', 'toggleBatch'])

const handleSelect = (id: string) => {
  emit('handleSelect', id)
}

const handleDelete = (item: SelectSize) => {
  // 批量态：不可操作
  if (props.isSelectAllStatus) return
  // 置灰（后台维护数据 deleteEnable 非 true）：点击 toast 提示
  if (!item.deleteEnable) {
    showToast('后台维护的尺寸数据无法删除')
    return
  }
  emit('handleDelete', item.id)
}

const handleTouch = (isTouch: boolean, className: string, index: number) => {
  const currentElement = document.querySelectorAll(`.${className}`)?.[index] as HTMLElement | null
  if (isTouch) {
    currentElement?.classList.add('active')
  } else {
    currentElement?.classList.remove('active')
  }
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
