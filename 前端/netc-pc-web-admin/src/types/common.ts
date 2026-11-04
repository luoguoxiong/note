// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any

export type PlainObject = Record<string, Any>

export interface GlobalEvent {
  onClick?: ((evt: MouseEvent) => Any) | undefined
  onChange?: (row: Any) => void
}

/**
 * @description 用户信息
 */
export interface UserInfo {
  phone: string //下单手机(登录手机号)
  nickName: string //昵称
  name: string //姓名
}

export interface Options {
  label: string
  value: number | string
}
