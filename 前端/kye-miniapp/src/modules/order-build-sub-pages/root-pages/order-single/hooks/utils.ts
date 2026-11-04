import { FieldsConfig, Module, OrderInfo, PlainObject, QueryObject, Schema } from '@order-public-sub-public/types'
import { isBooleanString, transformNumberToBoolean } from '@order-public-sub-public/utils/string'
import { cloneDeep, get, merge, set } from 'lodash-es'
import { batchSchema, getChannel, initLayout, schema as defaultSchema } from '@order-public-sub-public/configs'
import { MODULE_CONFIG_TRANSFORM_RULES } from '@order-public-sub-public/configs/modules'
import { useRoute } from '@order-public-sub-public/vue-router/index'
import { Channel, ErrorCode, InitOrderStatus } from '@order-public-sub-public/constants'
import { getQueryObject } from '@order-public-sub-public/utils'
import { initErrorCode, initPageStatus, orderHomeRoute } from '@order-public-sub-root-pages/order-single/hooks/useInit'

/**
 * @description 单行竖线数据处理
 */
export const transformDataByRule = (data: string | PlainObject, rule: string) => {
  // 是对象不用解密
  if (typeof data === 'object') {
    return data
  }
  const result = {}
  const ruleArray = rule.split('|')
  const dataArray = data.split('|')
  ruleArray.forEach((key, index) => {
    let res: boolean | string = dataArray[index]
    let realKey = key
    // 把0和1转换为布尔值
    if (res === '0' || res === '1') {
      res = transformNumberToBoolean(res)
    }
    // 把v转换为visible
    if (key === 'v') {
      realKey = 'visible'
    }
    set(result, realKey, res)
  })
  return result
}

/**
 * @description 按规则转换|分割的数据
 */
export const transformDivideStringToData = (module: Record<string, Module>, rules: Record<string, string>) => {
  if (module) {
    for (const path in rules) {
      const data = get(module, path) as unknown as string | string[]
      const rule = rules[path]

      // 处理字符串场景
      if (typeof data === 'string') {
        const result = transformDataByRule(data, rule)
        set(module, path, result)
      } else if (Array.isArray(data)) {
        // 处理数组的场景
        set(
          module,
          path,
          data.map((item: string) => transformDataByRule(item, rule)),
        )
      }
    }
  }
}

/**
 * @description 布尔值转字符串
 * @param bool
 */
export const transformBooleanToNumber = (bool: boolean) => {
  if (bool === true) {
    return '1'
  } else {
    return '0'
  }
}

/**
 * @description 将对象转为|分割的字符串
 * @param module
 * @param rules
 */
export const transformDataToStringByRule = (data: Record<string, any>, rule: string) => {
  const ruleArray = rule.split('|')
  return ruleArray
    .map((key) => {
      let res = data[key]

      if (res === true || res === false) {
        res = transformBooleanToNumber(res)
      }

      return res
    })
    .join('|')
}

/**
 * @description 转换schema module部分对象，v转为visible,config内补充type并转换|分割的格式
 */
export const encryptModuleConfig = (module: Record<string, Module>, rules: Record<string, string>) => {
  if (module) {
    console.log('进入加密')
    for (const path in rules) {
      const data = get(module, path) as Record<string, any> | FieldsConfig[]
      const rule = rules[path]

      // 处理数组场景
      if (Array.isArray(data)) {
        set(
          module,
          path,
          data.map((item: FieldsConfig) => transformDataToStringByRule(item, rule)),
        )
      } else if (typeof data === 'object') {
        const result = transformDataToStringByRule(data, rule)
        set(module, path, result)
      }
    }
  }
  return module
}

/**
 * 覆盖默认schema-module: 目前只有运单审核/调价审核用到了
 * @param defaultSchema
 * @returns Schema
 */
export const updateModuleByChannel = (defaultSchema: Partial<Schema>) => {
  const channel = getChannel()
  const curDefaultSchema = cloneDeep(defaultSchema) as Schema

  // 调价审核和运单审核不可编辑
  if ([Channel.调价审核, Channel.运单审核].includes(channel)) {
    curDefaultSchema.module = Object.keys(curDefaultSchema.module).reduce(
      (pre, key) => {
        pre[key] = {
          ...curDefaultSchema.module[key],
          disabled: true,
        }
        return pre
      },
      {} as Record<string, Module>,
    )
    // 隐藏公司
    curDefaultSchema.module.OrderCustomer.v = false
    // 状态和原因
    curDefaultSchema.module.Banner.v = true
  }
  return curDefaultSchema
}

/**
 * @description 转换schema module部分对象，v转为visible,config内补充type并转换|分割的格式
 */
