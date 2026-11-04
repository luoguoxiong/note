import { defineStore } from 'pinia'
import { getCardConfig } from '@/public/apis/card-customize'
import { CARD_CONFIG_VERSION, WAYBILL_CONFIG_STATUS } from '@/public/constants/cardConfig'
import { VersionType } from '@/public/apis/card-customize/types'
import type { CardConfigMap, CardConfig, StatusConfig, CustomCode } from '@/public/apis/card-customize/types'
import { CUSTOM_CODE_PREFIX } from '@/public/components/business/waybill-card/config/codes'
import { useCustomerCodeEvent } from '@public/storage/hooks/useCustomerCodeEvent'
/**
 * 过滤掉 waybillInfoConfig.fields 中已失效的动态表头(KYFIELD-xxx)字段。
 * 失效指其 kyField 已不在当前 customCodes（kyFieldSet）中。
 * 在 store 加载配置时统一过滤，保证下游（卡片渲染/预览）拿到的 config 不含失效项。
 */
const filterStaleCustomCodeFields = (config: CardConfig, kyFieldSet: Set<string>): CardConfig => ({
  ...config,
  waybillInfoConfig: {
    ...config.waybillInfoConfig,
    fields: config.waybillInfoConfig.fields.filter((f) => {
      // 线上存在 f.code 缺失的数据，非 KYFIELD- 前缀（含 code 缺失）直接保留
      if (!f?.code?.startsWith(CUSTOM_CODE_PREFIX)) return true
      return kyFieldSet.has(f.code.slice(CUSTOM_CODE_PREFIX.length))
    }),
  },
})

export const useCardConfigStore = defineStore('cardConfig', {
  state: () => ({
    configMap: {} as CardConfigMap,
    customCodes: [] as CustomCode[],
    /** 列表个性设置入口开关，接口返回控制 */
    cardConfigSwitch: false,
    loading: false,
    loaded: false,
  }),

  getters: {
    getConfigByStatus: (state) => {
      return (status: WAYBILL_CONFIG_STATUS): CardConfig | undefined => {
        return state.configMap[status]?.config
      }
    },
    getConfigPairByStatus: (state) => {
      return (status: WAYBILL_CONFIG_STATUS): { standardConfig: CardConfig | null; customConfig: CardConfig | null } => {
        const item = state.configMap[status]
        return {
          standardConfig: item?.standardConfig ?? null,
          customConfig: item?.customConfig ?? null,
        }
      }
    },
    getVersionByStatus: (state) => {
      return (status: WAYBILL_CONFIG_STATUS): VersionType => {
        return state.configMap[status]?.currentVersion ?? VersionType.STANDARD
      }
    },
  },

  actions: {
    /**
     * 加载全量配置；失败不兜底，保持 configMap 为空、loaded=false，由各页面自行处理
     * @param options.force 是否强制重新加载数据
     */
    async loadAllConfigs(options = { force: false }) {
      
      // loading 中直接返回，force 也不能重复发起并发请求
      if (this.loading) {
        return
      }
      // force 仅绕过 loaded 检查，允许已加载后强制刷新
      if (this.loaded && !options.force) {
        return
      }
      this.loading = true
      // force 模式下先清空旧配置，避免切换账号后请求失败时残留上个用户的配置
      if (options.force) {
        this.reset()
      }
      try {
        const res = await getCardConfig({ version: CARD_CONFIG_VERSION })
        if (res?.data?.configs) {
          // 先取 customCodes，用于过滤失效的动态表头字段
          const customCodes = res.data.customCodes || []
          const kyFieldSet = new Set(customCodes.map((c) => c.kyField))
          const map: CardConfigMap = {}
          for (const statusConfig of res.data.configs) {
            // 仅过滤 customConfig 中的失效动态表头(KYFIELD-xxx)；
            // standardConfig 为默认配置，不会含动态表头，无需过滤
            const filtered: StatusConfig = {
              ...statusConfig,
              customConfig: statusConfig.customConfig
                ? filterStaleCustomCodeFields(statusConfig.customConfig, kyFieldSet)
                : null,
            }
            map[statusConfig.waybillStatus] = {
              currentVersion: filtered.currentVersion,
              config: this.getConfigByVersion(filtered),
              standardConfig: filtered.standardConfig,
              customConfig: filtered.customConfig,
            }
          }
          this.configMap = map
          this.customCodes = customCodes
          this.cardConfigSwitch = res.data.cardConfigSwitch ?? false
          this.loaded = true
        }
        // 无 configs 时不兜底，loaded 保持 false，页面自行处理兜底逻辑
      } catch {
        // 加载失败不兜底，loaded 保持 false，页面自行处理兜底逻辑
      } finally {
        this.loading = false
      }
    },

    /**
     * 切换版本后定向刷新单个状态配置（get 支持 waybillStatus 单状态查询）
     * 失败不重置已有配置，保持本地切换结果
     */
    async loadConfigs(status: WAYBILL_CONFIG_STATUS) {
      try {
        const res = await getCardConfig({ version: CARD_CONFIG_VERSION, waybillStatus: status })
        const configs = res?.data?.configs
        if (configs?.length) {
          // 同步 customCodes（单状态查询也可能返回），用于过滤失效动态表头
          if (res?.data?.customCodes) this.customCodes = res.data.customCodes
          if (res?.data?.cardConfigSwitch !== undefined) this.cardConfigSwitch = res.data.cardConfigSwitch
          const kyFieldSet = new Set<string>(this.customCodes.map((c: CustomCode) => c.kyField))
          for (const config of configs) {
            // 仅过滤 customConfig 中的失效动态表头(KYFIELD-xxx)；standardConfig 无需过滤
            const filtered: StatusConfig = {
              ...config,
              customConfig: config.customConfig
                ? filterStaleCustomCodeFields(config.customConfig, kyFieldSet)
                : null,
            }
            this.configMap[config.waybillStatus] = {
              currentVersion: filtered.currentVersion,
              config: this.getConfigByVersion(filtered),
              standardConfig: filtered.standardConfig,
              customConfig: filtered.customConfig,
            }
          }
        }
      } catch {
        // 刷新失败保持本地已切换状态，不重置已有配置
      }
    },

    getConfigByVersion(statusConfig: StatusConfig): CardConfig {
      if (statusConfig.currentVersion === VersionType.CUSTOM && statusConfig.customConfig) {
        return statusConfig.customConfig
      }
      return statusConfig.standardConfig
    },

    /** 切换版本后本地同步当前版本与生效配置（作为刷新失败的兜底） */
    setCurrentVersion(status: WAYBILL_CONFIG_STATUS, version: VersionType) {
      const item = this.configMap[status]
      if (!item) return
      item.currentVersion = version
      item.config = version === VersionType.CUSTOM && item.customConfig ? item.customConfig : item.standardConfig
    },

    reset() {
      this.configMap = {}
      this.customCodes = []
      this.cardConfigSwitch = false
      this.loaded = false
    },
  },
})
