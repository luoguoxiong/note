import { defineStore } from 'pinia'
import { OrderPageType, ModuleType, businessConfigType } from '@order-public-sub-public/constants'
import { SchemaConfig, SchemaState, ModuleDimensionType } from '../../types'
import { cloneDeep } from 'lodash-es'
import { schema } from '@order-public-sub-public/configs/schema'
import { uncapitalLize } from '@order-public-sub-public/utils/string'
import { Module, ModuleDimension, Schema } from '@order-public-sub-public/types'
import { useOrderRootStore } from '../../pinia'

export const useSchemaStore = defineStore('schema', {
  state: (): SchemaState => ({
    [OrderPageType.单票]: {
      configId: '',
      schema: cloneDeep(schema),
    },
    [OrderPageType.预览]: {} as SchemaConfig,
    [OrderPageType.批量寄单票]: {} as SchemaConfig,
    [OrderPageType.批量寄]: {} as SchemaConfig,
    [OrderPageType.返程单]: {} as SchemaConfig,
  }),

  // Getters
  getters: {
    currentSchema: (state) => {
      const rootStore = useOrderRootStore()
      return state[rootStore.getOrderPageType]
    },
    getSchemaByType: (state) => (orderPageType?: OrderPageType) => {
      const rootStore = useOrderRootStore()
      return state[orderPageType || rootStore.getOrderPageType]
    },
    moduleDimension: (state) => {
      const rootStore = useOrderRootStore()
      return state[rootStore.getOrderPageType].schema.data
    },

    /**
     *  @description 从schema.data中获取组件维度的通用getter
     *  @param 组件枚举类型 例如ModuleType['货物信息']
     *  示例 const moduleData = piniaStore.schema.moduleDimensionData(ModuleType['货物信息'])
     */
    moduleDimensionData: (state) => (type: ModuleDimensionType | ModuleType, orderPageType?: OrderPageType) => {
      const rootStore = useOrderRootStore()
      const data = state[orderPageType || rootStore.getOrderPageType]?.schema?.data || ({} as ModuleDimension)
      const uncapitalLizeType = uncapitalLize(type)
      return data?.[uncapitalLizeType as ModuleDimensionType] || {}
    },
    moduleConfigData:
      (state) =>
      (type: ModuleType, rootConfig = false, orderPageType?: OrderPageType) => {
        const rootStore = useOrderRootStore()
        const module = state[orderPageType || rootStore.getOrderPageType]?.schema?.module
        for (const key in module) {
          if (module[key].type === type) {
            if (!rootConfig) {
              return module[key].config
            } else {
              return module[key]
            }
          }
        }

        // 没有匹配到，默认返回空对象
        return {}
      },
    orderCustomer: (state) => {
      const rootStore = useOrderRootStore()
      return state[rootStore.getOrderPageType].schema.data.orderCustomer?.customerName || ''
    },
    getSchemaBusinessConfig: (state) => (key: businessConfigType, orderPageType?: OrderPageType) => {
      const rootStore = useOrderRootStore()
      const businessCheckConfig = state[orderPageType || rootStore.getOrderPageType].schema.config.businessCheckConfig
      if (businessCheckConfig && key === 'paymentAuth' && businessCheckConfig.paymentAuth !== undefined) {
        return businessCheckConfig.paymentAuth
      }
      const businessConfig = businessCheckConfig?.businessConfig || []
      const filterResult = businessConfig.filter((item) => item.key === key)
      if (filterResult.length) {
        return filterResult[0]
      } else {
        return null
      }
    },
    getSchemaBusinessCheckConfig: (state) => (orderPageType?: OrderPageType) => {
      const rootStore = useOrderRootStore()
      const orderPageConfig =
        state[orderPageType || rootStore.getOrderPageType].schema?.config?.businessCheckConfig || {}
      return orderPageConfig
    },
    getSchemaOrderConfig: (state) => (key: string, orderPageType?: OrderPageType) => {
      const rootStore = useOrderRootStore()
      const orderPageConfig =
        state[orderPageType || rootStore.getOrderPageType].schema?.config?.businessCheckConfig || {}
      const filterResult = Reflect.get(orderPageConfig, key)
      return filterResult ?? null
    },
  },

  // Actions
  actions: {
    updateOnlySchema(payload: { schema: Schema; orderPageType?: OrderPageType }) {
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].schema = payload.schema
    },
    updateSchema(payload: { staticConfig: SchemaConfig; orderPageType?: OrderPageType; reset?: boolean }) {
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      const { configId, versionId, currentThemeName, themeName, schema, ...rest } = payload.staticConfig
      const schemaData = { ...this[orderPageType].schema, ...schema }
      this[orderPageType] = {
        configId,
        versionId,
        themeName,
        currentThemeName,
        schema: schemaData,
        ...rest,
      }
    },
    updateData(payload: { data: ModuleDimension; orderPageType?: OrderPageType }) {
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      const { data } = payload
      const schemaData = this[orderPageType].schema.data
      for (const key in data) {
        const targetData = data[key as keyof ModuleDimension]
        // 如果目标数据是字符串或者是后端执行过的逻辑，才会覆盖
        if (typeof targetData === 'string') {
          Reflect.set(schemaData, key, targetData)
        } else if (typeof targetData === 'object' && targetData !== null) {
          Reflect.set(schemaData, key, Object.assign({}, Reflect.get(schemaData, key), targetData))
        }
      }
    },
    updateModuleDimensionByType(payload: {
      type: ModuleDimensionType
      data: ModuleDimension[typeof payload.type]
      waybillNumber?: string
      orderPageType?: OrderPageType
    }) {
      const rootStore = useOrderRootStore()
      const { type, data, orderPageType = rootStore.getOrderPageType } = payload
      const schemaData = this[orderPageType]?.schema?.data
      if (!schemaData) return
      const uncapitalLizeType = uncapitalLize(type) as ModuleDimensionType
      Reflect.set(schemaData, uncapitalLizeType, Object.assign({}, schemaData[uncapitalLizeType], data))
    },
    updateOrderCustomer(value: string) {
      const rootStore = useOrderRootStore()
      const orderPageType = rootStore.getOrderPageType
      this[orderPageType].schema.data.orderCustomer = { customerName: value }
    },
    updateBatchModuleDimension(payload: { data: ModuleDimension; orderPageType?: OrderPageType }) {
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].schema.data = payload.data
    },
    updateModuleConfigByType(payload: { type: ModuleType; data: Partial<Module>; orderPageType: OrderPageType }) {
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      const module = this[orderPageType].schema.module
      for (const key in module) {
        if (module[key].type === payload.type) {
          module[key] = { ...module[key], ...payload.data }
          break
        }
      }
    },
  },
})
