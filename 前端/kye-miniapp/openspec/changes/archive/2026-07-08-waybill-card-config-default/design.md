## Context

当前查件列表卡片为固定样式，字段展示逻辑分散在各个组件中。本次改造需要：
1. 统一配置管理，支持配置驱动渲染
2. 保持原有逻辑不变，在原有基础上叠加配置
3. 为后续配置页和接口联调奠定基础

**现有代码结构**：
- 查件列表页：`src/modules/kye-miniapp-waybill/src/components/waybill-search/index.vue`
- 运单卡片：`src/public/components/business/waybill-card/index.vue`
- 底部按钮：直接在 waybill-search/index.vue 的 `#cardBottom` slot 中渲染

**后端接口**：
- 查询配置：`web.query.cardConfig.get`
- 保存配置：`web.query.cardConfig.save`（暂不联调）
- 切换版本：`web.query.cardConfig.switch`（暂不联调）

## Goals / Non-Goals

**Goals:**
- 新增本地默认配置常量，所有字段 visible=true
- 新增 Pinia Store，支持配置加载、降级、版本切换
- 改造 waybill-card 组件，支持配置驱动渲染
- 新增运单信息字段组件，每个字段独立组件
- 改造底部按钮，叠加配置过滤逻辑
- 联调 web.query.cardConfig.get 接口

**Non-Goals:**
- 配置页开发（后续 change）
- 保存接口联调（后续 change）
- 切换版本接口联调（后续 change）
- 新手引导功能（后续 change）

## Decisions

### Decision 1: 字段组件方案

**选择**: 运单信息字段使用独立组件，通过 code 匹配渲染

**理由**:
- 每个字段渲染逻辑不同（时间字段有连带标签、费用字段需要权限判断）
- 独立组件易于维护和扩展
- 新增字段只需添加新组件

**替代方案**:
- v-if/else-if 判断：代码长，难维护
- 渲染函数配置：抽象层过重

### Decision 2: 配置叠加方案

**选择**: 在原有逻辑上叠加配置，原有函数保持不变

**理由**:
- 最小化改动，降低风险
- 原有逻辑经过验证，保持稳定
- 标准版/无配置时走原有逻辑，不受影响

**实现方式**:
```typescript
// 原有函数保持不变
const getMenus = (params) => { ... }

// 新增配置化函数
const getMenusWithConfig = (params) => {
  const original = getMenus(params)
  if (!functionConfig?.length) return original
  // 叠加配置过滤
  const hiddenCodes = new Set(functionConfig.filter(b => !b.visible).map(b => b.code))
  return original.filter(item => {
    if (!item.configCode) return true
    return !hiddenCodes.has(item.configCode)
  })
}
```

### Decision 3: 默认配置方案

**选择**: 所有字段 visible=true，状态判断由现有逻辑控制

**核心设计原则**: 默认配置必须表达为当前的列表卡片样式

**具体含义**:
- 默认配置 = 当前 UI 的完整字段列表
- 所有字段都设置为 visible=true
- 字段的 order 按当前 UI 的显示顺序排列
- 状态判断（哪些字段在哪些状态显示）由现有逻辑控制，不在默认配置中体现

**理由**:
- 默认配置是"标准版"的本地备份，必须与当前 UI 完全一致
- 接口失败时降级使用，用户看到的卡片样式不变
- 简化默认配置，不需要按状态区分
- 复用现有状态判断逻辑，避免重复维护

### Decision 4: Pinia Store 方案

**选择**: 使用 Pinia store 管理配置数据

**理由**:
- 应用级别缓存，多个页面共享（查件页面、配置页）
- 避免重复调用接口
- 支持用户切换检测（通过手机号变化）

**实现方式**:
```typescript
export const useCardConfigStore = defineStore('cardConfig', {
  state: () => ({
    configMap: {} as CardConfigMap,
    loading: false,
    loaded: false,
  }),
  getters: {
    getConfigByStatus: (state) => { ... },
    getVersionByStatus: (state) => { ... },
  },
  actions: {
    loadAllConfigs() { ... },
    updateConfig(status, config) { ... },
    reset() { ... },
  },
})
```

### Decision 5: 按钮配置化方案

**选择**: 使用 configCode 关联 MENU_LIST 和默认配置

**理由**:
- 统一管理按钮的 code
- 避免 code 写错或不一致
- 易于维护

**实现方式**:
```typescript
// MENU_LIST 中添加 configCode
{ label: '实名认证', type: 'canRealAuth', configCode: FunctionCode.CAN_REAL_AUTH }

// 默认配置中使用枚举
{ code: FunctionCode.CAN_REAL_AUTH, name: '实名认证', visible: true, fixed: true, order: 1 }
```

### Decision 6: 按钮渲染逻辑

**选择**: 前3个在底部右侧，order 最小的在最右边

**理由**:
- 符合用户习惯，常用按钮在右侧
- 与原有逻辑保持一致

**实现方式**:
```html
<!-- 前3个在底部右侧，反转后 order 最小的在最右边 -->
<ky-popover-menu :menus="getMenusWithConfig(data).slice(3)" />
<view v-for="item in getMenusWithConfig(data).slice(0, 3).reverse()">...</view>
```

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 接口返回数据格式与预期不符 | 渲染异常 | 使用 try-catch，降级到默认配置 |
| 字段组件过多 | 维护成本 | 统一接口，复用逻辑 |
| 底部按钮逻辑复杂 | 改动风险 | 只叠加配置，不改原有逻辑 |
| 多端兼容问题 | 样式/交互异常 | 重点测试微信/支付宝小程序 |

## Migration Plan

1. 新增配置常量和 Pinia Store
2. 新增字段组件
3. 改造 waybill-card 组件
4. 改造底部按钮
5. 联调 web.query.cardConfig.get 接口
6. 测试验证

**回滚策略**: 保留原有代码，通过配置开关控制新逻辑是否生效

## Open Questions

- 标签显示位置逻辑：时间字段全隐藏时，标签跟随寄收信息或单独一行
- 按钮配置合并：取货评价/派货评价/展会/修改运单的多个操作如何合并
