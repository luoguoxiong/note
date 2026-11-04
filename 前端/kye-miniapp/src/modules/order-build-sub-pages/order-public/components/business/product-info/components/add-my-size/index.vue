<template>
  <div class="add-my-size-page">
    <scroll-view
      class="add-my-size-scroll"
      scroll-y="true"
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
      @scroll="handleScroll"
    >
      <div
        v-for="(item, index) in groupList"
        :key="`addMySize-group-${index}-${groupVersion}`"
        class="add-my-size-section"
        :id="`addMySize-group-${index}`"
      >
        <!-- 托寄物 -->
        <div class="section-title font-level3">
          托寄物
          <span class="required-tag">必填</span>
        </div>
        <div
          class="goods-name-input"
          :class="{ 'is-error': errorKeys.has(`${index}-goodsName`) }"
          :data-validate="`addMySize.goodsName-${index}`"
          :id="`addMySize_goodsName-${index}`"
        >
          <KyInput
            ref="groupInputRefs"
            :dataValidate="`addMySize.goodsName-${index}`"
            placeholder="请输入托寄物名称"
            :no-padding="true"
            :hold-keyboard="true"
            show-border
            :enableNative="false"
            :modelValue="item.goodsName"
            :maxlength="64"
            :always-embed="true"
            :show-word-limit="true"
            clearable
            :formatter="formatterGoodsName"
            @update:model-value="(value: string) => handleGoodsNameInput(index, value)"
            @blur="() => handleGoodsNameBlur(index)"
            @clear="() => handleGoodsNameClear(index)"
            v-keyboard
          >
            <template #right>
              <span class="word-count">{{ item.goodsName.length }}/64</span>
            </template>
          </KyInput>
        </div>

        <!-- 尺寸 -->
        <div class="section-title font-level3 size-title">
          尺寸
          <span class="required-tag">必填</span>
        </div>
        <div class="size-tip">长、宽、高单位为 cm：重量请输入单件重量，单位为kg</div>
        <div class="size-row flex">
          <span
            :class="{ 'is-error': errorKeys.has(`${index}-length`) }"
            :data-validate="`addMySize.sizeList-length-${index}`"
            :id="`addMySize_sizeList-length-${index}`"
          >
            <KyInput
              ref="groupInputRefs"
              :data-validate="`addMySize.sizeList-length-${index}`"
              :class="`text-center ${item.length ? 'color-black' : ''}`"
              placeholder="长"
              :always-system="!isAmapApp"
              :always-system-gd="false"
              :no-padding="true"
              :hold-keyboard="true"
              :enableNative="false"
              :cursor-spacing="100"
              type="digit"
              step="any"
              v-model="item.length"
              :formatter="formatterSize"
              @blur="sizeBlur(index, 'length', item)"
              v-keyboard
            >
            </KyInput>
          </span>
          <SvgIcon class="product-size-join-icon" name="product-size-join" />
          <span
            :class="{ 'is-error': errorKeys.has(`${index}-width`) }"
            :data-validate="`addMySize.sizeList-width-${index}`"
            :id="`addMySize_sizeList-width-${index}`"
          >
            <KyInput
              ref="groupInputRefs"
              :data-validate="`addMySize.sizeList-width-${index}`"
              :class="`text-center ${item.width ? 'color-black' : ''}`"
              placeholder="宽"
              :always-system="!isAmapApp"
              :always-system-gd="false"
              :no-padding="true"
              :hold-keyboard="true"
              :enableNative="false"
              :cursor-spacing="100"
              type="digit"
              step="any"
              v-model="item.width"
              :formatter="formatterSize"
              @blur="sizeBlur(index, 'width', item)"
              v-keyboard
            >
            </KyInput>
          </span>
          <SvgIcon class="product-size-join-icon" name="product-size-join" />
          <span
            :class="{ 'is-error': errorKeys.has(`${index}-height`) }"
            :data-validate="`addMySize.sizeList-height-${index}`"
            :id="`addMySize_sizeList-height-${index}`"
          >
            <KyInput
              ref="groupInputRefs"
              :data-validate="`addMySize.sizeList-height-${index}`"
              :class="`text-center ${item.height ? 'color-black' : ''}`"
              placeholder="高"
              :always-system="!isAmapApp"
              :always-system-gd="false"
              :no-padding="true"
              :hold-keyboard="true"
              :enableNative="false"
              :cursor-spacing="100"
              type="digit"
              step="any"
              v-model="item.height"
              :formatter="formatterSize"
              @blur="sizeBlur(index, 'height', item)"
              v-keyboard
            >
            </KyInput>
          </span>
          <template v-if="false">
            <SvgIcon class="product-size-join-icon" name="product-size-join" />
            <KyInput
              ref="groupInputRefs"
              :class="`text-center ${item.count ? 'color-black' : ''}`"
              placeholder="件数"
              :always-system-gd="false"
              :no-padding="true"
              :hold-keyboard="true"
              :enableNative="false"
              :cursor-spacing="100"
              type="number"
              v-model.number="item.count"
              :maxlength="4"
              :formatter="formatterCount"
              @input="countChange(item, $event)"
              @blur="countBlur(item)"
            >
            </KyInput>
          </template>
          <SvgIcon class="product-size-join-icon" name="product-size-join" />
          <KyInput
            ref="groupInputRefs"
            :class="`text-center ${item.singleWeight ? 'color-black' : ''}`"
            placeholder="重量"
            :always-system="!isAmapApp"
            :always-system-gd="false"
            :no-padding="true"
            :hold-keyboard="true"
            :enableNative="false"
            :enableWxNative="true"
            :enableWxNativeFormatter="true"
            :cursor-spacing="100"
            :enableBlurValueSync="true"
            type="digit"
            step="any"
            v-model="item.singleWeight"
            :formatter="formatterUnitWeight"
            @blur="weightBlur(item)"
            v-keyboard
          >
          </KyInput>
        </div>

        <!-- 删除：仅一组时置灰不可点 -->
        <div :class="['card-delete', 'flex', 'items-center', 'justify-end', { disabled: groupList.length <= 1 }]">
          <SvgIcon
            v-if="groupList.length <= 1"
            @click="() => handleRemoveGroup(index)"
            name="delete"
            class="card-delete-icon card-delete-icon-disabled"
          />
          <SvgIcon v-else @click="() => handleRemoveGroup(index)" name="delete" class="card-delete-icon" />
          <span @click="() => handleRemoveGroup(index)">删除</span>
        </div>
      </div>
    </scroll-view>

    <!-- 底部：添加尺寸 + 保存 -->
    <div class="add-my-size-footer flex">
      <KyButton
        :class="['footer-add-btn', { disabled: groupList.length >= MAX_ADD_SIZE_GROUP }]"
        type="default"
        text="添加尺寸"
        @click="handleAddGroup"
      ></KyButton>
      <KyButton class="footer-save-btn" text="保存" :loading="saveLoading" @click="handleSave"></KyButton>
    </div>
    <!-- 全局气泡容器：effectBubble 校验气泡依赖此组件渲染；挂载时清除本页残留校验状态 -->
    <PageCommon pageValidateName="addMySize" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Taro from '@tarojs/taro'
