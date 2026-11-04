## Context

配送范围页位于 `src/modules/tools/delivery-area`，当前流程为选择地址、调用 `web.basicBiz.address.deliverySearch`、展示查询结果。已有新客留资活动状态由首页 `useRoleFlags()` 从 `useHomeStore()` 派生，`FooterBar` 已使用相同状态展示“新客专享优惠”角标。

本次只在配送范围页面新增结果承接能力，不新增后端接口。表单提交后直接进入 H5 结果页，`couponStatus` 和 `couponNumber` 作为预留参数，后续接口确认后再接入真实值。

## Goals / Non-Goals

**Goals:**

- 在可配送查询结果下展示留资卡片。
- 复用当前查询地址默认填充内联留资表单省市区。
- 校验必填项后跳转 H5 申请结果页。
- 将已知字段和预留字段统一拼接到 H5 URL。

**Non-Goals:**

- 不新增留资提交接口。
- 不修改首页 store 的新客活动数据结构。
- 不修改公共请求层、WebView/Native 桥接或子仓库构建产物。
- 不处理 H5 结果页内部展示逻辑。

## Decisions

1. **留资 UI 放在 `delivery-area` 模块内**

   新卡片和表单切换只服务配送范围页，作为页面内业务组件更合适，避免把临时业务形态沉淀到 `src/public/components`。

2. **活动状态复用现有新客活动接口**

   `hasLeadCaptureActivity` 已在首页、关于公司、行业方案页面使用，可用于控制角标和优惠文案。配送范围页在查询结果支持配送时，复用首页同一个 `web.activity.getNewCustomerActivity` 接口校准当前账号的留资状态，使用页面本地状态控制结果卡片，避免账号切换后依赖首页返回刷新。

3. **跳转使用 `openURL()` 打开完整 H5 地址**

   结果页是外部 H5，使用现有 `src/modules/webview/utils` 的 `openURL` 可保持微信小程序、支付宝小程序和 H5 的统一打开方式。目标 URL 已包含 `https://ic-h5-uat.kye-erp.com`，不依赖轻应用编码。

4. **优惠券字段先预留为空**

   当前页面没有 `couponStatus`、`couponNumber` 的确定数据源。实现时保留字段构造位置，默认不传或传空值，后续接口对齐后只需替换数据来源。

5. **留资表单以内联卡牌方式展示**

   点击“获取专属服务方案”后，不打开 `ky-popup` 或底部弹窗，而是在查询结果区域内将 CTA 卡牌平滑切换为表单卡牌。转场使用页面内 CSS transform/opacity 过渡，保持用户仍处于查询结果上下文内。

6. **入口按用户角色和留资状态展示**

   配送范围页复用 `useRoleFlags()` 的 `isNew`、`hasLeadCapture` 和 `hasLeadCaptureActivity`。只有 `isNew && !hasLeadCapture` 且查询结果为支持/部分支持配送时展示入口；其中 `hasLeadCaptureActivity` 只控制优惠角标和优惠文案。已留资新客、老客、无结果、不支持配送均不展示入口。未留资新客展示入口时，原结果卡中的“去寄件”按钮隐藏。

7. **账号切换后默认隐藏并重新校准入口**

   配送范围页监听账号切换事件并重置本页留资入口状态；下一次配送范围查询成功后，如果当前账号仍为新客且结果支持配送，再调用新客活动接口刷新 `hasLeadCapture` 和 `hasLeadCaptureActivity`。老客或接口失败时保持入口隐藏，恢复原查询结果按钮。

## Risks / Trade-offs

- [Risk] H5 结果页强依赖 `couponStatus` 或 `couponNumber` 展示优惠结果。→ Mitigation: 当前按预留字段实现；接口确认后接入真实值。
- [Risk] 配送范围页独立进入或账号切换后首页新客角色/活动状态尚未加载。→ Mitigation: 入口先按安全默认值隐藏；查询结果支持配送且当前账号为新客时，配送范围页自行调用新客活动接口刷新资格，不阻断主流程。
- [Risk] H5 UAT 地址固定，生产环境可能需要切换。→ Mitigation: 按当前需求使用指定 UAT 地址；后续如需生产切换再抽常量或读取环境配置。
