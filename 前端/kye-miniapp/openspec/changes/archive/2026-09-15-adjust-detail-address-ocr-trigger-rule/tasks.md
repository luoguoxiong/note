# Tasks: 详细地址智能识别触发边界守卫

## Overview

为两个 detail-address 弹窗组件增加触发边界守卫，并修复 order 侧父组件部分省市区回填缺口。排除 `order-build-sub-pages`。

## Phase 1: 边界守卫

- [x] **T-1.1** 修改 `kye-miniapp-order/.../business/detail-address/index.vue`：`onConfirmDetailAddress` 开头增加 `props.area.some(Boolean)` 守卫，已选则跳过 AI、emit 原始 detailAddress 并关闭弹窗
- [x] **T-1.2** 修改 `order-global-package/components/business/detail-address/index.vue`：同上（保持 `onClickConfirm` 埋点 emit 不变）

## Phase 2: 父组件回填缺口

- [x] **T-2.1** 修改 `kye-miniapp-order/.../hooks/address/sender/useFields.ts` 的 `onSelectDetailAddress`：省市区不变时正确回填 detailAddress（含部分省市区场景）
- [x] **T-2.2** 修改 `kye-miniapp-order/.../hooks/address/receive/useFields.ts` 的 `onSelectDetailAddress`：同上

## Phase 3: 验证

- [ ] **T-3.1** 已有省市区 + 填写含逗号详细地址 + 确定 → 逗号保留、省市区不变
- [ ] **T-3.2** 三级全空 + 填写完整地址 + 确定 → 正常触发识别回填
- [ ] **T-3.3** 部分省市区 + 确定 → detailAddress 正确回填
- [ ] **T-3.4** 回填后再编辑详细地址 → 已有省市区不再识别
- [ ] **T-3.5** 清空省市区后再编辑 → 恢复识别
- [ ] **T-3.6** freight-time 运费时效 → 同规则生效
