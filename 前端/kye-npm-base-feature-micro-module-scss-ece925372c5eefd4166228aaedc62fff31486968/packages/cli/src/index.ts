#!/usr/bin/env node
import { cac } from 'cac'
import { createRequire } from 'module'
import type { EnvType, PlatformType } from './type.js'
import {
  build,
  start,
  upload,
  getPackageJson,
  createPublishRelease,
} from './build.js'

const require = createRequire(import.meta.url)
const cli = cac('kycli')

/**
 * 🏗️ 构建命令
 */
cli
  .command('build', '执行构建任务')
  .option('--app <apps>', '指定平台，例如 apk,ipa,wx,alipay,amap')
  .option('--env <env>', '指定环境，例如 uat 或 prod')
  .option('--ver <version>', '指定版本号')
  .action(async (options: { app?: string; env?: EnvType; ver?: string }) => {
    const apps: PlatformType[] = options?.app
      ? (options.app.split(',') as PlatformType[])
      : ['apk', 'ipa', 'wx', 'alipay', 'amap', 'h5']

    const env: EnvType = options?.env || 'prod'

    const { pkg } = getPackageJson()

    const version = options?.ver || pkg.version

    await build(apps, env, version)
  })

/**
 * 🚀 交互式启动命令
 */
cli.command('start', '交互式构建流程').action(async () => {
  await start()
})

/**
 * 🚀 上传
 */
cli.command('upload', '上传包').action(async () => {
  await upload()
})

/**
 * 🚀 创建发布日志
 */
cli.command('log', '创建发布日志').action(async () => {
  await createPublishRelease()
})

/**
 * 🧭 通用帮助信息
 */
cli.help()

/**
 * 📦 版本号
 */
cli.version(require('../../package.json').version)

cli.parse()
