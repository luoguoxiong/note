<template>
  <ProductSizeBus
    class="freight-time-product-size"
    :is-show-goods-size="true"
    :goods-size-list="preWaybillGoodsSizeList"
    @addGoodsSize="handleAddGoodsSizeList"
    :max-size="maxSizeLength"
  >
    <template #sizeRow="{ item, index }">
      <div class="product-size-input-cell flex radius10">
        <span
          :data-validate="`productInfo.preWaybillGoodsSizeList-length-${index}`"
          :id="`productInfo_preWaybillGoodsSizeList-length-${index}`"
        >
          <KyInput
            :data-validate="`productInfo.preWaybillGoodsSizeList-length-${index}`"
            :class="`text-center ${item.count ? 'color-black' : ''}`"
            placeholder="长"
            :no-padding="true"
            :enableNative="false"
            :always-system="!isAmapApp"
            :hold-keyboard="!isIosEnv"
            :cursor-spacing="100"
            :inputDebounce="platformInputDebounceTime"
            type="digit"
            step="any"
            v-model="item.length"
            :formatter="formatterSize"
            @update="onProductSizeBlur"
            @blur="onBlur($event, item.length)"
            v-keyboard
          >
          </KyInput>
        </span>
        <SvgIcon class="product-size-join-icon" name="product-size-join" />
        <span
          :data-validate="`productInfo.preWaybillGoodsSizeList-width-${index}`"
          :id="`productInfo_preWaybillGoodsSizeList-width-${index}`"
        >
          <KyInput
            :data-validate="`productInfo.preWaybillGoodsSizeList-width-${index}`"
            :class="`text-center ${item.count ? 'color-black' : ''}`"
            placeholder="宽"
            :no-padding="true"
            :enableNative="false"
            :always-system="!isAmapApp"
            :hold-keyboard="!isIosEnv"
            :cursor-spacing="100"
            :inputDebounce="platformInputDebounceTime"
            step="any"
            type="digit"
            v-model="item.width"
            :formatter="formatterSize"
            @update="onProductSizeBlur"
            @blur="onBlur($event, item.width)"
            v-keyboard
          >
          </KyInput>
        </span>
        <SvgIcon class="product-size-join-icon" name="product-size-join" />
        <span
          :data-validate="`productInfo.preWaybillGoodsSizeList-height-${index}`"
          :id="`productInfo_preWaybillGoodsSizeList-height-${index}`"
        >
          <KyInput
            :data-validate="`productInfo.preWaybillGoodsSizeList-height-${index}`"
            :class="`text-center ${item.count ? 'color-black' : ''}`"
            placeholder="高"
            :no-padding="true"
            :enableNative="false"
            :always-system="!isAmapApp"
            :hold-keyboard="!isIosEnv"
            :cursor-spacing="100"
            :inputDebounce="platformInputDebounceTime"
            type="digit"
            step="any"
            v-model="item.height"
            :formatter="formatterSize"
            @update="onProductSizeBlur"
            @blur="onBlur($event, item.height)"
            v-keyboard
          >
          </KyInput>
        </span>
        <SvgIcon class="product-size-join-icon" name="product-size-join" />
        <KyInput
          :class="`text-center ${item.count ? 'color-black' : ''}`"
          placeholder="件数"
          :no-padding="true"
          :enableNative="false"
          :always-system="!isAmapApp"
          :hold-keyboard="!isIosEnv"
          :cursor-spacing="100"
          :inputDebounce="platformInputDebounceTime"
          type="number"
          v-model.number="item.count"
          :maxlength="4"
          :formatter="formatterCount"
          @update="onProductSizeBlur"
          @input="countChange(item, $event)"
          @blur="countBlur(item)"
          v-keyboard
        >
        </KyInput>
        <SvgIcon class="product-size-join-icon" name="product-size-join" />
        <KyInput
          :class="`text-center ${item.singleWeight ? 'color-black' : ''}`"
          placeholder="重量"
          :no-padding="true"
          :enableNative="false"
          :always-system="!isAmapApp"
          :hold-keyboard="!isIosEnv"
          :cursor-spacing="100"
          :inputDebounce="platformInputDebounceTime"
          type="digit"
          step="any"
          v-model="item.singleWeight"
          :formatter="formatterSingleWeight"
          @update="onProductSizeBlur"
          @blur="onBlur($event, item.singleWeight)"
          v-keyboard
        >
        </KyInput>
        <div
          class="product-size-sub-btn flex items-center justify-center"
          :class="{ disabled: preWaybillGoodsSizeList.length === 1 }"
          @click="() => handleSubGoodsSizeList(index)"
        >
          <SvgIcon
            v-show="preWaybillGoodsSizeList.length === 1"
            class="product-size-sub-btn-icon"
            name="del-disabled"
          />
          <SvgIcon v-if="!(preWaybillGoodsSizeList.length === 1)" class="product-size-sub-btn-icon" name="minus" />
        </div>
      </div>
      <div class="font-level4 over-weight-content"></div>
    </template>
  </ProductSizeBus>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProductSizeBus from '@order-global-package-freight-time/components/business/product-size-bus/index.vue'
