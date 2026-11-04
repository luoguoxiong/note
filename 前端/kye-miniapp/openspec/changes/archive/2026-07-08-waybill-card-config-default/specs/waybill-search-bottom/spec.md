## ADDED Requirements

### Requirement: 底部按钮配置过滤
系统 SHALL 在原有按钮逻辑上叠加配置过滤。

#### Scenario: 无配置时走原有逻辑
- **WHEN** 无配置或配置为空
- **THEN** 使用原有 getMenus/getRelieveButtons 结果

#### Scenario: 有配置时过滤
- **WHEN** 配置中 visible=false 的按钮
- **THEN** 从结果中过滤掉该按钮

#### Scenario: 使用 configCode 关联
- **WHEN** 过滤按钮
- **THEN** 使用 MENU_LIST 中的 configCode 与配置中的 code 关联

### Requirement: 底部按钮渲染逻辑
系统 SHALL 按配置顺序渲染按钮。

#### Scenario: 前3个在底部右侧
- **WHEN** 有按钮显示
- **THEN** 前3个按钮显示在底部右侧

#### Scenario: order 最小的在最右边
- **WHEN** 渲染底部右侧按钮
- **THEN** 反转前3个按钮，order 最小的在最右边

#### Scenario: 其余在更多菜单
- **WHEN** 按钮数量超过3个
- **THEN** 其余按钮显示在更多菜单中

### Requirement: 取消订单按钮配置判断
系统 SHALL 在原有取消订单逻辑上叠加配置判断。

#### Scenario: 配置中可见
- **WHEN** 配置中 canCancel.visible=true
- **THEN** 显示取消订单按钮

#### Scenario: 配置中隐藏
- **WHEN** 配置中 canCancel.visible=false
- **THEN** 隐藏取消订单按钮
