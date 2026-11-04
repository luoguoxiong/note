<template>
  <view className="rich-page-content">
    <rich-text :nodes="vwToRem(richText.content)"></rich-text>
  </view>
</template>
<script lang="ts" setup>
import { richText } from '@/public/utils/rich'
import './index.scss'
import { useDidShow } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { vwToRem } from '@/public/utils'

defineOptions({ name: 'RichIndex' })

useDidShow(() => {
  Taro.setNavigationBarTitle({
    title: richText.title,
  })
})
</script>
