---
name: "netc-git-branch"
description: "Git 分支名生成技能。按照 ai/{YYYYMM}/{YYYYMMDD}_{keyword}_{模型} 命名规范，自动拼接日期前缀与模型后缀，让用户输入关键词后缀，生成分支名并可选创建分支。"
---

# netc-git-branch

## 功能概述

按照 NETC 前端 AI 开发分支命名规范，自动生成符合 `ai/{YYYYMM}/{YYYYMMDD}_{keyword}_{模型}` 格式的分支名。

- 前缀 `ai/{YYYYMM}/{YYYYMMDD}_` 由当前日期自动拼接
- 中间段 `{keyword}` 由用户输入
- 后缀 `{模型}` 为当前 AI 模型完整标识（含版本号），自动获取
- 生成后可选创建分支并切换

## 触发指令

```text
生成分支名 [关键词]
创建分支 [关键词]
新建分支 [关键词]
```

**示例：**

```text
生成分支名                        # 触发后询问关键词
生成分支名 canteen-refund          # 直接传关键词
生成分支名 食堂退款                 # 传中文，自动翻译为 kebab-case 英文
创建分支 fix-table-sort            # 创建并切换分支
```

> 关键词可省略，省略时通过交互式提问获取。

## 执行流程

### 步骤一：获取当前日期

获取操作当天的本地日期，提取：
- `YYYYMM`（年月，6 位）
- `YYYYMMDD`（年月日，8 位）

### 步骤二：获取关键词

1. 若触发指令中已包含关键词，直接使用
2. 若未包含，使用 `ask_followup_question` 向用户提问：

```
请输入分支关键词（英文 kebab-case，描述本次改动的核心意图）
示例：canteen-refund、fix-table-sort、user-login
```

3. 若用户输入为中文，翻译为简短英文 kebab-case
4. 校验关键词格式：仅小写字母、数字、连字符，不以连字符开头或结尾

### 步骤三：获取模型标识

自动获取当前 AI 模型完整标识（含版本号），无需询问用户：

- 例如 `DeepSeek-V4-Flash`、`GLM-5.2`、`Claude-Sonnet-5`
- **模型名规范化**：将 `.` → `-`、`/` → `-`、空格 → `-`，去掉首尾 `-`
  - 例：`GLM5.2` → `GLM5-2`
- **禁止使用的非法标识**：`TRAE-CN`、`TRAE`、`Trae`、`CodeBuddy`、`IDE`、`Assistant`、`AI` 等产品名/平台名/通用称谓
- 无法确定真实模型标识时，**必须询问用户**，禁止猜测

### 步骤四：拼接分支名

```
ai/{YYYYMM}/{YYYYMMDD}_{keyword}_{模型}
```

**示例：** 日期 2026-08-25，关键词 `canteen-refund`，模型 `GLM-5.2`

```
ai/202608/20260825_canteen-refund_GLM-5-2
```

### 步骤五：输出并询问是否创建

1. 输出生成的分支名
2. 使用 `ask_followup_question` 询问用户是否需要创建并切换分支：

```
是否创建并切换到该分支？
- 选项 A：仅生成分支名，不创建
- 选项 B：基于 master 创建
```

3. 若用户选择 B，执行：

```bash
git fetch origin master
git checkout -b <生成的分支名> origin/master
```

4. 若用户选择 A，仅输出分支名，流程结束

## 命名规范

详见 [git-branch-rule.md](../../rules/git-branch-rule.md)

## 注意事项

- **不自动 push**：创建分支后不推送到远端，除非用户明确要求
- **关键词唯一性**：生成前可执行 `git branch -a | grep <keyword>` 检查是否已存在同名分支，若存在则提醒用户
- **日期准确性**：使用用户本地系统日期，非 UTC 时间
- **全英文命名**：分支名禁止使用中文等非 ASCII 字符
