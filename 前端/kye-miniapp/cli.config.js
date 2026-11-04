/* eslint-disable no-undef */
const path = require('path')

const workDir = process.cwd()

const iosConf = {
  uat: {
    profilePath: './miniapp/ios/dragSource/kuajeji_dev_new.mobileprovision',
    certificateName: 'Apple Development: å¤©æ± æ (5R7J5T292V)',
    p12Path: './miniapp/ios/dragSource/kuajeji_dev_new.p12',
  },
  prod: {
    profilePath: './miniapp/ios/dragSource/kuajeji_dev_new.mobileprovision',
    certificateName: 'Apple Development: å¤©æ± æ (5R7J5T292V)',
    p12Path: './miniapp/ios/dragSource/kuajeji_dev_new.p12',
    // profilePath: './miniapp/ios/dragSource/dragSource_waibu_dis.mobileprovision',
    // certificateName: 'iPhone Distribution: KUA YUE EXPRESS Group Co.,Ltd (2TV8766467)',
    // p12Path: './miniapp/ios/dragSource/ios_dis.p12',
  },
}

module.exports = (env) => {
  console.log('env', env)
  return {
    wx: {
      output: path.join(workDir, './build'),
      appid: 'wxaf9417914179d465',
      privateKeyPath: path.join(workDir, './miniapp/private.wxaf9417914179d465.key'),
      appidUat: 'wxc6972590238f642d',
      privateKeyPathUat: path.join(workDir, './miniapp/private.wxc6972590238f642d.key'),
      projectPath: path.join(workDir, './dist/weapp'),
      keyAlias: 'kye',
      keyPass: 'kye915800',
      keyStore: path.join(workDir, './miniapp/android/速运证书/kye.keystore'),
      storePass: 'kye915800',
      p12Password: '1234',
      ...iosConf[env],
    },
    alipay: {
      appId: '2021004197669574',
      identityKeyPath: path.join(workDir, './miniapp/alipay.cli.json'),
      projectPath: path.join(workDir, './dist/alipay'),
    },
  }
}
