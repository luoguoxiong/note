/* eslint-disable max-params */
import { commaSeparatorReplacer, startWithWhitespaceOrCommaReplacer } from '@/utils/regexp'

// const COMMA = ','

// 给每一行某位自动添加一个换行符
export function processAndFormatString(input: string) {
  // 检查输入是否为空
  if (input.length === 0) {
    return ''
  }
  const COMMA = ','
  // 删除首字母空格或者回车
  input = startWithWhitespaceOrCommaReplacer(input, '')
  //一个或多个逗号或者中文逗号或者空格变为单个逗号
  input = commaSeparatorReplacer(input, COMMA)

  return input
}

// 数组删除下表为index的item值，返回删除的是第几个item
export function getArrayRemoveIndex(array: string[], item: string, index: number) {
  let count = 0
  for (let i = 0; i < array.length; i++) {
    if (array[i] === item) {
      count += 1
      if (i === index) {
        return count
      }
    }
  }
  return -1 // 如果找不到符合条件的元素，返回 -1
}

// 删除二维数组array中出现第count次的item
export function removeArrayItemByIndex(array: string[][], item: string, count: number) {
  let occurrences = 0
  for (let index = 0; index < array.length; index++) {
    const element = array[index]
    for (let temp = 0; temp < element.length; temp++) {
      const eleStrs = element[temp]
      if (eleStrs === item) {
        occurrences += 1
        if (occurrences === count) {
          element.splice(temp, 1)
          return array
        }
      }
    }
  }
  return array
}

// 获取倒数第二个逗号
export function getSecondLastCommaIndex(str: string) {
  // 查找倒数第一个逗号的位置
  const lastCommaIndex = str.lastIndexOf(',')

  // 如果没有逗号，返回 -1
  if (lastCommaIndex === -1) {
    return -1
  }

  // 查找倒数第二个逗号的位置
  const secondLastCommaIndex = str.lastIndexOf(',', lastCommaIndex - 1)

  return secondLastCommaIndex
}

// 删除字符串中第100个逗号或者换行符后面的字符串
export function removeAfternthCommaOrNewline(input: string, nthNum: number) {
  let commaCount = 0
  let newlineCount = 0
  let index = 0

  for (index = 0; index < input.length; index++) {
    if (input[index] === '\n') {
      newlineCount += 1
    } else if (input[index] === ',' && index + 1 < input.length && input[index + 1] !== '\n') {
      commaCount += 1
    }
    // 这里判断第nthNum个逗号和换行符的总和
    if (commaCount + newlineCount >= nthNum) {
      break
    }
  }

  // 如果找到了第nthNum个逗号或者换行符，返回截断后的字符串
  if (commaCount + newlineCount >= nthNum) {
    return {
      newString: input.substring(0, index),
      isOver100: true,
    }
  } else {
    return {
      newString: input,
      isOver100: false,
    }
  }
}

export function getSearchByCursorPosition(input: string, index: number): [number, number] {
  if (input.length === 0) {
    return [0, 0]
  }

  const lastIndex = input.length - 1
  let leftIndex = index - 1

  while (leftIndex > 0) {
    if (input[leftIndex] === ',') {
      leftIndex += 1
      break
    }
    leftIndex -= 1
  }
  let rightIndex = index
  while (rightIndex < lastIndex) {
    if (input[rightIndex] === ',') {
      break
    }
    rightIndex += 1
  }

  return [leftIndex, rightIndex]
}

export function replaceStringSection(str: string, start: number, end: number, replacement: string) {
  // 获取起始位置之前的部分
  const before = str.substring(0, start)
  // 获取结束位置之后的部分
  const after = str.substring(end)
  // 连接起始位置之前的部分、替换的字符串和结束位置之后的部分
  return before + replacement + after
}
