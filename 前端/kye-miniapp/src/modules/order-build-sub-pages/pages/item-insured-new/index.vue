<template>
  <ky-container v-bind="pageOptions">
    <div class="item-insured-new">
      <rich-text :style="{ overflowY: 'scroll' }" :nodes="internalState.agreementContent"></rich-text>
    </div>
  </ky-container>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'

import { getHelpContent, AgreementType } from '@order-public-sub-public/hooks/useAgreeState'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import Taro, { useDidShow } from '@tarojs/taro'

interface InternalState {
  agreementContent: string
}
const pageOptions = ref({
  navBarOptions: { showPlatList: ['wx'], title: '保价声明' },
})

const internalState: InternalState = reactive({
  agreementContent: '',
})
onMounted(async () => {
  initAgreeContent()
})
const isFormat: boolean = [Taro.ENV_TYPE.WEAPP, Taro.ENV_TYPE.ALIPAY].includes(Taro.getEnv())
const initAgreeContent = async () => {
  const { content: contentResult } = await getHelpContent({ types: AgreementType.Premium.toString() })
  let content = contentResult || ''
  // 删除富文本中的首行缩进（Word 粘贴内容自带 text-indent），保证内容靠左对齐
  content = content.replace(/text\-indent\:.*?pt;/g, '')
  // 支付宝小程序的 rich-text 渲染 table 需自行加入边框样式，否则无边框
  content = content
    // .replace(/<\/div>/g, '</p>')
    .replace(/<(\/?)font\b/g, '<$1span')
    .replace(/<b\b([^>]*)>/g, '<span$1 style="font-weight: bold">')
    .replace(/<\/b\b>/g, '</span>')
    .replace(/<(\/?)spantimes\b/g, '<$1span')
    .replace(/<!--\[if !supportLists\]-->/g, '')
    .replace(/<!--\[endif\]-->/g, '')
  if (isFormat) {
    content = modifyHtmlString(content, 'table', 'border-collapse: collapse;')
    content = modifyHtmlString(content, 'th', 'border: 2px solid #000;')
    content = modifyHtmlString(content, 'td', 'border: 2px solid #000;text-indent: 0;')
    content = modifyHtmlString(content, 'p', 'line-height: 2;')
  }
  internalState.agreementContent = content
}

const modifyHtmlString = (htmlString, tag, styleContent) => {
  if (typeof htmlString !== 'string') return ''

  // 正则表达式
  // 匹配 <tag 开头
  // 捕获 (style="[^"]*")? 来匹配可选的 style 属性及其内容
  // 捕获其余属性 .*?
  // 匹配 > 结尾
  const regex = new RegExp(`(<${tag}\\s*)(style="[^"]*")?([^>]*>)`, 'g')

  return htmlString.replace(regex, (match, p1, p2, p3) => {
    if (p2) {
      // 如果 style 属性已存在，合并内容
      const existingStyle = p2.substring('style="'.length, p2.length - 1)
      styleContent = `${existingStyle.trim()}; ${styleContent}`
    }

    // 确保 styleContent 不为空，避免生成 style=""
    const newStyleAttr = styleContent ? `style="${styleContent.trim()}"` : ''

    // 组合新的 tag 标签
    return `${p1} ${newStyleAttr} ${p3}`
  })
}
useDidShow(() => {
  umpOtherReport('EXP', {
    eventCode: 'page_express_single_insurance_statement_v1',
  })
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
