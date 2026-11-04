/* eslint-disable @typescript-eslint/no-non-null-assertion */
import path from 'path'
import fs from 'fs'
import inquirer from 'inquirer'
import { spawn, execSync } from 'child_process'
import { KyeCicd } from './ci.js'
import { EnvType, PlatformType, VersionBumpType, PackageJSON } from './type'

/** 🧩 获取当前时间字符串 */
function formatDateTime(): string {
  const date = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const yyyy = date.getFullYear()
  const MM = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  const ss = pad(date.getSeconds())
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`
}

/** 🧩 获取当前 git 用户名 */
function getGitUser(): string {
  try {
    const name = execSync('git config user.name', { encoding: 'utf8' }).trim()
    return name || '未知用户'
  } catch {
    return '未知用户'
  }
}

/** 🧩 获取当前主分支名 */
function getCurrentBranch(cwd = process.cwd()): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      cwd,
      encoding: 'utf8',
    }).trim()
  } catch {
    return 'unknown'
  }
}

/** 🧩 创建 Git tag（存在则先删除，支持子目录） */
function createGitTag(tagName: string, cwd = process.cwd()): void {
  try {
    // 检查 tag 是否存在
    const existingTags = execSync('git tag', { cwd, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean)

    if (existingTags.includes(tagName)) {
      console.log(`⚠️ 目录 ${cwd} Tag ${tagName} 已存在，先删除`)
      execSync(`git tag -d ${tagName}`, { cwd }) // 删除本地 tag
      execSync(`git push origin :refs/tags/${tagName}`, { cwd }) // 删除远程 tag
    }

    execSync(`git tag ${tagName}`, { cwd })
    execSync(`git push origin ${tagName}`, { cwd })
    console.log(`🏷️ 目录 ${cwd} 已创建并推送 tag: ${tagName}`)
  } catch (error) {
    console.error(`❌ 目录 ${cwd} 创建 tag 失败：`, error)
  }
}

/** 🧩 获取子包分支信息（支持 Git Submodules 或子文件夹含 .git） */
function getSubPackages(): { name: string; path: string; branch: string }[] {
  const result: { name: string; path: string; branch: string }[] = []
  const root = process.cwd()
  const gitmodulesPath = path.join(root, '.gitmodules')

  if (fs.existsSync(gitmodulesPath)) {
    const content = fs.readFileSync(gitmodulesPath, 'utf8')
    const matches = [...content.matchAll(/path\s*=\s*(.+)/g)]
    for (const [, subPath] of matches) {
      const absPath = path.join(root, subPath.trim())
      const branch = getCurrentBranch(absPath)
      result.push({ name: subPath.trim(), path: absPath, branch })
    }
  }

  if (result.length === 0) {
    const dirs = fs.readdirSync(root).filter((d) => {
      const full = path.join(root, d)
      return (
        fs.existsSync(path.join(full, '.git')) &&
        fs.statSync(full).isDirectory()
      )
    })
    for (const dir of dirs) {
      const absPath = path.join(root, dir)
      const branch = getCurrentBranch(absPath)
      result.push({ name: dir, path: absPath, branch })
    }
  }

  return result
}

/** 🚀 执行命令 */
function runCommand(cmd: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n▶️ 执行命令: ${cmd} ${args.join(' ')}\n`)
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`命令执行失败，退出码: ${code}`))
    })
  })
}

export function getPackageJson(): {
  pkg: PackageJSON
  pkgPath: string
  miniapp: PackageJSON
  miniappPath: string
} {
  const pkgPath = path.join(process.cwd(), 'package.json')
  const miniappPath = path.join(process.cwd(), 'project.miniapp.json')
  return {
    pkg: JSON.parse(fs.readFileSync(pkgPath, 'utf-8')),
    pkgPath,
    miniapp: JSON.parse(fs.readFileSync(miniappPath, 'utf-8')),
    miniappPath,
  }
}

/** 🔼 版本号递增 */
function bumpVersion(version: string, type: VersionBumpType): string {
  console.log(version)
  const [major, minor, patch] = version.split('.').map(Number)
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
    default:
      return version
  }
}

