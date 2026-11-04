<template>
  <!-- 历史尺寸 -->
  <div class="history-size-content" id="order-page">
    <div v-if="historySizeList && historySizeList.length > 0">
      <div class="history-size-title flex items-center space-between">
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
      <template v-for="(item, index) in historySizeList" :key="item.batchId">
        <div
          :class="['history-size-block', { 'is-batch': isSelectAllStatus }]"
          @touchstart="handleTouch(true, 'history-size-block', index)"
          @touchend="handleTouch(false, 'history-size-block', index)"
          @click.stop="() => handleSelectHistory(item.batchId)"
        >
          <!-- 批量态单选框：卡片左侧垂直居中 -->
          <span class="batch-radio" v-if="isSelectAllStatus">
            <SvgIcon v-if="selectedIds?.has(historySizeKey(item.batchId))" name="radio-checked" class="radio-icon" />
            <SvgIcon v-else name="radio-unchecked" class="radio-icon" />
          </span>
          <div class="history-size-block-main">
            <div class="history-size-block-top flex items-center space-between">
              <div class="history-size-block-icon">
                <span class="icon-content"><SvgIcon name="history-size-icon-new" class="size-icon" /></span>
                <span class="size-no" v-html="highlightText(item.goodsName, searchKey)"></span>
              </div>
              <div class="operate-content">
                <!-- 编辑 -->
                <div class="history-size edit" @click.stop="() => handleEdit(item)">
                  <SvgIcon v-if="isSelectAllStatus" name="icon-edit-new" class="svg-icon-disabled" />
                  <SvgIcon v-else name="icon-edit-new" />
                </div>

                <!-- 删除 -->
                <div class="history-size delete" @click.stop="() => handleDelete(item.batchId)">
                  <SvgIcon v-if="isSelectAllStatus" name="delete" class="svg-icon-disabled" />
                  <SvgIcon v-else name="delete" />
                </div>
              </div>
            </div>
            <div class="history-size-block-content flex space-between">
              <template v-for="secItem in item.goodsSizes" :key="secItem.id">
                <div class="history-size-items">
                  <div class="history-size-items-content font-level4">
                    {{ secItem?.length }}*{{ secItem?.width }}*{{ secItem?.height }}*{{ secItem?.count
                    }}<template v-if="secItem?.singleWeight">*{{ secItem?.singleWeight }}</template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  <div class="history-size-dialog">
    <ky-dialog
      :z-index="1"
      v-model:show="dialogVisible"
      title="编辑历史尺寸名称"
      class="edit-history-size-dialog"
      :showConfirmButton="false"
      :showCancelButton="false"
    >
      <div class="form-content">
        <div class="label" id="edit_history">历史尺寸名称</div>
        <KyInput
          data-validate="edit.history"
          placeholder="请输入历史尺寸名称"
          ref="searchRef"
          :no-padding="true"
          show-border
          :shouldFocus="true"
          v-model="renameValue"
          :maxlength="64"
          :show-word-limit="true"
          clearable
          :formatter="formatterGoodsType"
          @focus="curEditNameReport('文本框', curEditData)"
          @onClearInput="curEditNameReport('清空', curEditData)"
          v-keyboard
        >
          <template #right>
            <span>{{ renameValue.length || 0 }}/64</span>
          </template>
        </KyInput>
      </div>
      <template v-slot:footer>
        <div class="footer-content">
          <div class="history-size btn cancel" @click="handleDialogCancel">取消</div>
          <div class="history-size btn confirm" @click="handleDialogConfirm">确定</div>
        </div>
      </template>
    </ky-dialog>
  </div>
</template>

<script setup lang="ts">
import { HistorySizeList } from '@order-public-sub-public/apis/product-info/types'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import { ref } from 'vue'
import { modifyUserHistorySize } from '@order-public-sub-public/apis/product-info'

import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import useEffect from '@order-public-sub-public/validate'
import {
  apiResultReport,
  curEditNameReport,
} from '@order-public-sub-public/components/business/product-info/hooks/report'
import highlightText from '@order-global-package-order-sub/utils/highlightText'
import { historySizeKey } from '../../hooks/useSelectSizeBatch'

const props = withDefaults(
  defineProps<{
    searchKey?: string
    historySizeList: HistorySizeList[]
    /** 批量态开关 */
    isSelectAllStatus?: boolean
    /** 已选中卡片集合（跨 tab 共享） */
    selectedIds?: Set<string>
    /** 货物信息已达上限时批量操作置灰 */
    batchDisabled?: boolean
  }>(),
  {
    historySizeList: () => [],
    searchKey: '',
    isSelectAllStatus: false,
    selectedIds: () => new Set<string>(),
    batchDisabled: false,
  },
)
const { effectBubble } = useEffect()

