---
name: kye-miniapp-skills-index
description: 项目的本地技能索引，帮助 AI 代理在具体开发场景下选择合适的技能文件。
---

# 项目技能索引

项目在 `.agents/skills` 下定义了一些与规范配套的技能，用于承载**具体实践步骤与示例代码**，避免在规范文档中塞入过多细节。

## 技能列表

### 小程序开发技能

- **kye-miniui-components**：KYE MiniUI 组件库使用指南
  - 指导正确使用自研小程序 UI 组件库
  - 包含组件选择、使用规范与常见场景
  - 适用于表单开发、UI 界面实现等场景

- **miniapp-page-development**：小程序页面开发
  - 指导在 Taro + Vue3 项目中创建和开发页面
  - 包含目录结构、路由注册、组件编写与 API 集成
  - 适用于新增页面或修改现有页面结构

- **api-integration**：接口集成
  - 指导进行 HTTP 接口集成
  - 包含请求封装、类型定义、错误处理与文件组织
  - 适用于新增 API 调用或定义接口类型

- **multi-platform-adaptation**：多端适配
  - 指导进行微信、支付宝、H5 多端适配开发
  - 包含平台判断、API 差异处理与样式适配
  - 适用于处理跨平台兼容性问题

- **native-capability**：原生能力
  - 指导使用小程序原生能力
  - 包含支付、导航、原生插件等功能的调用与封装
  - 适用于调用小程序原生 API

- **report-tracking**：埋点追踪
  - 指导实现数据埋点追踪
  - 包含埋点类型、命名规范、文件组织与上报方式
  - 适用于添加用户行为数据追踪

## 技能使用指南

### 何时使用技能

AI 代理在执行以下类型任务时，应加载对应的技能文档作为参考：

1. **页面开发**：使用 `miniapp-page-development` + `kye-miniui-components`
2. **接口调用**：使用 `api-integration`
3. **多端兼容**：使用 `multi-platform-adaptation`
4. **原生功能**：使用 `native-capability`
5. **数据埋点**：使用 `report-tracking`

### 技能组合使用

某些复杂任务可能需要组合多个技能：

- **新增完整页面**：
  - `miniapp-page-development`（页面结构）
  - `kye-miniui-components`（UI 组件）
  - `api-integration`（接口调用）
  - `report-tracking`（埋点上报）

- **跨平台功能开发**：
  - `multi-platform-adaptation`（平台适配）
  - `native-capability`（原生能力）

## 技能文档结构

每个技能文档包含以下部分：

1. **使用场景**：说明何时使用该技能
2. **使用步骤**：详细的操作步骤和代码示例
3. **注意事项**：开发中需要注意的要点和常见问题
4. **快速检查清单**：完成任务后的自检项目

## 扩展说明

后续如有新的实践场景（例如：测试用例编写、性能优化、安全加固等），建议以新的技能目录形式补充到本目录中，保持技能文档的模块化和可维护性。