import { useFreightTimeStore } from '@freight-time/store'
import { showToast } from '@order-global-package-freight-time/hooks/useShowToast'
import { GoodsSize } from '@freight-time/types'
import SvgIcon from '@order-global-package-freight-time/components/ui/svg-icon/index.vue'
import KyInput from '@order-global-package-freight-time/components/base/ky-input-base/input.vue'
import { isIosEnv } from '@/public/utils'
import { isAmapApp } from '@order-global-package-freight-time/utils'
import { getEnvConfig } from '@/public/config'
import { closeValidateKey } from '../product-spec-weight/useActualWeightValidate'
import { reportOther } from '@freight-time/report'

const { platformInputDebounceTime } = getEnvConfig()

const store = useFreightTimeStore()

const maxSizeLength = 20

const preWaybillGoodsSizeList = computed(() => store.productInfo.preWaybillGoodsSizeList)

const handleAddGoodsSizeList = async () => {
  if (preWaybillGoodsSizeList.value?.length >= maxSizeLength) {
    showToast(`最大添加${maxSizeLength}组`)
    return
  }

  const result = [
    ...preWaybillGoodsSizeList.value,
    ...[
      {
        id: Math.floor(100000 + Math.random() * 900000),
        width: '',
        height: '',
        length: '',
        count: 1,
        singleWeight: '',
      },
    ],
  ]
  store.setPreWaybillGoodsSizeList(result)
}

const countChange = (item: GoodsSize, e: Event) => {
  if (!e) {
    return
  }
}

//设置件数默认值为1
const countBlur = (item: GoodsSize) => {
  if (!item.count) {
    item.count = 1
  }

  reportOther('other_express_single_consignment_size_v1', {
    number_size: item.count,
  })
}

const onBlur = (e: FocusEvent, value?: string | number) => {
  let val = e?.target?.value
  reportOther('other_express_single_consignment_size_v1', {
    number_size: val || value,
  })
}

const handleSubGoodsSizeList = async (index: number) => {
  if (preWaybillGoodsSizeList.value.length <= 1) {
    return
  }
  const result = preWaybillGoodsSizeList.value?.filter((_item, idx) => idx !== index) || []

  store.setPreWaybillGoodsSizeList(result)

  sumVolumeSize()
}

const onProductSizeBlur = () => {
  sumVolumeSize()
  tryFillActualWeight()
}

// 当所有行长宽高填写完整，且单件重量*件数之和≥总重量时，自动回填总重量
const tryFillActualWeight = () => {
  const list = preWaybillGoodsSizeList.value
  // 条件1：所有行长宽高必须填写完整
  const allSizeFilled = list.every((item) => item.length && item.width && item.height)
  if (!allSizeFilled) return

  // 计算 singleWeight * count 之和(避免浮点数累加误差)
  const weightSum = list.reduce((sum, item) => {
    // 单件重量最多 2 位小数,件数为整数,先转成整数运算再还原,避免 0.1 + 0.2 这类误差
    const single = +item.singleWeight || 0
    const count = +item.count || 1
    const itemWeight = Number((Math.round(single * 100) * count) / 100)
    return Number((Math.round(sum * 100) + Math.round(itemWeight * 100)) / 100)
  }, 0)

  // 条件2：单件重量*件数之和 ≥ 总重量
  const currentActualWeight = store.getActualWeight || 0
  if (weightSum >= currentActualWeight) {
    if (weightSum > 60000) {
      store.setActualWeight(60000)
      return
    }
    // 先清除总重量校验
    closeValidateKey()
    store.setActualWeight(Number(weightSum.toFixed(2)))
  }
}

