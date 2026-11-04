import { localCheckResult } from '@order-public-sub-public/types'

export const useValidate = () => {
  const validateCollection = async (): Promise<localCheckResult[]> => {
    const validateResult = [{ passed: true, content: '', key: '' }]

    return Promise.all(validateResult)
  }

  return {
    validateCollection,
  }
}
