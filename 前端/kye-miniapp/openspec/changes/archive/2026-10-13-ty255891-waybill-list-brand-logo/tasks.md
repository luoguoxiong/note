# TY255891 查件列表页底部品牌logo 实施任务

> 改动文件均在 waybill 子仓库 `src/modules/kye-miniapp-waybill`（真实源码），主应用经 `waybill-build` 副本引用，勿改副本目录。

## 1. 清理草稿

- [x] 1.1 删除 `src/components/waybill-search/index.vue` 中草稿代码：`#finished` 内 `logo-search`（rowTotal>1 分支）与列表外 `logo-bottom`（rowTotal===1 分支），保留 `rowTotal` ref 及 `listFetch` 内赋值逻辑
- [x] 1.2 删除 `src/components/waybill-search/index.scss` 中草稿样式：`.logo-bottom`、`.logo-search`、`.list-bottom`

## 2. 品牌标识贴底实现

- [x] 2.1 在 `#finished` 插槽内新增贴底 logo 元素：`v-if="rowTotal > 0"`，`position: fixed; bottom: 0`，横向居中，复用寄件页同款整图 `https://ic-img.ky-express.com/netc/20250719_43690_!!1752909576195_148_48.png`（148×48，KYE 图形标+95324）
- [x] 2.2 新增 scss 类（如 `.brand-logo-fixed`）：fixed 贴底、居中、安全区适配（`padding-bottom: constant/env(safe-area-inset-bottom)` 按需），z-index 低于弹窗类组件、不遮挡卡片操作
- [x] 2.3 「可筛选查询近1年内运单 去筛选」提示区（`#finished` 内 `.bottom-tip`）下方增加占位高度（约 150px），滚动到底时提示在上、logo 在下互不遮挡

## 3. 状态与边界验证（开发自测）

- [ ] 3.1 有数据单页（rowTotal 较小，列表不足一屏）：logo 贴底展示，无遮挡
- [ ] 3.2 有数据多页：上拉加载中 logo 隐藏，全部加载完（出现「可筛选…去筛选」）后 logo 展示
- [ ] 3.3 空态（无运单数据）与获取专属服务方案页（NewUserActive）：logo 不展示
- [ ] 3.4 筛选、tab 切换、下拉刷新、返回重进等触发 `init()` 的场景：logo 展示状态随数据正确刷新，无残留
- [x] 3.5 不遮挡最后一张运单卡片的底部操作按钮与「回顶」悬浮按钮（z-index 层级检查）

## 4. 多端走查

- [ ] 4.1 微信小程序：贴底定位、滚动遮挡、加载隐藏表现正确
- [ ] 4.2 APP（H5 内嵌）：同上，重点确认 fixed 在 H5 scroll-view 内贴底
- [ ] 4.3 支付宝小程序：fixed 表现验证；若定位异常，按 design.md 降级方案（兄弟节点 + 状态驱动）重写并回归
- [ ] 4.4 PC微信 / 企微 / PC企微：宽屏下居中贴底观感正常

## 5. 收尾

- [x] 5.1 代码自查：箭头函数规范、px 单位（禁 rpx）、样式独立 scss、无多余 console
- [ ] 5.2 提交 waybill 子仓库与主仓库改动，走 code review 与质检报告更新
