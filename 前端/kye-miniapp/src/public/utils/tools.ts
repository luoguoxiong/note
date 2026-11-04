import { promisify } from './taroApiPromises'

declare const wx: any

export const sleep = (timeout: number) =>
  new Promise((res) =>
    setTimeout(() => {
      res(true)
    }, timeout),
  )

export function compareVersion(v1: string, v2: string) {
  var s1 = v1.split('.')
  var s2 = v2.split('.')
  var len = Math.max(s1.length, s2.length)

  for (let i = 0; i < len; i++) {
    var num1 = parseInt(s1[i] || '0')
    var num2 = parseInt(s2[i] || '0')

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

type PlainObject = { [k: string]: any }

export function isObject(v: any): v is PlainObject {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

export function cloneValue<T>(v: T): T {
  if (Array.isArray(v)) return v.slice() as any
  if (isObject(v)) return { ...(v as any) } as any
  return v
}

/**
 * 返回一个新的对象：基于 target 深度合并 source（允许新增 key，保留 target 未被覆盖的 field）
 */
export function mergeDeepImmutable<T extends PlainObject, S extends PlainObject>(target: T, source: S): T & S {
  // 先浅克隆 target，保证不可变
  const out: PlainObject = Array.isArray(target) ? (target.slice() as any) : { ...target }

  for (const key of Object.keys(source)) {
    const sVal = source[key]
    const tVal = out[key]

    if (isObject(tVal) && isObject(sVal)) {
      // 递归合并两个对象（返回新的对象）
      out[key] = mergeDeepImmutable(tVal, sVal)
    } else {
      // 非对象 或 target 无该 key → 直接克隆赋值（覆盖或新增）
      out[key] = cloneValue(sVal)
    }
  }

  return out as T & S
}
/* 是否为空 */
export const isEmpty = (v) => v === null || v === undefined || v === ''
/* 是否为加密 */
export const isEncrypted = (v) => v.includes('***')
/* 字符串相等匹配 */
export const isEqualString = (a, b) => {
  // 都为 null / undefined / '' => 相等
  const isEmpty = (v) => v === null || v === undefined || v === ''
  if (isEmpty(a) && isEmpty(b)) return true
  // 其它情况，按字符串比较
  return String(a) === String(b)
}

export async function ensureWechatInstalled() {
  try {
    const res = await promisify<{ errMsg: string; hasWechatInstall: boolean }, undefined>(wx.miniapp.hasWechatInstall)(
      undefined,
    )
    return res.hasWechatInstall
  } catch {
    return false
  }
}
