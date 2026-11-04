<template>
  <div class="bind-customer-code__list">
    <el-form :model="ruleForm" ref="ruleFormRef">
      <div
        :class="['bind-customer-code__item', !!customCode && index === 0 && 'disabled']"
        v-for="(value, index) in ruleForm.formList"
        :key="index"
      >
        <el-form-item :prop="`formList[${index}].customerCode`" :rules="formRules.customerCode">
          <el-autocomplete
            :ref="(el: any) => setAutoInputRef(el, index)"
            :fetch-suggestions="querySearch"
            @select="(item: any) => handleSelect(item, value)"
            placeholder="请输入客户编码"
            popper-class="customer-code-suggestion"
            v-model="value.customerCode"
            v-parse-space="(text: string) => handlePaste(text, index)"
            clearable
            :debounce="0"
            :disabled="!!customCode && index === 0"
            @change="(e: string) => handleChange(e, value)"
            :trigger-on-focus="customerList.length > 0"
          >
            <template #default="{ item }">
              <div :class="['customer-code-option', hasChoosed(item) && 'hasChoosed']" v-if="item.customerCode">
                <span class="format-text" v-html="item.formatText"></span>
                <span class="choosed ml_3" v-if="hasChoosed(item)">已选</span>
              </div>
            </template>
            <template #prefix>
              <span v-if="!!customCode && index === 0" class="cur-bind">当前绑定</span>
            </template>
          </el-autocomplete>
          <span :class="['del-btn', disabledBtn(index) && 'disabledBtn']" @click="handleDelCustomerCode(index)">
            <div class="del-icon"></div>
          </span>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
/**
 * 申请绑定其他公司-客户编码输入表单(TS 版)
 * 来源: netc-pc-web/src/views/setting/user/components/customer-code-list/bind-customer-code-form.vue
 *  - @vue/composition-api -> vue script setup
 *  - root.$set -> vue3 响应式直接赋值
 *  - v-parseSpace:calback 参数形式 -> v-parse-space 值形式(本目录 directives/parse-space)
 *  - element-ui autocomplete 实例 getData(粘贴原文回填) -> parse-space 指令已派发 input 事件,
 *    autocomplete 自动重新拉取建议, 粘贴回调内仅重新聚焦保持下拉展开
 *  - UserService.applyBindOtherCustomerCheck / getFrontRecommendCustomer -> 本目录 api.ts
 *  - v-kytrack 指令 -> 本目录 report.ts 显式上报(事件码不变)
 */
import { nextTick, reactive, ref, toRefs, watch } from 'vue'
import { sortBy } from 'lodash-es'
import { applyBindOtherCustomerCheck, getFrontRecommendCustomer } from '../../api'
import useCustomerCodeStore from '../../hooks/useCustomerCodeStore'
import { clkCustomerCodeBindApplyCompanyPopupButton } from '../../report'

defineOptions({ name: 'bind-customer-code-form' })

const props = defineProps<{
  formList?: any[]
  visible?: boolean
}>()

const emit = defineEmits(['delCustomerCode', 'update:disabled'])

const { customCode } = useCustomerCodeStore()

const state = reactive({
  ruleForm: {
    formList: [] as any[],
  },
  customerList: [] as any[],
})
const { ruleForm, customerList } = toRefs(state)

// el-autocomplete 动态列表 ref
const autoInputRefs = ref<any[]>([])
const setAutoInputRef = (el: any, index: number) => {
  if (el) autoInputRefs.value[index] = el
}

// 校验器需同步返回 void(FormItemRule.validator 类型), 异步校验在 doValidateCustomer 内部完成
const validateCustomer = (rule: any, value: string, callback: (error?: Error) => void) => {
  doValidateCustomer(rule, value, callback)
}

const doValidateCustomer = async (rule: any, value: string, callback: (error?: Error) => void) => {
  const idx = rule.field.match(/\d/)?.[0]
  const customerCode = state.ruleForm.formList[Number(idx)]?.customerCode
  if (!/\S/.test(value) || typeof value === 'undefined') {
    return callback()
  }
  // 当前绑定不校验
  if (customCode.value && rule.field.includes('0')) {
    return callback()
  }
  if (!/\d/.test(customerCode)) {
    return callback(new Error('请输入正确的客户编码'))
  }
  const res = await applyBindOtherCustomerCheck(customerCode)
  if (res.code !== 0 && res.msg) {
    return callback(new Error(res.msg))
  }
  const existIndex = state.ruleForm.formList.findIndex((f) => f.customerCode === customerCode)
  const list = state.ruleForm.formList.filter((_val, index) => Number(idx) !== index)
  const exist = list.find((f) => f.customerCode === customerCode)
  if (exist && Number(idx) !== existIndex) {
    return callback(new Error('不可输入相同的公司'))
  }
  callback()
}

const ruleFormRef = ref()

