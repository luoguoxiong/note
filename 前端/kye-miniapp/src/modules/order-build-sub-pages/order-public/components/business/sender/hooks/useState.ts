import { switchVisible } from './state'

export const useSwitchVisible = () => {
  const setSwitchVisible = (value: boolean) => {
    switchVisible.value = value
  }

  return { switchVisible, setSwitchVisible }
}
