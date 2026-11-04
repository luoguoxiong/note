/**
 * @description 时间选择器数据结构
 */
export interface PickTime {
  text: string
  value: string
  children?: PickTime[]
}

/**
 * @description 检查默认选中值
 *
 * 需求描述：批次和自定义切换时，如果切换前选中的时间，在切换后的组件对应的选项中：
 * 年月日时分秒全都能匹配上，则保持选中；否则设置为初始状态
 *
 * 数据结构为三层嵌套数组，采用递归匹配，限制最大层级为3
 * @example
 * [
 *   { text: 'XXX', value: 'YYYY/MM/DD', children: [
 *     { text: 'XXX', value: 'HH:mm', children: [...] }
 *   ]}
 * ]
 *
 * @param pickData 可选数据对象
 * @param selectTime 当前时间（格式：YYYY/MM/DD HH:mm）
 * @param selfSignFlag 是否为自定义模式（自定义模式需要匹配到分钟，批次模式匹配到时分即可）
 * @returns 匹配到的默认值数组
 */
export const checkDefaultValue = (pickData: PickTime[], selectTime: string, selfSignFlag: boolean) => {
  if (!selectTime) {
    return []
  }

  let defaultValue: string[] = []
  const yearStr = selectTime.split(' ')[0] // 日期部分
  const time = selectTime?.split(' ')[1] // 时间部分
  const hour = time?.split(':')[0] // 小时
  const munite = time?.split(':')[1] // 分钟

  if (selfSignFlag) {
    // 自定义模式：日期 + 小时 + 分钟
    defaultValue = buildResult({
      pickData: pickData,
      defaultValue: [yearStr, hour, munite],
      indexNum: 0,
      result: [],
    })
    if (defaultValue.length !== 3) {
      return []
    }
  } else {
    // 批次模式：日期 + 时分
    defaultValue = buildResult({
      pickData: pickData,
      defaultValue: [yearStr, time],
      indexNum: 0,
      result: [],
    })
    if (defaultValue.length !== 2) {
      return []
    }
  }

  return defaultValue
}

/**
 * @description 递归组装默认值结果
 * @param params 递归参数
 * @param params.pickData 当前层级的可选数据
 * @param params.defaultValue 待匹配的默认值数组
 * @param params.indexNum 当前匹配层级索引
 * @param params.result 已匹配的结果数组
 * @returns 完整的匹配结果
 */
const buildResult = (params: { pickData: PickTime[]; defaultValue: string[]; indexNum: number; result: string[] }) => {
  const { pickData, defaultValue, indexNum, result } = params

  // 终止条件：子级有数据且层级不超过3
  if (pickData?.length && indexNum <= 3) {
    for (let i = 0; i < pickData.length; i++) {
      const curTimeObj = pickData[i]
      if (curTimeObj.value === defaultValue[indexNum]) {
        result.push(curTimeObj.value)
        if (curTimeObj.children && curTimeObj.children.length) {
          // 递归匹配下一层级
          buildResult({
            pickData: curTimeObj.children,
            defaultValue: defaultValue,
            indexNum: indexNum + 1,
            result: result,
          })
        }
        break
      }
    }
  }

  return result
}
