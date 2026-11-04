# TimeSelect 时间选择

聚合「精确时间选择」与「时间段选择」两个能力。通过 `ref` 调用 `openPreciseDialog` / `openRangeDialog` 打开对应弹窗，通过 `preciseConfirm` / `rangeConfirm` 事件接收结果。

## 基本使用

<preview path="../demos/time-select/time-select-1.vue" title="聚合组件使用" description="通过 ky-time-select 聚合组件使用"></preview>

<preview path="../demos/time-select/time-select-2.vue" title="独立组件使用" description="直接引入 PreciseTimeSelect 与 TimeRangePicker 使用"></preview>

## 组件 API

### Attributes 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|  ----  | ----  | ----  | ----  | ----  |
| choosable-times | 可选日期及对应时段数据，每项可同时包含 exactTimeRanges / matchPeriods / timeRanges 字段 | `Array<TimeSelectChoosableTime>` | — | `[]` |

### Methods 方法

| 方法名 | 说明 | 参数 | 返回值 |
|  ----  | ----  | ----  | ----  |
| openPreciseDialog | 打开精确时间选择弹窗 | `(timeValue?: string\|number\|Date, exactTimeEarliestStartTime?: string\|number\|Date)` | — |
| openRangeDialog | 打开时间段选择弹窗 | `({ startTime: string\|number\|Date, endTime: string\|number\|Date })` | — |

### Events 事件

| 事件名 | 说明 | 参数 | 返回值 |
|  ----  | ----  | ----  | ----  |
| precise-confirm | 精确时间选择确认 | `time: Date` | — |
| range-confirm | 时间段选择确认 | `{ startTime: Date, endTime: Date }` | — |

### Slots 插槽

| 插槽名 | 说明 | 参数 |
|  ----  | ----  | ----  |
|  |  |  |

## 命名导出

除默认的聚合组件 `TimeSelect` 外，还命名导出两个可独立使用的子组件：

- `PreciseTimeSelect`：精确时间选择（`ky-precise-time-select`）
- `TimeRangePicker`：时间段选择（`ky-time-range-picker`）
