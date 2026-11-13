/* eslint-disable @typescript-eslint/no-non-null-assertion */
import ci from 'miniprogram-ci'
import path from 'path'
import fs from 'fs'
import { createRequire } from 'module'
import { EnvType } from './type'

const require = createRequire(import.meta.url)
const { minidev } = require('minidev')

interface CliConfig {
  wx: {
    appid: string
    appidUat: string
    projectPath: string
    privateKeyPath: string
    privateKeyPathUat: string
    keyAlias?: string
    keyPass?: string
    keyStore?: string
    storePass?: string
    output?: string
    profilePath?: string
    certificateName?: string
    p12Path?: string
    p12Password?: string
  }
  alipay: {
    appId: string
    projectPath: string
    identityKeyPath: string
  }
}
export class KyeCicd {
  workDir: string
  version: string
  env: EnvType
  config: CliConfig
  desc: string
  project: ci.Project

  uatProject: ci.Project

  constructor(version: string, env: EnvType) {
    this.workDir = process.cwd()
    this.version = env === 'uat' ? `99999${version}` : version
    this.env = env

    const configFn = require(path.join(this.workDir, 'cli.config.js'))
    this.config = configFn(env)
    this.desc = `CI 自动构建（版本号：${version}、环境：${env}）`

    this.project = new ci.Project({
      appid: this.config.wx.appid,
      type: 'miniProgram',
      projectPath: this.config.wx.projectPath,
      privateKeyPath: this.config.wx.privateKeyPath,
      ignores: ['node_modules/**/*'],
    })

    this.uatProject = new ci.Project({
      appid: this.config.wx.appidUat,
      type: 'miniProgram',
      projectPath: this.config.wx.projectPath,
      privateKeyPath: this.config.wx.privateKeyPathUat,
      ignores: ['node_modules/**/*'],
    })
  }

  /** ✅ 成功日志 */
  logSuccess(platform: string, data?: unknown): void {
    console.log(`\n✅ [${platform}] 构建成功！`)
    if (data) console.log(data)
  }

  /** 📦 微信小程序 */
  async buildWxMini(): Promise<void> {
    const result = await ci.upload({
      project: this.project,
      version: this.version,
      desc: this.desc,
      setting: {
        es6: true,
        useProjectConfig: true,
        minifyJS: true,
        minifyWXML: true,
        minifyWXSS: true,
        autoPrefixWXSS: true,
      },
      robot: 1,
    })
    this.logSuccess('微信小程序', result)
  }

  /** 🧩 确保目录存在 */
  private ensureDirExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      this.logSuccess(`已创建输出目录：${dirPath}`)
    }
  }

  /** 🤖 Android */
  async buildApk(): Promise<void> {
    const outputDir = this.config.wx.output!

    this.ensureDirExists(outputDir)

    const project = this.env === 'uat' ? this.uatProject : this.project

    await ci.buildApk({
      project: project,
      keyAlias: this.config.wx.keyAlias!,
      keyPass: this.config.wx.keyPass!,
      keyStore: this.config.wx.keyStore!,
      storePass: this.config.wx.storePass!,
      output: outputDir,
      disableCache: true,
      version: this.version,
      desc: this.desc,
      robot: this.env === 'uat' ? 2 : 3,
    })

    this.logSuccess('Android')
  }

  /** 🍎 iOS */
  async buildIpa(): Promise<void> {
    const outputDir = this.config.wx.output!

    this.ensureDirExists(outputDir)

    // 夸科技扫码智能用uat
    const project = this.uatProject

    await ci.buildIpa({
      project: project,
      output: outputDir,
      isRemoteBuild: true,
      robot: this.env === 'uat' ? 4 : 5,
      version: this.version,
      desc: this.desc,
      isDistribute: true,
      p12Password: this.config.wx.p12Password!,
      profilePath: this.config.wx.profilePath!,
      certificateName: this.config.wx.certificateName!,
      p12Path: this.config.wx.p12Path!,
    })

    this.logSuccess('iOS')
  }

  async uploadResouce(): Promise<void> {
    const project = this.env === 'uat' ? this.uatProject : this.project

    await ci.miniappCloudUpload({
      project: project,
      version: this.version,
      setting: {
        es6: true,
        useProjectConfig: true,
        minifyJS: true,
        minifyWXML: true,
        minifyWXSS: true,
        autoPrefixWXSS: true,
      },
      androidPlatform: true,
      iOSPlatform: true,
      robot: this.env === 'uat' ? 6 : 7,
      desc: this.desc,
    })
    console.log(`\n✅ 上传资源包成功！`)
  }

  async buildAmap(clientType: 'alipay' | 'amap'): Promise<void> {
    try {
      await minidev.app.deleteVersion({
        clientType,
        appId: this.config.alipay.appId,
        identityKeyPath: this.config.alipay.identityKeyPath,
        project: this.config.alipay.projectPath,
        version: this.version,
      })
      const { qrcodeUrl } = await minidev.upload({
        clientType,
        appId: this.config.alipay.appId,
        identityKeyPath: this.config.alipay.identityKeyPath,
        project: this.config.alipay.projectPath,
        experience: true,
        version: this.version,
        versionDescription: this.desc,
      })
      this.logSuccess(`${clientType === 'amap' ? '高德' : '支付宝'} 小程序`, {
        qrcodeUrl,
      })
    } catch (error) {
      console.error(error, 'clientType', clientType)
    }
  }

  async buildAlipay(clientType: 'alipay' | 'amap'): Promise<void> {
    try {
      const versionString = (await minidev.app.getUploadedVersionList({
        clientType,
        appId: this.config.alipay.appId,
        identityKeyPath: this.config.alipay.identityKeyPath,
        project: this.config.alipay.projectPath,
      })) as any[]

      const initApps = versionString.filter(
        (item) =>
          item.versionStatus === 'INIT' && item.versionDescription !== '',
      )

      for await (const app of initApps) {
        await minidev.app.deleteVersion({
          clientType,
          appId: this.config.alipay.appId,
          identityKeyPath: this.config.alipay.identityKeyPath,
          project: this.config.alipay.projectPath,
          version: app.appVersion,
        })
      }

      const { qrcodeUrl } = await minidev.upload({
        clientType,
        appId: this.config.alipay.appId,
        identityKeyPath: this.config.alipay.identityKeyPath,
        project: this.config.alipay.projectPath,
        experience: true,
        version: this.version,
        versionDescription: this.desc,
      })

      this.logSuccess(`支付宝小程序`, {
        qrcodeUrl,
      })
    } catch (error) {
      console.log(error)
    }
  }
}
