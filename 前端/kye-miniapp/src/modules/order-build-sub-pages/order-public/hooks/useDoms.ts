import { GLOBAL_CONFIG_MAP, addKeyInExistMap, setComponentListAndMap } from '@order-public-sub-public/configs'
import { ModuleType } from '@order-public-sub-public/constants'
import { ref } from 'vue'

const root = ref<HTMLElement | null>(null)

const blocks = ref<HTMLElement[]>([])

const componentList = ref<string[]>([])

export const comRenderList = ref<string[]>([])

/**
 * @description 获取最后一个非空的元素
 * @param root
 * @param selector
 */
const getLastNotEmptyCellElement = (root: Element, selector: string) => {
  if (!root) {
    return null
  }

  const items = root.querySelectorAll(selector)

  for (let i = items.length - 1; i > 0; i--) {
    const item = items[i]
    const cell = item.querySelector('.driver')
    if (item.children.length && cell) {
      return cell
    }
  }

  return null
}

/**
 * @description 获取block中的最后一个cell,并且标记
 * @param root
 */
const getLastCell = (block: Element) => {
  return getLastNotEmptyCellElement(block, '.row')
}

/**
 * @description 给最后一个元素加上data-last-cell
 */
const addAttributesForLastEmptyNodes = () => {
  if (!root.value) {
    return
  }

  blocks.value = Array.from(root.value.querySelectorAll('.block'))

  const lastCellList = blocks.value.map((block) => getLastCell(block))

  lastCellList.forEach((cell) => cell?.setAttribute('data-last-cell', 'true'))
}

/**
 * @description 收集实际渲染的组件
 */
const collectExistComponents = () => {
  // blocks.value.forEach((block) => {
  //   // 同时有type和visible两个attribute认为是组件父容器
  //   const existsDivs = block.querySelectorAll(`div[type][visible]`)
  //   Array.from(existsDivs).forEach((div) => {
  //     const type = div.getAttribute('type') as ModuleType
  //     if (GLOBAL_CONFIG_MAP?.[type]) {
  //       componentList.value.push(type)
  //       addKeyInExistMap(div.getAttribute('type') as ModuleType)
  //     }
  //   })
  // })
  // setComponentListAndMap(componentList.value)
  const list = [...new Set(comRenderList.value)].filter((i) => GLOBAL_CONFIG_MAP[i])
  setComponentListAndMap(list)
  list.forEach((normal) => {
    addKeyInExistMap(normal as ModuleType)
  })
}

export const useDoms = (rootSelector?: string) => {
  componentList.value = []

  // 处理最后一个cell的border-bottom
  addAttributesForLastEmptyNodes()

  // 从dom收集实际渲染的组件
  collectExistComponents()
  if (!rootSelector) {
    return
  }
  root.value = document.querySelector(rootSelector)
}