import { debounce, throttle } from 'lodash-es'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import KyButton from '@order-global-package-order-sub/components/base/ky-button/index.vue'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import vKeyboard from '@order-global-package-order-sub/directives/keyboard'
import { saveCustomerSku, validSensitiveWord } from '@order-public-sub-public/apis/product-info/index'
import { productSingleWeightMax, productCountMax } from '@order-public-sub-public/constants'
import { showToast } from '@order-global-package-order/hooks/useShowToast'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { effectBubble } from '@order-public-sub-public/validate/effect/effectBubble'
import { useValidate } from '@order-public-sub-public/hooks/useValidate'
import { useGlobalPopover } from '@order-global-package-order-sub/components/business/popover-effect/hooks/useUpdate'
import { isAmapApp } from '@order-public-sub-public/utils'
import { isH5FSEnv } from '@/public/utils'
import { selectSizeRefreshType } from '../../hooks/state'
import { clk_add_size_save_v1 } from '../../hooks/report'
import { HistoryGoodsSize } from '@order-public-sub-public/apis/product-info/types'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'

/** 尺寸组：每组包含独立托寄物名称与一组尺寸 */
interface SizeGroup {
  goodsName: string
  length: string
  width: string
  height: string
  count: number | string
  singleWeight: string
}

/** 新增尺寸页最大组数：产品要求本页限制 10 组（区别于全局货物信息 maxOfGroup 的 20 组上限） */
const MAX_ADD_SIZE_GROUP = 10

