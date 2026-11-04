/**
 * 手动验证脚本（无测试运行器，用 `npx esno` 运行）。
 * 验证 buildReusedConfig / resolveInitialConfig / getPreviousStatus 是否符合 spec 场景。
 * 运行：npx esno openspec/changes/waybill-config/verify-utils.ts
 */
import {
  buildReusedConfig,
  resolveInitialConfig,
  getPreviousStatus,
} from '../../../src/modules/kye-miniapp-waybill/src/pages/waybill-config/utils'
import type { CardConfig } from '../../../src/public/components/business/waybill-card/config/types'

let pass = 0
let fail = 0
const assert = (cond: boolean, msg: string) => {
  if (cond) {
    pass++
    console.log(`  ✓ ${msg}`)
  } else {
    fail++
    console.error(`  ✗ ${msg}`)
  }
}
const codes = (list: Array<{ code: string }>) => list.map((f) => f.code)

// ===== 构造样例数据 =====
// 上一状态定制配置（待揽件）
const prevCustom: CardConfig = {
  senderReceiverConfig: {
    fields: [
      { code: 'DELIVERY_CITY', name: '寄件城市', visible: true, fixed: true },
      { code: 'DELIVERY_PERSON', name: '寄件人姓名', visible: false, fixed: false }, // 关闭 → 复用关闭
      { code: 'PICKUP_CITY', name: '收件城市', visible: true, fixed: true },
    ],
  },
  waybillInfoConfig: {
    // prev 顺序：货好时间(1) → 路由信息(2) → 寄件时间(3,关闭) → 创建时间(4,仅 prev)
    fields: [
      { code: 'GOODS_TIME', name: '货好时间', visible: true, order: 1 },
      { code: 'NEW_EXTERIOR_ROUTE_INFO', name: '路由信息', visible: true, order: 2 },
      { code: 'DELIVERY_TIME', name: '寄件时间', visible: false, order: 3 },
      { code: 'CREATION_TIME', name: '创建时间', visible: true, order: 4 }, // 仅 prev 存在
    ],
    maxSelect: 4,
  },
  functionConfig: {
    // prev：fixed(1,2) → 催取(3,开) → 催派(4,关) → 取消运单(5,仅 prev)
    buttons: [
      { code: 'CAN_REAL_AUTH', name: '实名认证', visible: true, fixed: true, order: 1 },
      { code: 'CAN_NEED_PAY', name: '去支付', visible: true, fixed: true, order: 2 },
      { code: 'CAN_TAKE', name: '催取', visible: true, fixed: false, order: 3 },
      { code: 'CAN_DELIVERY', name: '催派', visible: false, fixed: false, order: 4 },
      { code: 'CAN_CANCEL', name: '取消运单', visible: true, fixed: false, order: 5 }, // 仅 prev
    ],
  },
}

// 当前状态常规版本（待签收）
const standard: CardConfig = {
  senderReceiverConfig: {
    fields: [
      { code: 'DELIVERY_CITY', name: '寄件城市', visible: true, fixed: true },
      { code: 'DELIVERY_PERSON', name: '寄件人姓名', visible: true, fixed: false },
      { code: 'PICKUP_CITY', name: '收件城市', visible: true, fixed: true },
    ],
  },
  waybillInfoConfig: {
    // current 顺序：签收人 → 路由信息 → 货好时间 → 预计派送时间 → 寄件时间
    fields: [
      { code: 'RECEIVER', name: '签收人', visible: true, order: 1 }, // 仅 current
      { code: 'NEW_EXTERIOR_ROUTE_INFO', name: '路由信息', visible: true, order: 2 },
      { code: 'GOODS_TIME', name: '货好时间', visible: true, order: 3 },
      { code: 'FINAL_AGING', name: '预计派送时间', visible: true, order: 4 }, // 仅 current
      { code: 'DELIVERY_TIME', name: '寄件时间', visible: true, order: 5 },
    ],
    maxSelect: 4,
  },
  functionConfig: {
    // current：fixed(1,2) → 催取(3) → 催派(4) → 修改运单(5,仅 current)
    buttons: [
      { code: 'CAN_REAL_AUTH', name: '实名认证', visible: true, fixed: true, order: 1 },
      { code: 'CAN_NEED_PAY', name: '去支付', visible: true, fixed: true, order: 2 },
      { code: 'CAN_TAKE', name: '催取', visible: true, fixed: false, order: 3 },
      { code: 'CAN_DELIVERY', name: '催派', visible: true, fixed: false, order: 4 },
      { code: 'CAN_MODIFY', name: '修改运单', visible: true, fixed: false, order: 5 }, // 仅 current
    ],
  },
}

console.log('\n===== buildReusedConfig =====')
const reused = buildReusedConfig(standard, prevCustom)

console.log('\n寄收模块：')
console.log('  复用后:', reused.senderReceiverConfig.fields.map((f) => `${f.code}(visible=${f.visible},fixed=${f.fixed})`).join(', '))
assert(
  codes(reused.senderReceiverConfig.fields).join(',') === 'DELIVERY_CITY,DELIVERY_PERSON,PICKUP_CITY',
  '寄收保持当前顺序',
)
assert(
  reused.senderReceiverConfig.fields.find((f) => f.code === 'DELIVERY_PERSON')!.visible === false,
  '寄件人姓名复用上一状态关闭状态',
)
assert(
  reused.senderReceiverConfig.fields.every((f) => f.fixed ? f.visible === true : true),
  'fixed 字段强制 visible=true',
)
assert(
  !reused.senderReceiverConfig.fields.some((f) => f.code === 'CREATION_TIME'),
  '仅上一状态存在的字段不复用（寄收无此情况，占位校验）',
)