/** ✍️ 更新 package.json 版本号 */
async function updatePackageVersion(
  version: string,
  isUpdateVersion: boolean,
): Promise<string> {
  const { pkg, pkgPath, miniapp, miniappPath } = getPackageJson()
  pkg.version = version
  miniapp.version = version
  if (isUpdateVersion) {
    miniapp.versionCode += 1
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
  fs.writeFileSync(miniappPath, JSON.stringify(miniapp, null, 2))
  console.log(`\n📦 版本号：${version}\n`)
  console.log(`\n📦 应用版本号：${miniapp.versionCode}\n`)
  return version
}

/** 🏗️ 构建任务 */
async function buildPackage(
  platforms: PlatformType[],
  env: EnvType,
  version: string,
): Promise<void> {
  const buildTargets: string[] = []
  if (platforms.some((p) => ['wx', 'apk', 'ipa'].includes(p)))
    buildTargets.push('weapp')
  if (platforms.some((p) => ['alipay', 'amap'].includes(p)))
    buildTargets.push('alipay')
  if (platforms.includes('h5')) {
    buildTargets.push('h5')
  }

  // 🔧 统一打包
  for (const target of buildTargets) {
    const modeArg = env === 'uat' ? ['--mode', env] : []
    await runCommand('taro', ['build', '--type', target, ...modeArg])
  }

  // 🧹 删除 build 目录下所有文件
  const buildDir = path.join(process.cwd(), 'build')
  if (fs.existsSync(buildDir)) {
    console.log('🧹 清空 build 目录...')
    fs.rmSync(buildDir, { recursive: true, force: true })
  }

  const isBuildApp = platforms.includes('apk') || platforms.includes('ipa')

  let restore

  if (isBuildApp) {
    restore = await deleteAppPlugin()
    console.log('🧹 uat 清空  project.miniapp.json 插件配置')
  }

  // 🚀 上传与构建
  const cicd = new KyeCicd(version, env)

  for (const p of platforms) {
    if (p === 'wx') await cicd.buildWxMini()
    if (p === 'apk') await cicd.buildApk()
    if (p === 'ipa') await cicd.buildIpa()
    if (p === 'alipay') await cicd.buildAlipay('alipay')
    if (p === 'amap') await cicd.buildAmap('amap')
  }

  // 🚀 app上传资源包
  if (isBuildApp && env !== 'uat') {
    console.log('上传资源包开始...')
    await cicd.uploadResouce()
  }

  if (restore && isBuildApp && env === 'uat') {
    restore()
  }
}

/** 🏗️ 上传任务 */
async function uploadPackage(
  platforms: PlatformType[],
  env: EnvType,
  version: string,
): Promise<void> {
  // 🧹 删除 build 目录下所有文件
  const buildDir = path.join(process.cwd(), 'build')
  if (fs.existsSync(buildDir)) {
    console.log('🧹 清空 build 目录...')
    fs.rmSync(buildDir, { recursive: true, force: true })
  }

  const isBuildApp = platforms.includes('apk') || platforms.includes('ipa')

  let restore

  if (isBuildApp && env === 'uat') {
    restore = await deleteAppPlugin()
    console.log('🧹 uat 清空  project.miniapp.json 插件配置')
  }

  // 🚀 上传与构建
  const cicd = new KyeCicd(version, env)

  for (const p of platforms) {
    if (p === 'wx') await cicd.buildWxMini()
    if (p === 'apk') await cicd.buildApk()
    if (p === 'ipa') await cicd.buildIpa()
    if (p === 'alipay') await cicd.buildAlipay('alipay')
    if (p === 'amap') await cicd.buildAmap('amap')
  }

  // 🚀 app上传资源包
  if (isBuildApp && env !== 'uat') {
    await cicd.uploadResouce()
  }

  if (restore && isBuildApp && env === 'uat') {
    restore()
  }
}

/** 📈 版本号选择与更新 */
async function handleVersionUpgrade(): Promise<string> {
  const { type } = await inquirer.prompt({
    type: 'list',
    name: 'type',
    message: '请选择版本变更类型：',
    choices: [
      { name: '主版本号（major）', value: 'major' },
      { name: '次版本号（minor）', value: 'minor' },
      { name: '修复版本号（patch）', value: 'patch' },
    ],
  })

  const { pkg } = getPackageJson()
  const newVersion =
    type === 'none' ? pkg.version : bumpVersion(pkg.version, type)
  await updatePackageVersion(newVersion, true)
  return newVersion
}

/** 🏁 主函数（交互式） */
export async function start(): Promise<void> {
  const { env } = await inquirer.prompt({
    type: 'list',
    name: 'env',
    message: '请选择构建环境：',
    choices: ['uat', 'prod'],
  })

  const allPlatforms = [
    { name: '微信小程序', value: 'wx' },
    { name: 'Android', value: 'apk' },
    { name: 'iOS', value: 'ipa' },
    { name: '支付宝小程序', value: 'alipay' },
    { name: '高德小程序', value: 'amap' },
    { name: 'web', value: 'h5' },
  ]

  const { platformList } = await inquirer.prompt({
    type: 'checkbox',
    name: 'platformList',
    message: '请选择要构建的类型：',
    choices: allPlatforms,
    default: [],
    validate: (input: PlatformType[]) =>
      input.length === 0 ? '⚠️ 请至少选择一个构建类型！' : true,
  })
  const { pkg } = getPackageJson()
  await buildPackage(platformList, env, pkg.version)
  console.log('\n🎉 所有构建任务已完成!\n')
  process.exit(0)
}

/** 🧩 非交互式构建 */
export async function build(
  platformList: PlatformType[],
  env: EnvType,
  version: string,
): Promise<void> {
  await updatePackageVersion(version, false)
  await buildPackage(platformList, env, version)
  console.log('\n🎉 所有构建任务已完成!\n')
  process.exit(0)
}

/** 📝 创建或更新发布日志 */
export async function createPublishRelease(): Promise<void> {
  // 1️⃣ 版本升级
  await handleVersionUpgrade()

  // 2️⃣ 获取项目信息
  const { pkg, miniapp } = getPackageJson()

  // 3️⃣ 让用户填写更新内容
  const { content } = await inquirer.prompt({
    type: 'editor',
    name: 'content',
    message: `请输入 ${pkg.version} 更新内容:`,
    validate: (i) => (i.trim() ? true : '内容不能为空'),
  })

  // 4️⃣ 基础信息准备
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md')
  const now = formatDateTime()
  const gitUser = getGitUser()
  const branch = getCurrentBranch()
  const tagName = `v${pkg.version}`
  const subPackages = getSubPackages()

  // 5️⃣ 生成日志内容
  const subText = subPackages.length
    ? subPackages.map((s) => `- ${s.name} — 分支：${s.branch}`).join('\n')
    : '（无子包信息）'

  const logEntry = [
    `## 🏷️ 版本 ${pkg.version}`,
    `**发布时间：** ${now}`,
    `**发布人：** ${gitUser}`,
    `**主分支：** ${branch}`,
    `**Git Tag：** ${tagName}`,
    ``,
    `### 📦 子包信息`,
    subText,
    ``,
    `**Android-sdk版本号：** ${miniapp['mini-android']?.sdkVersion ?? '-'}`,
    ``,
    `**IOS-sdk版本号：** ${miniapp['mini-ios']?.sdkVersion ?? '-'}`,
    ``,
    `**鸿蒙-sdk版本号：** ${miniapp['mini-ohos']?.sdkVersion ?? '-'}`,
    ``,
    `${content.trim()}`,
    `\n---\n`,
  ].join('\n')

  const header = '# 📦 发布日志\n\n'
  const old = fs.existsSync(changelogPath)
    ? fs.readFileSync(changelogPath, 'utf-8')
    : ''

  const contentToWrite = old.startsWith(header)
    ? header + logEntry + old.replace(header, '')
    : header + logEntry + old

  fs.writeFileSync(changelogPath, contentToWrite)

  // 6️⃣ 提交到 Git（提交所有变动）
  try {
    // execSync(`git add -A`, { stdio: 'inherit' })
    // execSync(`git commit -m "force# v${pkg.version}"`, { stdio: 'inherit' })
    // execSync(`git push origin ${branch}`, { stdio: 'inherit' })
    console.log(`✅ 已生产日志信息 ${branch}`)
  } catch (err) {
    console.error('❌ Git 提交失败:', err)
    return
  }

  // 7️⃣ 创建并推送 Tag（确保 tag 指向最新 commit）
  try {
    createGitTag(tagName)
    execSync(`git push origin ${tagName}`, { stdio: 'inherit' })
    console.log(`✅ 已创建并推送 Tag：${tagName}`)
  } catch (err) {
    console.error('❌ Tag 创建或推送失败:', err)
  }
  // 子包打 Tag
  if (subPackages.length) {
    for (const sub of subPackages) {
      console.log(`📦 处理子包：${sub.name}（分支：${sub.branch}）`)
      try {
        execSync(`git -C ${sub.path} fetch origin ${sub.branch}`, {
          stdio: 'inherit',
        })
        execSync(`git -C ${sub.path} checkout ${sub.branch}`, {
          stdio: 'inherit',
        })
        const subTag = `v${pkg.version}`
        createGitTag(subTag, sub.path)
      } catch (err) {
        console.error(`❌ 子包 ${sub.name} Tag 创建或推送失败:`, err)
      }
    }
  }
  console.log(`🎉 发布流程完成：版本 ${pkg.version}`)
}

/** 🏁 主函数（交互式） */
export async function upload(): Promise<void> {
  const { env } = await inquirer.prompt({
    type: 'list',
    name: 'env',
    message: '请选择发布环境：',
    choices: ['uat', 'prod'],
  })

  const allPlatforms = [
    { name: '微信小程序', value: 'wx' },
    { name: 'Android', value: 'apk' },
    { name: 'iOS', value: 'ipa' },
    { name: '支付宝小程序', value: 'alipay' },
    { name: '高德小程序', value: 'amap' },
  ]

  const { platformList } = await inquirer.prompt({
    type: 'checkbox',
    name: 'platformList',
    message: '请选择要构建的类型：',
    choices: allPlatforms,
    default: [],
    validate: (input: PlatformType[]) =>
      input.length === 0 ? '⚠️ 请至少选择一个构建类型！' : true,
  })

  const { pkg } = await getPackageJson()

  await uploadPackage(platformList, env, pkg.version)
  console.log('\n🎉 所有构建任务已完成!\n')
  process.exit(0)
}

export async function deleteAppPlugin() {
  const appJsonPath = path.join(
    process.cwd(),
    './dist/weapp/project.miniapp.json',
  )

  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'))

  // 备份删除前的配置
  const backup = appJson['mini-plugin']

  // 删除打包app插件配置
  delete appJson['mini-plugin']

  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2))

  // 返回恢复函数
  return () => {
    if (backup) {
      const currentJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'))
      currentJson['mini-plugin'] = backup
      fs.writeFileSync(appJsonPath, JSON.stringify(currentJson, null, 2))
    }
  }
}
