## ADDED Requirements

### Requirement: 配置加载
useCardConfigStore SHALL 提供 loadAllConfigs 方法，调用接口加载配置。

#### Scenario: 成功加载配置
- **WHEN** 调用 loadAllConfigs
- **THEN** 从 web.query.cardConfig.get 接口获取配置
- **THEN** 按状态（20/30/40）存储到 configMap

#### Scenario: 接口失败降级
- **WHEN** 接口调用失败
- **THEN** 使用本地默认配置 DEFAULT_CARD_CONFIG
- **THEN** 按状态（20/30/40）初始化 configMap

#### Scenario: 已加载过跳过
- **WHEN** 调用 loadAllConfigs 且 loaded=true
- **THEN** 直接返回，不重复调用接口

#### Scenario: 强制重新加载
- **WHEN** 调用 loadAllConfigs({ force: true })
- **THEN** 忽略 loaded 状态，重新调用接口

### Requirement: 版本选择
useCardConfigStore SHALL 根据 currentVersion 选择配置版本。

#### Scenario: 使用定制版
- **WHEN** currentVersion=20 且 customConfig 不为空
- **THEN** 使用 customConfig

#### Scenario: 使用标准版
- **WHEN** currentVersion=10 或 customConfig 为空
- **THEN** 使用 standardConfig

### Requirement: 配置获取
useCardConfigStore SHALL 提供 getConfigByStatus getter，根据运单状态获取配置。

#### Scenario: 获取已配置状态
- **WHEN** 调用 getConfigByStatus(20)
- **THEN** 返回 configMap 中状态 20 的配置

#### Scenario: 获取未配置状态
- **WHEN** 调用 getConfigByStatus(99)
- **THEN** 返回本地默认配置 DEFAULT_CARD_CONFIG

### Requirement: 版本获取
useCardConfigStore SHALL 提供 getVersionByStatus getter，根据运单状态获取版本。

#### Scenario: 获取已配置状态版本
- **WHEN** 调用 getVersionByStatus(20)
- **THEN** 返回 configMap 中状态 20 的 currentVersion

#### Scenario: 获取未配置状态版本
- **WHEN** 调用 getVersionByStatus(99)
- **THEN** 返回 10（标准版）

### Requirement: 配置更新
useCardConfigStore SHALL 提供 updateConfig 方法，用于配置页保存后更新。

#### Scenario: 更新已存在状态的配置
- **WHEN** 调用 updateConfig(20, newConfig)
- **THEN** 更新 configMap[20].config 为 newConfig

#### Scenario: 更新不存在状态的配置
- **WHEN** 调用 updateConfig(99, newConfig)
- **THEN** 创建 configMap[99]，currentVersion=20，config=newConfig

### Requirement: 配置重置
useCardConfigStore SHALL 提供 reset 方法，用于用户切换等场景。

#### Scenario: 重置配置
- **WHEN** 调用 reset()
- **THEN** 清空 configMap、customCodes
- **THEN** 设置 loaded=false