const router = useRouter()
const { setErrorClassUpdate, removeValidateKeyByType } = useValidate()
const { removeValidateSinge } = useGlobalPopover()

/** 尺寸组列表（默认一组，件数默认 1） */
const createEmptyGroup = (): SizeGroup => ({
  goodsName: '',
  length: '',
  width: '',
  height: '',
  count: 1,
  singleWeight: '',
})
const groupList = ref<SizeGroup[]>([createEmptyGroup()])

/**
 * 组版本号：参与 v-for key。增删组时自增，强制全部输入组件重建。
 * 支付宝系（高德App）端 input 组件在 v-for 纯 index key 下增删组会复用旧节点，
 * 导致 input 内部状态与显示层脱节（显示空但 placeholder 不显示，微信端无此问题）
 */
const groupVersion = ref(0)

/** 报错标红集合（key：`${index}-${field}`）：全部标红，首个报错模块气泡提示 */
const errorKeys = ref<Set<string>>(new Set())

/** scroll-view 滚动位置（scroll-top 定位报错项） */
const scrollTop = ref(0)

/** 最近一次滚动时间戳：滚动触发的程序性失焦不应触发托寄物名称的失焦校验（避免误报红/气泡） */
let lastScrollTs = 0

/** 滚动时清除所有气泡提示：scroll 事件高频触发，节流 100ms（同货物信息页滚动处理） */
const handleScroll = throttle(() => {
  // 飞书端键盘顶起依赖 v-keyboard 的 scrollIntoView 平滑滚动，滚动即失焦会导致键盘刚弹起就被收起，直接跳过
  // 注意：isH5FSEnv 当前实现恒等于 isH5Env（public/utils/device.ts#L105 疑似 bug），实际效果为所有 H5 端跳过
  if (isH5FSEnv) return
  // 滚动时全部输入框失焦收起键盘（v-for 内同名 ref 自动收集为数组）
  groupInputRefs.value.forEach((input) => input?.inputRef?.blur?.())
  lastScrollTs = Date.now()
  removeValidateSinge()
}, 100)

/** 生成报错 key */
const errorKey = (index: number, field: string) => `${index}-${field}`

/** 全部尺寸组输入组件实例（v-for 内同名 ref 自动收集）：滚动时统一失焦用 */
const groupInputRefs = ref<any[]>([])

const clearError = (index: number, field: string) => {
  errorKeys.value.delete(errorKey(index, field))
}

/**
 * 托寄物名称格式化：禁止表情与空格（截断无法输入），最长 64 由 maxlength 控制
 */
const formatterGoodsName = (value: string) => {
  let str = value
  str = str.replace(/\s+/g, '')
  str = str.replace(/(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]/g, '')
  return str
}

const handleGoodsNameInput = (index: number, value: string) => {
  groupList.value[index].goodsName = formatterGoodsName(value || '')
  clearError(index, 'goodsName')
}

const handleGoodsNameClear = (index: number) => {
  groupList.value[index].goodsName = ''
  // 清空即清报错：后续保存时按空值重新报「请输入托寄物名称」
  clearError(index, 'goodsName')
}

/**
 * 托寄物名称失焦校验：必填、纯数字/纯字符报错、敏感词校验
 */