console.log('\n运单信息模块：')
console.log('  复用后:', reused.waybillInfoConfig.fields.map((f) => `${f.code}(visible=${f.visible},order=${f.order})`).join(', '))
// 期望：开启项按 prev 相对顺序(货好时间→路由信息)置顶，其余按 current 顺序(签收人→预计派送时间→寄件时间)
assert(
  codes(reused.waybillInfoConfig.fields).join(',') ===
    'GOODS_TIME,NEW_EXTERIOR_ROUTE_INFO,RECEIVER,FINAL_AGING,DELIVERY_TIME',
  '开启项按上一状态相对顺序置顶，其余按当前默认顺序跟随',
)
assert(
  reused.waybillInfoConfig.fields.find((f) => f.code === 'DELIVERY_TIME')!.visible === false,
  '寄件时间复用上一状态关闭状态',
)
assert(
  reused.waybillInfoConfig.fields.find((f) => f.code === 'RECEIVER')!.visible === true,
  '仅当前存在字段保持常规版本默认 visible',
)
assert(
  !reused.waybillInfoConfig.fields.some((f) => f.code === 'CREATION_TIME'),
  '仅上一状态存在的字段(创建时间)不复用',
)
assert(
  reused.waybillInfoConfig.fields.map((f) => f.order).join(',') === '1,2,3,4,5',
  'order 按 1..n 重排',
)
assert(reused.waybillInfoConfig.maxSelect === 4, 'maxSelect 保留当前常规版本值')

console.log('\n功能按钮模块：')
console.log('  复用后:', reused.functionConfig.buttons.map((b) => `${b.code}(visible=${b.visible},fixed=${b.fixed},order=${b.order})`).join(', '))
// 期望：fixed 原位(实名认证→去支付) → 非fixed 开启项(催取) → 非fixed 其余(催派→修改运单)
assert(
  codes(reused.functionConfig.buttons).join(',') === 'CAN_REAL_AUTH,CAN_NEED_PAY,CAN_TAKE,CAN_DELIVERY,CAN_MODIFY',
  'fixed 原位保留，非 fixed 开启项置顶、其余跟随',
)
assert(
  reused.functionConfig.buttons.find((b) => b.code === 'CAN_DELIVERY')!.visible === false,
  '催派复用上一状态关闭状态',
)
assert(
  reused.functionConfig.buttons.filter((b) => b.fixed).every((b) => b.visible === true),
  'fixed 按钮强制 visible=true',
)
assert(
  !reused.functionConfig.buttons.some((b) => b.code === 'CAN_CANCEL'),
  '仅上一状态存在的按钮(取消运单)不复用',
)
assert(
  reused.functionConfig.buttons.map((b) => b.order).join(',') === '1,2,3,4,5',
  'order 按 1..n 重排',
)

console.log('\n===== getPreviousStatus =====')
assert(getPreviousStatus(20) === null, '待揽件(20) 上一状态为 null')
assert(getPreviousStatus(30) === 20, '待签收(30) → 待揽件(20)')
assert(getPreviousStatus(40) === 30, '已签收(40) → 待签收(30)')

console.log('\n===== resolveInitialConfig =====')
const customConfig: CardConfig = JSON.parse(JSON.stringify(standard))

let r = resolveInitialConfig({ mode: 'edit', status: 30, currentPair: { standardConfig: standard, customConfig }, prevCustom })
assert(r.needPrompt === false && r.config === customConfig, 'edit + 有定制配置 → 直接取定制配置')

r = resolveInitialConfig({ mode: 'edit', status: 30, currentPair: { standardConfig: standard, customConfig: null }, prevCustom })
assert(r.needPrompt === false && r.config === standard, 'edit + 无定制配置 → 回退常规版本')

r = resolveInitialConfig({ mode: 'add', status: 20, currentPair: { standardConfig: standard, customConfig: null }, prevCustom: null })
assert(r.needPrompt === false && r.config === standard, 'add + 待揽件 → 常规版本，不弹窗')

r = resolveInitialConfig({ mode: 'add', status: 30, currentPair: { standardConfig: standard, customConfig: null }, prevCustom: null })
assert(r.needPrompt === false && r.config === standard, 'add + 待签收 + 上一状态无定制 → 常规版本，不弹窗')

r = resolveInitialConfig({ mode: 'add', status: 30, currentPair: { standardConfig: standard, customConfig: null }, prevCustom })
assert(r.needPrompt === true && r.standardConfig === standard && r.prevCustom === prevCustom, 'add + 待签收 + 上一状态有定制 → 弹窗')

r = resolveInitialConfig({ mode: 'add', status: 40, currentPair: { standardConfig: standard, customConfig: null }, prevCustom })
assert(r.needPrompt === true, 'add + 已签收 + 上一状态有定制 → 弹窗')

r = resolveInitialConfig({ mode: 'add', status: 40, currentPair: { standardConfig: standard, customConfig: null }, prevCustom: null })
assert(r.needPrompt === false && r.config === standard, 'add + 已签收 + 上一状态无定制 → 常规版本，不弹窗')

console.log(`\n===== 结果: ${pass} passed, ${fail} failed =====`)
if (fail > 0) process.exit(1)