const formRules = {
  customerCode: [{ validator: validateCustomer, trigger: 'change' }],
}

function disabledBtn(index: number) {
  if (customCode.value) {
    if (index === 0 || state.ruleForm.formList.length <= 2) {
      return true
    }
  } else {
    if (index === 0) {
      return true
    }
  }
  return false
}

/** 获取推荐绑定公司列表 */
async function fetchCustomerCodeList() {
  try {
    const res = await getFrontRecommendCustomer()
    if (res.code === 0 && res.data) {
      state.customerList = res.data
    } else {
      state.customerList = []
    }
  } catch (e) {
    console.log(e, ':>> e')
  }
}

function _createFilter(queryString: string) {
  return (f: any) => {
    return (
      f.customerCode?.toLowerCase().indexOf(queryString.toLowerCase()) === 0 ||
      f.customerShortName?.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

function querySearch(queryString: string, cb: (results: any[]) => void) {
  let results = queryString ? state.customerList.filter(_createFilter(queryString)) : state.customerList
  results = sortBy(results, (f) => hasChoosed(f))
  results = results.map((item) => {
    const formatText = `${item.customerShortName}（${item.customerCode}）`
    return {
      ...item,
      formatText: formatText.replace(new RegExp(`(${queryString})`, 'ig'), "<span style='color:#8365f6'>$1</span>"),
    }
  })
  cb(results)
}

function handleSelect(item: any, value: any) {
  if (hasChoosed(item)) {
    value.customerCode = ''
    value.customerShortName = ''
    return
  }
  if (item) {
    value.customerCode = item.customerCode
    value.customerShortName = item.customerShortName
  }
}

function handlePaste(_text: string, index: number) {
  // parse-space 指令已派发 input 事件, autocomplete 自动重新拉取建议; 此处重新聚焦保持下拉展开
  nextTick(() => {
    autoInputRefs.value[index]?.focus()
  })
}

function handleChange(e: string, value: any) {
  const existObj = state.ruleForm.formList.find((f) => f.customerCode === e)
  if (existObj) value.customerCode = existObj.customerCode
}

/** 推荐列表当前已选择 */
function hasChoosed(item: any) {
  const findData = state.ruleForm.formList.find((f) => {
    return f.customerCode === item.customerCode && f.customerShortName === item.customerShortName
  })
  return Boolean(findData)
}

function resetForm() {
  ruleFormRef.value?.resetFields()
}

function handleDelCustomerCode(index: number) {
  clkCustomerCodeBindApplyCompanyPopupButton({ button_name: '删除' })
  emit('delCustomerCode', index)
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      fetchCustomerCodeList()
      state.ruleForm.formList = props.formList || []
    }
  },
  { immediate: true }
)

watch(
  () => props.formList,
  (val) => {
    let _count = 0
    ;(val || []).forEach((f) => {
      if (f.customerCode) {
        _count += 1
      }
    })
    if (customCode.value) {
      emit('update:disabled', _count <= 1)
    } else {
      emit('update:disabled', _count <= 0)
    }
  },
  { deep: true }
)

defineExpose({
  ruleForm,
  ruleFormRef,
  resetForm,
})
</script>

<style lang="scss" scoped>
.bind-customer-code__list {
  .bind-customer-code__item {
    display: flex;
    align-items: center;
    :deep(.el-form-item) {
      margin-bottom: 20px;
      flex: 1;
      .el-autocomplete {
        flex: 1;
      }
    }
    :deep(.el-form-item__error) {
      padding-top: 2px;
    }
    :deep(.el-input__inner) {
      border-radius: 2px !important;
      padding: 0 25px 0 9px !important;
      height: 34px;
      line-height: 34px;
    }
    // 当前绑定行: 无边框灰底融合态(对齐老基座)
    &.disabled {
      :deep(.el-input__wrapper) {
        box-shadow: none !important;
        background-color: #f5f7fa;
      }
      :deep(.el-input.is-disabled .el-input__inner) {
        background-color: transparent;
        color: #8c8f99;
      }
    }
    .cur-bind {
      position: absolute;
      left: 110px;
      font-size: 12px;
      color: #03050d;
      background: #ffffff;
      border: 1px solid #e5e6eb;
      border-radius: 2px;
      padding: 0 6px;
      margin-right: 6px;
      white-space: nowrap;
      line-height: 20px;
    }
    .del-btn {
      cursor: pointer;
      width: 34px;
      height: 34px;
      margin-left: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f4f5f7;
      border-radius: 2px;
      color: #8c8f99;
      border: 1px solid #e7e7e7;
      .del-icon {
        width: 40%;
        height: 1px;
        background: #c6c6c6;
      }
      &:hover {
        color: #8a61f2;
      }
      &.disabledBtn {
        cursor: not-allowed;
        opacity: 0.4;
      }
    }
  }
}
</style>
