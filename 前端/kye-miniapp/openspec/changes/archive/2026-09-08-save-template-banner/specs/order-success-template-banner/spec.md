## ADDED Requirements

### Requirement: 保存模板横幅展示
下单成功页 SHALL 在接口 `web.order.single.app.getSingleSaveBaseResult` 返回的 `templateVo.showSaveBanner` 为 `true` 时，在运单卡片与底部操作区之间展示保存模板横幅；`showSaveBanner` 为 `false`、缺失或页面处于网络错误态时 SHALL 不展示。

#### Scenario: showSaveBanner 为 true 时展示横幅
- **WHEN** 下单成功页加载数据成功且 `templateVo.showSaveBanner === true`
- **THEN** 页面在运单卡片与 Footer 之间展示保存模板横幅

#### Scenario: showSaveBanner 为 false 或缺失时隐藏横幅
- **WHEN** `templateVo.showSaveBanner === false` 或接口返回的 `templateVo` 中无该字段
- **THEN** 页面不展示保存模板横幅，其余内容不受影响

#### Scenario: 审核轮询更新后横幅状态跟随
- **WHEN** 页面处于审核中场景，轮询结束用最新 `templateVo` 覆盖 `extInfo`
- **THEN** 横幅显隐状态按最新的 `showSaveBanner` 值展示

### Requirement: 横幅内容与视觉
保存模板横幅 SHALL 包含文案"保存为寄件模板，下次寄件直接使用"与按钮"保存模板"，视觉样式 SHALL 以设计稿为准（原型参考：整块横幅为可点击卡片，左侧文案、右侧按钮）。

#### Scenario: 横幅内容完整性
- **WHEN** 横幅展示
- **THEN** 横幅内包含指定文案与"保存模板"按钮，样式符合设计稿

### Requirement: 点击横幅跳转寄件模板页
横幅整体（含按钮）作为点击热区，点击后 SHALL 跳转新增寄件模板页，跳转链路与交互 SHALL 与线上"保存模板"逻辑一致（H5 `#/detail?pageFrom=100`，自动填充运单信息，回填优先级：运单信息 > AI 推荐内容）。

#### Scenario: 点击横幅跳转
- **WHEN** 用户点击横幅任意区域（含"保存模板"按钮）
- **THEN** 跳转至新增寄件模板页，且跳转参数与线上"保存模板"按钮的跳转一致

### Requirement: 线上模板有值逻辑不受影响
当寄件模板有值（线上逻辑）时，页面 SHALL 保持现有行为不变：Footer「保存模板」按钮、气泡提示等均不因本次改动发生变化。

#### Scenario: 模板有值时回归
- **WHEN** 接口返回 `showSaveTemplate === true`（模板有值场景）
- **THEN** Footer「保存模板」按钮与气泡按线上逻辑正常展示，横幅逻辑不影响其显隐与交互
