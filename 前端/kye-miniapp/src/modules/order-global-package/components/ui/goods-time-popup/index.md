# GoodsTimePopup 货好时间选择弹窗

## 组件介绍

货好时间选择弹窗组件，用于选择货物准备好的时间。支持两种模式：
- **线上模式**（online）：按照后台配置的时间批次进行选择
- **自定义模式**（custom）：用户自定义选择具体时间

## 组件结构

```
goods-time-popup/
├── index.vue          # 主组件（底部弹窗容器）
├── online/            # 线上时间选择子组件
│   └── index.vue
├── custome/           # 自定义时间选择子组件
│   └── index.vue
├── footer/            # 底部操作栏组件
│   ├── index.vue
│   └── index.scss
├── base/              # 基础布局组件
│   ├── index.vue
│   └── index.scss
├── empty/             # 空状态组件
│   ├── index.vue
│   └── index.scss
├── hooks/             # 时间列初始化 hooks
│   ├── index.ts
│   ├── useCustomerColumns.ts
│   └── useOnlineBatchColumns.ts
├── goods-time.ts      # 类型定义
├── utils.ts           # 工具函数
└── index.scss         # 全局样式
```

## Props 属性

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `visible` | `boolean` | 否 | `false` | 弹窗显示状态（支持 v-model） |
| `goodsTime` | `string` | 否 | - | 当前选中的货好时间，格式：`YYYY-MM-DD HH:mm` |
| `selfSignFlag` | `boolean` | 否 | - | 是否支持自定义时间（时分秒选择） |
| `urgentGoods` | `UrgentGoods` | 否 | - | 是否为急件 |
| `config` | `GoodsTimeVo` | 是 | - | 货好时间配置数据 |

## Events 事件

| 事件名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `update:visible` | `visible: boolean` | 弹窗关闭时触发，更新 visible 状态 |
| `selectTime` | `{ type: string; data: GoodsTime }` | 用户选择时间后触发 |

## 类型定义

### GoodsTimeType

货好时间类型枚举：

```typescript
export enum GoodsTimeType {
  'ONLINE' = 'online',   // 按线上逻辑
  'CUSTOM' = 'custom',   // 自定义时间
}
```

### GoodsTimeFlag

货好时间标志枚举：

```typescript
export enum GoodsTimeFlag {
  NOW = 10,              // 现在货好
  NONE = '',             // 无标志
  LATER_NOTIFIED = 20,   // 稍后通知
}
```

### UrgentGoods

急件标志枚举：

```typescript
export enum UrgentGoods {
  'URGENT' = '10',
}
```

### GoodsTime

货好时间数据结构：

```typescript
export interface GoodsTime {
  goodsTime: string           // 货好时间，格式：YYYY-MM-DD HH:mm
  goodsTimeFlag?: GoodsTimeFlag  // 货好时间标志
  urgentGoods?: UrgentGoods      // 急件标志
  selfSignFlag?: boolean         // 是否支持自定义时间
}
```

### GoodsTimeVo

货好时间配置 VO：

```typescript
export interface GoodsTimeVo {
  alias: string                          // 外显名称
  inputMode?: GoodsTimeType              // 输入模式
  crmGoodsTimeConfig: CrmGoodsTimeConfig // CRM 货好时间配置（线上模式）
  erpGoodsTimeConfig: GoodsTimeConfig | null // ERP 货好时间配置（自定义模式）
  goodsTimeFlagVisible?: boolean         // 是否显示货好时间标志
}
```

### CrmGoodsTimeConfig

线上模式配置：

```typescript
export interface CrmGoodsTimeConfig {
  goodsTips: string                    // 静默提示文案
  goodsTimeFlag?: GoodsTimeFlag | boolean  // 是否显示现在货好按钮
  timeRange: TimeRangeOnline           // 时间范围配置
  goodsTimeNotifyLater?: boolean       // 是否展示稍后通知按钮
}
```

### GoodsTimeConfig

自定义模式配置：

```typescript
export interface GoodsTimeConfig {
  alias: string                       // 外显名称
  packageGoodsTimeType: GoodsTimeType // 货好时间类型
  timeRangeList: TimeRange[]          // 时间范围列表（支持多段配置）
  defaultGoodsTime: DefaultGoodsTime  // 默认填充货好时间
  goodsTimeFlag: boolean              // 是否显示现在货好按钮
  goodsTips: string                   // 静默提示文案
  visible?: boolean                   // 是否可见
  disabled?: boolean                  // 是否禁用
  notifyLater?: string                // 稍后通知文案
  goodsTimeNotifyLater?: boolean      // 是否展示稍后通知按钮
}
```

### TimeRangeOnline

线上时间范围：

```typescript
export interface TimeRangeOnline {
  startDate: string      // 开始日期
  startTime: string      // 开始时间
  endDate: string        // 结束日期
  endTime: string        // 结束时间
  minuteStep?: number    // 时间间隔（分钟）
  hourStep?: number      // 小时间隔
  timeBatch?: string[]   // 时间批次列表
  timePeriodType?: PeriodType  // 时间类型（时间点/时间范围）
  intervalMinuteOffset?: number // 时间偏移量（分钟）
}
```

