# Logout Success Feedback Specification

## Purpose

定义一键退登请求成功后的反馈行为：按用户是否已设置登录密码（passwordStatus）分支展示吐司或成功弹窗，并提供「去修改」跳转修改密码的入口，同时上报退登结果自定义事件。

## ADDED Requirements

### Requirement: 退登成功吐司反馈

退登成功且用户未设置登录密码（passwordStatus=0）时，系统 SHALL 在当前页面居中展示吐司「已成功退登其他设备」，约 2 秒自动消失。

#### Scenario: 未设置登录密码

- **WHEN** 退登接口返回成功且 passwordStatus=0
- **THEN** 页面居中 toast「已成功退登其他设备」，约 2 秒后自动消失，无弹窗

### Requirement: 退登成功弹窗反馈

退登成功且用户已设置登录密码（passwordStatus=1）时，系统 SHALL 展示成功弹窗：成功图标 + 标题「已成功退登其他设备」+ 文案「如需进一步保障账号安全，可点击【去修改】前往修改登录密码」，按钮为【暂不修改】与【去修改】。

#### Scenario: 已设置登录密码

- **WHEN** 退登接口返回成功且 passwordStatus=1
- **THEN** 展示含成功图标的成功弹窗，按钮为【暂不修改】（左）与【去修改】（右）

### Requirement: 成功弹窗按钮交互

点击【去修改】SHALL 上报点击埋点（button_name=去修改）、关闭弹窗并跳转「用户-密码修改」H5 轻应用；点击【暂不修改】SHALL 上报点击埋点（button_name=暂不修改）并关闭弹窗，停留设置页。

#### Scenario: 点击去修改

- **WHEN** 用户点击成功弹窗【去修改】
- **THEN** 上报点击埋点（事件类型：点击），弹窗关闭，跳转修改密码 H5 轻应用

#### Scenario: 点击暂不修改

- **WHEN** 用户点击成功弹窗【暂不修改】
- **THEN** 上报点击埋点（事件类型：点击），弹窗关闭，停留在设置页

### Requirement: 退登成功结果埋点

退登接口返回成功时，系统 SHALL 在请求结果返回时上报自定义事件 `other_mine_logout_success_v1`，属性包含 source（操作来源中文枚举，与当前端对应）、request_result=成功、failure_reason 为空。

#### Scenario: 退登成功上报

- **WHEN** 退登接口返回成功（事件类型：事件）
- **THEN** 上报 `other_mine_logout_success_v1`，source 为当前端对应中文来源（如「跨越支付宝小程序」），request_result=成功

#### Scenario: 退登失败上报

- **WHEN** 退登接口返回失败（事件类型：事件）
- **THEN** 上报 `other_mine_logout_success_v1`，request_result=失败，failure_reason 为失败原因
