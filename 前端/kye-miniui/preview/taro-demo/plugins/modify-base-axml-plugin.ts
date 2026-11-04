/**
 * @Desc: modify-template-plugin 支付宝模板兼容插件-用于支付宝小程序模板兼容
 * @Author: wu xingtao
 * @Date: 2024/12/13
 */
import { IPluginContext } from '@tarojs/taro'
const fs = require('fs')
const path = require('path')

const ENVTemplate = {
  alipay: {
    templateFile: 'base.axml',
    regex: /<picker-view-column\b[^>]*>([\s\S]*?)<\/picker-view-column>/g,
    content: `
        <picker-view-column class="{{item.cl}}" style="{{item.st}}">
              <view a:for="{{item.cn}}" a:key="sid">
                <template is="{{xs.a(0, item.nn)}}" data="{{i:item}}" a:for="{{i.cn}}" a:key="sid" />
              </view>
            </picker-view-column>
                `,
    contentModify: `
            <block a:for="{{i.cn}}" a:key="sid">
              <picker-view-column class="{{item.cl}}" style="{{item.st}}" a:if="{{item.cn}}">
                <template is="{{xs.a(0, item.nn)}}" data="{{i:item}}" a:for="{{item.cn}}" a:key="sid" />
                    </picker-view-column>
            </block>
                `,
  },
  weapp: {
    templateFile: 'base.wxml',
    regex: /<picker-view-column\b[^>]*>([\s\S]*?)<\/picker-view-column>/g,
    content: `
        <picker-view-column name="{{i.p0}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid||i.sid}}" data-sid="{{i.sid}}">
    <template is="{{xs.a(c, item.nn, l)}}" data="{{i:item,c:c+1,l:xs.f(l,item.nn)}}" wx:for="{{i.cn}}" wx:key="sid" />
  </picker-view-column>
                `,
    contentModify: `
            <picker-view-column name="{{i.p0}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid||i.sid}}" data-sid="{{i.sid}}">
    <template is="{{xs.a(c, item.nn, l)}}" data="{{i:item,c:c+1,l:xs.f(l,item.nn)}}" wx:for="{{i.cn}}" wx:key="sid" wx:if="{{item.cn}}" />
  </picker-view-column>
                `,
  },
}

class ModifyBaseAxmlPlugin {
  apply(compiler) {
    // Hook into the compilation process
    compiler.hooks.afterEmit.tapAsync('ModifyBaseAxmlPlugin', (compilation, callback) => {
      const outputPath = compilation.outputOptions.path
      const templateConfig = ENVTemplate[process.env.TARO_ENV]
      // 找到构建后输出文件
      const fileName = templateConfig.templateFile
      const filePath = path.join(outputPath, fileName)
      console.log('filePath>>>>>>', filePath)
      if (fs.existsSync(filePath)) {
        let fileContent = fs.readFileSync(filePath, 'utf-8')
        // 模板文件匹配
        const regex = templateConfig.regex
        const contentB = templateConfig.contentModify

        // 替换模板文件
        fileContent = fileContent.replace(regex, contentB.trim())

        // 重新写入文件
        fs.writeFileSync(filePath, fileContent, 'utf-8')
        console.log(`[ModifyBaseAxmlPlugin] Modified file: ${filePath}`)
      } else {
        console.warn(`[ModifyBaseAxmlPlugin] File not found: ${filePath}`)
      }
      callback()
    })
  }
}

module.exports = (ctx: IPluginContext, pluginOpts) => {
  ctx.onBuildStart(() => {
    console.log('编译开始>>>>>>>>>>>>>>>>>>！')
  })
  ctx.modifyWebpackChain(({ chain }) => {
    // 处理 编译后生成的 base.axml 文件。
    chain.plugin('ModifyBaseAxmlPlugin').use(ModifyBaseAxmlPlugin, [pluginOpts])
  })
}
