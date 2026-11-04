<template>
  <Content>
    <template v-slot:title>
      <span class="title">
        <svg-icon name="about"></svg-icon>
        关于跨越
      </span>
    </template>
    <template v-slot:more>
      <More text="前往官网了解更多" :to-more="toOffical"></More>
    </template>
    <template v-slot:content>
      <div
        class="company-info-wrap"
        v-exposure-report="{
          eventCode: 'exp_homepage_about_kye_v1',
          region_code: 'about_kye',
        }"
      >
        <div class="company-info-item" @click="linkToUrl(item)" v-for="item in keyInfo.subModule" :key="item.title">
          <img
            class="company-info-img"
            v-lazyload="{
              src: item.imgUrl,
              placeholder: 'https://ic-img.ky-express.com/netc/20240513_22470395113_!!1715600535931_200_200.png',
              error: 'https://ic-img.ky-express.com/netc/20240513_22470395113_!!1715600535931_200_200.png',
            }"
          />
          <div class="company-info-msg">
            <div class="op-title">{{ item.title }}</div>
            <div class="op-desc">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </template>
  </Content>
</template>
<script setup lang="ts">
import { useHomeStore } from '@/hooks'
import { KeyInfoItem } from '@/stores/home'
import Content from '@/views/home/components/content/index.vue'
import More from '@/views/home/components/more/index.vue'

const { keyInfo } = useHomeStore()
const toOffical = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_about_kye_view_more_v1',
    },
    {
      region_code: 'about_kye',
    }
  )
  window.open(keyInfo.value.officialWebsite, '_blank')
}
const linkToUrl = (item: KeyInfoItem) => {
  if (!item.viewMoreUrl) throw '没有跳转链接'
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_about_kye_strength_subblock_v1',
    },
    {
      region_code: 'about_kye',
      subblock_name: item.title,
    }
  )
  window.open(item.viewMoreUrl, '_blank')
}
</script>
<style lang="scss" scoped>
#about-kye {
  width: 100%;
  height: 335px;
  overflow: hidden;
}
.title {
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  img {
    margin-right: 4px;
  }
}
.company-info-wrap {
  display: grid;
  grid-template-columns: repeat(4, 2fr);
  grid-gap: 0 16px;
}
.company-info-item {
  height: 100%;
  height: 270px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  overflow: hidden;
  &:hover {
    box-shadow: 0px 6px 18px 0px rgba(0, 0, 0, 0.12);
  }
}
.company-info-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}
.company-info-msg {
  height: 70px;
  background: #f7f8fa;
  padding: 16px;
  text-align: center;
  box-sizing: border-box;
  & > div:nth-child(1) {
    font-size: 15px;
    font-weight: 600;
    color: #03050d;
    margin-bottom: 4px;
    height: 16px;
    line-height: 16px;
  }
  & > div:nth-child(2) {
    font-size: 12px;
    line-height: 18px;
    color: #4d4f54;
  }
}
</style>