const handleGoodsNameBlur = async (index: number) => {
  // 滚动引起的程序性失焦不校验：用户只是滚动页面，非主动离开输入框
  if (Date.now() - lastScrollTs < 300) {
    return
  }
  const name = groupList.value[index].goodsName
  if (!name) {
    // 同货物信息托寄物失焦：空值标红并气泡提示
    errorKeys.value.add(errorKey(index, 'goodsName'))
    effectBubble([
      {
        key: `addMySize.goodsName-${index}`,
        passed: false,
        content: '请输入托寄物名称',
        bubbleConfig: { offset: [0, 10] },
      },
    ])
    return
  }
  if (/^\d+$/.test(name) || /^[a-zA-Z]+$/.test(name)) {
    errorKeys.value.add(errorKey(index, 'goodsName'))
    effectBubble([
      {
        key: `addMySize.goodsName-${index}`,
        passed: false,
        content: '托寄物名称不可仅为数字或字符',
        bubbleConfig: { offset: [0, 10] },
      },
    ])
    return
  }
  try {
    const { data } = await validSensitiveWord({ content: name, type: 'goodsType' })
    if (data?.status === false) {
      errorKeys.value.add(errorKey(index, 'goodsName'))
      effectBubble([
        {
          key: `addMySize.goodsName-${index}`,
          passed: false,
          content: '存在敏感信息，请重新填写',
          bubbleConfig: { offset: [0, 10] },
        },
      ])
    }
  } catch (error) {
    console.error(error)
  }
}

/** 件数格式化：纯数字，最多 3 位，前导零处理（同货物信息尺寸输入） */
const formatterCount = (value: string) => {
  if (!value) {
    return ''
  }
  // 转为字符串，移除所有非数字字符（只保留 0-9）
  let str = value?.toString().replace(/[^\d]/g, '') ?? ''
  // 移除前导零（但避免空字符串）
  str = str.replace(/^0+/, '') || '1'
  // 限制最大长度，最多 3 位正整数
  if (str.length > 3) {
    str = str.substring(0, 3)
  }
  return str
}

/** 单件重量格式化：数字与小数点，整数最多 5 位、小数最多 2 位，上限 60000（同货物信息尺寸输入） */
const formatterUnitWeight = (value: string | number): string => {
  if (!value) return ''
  let result = String(value)
  // 过滤非数字字符
  result = result.replace(/[^\d.]/g, '')
  // 移除前导零（但避免空字符串）
  result = result.replace(/^0+/, '') || ''
  const parts = result.split('.')
  // 整数部分最多5位
  if (parts[0].length > 5) {
    parts[0] = parts[0].substring(0, 5)
  }
  // 小数部分最多2位
  if (parts[1] && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2)
  }
  result = parts.join('.')
  // 上限60000
  if (Number(result) > productSingleWeightMax.重量) {
    result = String(productSingleWeightMax.重量)
  }
  if (result.startsWith('.')) result = '0' + result
  // 兜底：必须是合法数字，否则返回空
  if (result === '' || isNaN(Number(result))) {
    return ''
  }
  return result
}

/**
 * 长宽高格式化：完全同货物信息尺寸输入（product-size/formatterSize）
 * 格式异常/超限时在输入过程中即时 toast 提示并自动修正
 */
