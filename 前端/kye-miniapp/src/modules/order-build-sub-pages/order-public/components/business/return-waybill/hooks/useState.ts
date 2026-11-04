import { switchFlag, returnWaybillValue } from './state'

export const useSwitchFlag = () => {
  const setSwitchFlag = (value: boolean) => {
    switchFlag.value = value
  }

  return { switchFlag, setSwitchFlag }
}

export const useReturnWaybillValue = () => {
  const setReturnWaybillValue = (value: string) => {
    returnWaybillValue.value = value
  }

  return { returnWaybillValue, setReturnWaybillValue }
}
