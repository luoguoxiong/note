# driver-evaluation-aggregation-page Specification

## Purpose

司机评价聚合页（`pages/evaluation-list`）的空状态行为约束：批量（一键）评价全部提交完成后停留聚合页并展示空状态缺省图，不再自动跳转查件列表；空状态下刷新仍无数据时保持当前页。

## Requirements

### Requirement: 全部评价提交完成后停留聚合页

司机评价聚合页（`pages/evaluation-list`）在批量（一键）评价提交成功并重新拉取列表后，当已无待评价运单时，系统 SHALL 停留在当前聚合页，SHALL NOT 通过 `switchTab` 或其他方式自动跳转至查件列表（`/layout/pages/waybill/index`）。

#### Scenario: 一键评价成功且无剩余待评价运单

- **WHEN** 用户在聚合页勾选运单点击「一键评价」，批量评价提交成功，且重新拉取列表后待评价运单总数为 0
- **THEN** 页面 SHALL 停留在司机评价聚合页
- **AND** 系统 SHALL NOT 调用 `Taro.switchTab` 跳转查件 tab
- **AND** 列表区域 SHALL 展示空状态缺省图

#### Scenario: 一键评价成功后仍有剩余待评价运单

- **WHEN** 批量评价提交成功，但重新拉取列表后仍存在待评价运单
- **THEN** 页面 SHALL 停留在聚合页并展示刷新后的待评价运单列表
- **AND** 已提交的运单 SHALL NOT 再出现在待评价列表中

#### Scenario: 单票评价提交

- **WHEN** 用户在列表卡片内对单票运单提交评价
- **THEN** 页面 SHALL 停留在当前页，SHALL NOT 发生页面跳转（沿用现有行为）

### Requirement: 空状态展示

当聚合页内无待评价运单时，系统 SHALL 在列表区域展示空状态缺省图（沿用现有司机评价模块空状态样式：「暂无待评价运单」缺省图与「去寄件」按钮），页面顶部的规则横幅与「评价记录」入口 SHALL 保持现有导航结构不变。

#### Scenario: 无待评价运单时展示空状态

- **WHEN** 聚合页拉取待评价列表结果为空（包括首次进入即无数据、或全部评价完成后刷新为空）
- **THEN** 列表区域 SHALL 展示空状态缺省图与「去寄件」按钮
- **AND** 顶部规则横幅（RuleBanner）与评价记录入口（RecordsEntry） SHALL 正常展示且功能不变

#### Scenario: 空状态下点击去寄件

- **WHEN** 用户在空状态点击「去寄件」按钮
- **THEN** 沿用现有逻辑跳转寄件页，该行为不在本次改动范围

### Requirement: 空状态下刷新不跳转

当聚合页处于空状态时，用户触发下拉刷新或页面重新拉取数据后，若仍无待评价运单，系统 SHALL 保持当前聚合页并继续展示空状态，SHALL NOT 跳转至查件列表。

#### Scenario: 空状态下拉刷新后仍无数据

- **WHEN** 用户在全部评价完成后的空状态页面触发下拉刷新，且刷新结果仍无待评价运单
- **THEN** 页面 SHALL 保持在司机评价聚合页并展示空状态
- **AND** 系统 SHALL NOT 跳转至查件列表

#### Scenario: 空状态下拉刷新后出现新待评价运单

- **WHEN** 用户在空状态页面触发下拉刷新，且刷新结果存在新的待评价运单
- **THEN** 页面 SHALL 停留在聚合页并展示刷新后的待评价运单列表