export const decryptModuleConfig = (inputSchema: Partial<Schema> = {}) => {
  const route = useRoute()
  const path = route.name === 'modules/order-build/pages/order/index' ? '/order' : ''
  // 修改基础schema
  const curDefaultSchema = updateModuleByChannel(defaultSchema)

  if (path === '/order') {
    curDefaultSchema.layout = initLayout(curDefaultSchema?.layout)
  }
  // 和基础schema合并
  const schema = merge(path === '/order-batch' ? cloneDeep(batchSchema) : curDefaultSchema, inputSchema)

  // 批量寄处理
  if (path === '/order-batch') {
    schema.layout = cloneDeep(batchSchema.layout)
  }

  const module = schema.module

  for (const key in module) {
    // v转为visible
    const currentVisible = module[key].v
    if (isBooleanString(currentVisible)) {
      module[key].visible = Boolean(currentVisible)
      delete module[key].v
    }

    // 补充type
    module[key].type = key
  }

  // 按规则转换|分割的形式
  transformDivideStringToData(module, MODULE_CONFIG_TRANSFORM_RULES)

  return schema
}

/**
 * @description 处理textCode
 * @param query
 */
export const handleTextCode = (query: QueryObject) => {
  // 处理textCode
  if (query?.textCode) {
    return query.textCode
  } else if (query?.waybillNo) {
    return query.waybillNo
  }

  return ''
}

/**
 * @description 处理extendInfo
 * @param query
 */
export const getExtendInfo = (query: QueryObject) => {
  const extendInfo = query?.extendInfo
  if (!extendInfo) {
    return
  }
  try {
    return JSON.parse(decodeURIComponent(extendInfo))
  } catch (e) {
    console.log(e)
    return
  }
}

/**
 * @description 处理configVersion
 * @param query
 */
export const handleConfigVersion = (query: QueryObject) => {
  if (query?.configVersion) {
    return query.configVersion
  } else if (query?.versionId) {
    return query.versionId
  }
  return ''
}
/**
 * @description 需要读取单票缓存接口的channel
 */
export const needGetCatchApiChannel = (channel = getChannel()) => {
  if (!channel) {
    return false
  }
  const needGetCacheChannelList = [Channel.快速寄件, Channel.再来一单, Channel.扫二维码下单, Channel.扫活动码下单]
  return needGetCacheChannelList.includes(channel)
}

/**
 * @description 初始化接口返回数据为合并后的数据包含的channel类型
 */
export const InitResponseDataMeragedType = (channel = getChannel()) => {
  return [Channel.调价审核, Channel.运单审核, Channel.返程单].includes(channel)
}

/**
 * @description 单票不需要读取缓存，需要调用process接口的channel
 */
export const needProcessApiChannel = (channel = getChannel()) => {
  if (!channel) {
    return false
  }
  const list = [Channel.修改运单, Channel.再来一单]
  return list.includes(channel)
}

/**
 * @description 单票需要本地缓存的channel
 */

export const needLocalCacheChannel = (channel = getChannel()) => {
  if (!channel) {
    return false
  }
  const list = [Channel.快速寄件]
  return list.includes(channel)
}

/**
 * @description 合并waybillInfo
 * @param orderInfo1
 * @param orderInfo2
 * @returns
 */
export const getCombinedOrderInfo = (baseOrderInfo: OrderInfo, orderInfo: OrderInfo) => {
  // 如果基础运单数据没有，直接使用后者
  if (!baseOrderInfo) {
    return orderInfo || {}
  }

  const result = cloneDeep(baseOrderInfo)

  for (const key in result) {
    if (Reflect.has(orderInfo, key)) {
      const target = Reflect.get(result, key)
      const source = orderInfo[key as keyof OrderInfo]
      // 如果取到的数据是对象且不为null，则合并，否则覆盖
      if (source && typeof source === 'object') {
        if (Array.isArray(source)) {
          // 如果是数组 直接使用
          Reflect.set(result, key, source)
        } else {
          Reflect.set(result, key, Object.assign({}, target, source))
        }
      } else {
        Reflect.set(result, key, source)
      }
    }
  }

  console.log('合并完成的waybillInfo', result)

  return result
}

/**
 * @description 处理初始化接口的入参
 */
export const handleInitQuery = () => {
  const queryObject = orderHomeRoute.value || (getQueryObject() as QueryObject)
  // 处理textCode
  const textCode = handleTextCode(queryObject)

  // 处理configVersion
  const configVersion = handleConfigVersion(queryObject)

  //渠道channel
  const channel = getChannel()

  //透传的额外参数
  const extendInfo = getExtendInfo(queryObject)

  // 组装入参
  const query = { ...queryObject, textCode, configVersion, channel, extendInfo, $taroTimestamp: undefined }

  return query
}

//设置初始化的报错code
export const setInitErrorCode = (error: any) => {
  if (!error?.code) {
    initErrorCode.value = null
    return
  }
  if (error.code === ErrorCode.运单已删除 && getChannel() === Channel.修改运单) {
    initPageStatus.value = InitOrderStatus.FAILED
  }
  initErrorCode.value = {
    code: error.code,
    msg: error?.msg,
  }
}

export const setOrderQuestionUUID = (): string => {
  return `orderId-${Date.now()}`
}
