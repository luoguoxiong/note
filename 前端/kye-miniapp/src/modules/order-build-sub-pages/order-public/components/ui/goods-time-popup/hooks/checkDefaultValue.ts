import { PickTime } from '../type'
/**
 * 需求描述：批次和自定义切换时
 *     如果切换前选中的时间，在切换后的组件对应的选项中：年月日 时分秒全都能匹配上，则选中
 *     否则：设置为初始状态
 * 数据结构为: 如下，最大为三层，采用递归,限制为子级数据 && 层数3
 * [
 *    {
 *    .   text: 'XXX', value: 'YYYY/MM/DD', children: [
 *    .   .   {
 *    .   .   .    text: 'XXX', value: 'YYYY/MM/DD', children:[...]
 *    .   .   }
 *    .   ]
 *    }
 * ]
 * @param pickData 可选数据对象
 * @param selectTime 当前时间 YYYY/MM/DD HH:mm
 * @param selfSignFlag 是否为自定义
 */
export const checkDefaultValue = (pickData: PickTime[], selectTime: string, selfSignFlag: boolean) => {
  if (!selectTime) {
    return []
  }
  let defaultValue: string[] = []
  const yearStr = selectTime.split(' ')[0]
  const time = selectTime?.split(' ')[1]
  const hour = time?.split(':')[0]
  const munite = time?.split(':')[1]
  if (selfSignFlag) {
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
 * 组装默认值结果
 * @param params
 *    pickData 可选数据对象
 *    defaultValue 初始默认值
 *    indexNum 开始匹配层级
 *    result 组装结果
 */
const buildResult = (params: { pickData: PickTime[]; defaultValue: string[]; indexNum: number; result: string[] }) => {
  const { pickData, defaultValue, indexNum, result } = params

  // 终止条件 子级有值 且 indexNum 最大为3
  if (pickData?.length && indexNum <= 3) {
    for (let i = 0; i < pickData.length; i++) {
      const curTimeObj = pickData[i]
      if (curTimeObj.value === defaultValue[indexNum]) {
        result.push(curTimeObj.value)
        if (curTimeObj.children && curTimeObj.children.length) {
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
