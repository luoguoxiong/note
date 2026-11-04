<template>
  <div class="index">
    <div class="index-header">
      <img src="https://ic-img.ky-express.com/kye-miniapp/user/kye-logo.png" alt="" srcset="" />
      <div class="info">
        <h1>Ky mini ui</h1>
        <p>互联网小程序组件库</p>
      </div>
    </div>
    <scroll-view :scroll-y="true" style="height: calc(100vh - 120px);">
      <div class="index-components">
        <ol v-for="(_nav, index) in nav" :key="index">
          <li>{{ capitalize(_nav.name) }}</li>
          <ul>
            <template v-for="_package in reorder(_nav.packages)" :key="_package">
              <li v-if="_package.show !== false && _package.taro !== false">
                <a @click="navigateTo(_package)">
                  {{ _package.name }}
                  &nbsp;&nbsp;
                  {{ _package.cName }}
                </a>
              </li>
            </template>
          </ul>
        </ol>
      </div>
    </scroll-view>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs } from 'vue'
import config from '@/config.json'
import Taro from '@tarojs/taro'

export default {
  name: 'NutUI',
  // components: { Right },
  onShareAppMessage() {
    return {
      title: '',
      path: '/pages/index/index',
      success: function () {},
    }
  },
  // onShareTimeline() {
  //   return {
  //     title: '轻量级小程序组件库',
  //    success: function(res) {}
  //   }
  // },
  setup() {
    const state = reactive({
      nav: config.nav,
    })

    const reorder = (packages: any) => {
      return packages.sort(function (x: any, y: any) {
        return x['name'].toLowerCase().localeCompare(y['name'].toLowerCase())
      })
    }

    const navigateTo = (info: any) => {
      console.log('package>>>', info)
      if (info?.pagePath) {
        Taro.navigateTo({
          url: info?.pagePath,
        })
      } else {
        Taro.switchTab({
          url: `/pages/demo/index`,
        })
      }

      // Taro.navigateTo({
      //   url: `/${enName}/pages/${name.toLowerCase()}/index`,
      // })
    }

    const capitalize = (str) => {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    return {
      ...toRefs(state),
      reorder,
      navigateTo,
      capitalize,
    }
  },
}
</script>
<style lang="scss">
.index {
  height: 100%;
  width: 100%;
  // padding-top: 30px;

  &-header {
    display: flex;
    align-items: center;
    padding: 0 34px;
    height: 234px;

    > img {
      width: 134px;
      height: 134px;
      margin-right: 36px;
      flex-shrink: 0;
    }

    .info {
      display: flex;
      flex-direction: column;

      h1 {
        height: 96px;
        line-height: 96px;
        font-size: 34px;
        color: rgba(51, 51, 51, 1);
        font-weight: 500;
      }

      p {
        height: 36px;
        line-height: 36px;
        font-size: 24px;
        color: rgba(154, 155, 157, 1);
      }
    }
  }

  &-components {
    background: #f7f8fa;
    border-radius: 30px 30px 0 0;
    overflow-y: auto;
    padding: 30px 25px;

    > ol {
      margin-bottom: 34px;

      > li {
        line-height: 40px;
        font-size: 28px;
        color: rgba(144, 156, 164, 1);
        margin-bottom: 20px;
      }

      > ul {
        li {
          display: flex;
          align-items: center;
          padding: 0 48px;
          width: 100%;
          height: 90px;
          line-height: 90px;
          background: rgba(255, 255, 255, 1);
          border-radius: 44px;
          box-shadow: 0px 2px 8px 0px rgba(102, 102, 102, 0.06);
          margin-bottom: 26px;
          box-sizing: border-box;

          a {
            width: 100%;
            height: 100%;
            font-size: 30px;
            font-weight: bold;
            display: block;
            color: rgba(51, 51, 51, 1);
          }
        }
      }
    }

    ol,
    li {
      list-style: none;
    }
  }
}
</style>