const emit = defineEmits(['handleSelectHistory', 'handleDelete', 'handleEdit', 'toggleBatch', 'handleRename'])
const searchRef = ref<HTMLElement | null | any>(null)
const dialogVisible = ref(false)
const renameValue = ref('')
const curEditData = ref<HistorySizeList>({} as HistorySizeList)

const formatterGoodsType = (value: string) => {
  let str = value
  str = str.replace(/[\r\n]/g, '')
  str = str.replace(/(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]|/g, '')
  return str.trim()
}

const handleSelectHistory = (batchId: number) => {
  emit('handleSelectHistory', batchId)
}

const handleDelete = (batchId: number) => {
  // 批量态：删除不可操作
  if (props.isSelectAllStatus) return
  emit('handleDelete', batchId)
}
const handleEdit = (item: HistorySizeList) => {
  // 批量态：编辑不可操作
  if (props.isSelectAllStatus) return
  curEditData.value = item
  dialogVisible.value = true
  // 截取64个字符
  renameValue.value = item.goodsName?.slice(0, 64) || ''
  setTimeout(() => {
    searchRef.value?.inputRef.focus()
  }, 300)
  emit('handleEdit', item.batchId)
  // window.$umpOtherReport('EXP', {
  //   eventCode: 'exp_express_select_size_history_size_edit_popup_v1',
  // })
}

const handleDialogCancel = () => {
  clearEffect()
  dialogVisible.value = false
  renameValue.value = ''
  curEditNameReport('取消', curEditData.value)
}

// 清除副作用
const clearEffect = () => {
  return effectBubble([
    {
      key: 'edit.history',
      passed: true,
      content: '',
    },
  ])
}

/**
 * 校验结果
 * @param isCleaEffect 是否清除校验
 */
const validateName = () => {
  let tipText = ''
  if (renameValue.value.length > 64) {
    tipText = '名称不能超过64字'
  }
  if (!renameValue.value) {
    tipText = '请输入历史尺寸名称'
  }
  if (tipText) {
    return effectBubble([
      {
        key: 'edit.history',
        passed: false,
        content: tipText,
        bubbleConfig: {
          offset: [0, -20],
        },
      },
    ])
  }
}

/**
 * 重复名称错误判断（code = 361101）：
 * 编辑后托寄物+尺寸与其他记录完全一致（不区分顺序）时，后端返回重复错误
 */
const isDuplicateNameError = (error: unknown) => {
  return (error as { code?: number | string })?.code === 361101
}

/**
 * 敏感词错误判断（code = 361102）：
 * 名称命中敏感词时，后端返回敏感信息错误
 */
const isSensitiveWordError = (error: unknown) => {
  return (error as { code?: number | string })?.code === 361102
}

const handleDialogConfirm = async () => {
  await validateName()
  const eventCode = 'other_express_select_size_history_size_edit_popup_v1'
  curEditNameReport('确定', curEditData.value)
  try {
    if (!renameValue.value) return
    await modifyUserHistorySize({ batchId: curEditData.value?.batchId, customName: renameValue.value || '' })
    curEditData.value.goodsName = renameValue.value
    dialogVisible.value = false
    showToast('保存成功')
    apiResultReport(true, eventCode)
    // 编辑成功通知父组件：搜索态下需按原搜索条件重查列表（改名后命中结果会变化）
    emit('handleRename')
    setTimeout(() => {
      clearEffect()
    }, 200)
  } catch (error) {
    console.log(error)
    if (isDuplicateNameError(error)) {
      // 重复名称：气泡提示"存在重复名称"，弹窗不关闭
      effectBubble([
        {
          key: 'edit.history',
          passed: false,
          content: '存在重复名称',
          bubbleConfig: {
            offset: [0, -20],
          },
        },
      ])
      return
    } else if (isSensitiveWordError(error)) {
      // 敏感词：气泡提示"存在敏感信息，请重新填写"，弹窗不关闭
      effectBubble([
        {
          key: 'edit.history',
          passed: false,
          content: '存在敏感信息，请重新填写',
          bubbleConfig: {
            offset: [0, -20],
          },
        },
      ])
      return
    }
    showToast(error?.msg || '保存失败，请重新提交')
    apiResultReport(false, eventCode, error)
  }
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
