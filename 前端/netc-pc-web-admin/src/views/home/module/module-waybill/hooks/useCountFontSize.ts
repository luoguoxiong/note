import { thousandSeparatorReplacer } from '@/utils/regexp'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

export const useCountFontSize = () => {
  const elementRef = ref<HTMLElement>()

  const countRef = ref<number>()

  const fontSizeRef = ref<string>('')

  const calculateValue = (str: string, baseValue: number) => {
    const length: number = str.length

    if (length === 6) {
      return baseValue - 2
    }
    if (length === 7) {
      return baseValue - 6
    }
    return baseValue
  }

  const updateFontSize = () => {
    if (elementRef.value && `${countRef.value}`) {
      const styles = window.getComputedStyle(elementRef.value)
      const fontSize = styles.getPropertyValue('--font-size').trim()
      fontSizeRef.value = `${calculateValue(`${countRef.value}`, +fontSize)}px`
    }
  }

  const toLocaleString = (number: string) => {
    return thousandSeparatorReplacer(number, ',')
  }

  watch(
    [elementRef, countRef],
    () => {
      updateFontSize()
    },
    {
      immediate: true,
    }
  )

  onMounted(() => {
    window.addEventListener('resize', updateFontSize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateFontSize)
  })

  return { toLocaleString, fontSizeRef, elementRef, countRef }
}
