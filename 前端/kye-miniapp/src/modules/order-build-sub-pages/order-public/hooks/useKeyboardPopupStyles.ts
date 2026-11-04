import { isAliPayClient, isIphone } from '@order-public-sub-public/utils/device'
import { computed, reactive, ref, CSSProperties } from 'vue'

type InputElement = HTMLInputElement | HTMLTextAreaElement

type RootSelector = string

type InputSelector = 'input' | 'textarea' | 'input,textarea'

interface PopupStyles {
  styles: CSSProperties
  inputs: Array<InputElement>
}

const rootSelectorRef = ref<RootSelector>()

const inputSelectorRef = ref<InputSelector>('input')

// popup额外样式
const styles = ref<CSSProperties>({
  maxHeight: '100%',
  transition: '0.3s', //让重新定位效果不显得突兀
  willChange: 'bottom',
  bottom: '0', // bottom默认为0
})

const allPopupStyles = reactive<Record<RootSelector, PopupStyles>>({})

const popupStyles = computed(() => {
  if (!rootSelectorRef.value) {
    return styles.value
  } else {
    const key = rootSelectorRef.value as RootSelector
    const data = allPopupStyles[key]
    if (!data) {
      allPopupStyles[key] = {
        styles: styles.value,
        inputs: [],
      }
    }
    return allPopupStyles[key].styles
  }
})

// 底部安全距离
const safeAreaBottom = ref(true)

/**
 * @description 聚焦之后，重新计算popup的bottom
 */
const onFocus = () => {
  setTimeout(() => {
    // 该属性仅支持>=IOS13，不存在则直接设置bottom为0
    if (window?.visualViewport) {
      const b = window.innerHeight - window.visualViewport.height
      allPopupStyles[rootSelectorRef.value as RootSelector].styles.bottom = `${b}px`
    } else {
      allPopupStyles[rootSelectorRef.value as RootSelector].styles.bottom = '0'
    }
    safeAreaBottom.value = false
  }, 100)
}

/**
 * @description 失焦还原
 */
const onBlur = () => {
  allPopupStyles[rootSelectorRef.value as RootSelector].styles.bottom = '0'
  safeAreaBottom.value = true
}

const addEventListener = (element: InputElement) => {
  element.addEventListener('focus', onFocus)
  element.addEventListener('blur', onBlur)
}

const removeEventListener = (element: InputElement) => {
  element.removeEventListener('focus', onFocus)
  element.removeEventListener('blur', onBlur)
}

/**
 * @description 核心函数，绑定事件，初始化数据
 * @param rootSelector
 * @param inputSelector
 */
const handleInputs = (rootSelector: `.${RootSelector}`, inputSelector: InputSelector) => {
  if (!isIphone || isAliPayClient) {
    return
  }

  rootSelectorRef.value = rootSelector
  inputSelectorRef.value = inputSelector

  const root = document.querySelector(rootSelectorRef.value)
  if (root) {
    const inputs = root.querySelectorAll(inputSelectorRef.value)

    allPopupStyles[rootSelectorRef.value] = {
      inputs: [],
      styles: styles.value,
    }

    allPopupStyles[rootSelectorRef.value].inputs = Array.from(inputs) as Array<InputElement>
    allPopupStyles[rootSelectorRef.value].inputs.forEach((input) => {
      addEventListener(input)
    })
  }
}

/**
 * @description 解绑指定rootSelector inputs事件
 */
const removeEvents = (rootSelector: string) => {
  allPopupStyles?.[rootSelector]?.inputs.forEach((input) => removeEventListener(input))
}

/**
 * @description 只有iPhone需要走这个hook重新计算bottom
 */
export const useKeyboardPopupStyles = () => {
  return { allPopupStyles, popupStyles, safeAreaBottom, handleInputs, removeEvents }
}
