<template>
  <form class="nut-form" action="#" @submit.prevent="() => false">
      <slot></slot>
  </form>
</template>

<script lang="ts" setup name="ky-form">
import { defineProps, computed, reactive, provide, ref, watch } from 'vue'
/*类型*/
import { FormItemRule } from "../../field/src/types";
import { FormErrorMessage, FormProps, FormRule, FormRules} from './types'
/*工具*/
import { getPropByPath, isPromise} from "./../../../utils/src/common";
import { useChildren } from "../../../utils/hooks/useChildren";
/*常量*/
import { FORM_FIRST_TIP, FORM_KEY, FORM_TIP_KEY } from './../commons'

const props = withDefaults(defineProps<FormProps>(), {
  modelValue: () => ({}),
  rules: () => ({}),
})
const emit = defineEmits(['validate'])

const firstErrorProp = ref<string | null>(null) // 第一个错误记录

/**
 * 错误提示对象，prop为key
 * @returns
 */
const formErrorTip = computed(() => reactive<any>({}))
provide(FORM_TIP_KEY, formErrorTip)
provide(FORM_FIRST_TIP, firstErrorProp)

/**
 * 收集子组件
 */
const { children, linkChildren } = useChildren(FORM_KEY)
linkChildren({ props })

/**
 * 清除表单错误信息
 * @returns
 */
const clearErrorTips = (prop?:string) => {
  Object.keys(formErrorTip.value).forEach((item) => {
    if(prop && item === prop || !prop){
      formErrorTip.value[item] = ''
    }
  })
}

/**
 * 重置
 * @returns
 */
const reset = (prop?:string) => {
  clearErrorTips(prop)
}

const tipMessage = (errorMsg: FormErrorMessage) => {
  if (errorMsg.message) {
    emit('validate', errorMsg)
  }
  formErrorTip.value[errorMsg.prop] = errorMsg.message
}

/**
 * 检查校验规则
 * @returns
 */
const checkRule = async (item: FormRule): Promise<FormErrorMessage | boolean> => {
  const { rules = [], prop } = item
  //公共的错误提示promise
  const errorPromise = (errorMsg: FormErrorMessage): Promise<FormErrorMessage> => {
    return new Promise((resolve, reject) => {
      try {
        tipMessage(errorMsg)
        resolve(errorMsg)
      } catch (error) {
        reject(error)
      }
    })
  }
  if (!prop) {
    console.warn('[NutUI] <FormItem> 使用 rules 校验规则时 , 必须设置 prop 参数')
  }

  const value:any = getPropByPath(props.modelValue, prop || '')
  //清除已有错误提示
  tipMessage({ prop, message: '' })
  const formRules: FormRules = props.rules || {}
  const _rules = [...(formRules?.[prop] || []), ...rules]
  //循环校验规则
  while (_rules.length) {
    const rule = _rules.shift() as FormItemRule
    const { validator, ...ruleWithoutValidator } = rule
    const { required, regex, message } = ruleWithoutValidator
    const errorMsg = { prop, message: message || '' }
    if (required) {
      if (!value && value !== 0) {
        return errorPromise(errorMsg)
      }
    }
    if (regex && !regex.test(String(value))) {
      return errorPromise(errorMsg)
    }
    if (validator) {
      const result = validator(value, ruleWithoutValidator)
      if (isPromise(result)) {
        try {
          const value = await result
          if (value === false) {
            return errorPromise(errorMsg)
          }
        } catch (error) {
          const validateErrorMsg = { prop, message: error as string }
          return errorPromise(validateErrorMsg)
        }
      } else {
        if (!result) {
          return errorPromise(errorMsg)
        }
      }
    }
  }
  return Promise.resolve(true)
}

/**
 * 获取所有子组件的校验规则
 * @returns
 */
const getTaskFromChildren = () => {
  const task: FormRule[] = []
  children.forEach((item) => {
    task.push({
      prop: item?.['prop'],
      rules: item?.['rules'] || []
    })
  })
  return task
}

/**
 * 校验
 * @param customProp 指定校验，用于用户自定义场景时触发，例如 blur、change 事件
 * @returns
 */
const validate = (customProp = '') => {
  return new Promise((resolve, reject) => {
    try {
      const task = getTaskFromChildren()
      const errors = task.map((item) => {
        if (customProp && customProp !== item.prop) {
          return Promise.resolve(true)
        }
        return checkRule(item)
      })
      // 清空旧 firstErrorProp
      firstErrorProp.value = null
      Promise.all(errors).then((errorRes) => {
        errorRes = errorRes.filter(item => item !== true)
        const res = { valid: true, errors: [] }
        if (errorRes.length) {
          res.valid = false
          res.errors = errorRes as any
          if (errorRes[0].prop) {
            // 设置第一个错误
            firstErrorProp.value = errorRes[0]
          }
        }
        resolve(res)
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 对外暴漏组件方法
 * @returns
 */
defineExpose({
  reset,
  validate
})
</script>

<style scoped lang="scss">
.ky-form {
}
</style>