const sumVolumeSize = () => {
  const volumeSizeSum =
    preWaybillGoodsSizeList.value.reduce((pre, cur) => {
      pre += (+cur.length * +cur.width * +cur.height * (+cur.count || 1)) / 100 / 100 / 100
      if (Number(pre.toFixed(3)) <= 0) {
        return (pre = 0)
      }
      if (Number(pre) >= 10000) {
        return 9999.999
      }
      return Number(pre.toFixed(3))
    }, 0) || store.getVolumeSize

  store.setVolumeSize(volumeSizeSum)
}

const formatterSize = (value: string | number): string | number => {
  try {
    if (typeof value !== 'string') {
      value = value.toString()
    }
    let msg = ''
    const containsOnlyDigitsAndDecimalPoint = (str: string) => {
      return /^[0-9.]+$/.test(str)
    }
    if (!containsOnlyDigitsAndDecimalPoint(value)) {
      msg = '长宽高仅可输入数字'
    }
    // 1. 清理：去空格、去非数字字符
    let input = ((value || '') as string)
      .toString()
      .replace(/\s/g, '')
      .replace(/[^\d.]/g, '')
    if (!input) return ''
    if (value?.split('.').length > 2 || value?.split('.')[1]?.length > 1) {
      msg = '长宽高最多可输入一位小数'
    }
    // 2. 标准化：只保留第一个小数点，限制最多 1 位小数
    input = input.replace(/\.+/g, '.').replace(/^(\d+\.?\d*)\.?$/, '$1')
    const dotIndex = input.indexOf('.')
    input = dotIndex !== -1 ? input.slice(0, dotIndex + 2) : input

    // 3. 校验范围
    const num = Number(input)
    if (isNaN(num)) {
      return ''
    }
    if (num === 0) {
      msg && showToast(msg)
      return ''
    }
    if (num > 1500) {
      showToast('长宽高最大可输入1500cm')
      return '1500'
    }
    const newValue = num.toFixed(1).replace(/\.0$/, '')
    if (newValue && newValue !== value) {
      msg = '长宽高输入格式异常，已自动修正'
    }
    msg && showToast(msg)
    return newValue
  } catch {
    return value
  }
}

const formatterCount = (value: string) => {
  if (!value) {
    return ''
  }
  // 转为字符串，移除所有非数字字符（只保留 0-9）
  let str = value?.toString().replace(/[^\d]/g, '') ?? ''

  // 移除前导零（但避免空字符串）
  str = str.replace(/^0+/, '') || '1'

  // 限制最大长度，最多 4 位正整数
  if (str.length > 3) {
    str = str.substring(0, 3)
  }

  return str
}

const formatterSingleWeight = (value: string | number): string => {
  try {
    if (typeof value !== 'string') {
      value = value.toString()
    }
    // 1. 清理：去空格、去非数字和小数点字符（符号/中文/英文/特殊符号自动转空）
    let input = ((value || '') as string)
      .toString()
      .replace(/\s/g, '')
      .replace(/[^\d.]/g, '')

    if (!input) return ''

    // 2. 标准化：只保留第一个小数点，限制最多 2 位小数
    input = input.replace(/\.+/g, '.').replace(/^(\d+\.?\d*)\.?$/, '$1')
    const dotIndex = input.indexOf('.')
    input = dotIndex !== -1 ? input.slice(0, dotIndex + 3) : input

    // 3. 校验范围：上限 60000，超出自动截断
    const num = Number(input)
    if (num > 60000) {
      return '60000'
    }

    return input
  } catch {
    return ''
  }
}
</script>

<style lang="scss">
.freight-time-product-size {
  border-bottom: none;
}
</style>