### TimeRange

自定义时间范围：

```typescript
export interface TimeRange {
  startDate: string      // 开始日期
  startTime: string      // 开始时间
  endDate: string        // 结束日期
  endTime: string        // 结束时间
  interval?: number      // 时间间隔（分钟）
  minuteStep?: number    // 分钟间隔
  timePeriodType?: PeriodType  // 时间类型
}
```

### PeriodType

时间类型枚举：

```typescript
export enum PeriodType {
  '时间点' = 20,
  '时间范围' = 10,
}
```

### DefaultGoodsTime

默认填充时间类型：

```typescript
export enum DefaultGoodsTime {
  'NO_GOODS_TIME' = 'noGoodsTime',  // 无需货好
  'CURRENT_TIME' = 'currentTime',    // 当前时间
  'ONE_HOURS' = 'oneHours',          // 1小时后
}
```

## 使用示例

### 基础用法

```vue
<template>
  <GoodsTimePopup
    v-model:visible="showPopup"
    :goods-time="currentGoodsTime"
    :self-sign-flag="selfSignFlag"
    :urgent-goods="urgentGoods"
    :config="goodsTimeConfig"
    @select-time="handleSelectTime"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GoodsTimePopup from './components/ui/goods-time-popup/index.vue'
import { GoodsTimeType, GoodsTimeVo } from './components/ui/goods-time-popup/goods-time'

const showPopup = ref(false)
const currentGoodsTime = ref('2025-10-21 14:30')
const selfSignFlag = ref(false)
const urgentGoods = ref('10')

const goodsTimeConfig: GoodsTimeVo = {
  alias: '货好时间',
  inputMode: GoodsTimeType.ONLINE,
  crmGoodsTimeConfig: {
    goodsTips: '请选择货好时间',
    goodsTimeFlag: true,
    timeRange: {
      startDate: '2025-10-21',
      startTime: '08:00:00',
      endDate: '2025-10-25',
      endTime: '20:00:00',
      minuteStep: 15,
      timeBatch: ['09:00', '14:00', '18:00'],
    },
    goodsTimeNotifyLater: true,
  },
  erpGoodsTimeConfig: null,
}

const handleSelectTime = (data: { type: string; data: GoodsTime }) => {
  console.log('选择的货好时间:', data)
  currentGoodsTime.value = data.data.goodsTime
}
</script>
```

### 自定义模式示例

```typescript
const goodsTimeConfig: GoodsTimeVo = {
  alias: '货好时间',
  inputMode: GoodsTimeType.CUSTOM,
  crmGoodsTimeConfig: {} as CrmGoodsTimeConfig,
  erpGoodsTimeConfig: {
    alias: '货好时间',
    packageGoodsTimeType: GoodsTimeType.CUSTOM,
    timeRangeList: [
      {
        startDate: '2025-10-21',
        startTime: '09:00:00',
        endDate: '2025-10-23',
        endTime: '18:00:00',
        interval: 30,
      },
      {
        startDate: '2025-10-24',
        startTime: '10:00:00',
        endDate: '2025-10-25',
        endTime: '17:00:00',
        interval: 15,
      },
    ],
    defaultGoodsTime: 'currentTime',
    goodsTimeFlag: true,
    goodsTips: '请选择预计货好时间',
    goodsTimeNotifyLater: true,
  },
}
```

## 核心逻辑说明

### 模式切换机制

组件根据 `config.inputMode` 确定使用哪种模式：
- `online`：使用线上批次时间选择
- `custom`：使用自定义时间选择

### 时间过滤规则

1. **过去时间过滤**：自动过滤掉当前时间之前的可选时间
2. **时间间隔处理**：当前时间 + 5分钟 + 配置间隔时间 之后的时间才可选
3. **日期显示转译**：
   - 当天显示为「今天」
   - 明天显示为「明天」
   - 后天显示为「后天」
   - 其他日期显示为 `YYYY/MM/DD` 格式

### 急件特殊处理

当 `urgentGoods === '10'` 且 `selfSignFlag === true` 时：
- 显示「显示全天时间」开关
- 开启后可选择全天任意时间（分钟级精度）
- 关闭后仅显示配置的时间批次

## 注意事项

1. **数据格式要求**：
   - 日期格式：`YYYY-MM-DD`
   - 时间格式：`HH:mm:ss`（配置）或 `HH:mm`（显示）
   - 货好时间格式：`YYYY-MM-DD HH:mm`

2. **空状态处理**：当没有可选时间时，显示活动已结束的空状态提示

3. **默认值匹配**：切换模式时，如果切换前选中的时间在切换后的选项中完全匹配（年月日时分秒），则保持选中状态；否则重置为初始状态

4. **时区处理**：所有时间均使用本地时区，未涉及 UTC 转换