import { FormItemRule } from "../../field/src/types";

export type FormErrorMessage = {
  prop: string
  message: string
}

export type FormRule = {
  prop: string
  rules: FormItemRule[]
}
export type FormRules = {
  [key: string]: FormItemRule[]
}
export type FormProps = Partial<{
  modelValue: any
  rules: FormRules
  disabled: boolean
}>
