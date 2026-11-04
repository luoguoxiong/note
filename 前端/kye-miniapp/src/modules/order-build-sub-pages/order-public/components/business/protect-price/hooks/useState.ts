import { declared, premium, premiumType, originalPremium, visible, originalDeclared } from './state'
import { useGlobalPopover } from '@order-global-package-order-sub/components/business/popover-effect/hooks/useUpdate'
const { removeValidateSinge } = useGlobalPopover()
export const useDeclared = () => {
  const setDeclared = (value: string | number) => {
    declared.value = value
  }

  return { declared, setDeclared }
}

export const usePremium = () => {
  const setPremium = (value: string | number) => {
    premium.value = value
  }

  return { premium, setPremium }
}

export const usePremiumType = () => {
  const setPremiumType = (value: number | null) => {
    premiumType.value = value
  }

  return { premiumType, setPremiumType }
}

export const useOriginalPremium = () => {
  const setOriginalPremium = (value: string | number) => {
    originalPremium.value = value
  }

  return { originalPremium, setOriginalPremium }
}

export const useVisible = () => {
  const setVisible = (value: boolean) => {
    visible.value = value
    removeValidateSinge()
  }

  return { visible, setVisible }
}

export const useOriginalDeclared = () => {
  const setOriginalDeclared = (value: string | number) => {
    originalDeclared.value = value
  }

  return { originalDeclared, setOriginalDeclared }
}
