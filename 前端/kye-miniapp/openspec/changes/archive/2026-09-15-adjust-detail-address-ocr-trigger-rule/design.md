# Design: 详细地址智能识别触发边界守卫

## 背景

现有 detail-address 弹窗在 `onConfirmDetailAddress` 中始终调用 `aiAddrAnalysis`，用 `res.address` 覆盖用户输入，导致已有省市区时标点/结构被破坏。

## 方案

### 触发边界守卫

在 `onConfirmDetailAddress` 开头（debounce 内部，`state.message` 非空校验之后）增加：

```js
const hasArea = props.area?.some((i) => i)
if (hasArea) {
  emit('onSelect', {
    province: props.area?.[0] || '',
    city: props.area?.[1] || '',
    county: props.area?.[2] || '',
    detailAddress: state.message,
  })
  state.showPopup = false
  emit('getResolutionData')
  updateCommonDisabledScroll()
  return
}
```

守卫之后才走原 `aiAddrAnalysis` 逻辑。触发时机、防抖（800ms）、formatter 均保持不变。

### 两个组件版本差异

- `kye-miniapp-order` 版：无 `onClickConfirm`/`sceneType`/`originalAddress`。
- `order-global-package` 版：确认时先 emit `onClickConfirm(state.message)`（埋点），再 AI 解析；支持 `sceneType`。

守卫逻辑一致，插入位置在各自的 AI 调用之前。

### 父组件回填缺口（仅 order 侧）

order 侧 `onSelectDetailAddress` 的分支在「省市区部分已选」（如仅选省）时不会更新 detailAddress。守卫回填「省市区不变 + 原始 detailAddress」时需保证该分支也能正确更新 detailAddress。freight-time 的 `onDetailSelect` 先写 `detailAddress`，无此缺口。

## 关键决策

- 判断口径：`some(Boolean)`（任意一级非空，覆盖「半填充」）。
- 触发机制：保留「确定」点击，不改为失焦。
- 防抖：保持 800ms。
- formatter：保持 `filterEmojis` + `trim`。
