/**
 * @Desc: build-log
 * @Date: 2025/11/7
 */
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const rootDir = process.cwd()
const logPath = path.resolve(rootDir, '../../docs/guide/changelog.md')
const pkgPath = path.resolve(rootDir, '../../package.json')

/** 执行命令 */
function safeExec(cmd) {
  try {
    return execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return ''
  }
}

/** 递增补丁号 */
function bumpVersion(ver) {
  const parts = ver.split('.').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return '1.0.0'
  parts[2] += 1
  return parts.join('.')
}

/** 读取 package.json */
if (!fs.existsSync(pkgPath)) {
  console.error('[build log]❌ 找不到 package.json')
  process.exit(1)
}
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const oldVersion = pkg.version || '0.0.0'
const newVersion = bumpVersion(oldVersion)

/** 更新 package.json */
pkg.version = newVersion
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
console.log(`[build log]📦 版本号自动更新: ${oldVersion} → ${newVersion}`)

/** 构建时间 */
const buildTime = new Date().toLocaleString('zh-CN', { hour12: false })

/** 获取提交记录 - 不再依赖tag，始终获取最近10条提交 */
let commitLogs = safeExec(`git log -10 --pretty=format:"- %s (%h)" --no-merges`)
if (!commitLogs) commitLogs = '[build log]⚠️ 无法获取 git 提交记录'

/** 去重处理 - 基于commit ID严格检查重复 */
function deduplicateCommitLogs(newLogs, existingLogs) {
  if (!newLogs || !existingLogs) {
    console.log('[build log]📝 无新提交或现有日志为空，直接返回')
    return newLogs
  }

  // 提取已存在的提交哈希值（使用更宽松的正则表达式匹配任意长度的提交哈希）
  const existingHashes = new Set()
  // console.log('[build log] 开始从现有changelog提取已存在的提交哈希')

  // 逐行处理现有日志，提取提交哈希
  const lines = existingLogs.split('\n')
  lines.forEach((line, index) => {
    if (!line || line.trim() === '') return

    //匹配括号中的哈希值（允许括号后有其他字符）
    const hashMatch = line.match(/\(([0-9a-f]+)\)/)
    if (hashMatch && hashMatch[1]) {
      existingHashes.add(hashMatch[1])
      // 调试：记录找到的每个哈希值
      // console.log(`[build log] 发现现有提交哈希: ${hashMatch[1]} 在第${index+1}行`)
    }
  })

  // console.log(`[build log] 总共检测到 ${existingHashes.size} 条已存在的提交哈希`)

  // 处理新提交日志
  const newLogLines = newLogs.split('\n').filter(line => line && line.trim() !== '')
  console.log(`[build log]📥 新提交记录共 ${newLogLines.length} 条`)

  // 过滤掉已存在的提交
  const uniqueLogs = newLogLines
    .filter(line => {
      // 提取新提交的哈希值（使用与现有日志相同的宽松匹配规则）
      const hashMatch = line.match(/\(([0-9a-f]+)\)/)

      // 如果没有哈希值，则保留该行
      if (!hashMatch || !hashMatch[1]) {
        // console.log(`[build log] 保留无哈希值的记录: ${line}`)
        return true
      }

      const commitHash = hashMatch[1]
      const isDuplicate = existingHashes.has(commitHash)

      // if (isDuplicate) {
      //   console.log(`[build log]❌ 跳过重复提交: ${line}`)
      // } else {
      //   console.log(`[build log] 保留新提交: ${line}`)
      // }

      return !isDuplicate
    })
    .join('\n')

  console.log(`[build log]📊 过滤后剩余 ${uniqueLogs ? uniqueLogs.split('\n').length : 0} 条新提交记录`)
  return uniqueLogs || '⚠️ 无新的提交记录'
}
/** 写入 changelog.md */
let existing = ''
if (fs.existsSync(logPath)) existing = fs.readFileSync(logPath, 'utf8')

// 执行提交记录去重
const uniqueCommitLogs = deduplicateCommitLogs(commitLogs, existing)

/** 构建 log 内容 */
const logEntry = [
  `## 📦 构建版本 ${newVersion}`,
  `- 🕒 构建时间：${buildTime}`,
  `- 🧩 提交记录：`,
  uniqueCommitLogs,
  '',
].join('\n')

const newLog = `${logEntry}\n${existing}`
fs.writeFileSync(logPath, newLog)
console.log(`[build log]✅ 已更新 changelog.md。新增记录: ${uniqueCommitLogs !== '[build log]⚠️ 无新的提交记录' ? uniqueCommitLogs.split('\n').length : 0} 条`)

/** 打 git tag */
safeExec(`git tag -f build-v${newVersion}`)
console.log(`[build log]🏷️ 已打 tag: build-v${newVersion}`)

safeExec(`git push origin build-v${newVersion} --force`)
console.log(`[build log]🚀 已 push tag: build-v${newVersion}`)


