import { useExtendStore } from './modules/extend/pinia'
import { useGlobalDataStore } from './modules/globalData/pinia'
import { useOrderStore } from './modules/order/pinia'
import { useSchemaStore } from './modules/schema/pinia'

import { useOrderRootStore } from './pinia'

export const useStore = () => ({
  root: useOrderRootStore(),
  extend: useExtendStore(),
  globalData: useGlobalDataStore(),
  order: useOrderStore(),
  schema: useSchemaStore(),
})