const formatterSize = (value: string | number): string => {
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
    // 2. 标准化：多个小数点合并为一个，限制最多 1 位小数（末位小数点保留，支持继续输入小数）
    input = input.replace(/\.+/g, '.')
    const dotIndex = input.indexOf('.')
    input = dotIndex !== -1 ? input.slice(0, dotIndex + 2) : input
    // 3. 校验范围
    const num = Number(input)
    // iOS digit 键盘允许首位输入"."，此处 input 为"."时 Number 结果为 NaN，直接清空
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
    // 末位为小数点（如 "11."）：保留原样，允许继续输入小数位（同 product-size 行为）
    if (input.endsWith('.')) {
      return input
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

/** 所有组尺寸件数之和（同货物信息 getListCount 口径） */
const getListCount = computed(() =>
  groupList.value.reduce((pre, cur) => {
    pre += cur.count ? Number(cur.count) : 0
    return pre
  }, 0),
)

/** 所有组单件重量*件数之和（同货物信息 getListWeight 口径） */
const getListWeight = computed(() => {
  const res = groupList.value.reduce((pre, cur) => {
    if (cur.count && cur.singleWeight) {
      pre += Number(cur.singleWeight) * Number(cur.count)
    }
    return pre
  }, 0)
  return Math.round(res * 100) / 100
})

//件数最大值限制（同货物信息 countChange；超长费试算为订单页专属，此处不需要）
const countChange = (item: SizeGroup, e: Event) => {
  if (!e) {
    return
  }
  const { count } = item
  if (getListCount.value > productCountMax.件数) {
    showToast(`尺寸件数之和不能超过${productCountMax.件数}件`)
  } else if (getListWeight.value > productSingleWeightMax.重量) {
    // 单件重量*件数之和超限拦截
    showToast(`单件重量*件数之和不能超过${productSingleWeightMax.重量}kg`)
  }
}

//设置件数默认值为1（同货物信息 countBlur）
const countBlur = debounce((item: SizeGroup) => {
  if (!item.count) {
    item.count = 1
  }
}, 100)

//单件重量失焦校验（同货物信息 weightBlur）
const weightBlur = debounce((item: SizeGroup) => {
  if (getListWeight.value > productSingleWeightMax.重量) {
    showToast(`单件重量*件数之和不能超过${productSingleWeightMax.重量}kg`)
  }
}, 100)

/** 长宽高失焦：已填写数据时清除该字段报错标红 */
const sizeBlur = (index: number, field: 'length' | 'width' | 'height', item: SizeGroup) => {
  if (item[field]) {
    clearError(index, field)
  }
}

/** 添加尺寸组（达上限 toast）：仅清除气泡，标红错误保留 */
const handleAddGroup = () => {
  if (groupList.value.length >= MAX_ADD_SIZE_GROUP) {
    showToast(`最多可添加${MAX_ADD_SIZE_GROUP}组`)
    return
  }
  groupList.value.push(createEmptyGroup())
  groupVersion.value++
  removeValidateSinge()
}

/** 删除尺寸组（仅剩一组时置灰不可删）：仅清除气泡；标红错误按删除后的新索引重排 */
const handleRemoveGroup = (index: number) => {
  if (groupList.value.length <= 1) return
  groupList.value.splice(index, 1)
  groupVersion.value++
  removeValidateSinge()
  // 重排标红 key：被删组的报错移除，其后各组索引前移一位
  const newErrors = new Set<string>()
  errorKeys.value.forEach((key) => {
    const [errIndex, field] = key.split('-')
    const idx = Number(errIndex)
    if (idx === index) return
    newErrors.add(`${idx > index ? idx - 1 : idx}-${field}`)
  })
  errorKeys.value = newErrors
  // 同步校验框架的标红（placeholder 红）：清空后按新索引重设
  removeValidateKeyByType('addMySize')
  newErrors.forEach((key) => {
    const [errIndex, field] = key.split('-')
    setErrorClassUpdate({
      key: field === 'goodsName' ? `addMySize.goodsName-${errIndex}` : `addMySize.sizeList-${field}-${errIndex}`,
      passed: false,
      content: '请先完善尺寸信息',
    })
  })
}

/**
 * 滚动定位到第一条报错项：计算 scroll-top 使报错元素滚到容器可视区中部（不贴顶，观感更自然）
 * 通过 Taro.createSelectorQuery 取元素与容器位置，不操作 DOM
 */
const scrollToError = (id: string) => {
  setTimeout(() => {
    const query = Taro.createSelectorQuery()
    query.select(`#${id}`).boundingClientRect()
    query.select('.add-my-size-scroll').boundingClientRect()
    query.select('.add-my-size-scroll').scrollOffset()
    query.exec((res) => {
      const elRect = res?.[0]
      const containerRect = res?.[1]
      const scrollOffset = res?.[2]
      if (!elRect || !containerRect || !scrollOffset) {
        return
      }
      const target =
        Math.max(
          // 目标 scrollTop = 当前滚动位置 + 元素相对容器的偏移 - 居中所需距离
          (scrollOffset.scrollTop || 0) + (elRect.top - containerRect.top) - (containerRect.height - elRect.height) / 2,
          0,
        ) + 30
      // 先同步为当前滚动位置再赋目标值：目标值与上次相同时也能重新触发滚动
      scrollTop.value = scrollOffset.scrollTop || 0
      setTimeout(() => {
        scrollTop.value = target
      }, 50)
    })
  }, 100)
}

/**
 * 保存校验：对全部尺寸组按页面顺序执行前置校验（空值 → 纯数字/纯字符），
 * 返回全部报错（托寄物报错携带实际文案）。
 * 敏感词/重复数据不再前端循环调接口，由保存接口后端校验，异常经请求层 toast 提示
 */
const collectSaveErrors = () => {
  const errors: { index: number; field: 'goodsName' | 'length' | 'width' | 'height'; message?: string }[] = []
  groupList.value.forEach((item, index) => {
    const name = item.goodsName
    if (!name) {
      errors.push({ index, field: 'goodsName', message: '请输入托寄物名称' })
    } else if (/^\d+$/.test(name) || /^[a-zA-Z]+$/.test(name)) {
      errors.push({ index, field: 'goodsName', message: '托寄物名称不可仅为数字或字符' })
    }
    ;(['length', 'width', 'height'] as const).forEach((field) => {
      if (!item[field]) {
        errors.push({ index, field })
      }
    })
  })
  return errors
}

/** 保存提交逻辑（由防抖保存调用）：统一校验全部尺寸组 + 调保存接口 */
const submitSave = async () => {
  const errors = collectSaveErrors()
  // 校验不通过：全部标红，页面顺序第一个托寄物报错气泡提示实际文案，长宽高缺失 toast，并滚动定位
  if (errors.length > 0) {
    errorKeys.value = new Set(errors.map(({ index, field }) => errorKey(index, field)))
    // 所有报错字段写入校验框架（同托寄物 isError 机制）：placeholder 标红
    errors.forEach(({ index, field }) => {
      setErrorClassUpdate({
        key: field === 'goodsName' ? `addMySize.goodsName-${index}` : `addMySize.sizeList-${field}-${index}`,
        passed: false,
        content: '请先完善尺寸信息',
      })
    })
    // 气泡锚定页面顺序第一个托寄物报错，按实际原因提示（空值/纯数字字符）
    const firstGoodsNameError = errors.find(({ field }) => field === 'goodsName')
    if (firstGoodsNameError) {
      effectBubble([
        {
          key: `addMySize.goodsName-${firstGoodsNameError.index}`,
          passed: false,
          content: firstGoodsNameError.message || '请输入托寄物名称',
          bubbleConfig: { offset: [0, 10] },
        },
      ])
    }
    // 长宽高缺失：仅 toast「请先完善尺寸信息」（无气泡）
    if (errors.some(({ field }) => field !== 'goodsName')) {
      showToast('请先完善尺寸信息')
    }
    // 滚动定位到页面顺序上的第一条报错
    const first = errors[0]
    scrollToError(
      first.field === 'goodsName'
        ? `addMySize_goodsName-${first.index}`
        : `addMySize_sizeList-${first.field}-${first.index}`,
    )
    return
  }
  // 3. 调用保存接口（重复数据由请求层 toast 后端提示）
  const sizeList = groupList.value.map((item) => ({
    goodsName: item.goodsName,
    goodsSizes: [
      {
        length: item.length,
        width: item.width,
        height: item.height,
        count: Number(item.count) || 1,
        singleWeight: item.singleWeight || '',
      },
    ] as HistoryGoodsSize[],
  }))
  try {
    await saveCustomerSku({ sizeList })
    clk_add_size_save_v1(groupList.value.length)
    // 校验通过：toast 新增成功并返回（关闭页面）
    showToast('新增成功')
    selectSizeRefreshType.value = 'mySize'
    setTimeout(() => {
      router.back()
    }, 100)
  } catch (error) {
    // 重复数据等后端错误由请求层 toast「存在重复尺寸数据，新增失败」等后端提示，页面不关闭
    console.error(error)
  }
}

/** 保存防抖时长：输入已即时回填（无防抖），预留富余时间确保最后一次输入与失焦处理完成后再提交 */
const SAVE_DEBOUNCE_TIME = 300

/** 保存 loading：点击立即展示，不受防抖影响 */
const saveLoading = ref(false)

/** 防抖保存：try/catch 包裹提交逻辑，无论成功失败（含校验拦截）finally 复位 loading */
const debouncedSave = debounce(async () => {
  try {
    await submitSave()
  } catch (error) {
    console.error(error)
  } finally {
    saveLoading.value = false
  }
}, SAVE_DEBOUNCE_TIME)

/** 保存入口：loading 先行展示（点击即出），提交走防抖 */
const handleSave = () => {
  saveLoading.value = true
  debouncedSave()
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
