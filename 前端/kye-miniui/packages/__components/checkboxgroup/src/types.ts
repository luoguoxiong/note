import { ComputedRef, ExtractPropTypes, InjectionKey } from 'vue'
import { ChildrenContext } from '@packages/__components/checkboxgroup/src/hooks/types'

export const checkboxgroupProps = {} as const

export type CheckboxgroupProps = ExtractPropTypes<typeof checkboxgroupProps>

export type CheckboxGroupExtra = {
  name: ComputedRef<any>
  disabled: ComputedRef<boolean>
  size: ComputedRef<string | undefined>
  iconSize: ComputedRef<string | undefined>
  // ...
}

export type CheckboxChild = {
  // 子组件暴露给父组件的能力
}

export const CHECKBOX_KEY = Symbol('CHECKBOX_KEY') as InjectionKey<ChildrenContext<CheckboxChild, CheckboxGroupExtra>>
