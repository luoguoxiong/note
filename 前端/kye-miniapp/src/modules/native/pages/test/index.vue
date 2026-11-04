<template>
  <view class="native-test">
    <ky-button type="primary" @click="shareImage">分享图片</ky-button>
    <ky-button type="primary" @click="shareMiniApp">分享小程序</ky-button>
    <ky-button type="primary" @click="shareWebPage">分享网页</ky-button>
    <ky-button type="primary" @click="chooseImage">上传图片</ky-button>
    <ky-button type="primary" @click="getLocation">获取定位</ky-button>
    <ky-button type="primary" @click="scanCode">扫码</ky-button>
    <ky-button type="primary" @click="getClipboardData">获取粘贴板</ky-button>
    <ky-button type="primary" @click="toTest">H5网页调试</ky-button>
    <ky-button type="primary" @click="openUrl">浏览器打开文件</ky-button>
    <ky-button type="primary" @click="shareFile">分享/打开文件</ky-button>
    <ky-button type="primary" @click="previewImage">预览图片</ky-button>
    <ky-button type="primary" @click="updateApp">APP更新</ky-button>
    <ky-button type="primary" @click="pcUpload">PC上传文件</ky-button>
    <ky-button type="primary" @click="iosScanCode">IOS扫码</ky-button>
    <ky-button type="primary" @click="iosChooseFile">IOS选择文件</ky-button>
    <ky-button type="primary" @click="scanCode2">继续扫码</ky-button>
    <ky-button type="primary" @click="checkPermissionSync">原生权限获取</ky-button>
    <ky-button type="primary" @click="buglyLog.testUmengCrash(1)">java crash </ky-button>
    <ky-button type="primary" @click="buglyLog.testUmengCrash(2)">native crash</ky-button>
    <ky-button type="primary" @click="buglyLog.testUmengCrash(3)">anr</ky-button>
    <ky-button type="primary" @click="buglyLog.testUmengCrash(4)">内存溢出</ky-button>
    <ky-button type="primary" @click="getDeviceId">获取设备唯一标识</ky-button>
  </view>
</template>
<script lang="ts" setup>
import Taro from '@tarojs/taro'
import './index.scss'
import { urlContact, uuid } from '@/public/utils'
import { nativeGet } from '../api/index'
import { openURL } from '@/modules/webview/utils'
import { listenWebUpload, openWebUpload } from '@/public/native'
import { onBeforeMount, onBeforeUnmount, onMounted } from 'vue'
import { scanQrcode } from '@/public/utils/scan'
import { AppPlugin } from '@/public/appPlugins'
import { buglyLog } from '@/public/appPlugins/bugly'

const shareImage = () => {
  Taro.navigateTo({
    url: urlContact(`/modules/native/pages/share/index`, {
      type: 'ShareImage',
      shareInfo: JSON.stringify({
        imagePath: 'https://photo.ky-express.com/images/qrCode-prd/175758064387191600.png',
        thumbPath: 'https://ic-img.ky-express.com/netc/20250218_96970395147_!!1739888079920_152_172.png',
        scene: 0,
      }),
    }),
  })
}

const shareMiniApp = () => {
  Taro.navigateTo({
    url: urlContact(`/modules/native/pages/share/index`, {
      type: 'ShareMiniApp',
      shareInfo: JSON.stringify({
        imagePath:
          'https://api-uat.kyeapi.com/router/download/fms_biz_upload_code/1756265473218/l170a6916c26fc430da3fd78d99739b145/907ec0c0f5d8457f9d0ecb8c44cf8a33?params=de3c41f0deb7b24e467b98e65803f253',
        miniprogramType: 2,
        path: '/packages/webview/openWebview?needLogin=true&url=https%3A%2F%2Finvoice-manager-dev.ky-express.com%2Ffms-online-settlement-h5%2Fpay-for-another%2Fdetail%3FpageType%3D1%26shareInfo%3D49563e448a24cef1330b294ba570dc24dd95bee792a3f09ff7d77ebd8c06a1c419c45b359e95ad7d9d219b13998bb9fc7bf6e384e4bb8a88fbb258867b03e26aa7dab60d44577ee7497e24257d57b53f1be53b507f500d9e683810268d036640234b9dc95cba689aeb85c1f63185ef6d1f72c50a0fc4cc4d5ac902f7e474b39fbfcd0b7dfa23c7654a45922bb8d6fab563869a53a225f911b50b053fce142c02%26sign%3Dr6NzfSdCjGi63fmNGemgWQTxK2mkHoxIKZSZHsz0UMYF9Lt0pUQ6Nr1OfCg910Lr',
        scene: 0,
        title: 'Hi，需要你帮我支付一笔费用',
        userName: 'gh_e42a21bb8f82',
        webpageUrl:
          'https://api-uat.kyeapi.com/router/download/fms_biz_upload_code/1756265473218/l170a6916c26fc430da3fd78d99739b145/907ec0c0f5d8457f9d0ecb8c44cf8a33?params=de3c41f0deb7b24e467b98e65803f253',
      }),
    }),
  })
}

const shareWebPage = () => {
  Taro.navigateTo({
    url: urlContact(`/modules/native/pages/share/index`, {
      type: 'ShareWebPage',
      shareInfo: JSON.stringify({
        title: '有些心意必须今天抵达',
        description: '',
        thumbPath: 'https://static-inform.ky-express.com/2025-05-11/156545933757505248',
        webpageUrl:
          'https://ic-h5.kye-erp.com/netc-h5-modules/kye-style/index.html#/video?mediaId=134&appId=SP-0003&hideNav=true&coverUrl=https://static-inform.ky-express.com/2025-05-11/156545932958211641',
        scene: 0,
      }),
    }),
  })
}

/**
 * 轮询工具函数
 * @param fn   每次轮询调用的方法，返回 Promise<结果或null>
 * @param interval 轮询间隔，默认 500ms
 * @param timeout  超时时间，默认 5000ms
 */
function poll<T>(fn: () => Promise<T | null>, interval = 500, timeout = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const start = Date.now()

    const timer = setInterval(async () => {
      try {
        const result = (await fn()) as any
        if (result.data) {
          clearInterval(timer)
          resolve(result.data)
        } else if (Date.now() - start >= timeout) {
          clearInterval(timer)
          reject(new Error('轮询超时'))
        }
      } catch (err) {
        clearInterval(timer)
        reject(err)
      }
    }, interval)
  })
}

const chooseImage = async () => {
  const id = uuid()
  const taskKey = `native-${id}`
  Taro.navigateTo({
    url: urlContact(`/modules/native/pages/base/index`, {
      taskKey: taskKey,
      taskMethod: 'chooseImage',
      data: JSON.stringify({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
      }),
    }),
  })
  try {
    const result = await poll(() => nativeGet({ key: taskKey }), 500, 600000)
    const imageList = JSON.parse(result as any).result
    console.error('imageList', imageList)
  } catch (e) {
    console.error('chooseImage 失败:', e)
    return null
  }
}

const getLocation = async () => {
  const id = uuid()
  const taskKey = `native-${id}`
  Taro.navigateTo({
    url: urlContact(`/modules/native/pages/base/index`, {
      taskKey: taskKey,
      taskMethod: 'getLocation',
      data: JSON.stringify({}),
    }),
  })
  try {
    const result = await poll(() => nativeGet({ key: taskKey }), 500, 600000)
    console.error(result)
  } catch (e) {
    console.error('getLocation 失败:', e)
    return null
  }
}

const scanCode = async () => {
  const id = uuid()
  const taskKey = `native-${id}`
  Taro.navigateTo({
    url: urlContact(`/modules/native/pages/base/index`, {
      taskKey: taskKey,
      taskMethod: 'scanCode',
      data: JSON.stringify({}),
    }),
  })
  try {
    const result = await poll(() => nativeGet({ key: taskKey }), 500, 600000)
    console.error(result)
  } catch (e) {
    console.error('chooseImage 失败:', e)
    return null
  }
}

const getClipboardData = async () => {
  const id = uuid()
  const taskKey = `native-${id}`
  Taro.navigateTo({
    url: urlContact(`/modules/native/pages/base/index`, {
      taskKey: taskKey,
      taskMethod: 'getClipboardData',
      data: JSON.stringify({}),
    }),
  })
  try {
    const result = await poll(() => nativeGet({ key: taskKey }), 500, 600000)
    console.error(result)
  } catch (e) {
    console.error('chooseImage 失败:', e)
    return null
  }
}

const previewImage = () => {
  Taro.navigateTo({
    url: urlContact(`/modules/native/pages/previewImage/index`, {
      urls: encodeURIComponent(
        JSON.stringify([
          'https://api-uat.kyeapi.com/router/download/file_convert_preview/0c2cb7d743e69eb166a9e1ba87889364png/l93016792eefe2443bb11155daffca668e?params=de3c41f0deb7b24e467b98e65803f253',
        ]),
      ),
      current: encodeURIComponent(
        'https://api-uat.kyeapi.com/router/download/file_convert_preview/0c2cb7d743e69eb166a9e1ba87889364png/l93016792eefe2443bb11155daffca668e?params=de3c41f0deb7b24e467b98e65803f253',
      ),
    }), // 需要预览的图片http链接列表
  })
}

const toTest = () => {
  openURL(location.origin)
}

const updateApp = () => {
  Taro.navigateTo({ url: '/modules/native/pages/updateApp/index' })
}

const openUrl = () => {
  wx.miniapp.openUrl({
    url: 'https://kuashengim-res.kyslb.com/prd/message/2025/08/26/3662a8ab4134bb41c5bf0ff9eb6ce2b2_39226_16946163071163697883.docx',
    success(res) {
      console.log('wx.miniapp.openUrl success', res)
    },
    fail(err) {
      console.log('wx.miniapp.openUrl fail', err)
    },
  })
}

const shareFile = () => {
  Taro.request({
    url: 'https://api-uat.kyeapi.com/router/download/filefms_excel_export_data/156828279779048801/ik2c7b59ba7ce741ebbc6cbf8fa49e4fea?params=de3c41f0deb7b24e467b98e65803f253',
    method: 'HEAD', // 只取响应头
    success: (headRes) => {
      console.log(headRes)
      const disposition = headRes.header['Content-Disposition'] || headRes.header['content-disposition']
      let fileName = 'default.xlsx'
      if (disposition) {
        // 处理 filename* 的情况
        let match = disposition.match(/filename\*=\s*UTF-8''([^;]+)/i)
        if (match && match[1]) {
          fileName = decodeURIComponent(match[1])
        } else {
          // fallback 普通 filename=
          match = disposition.match(/filename="?([^"]+)"?/i)
          if (match && match[1]) {
            fileName = decodeURIComponent(match[1])
          }
        }
      }
      console.log('文件名:', fileName)
    },
  })
}

let clearWebUpload

const pcUpload = () => {
  clearWebUpload = openWebUpload({
    componentName: 'nativeTest',
    limit: 1,
    inputOptions: {
      multiple: 'true',
    },
    bizOptions: {
      bizCode: 'IC_NATIVE_UPLOAD_TEMP',
    },
    callback: ({ type, data }) => {
      console.log('listenWebUpload', type, data)
    },
  })
}

const iosScanCode = () => {
  wx.miniapp.loadNativePlugin({
    pluginId: 'wxbe1a61223a0aa4d7',
    success(plugin: any) {
      console.error('导入插件成功', plugin?.openScanASynWithCallback)
      plugin?.openScanASynWithCallback({ onlyFromCamera: '0' }, (res: any) => {
        console.log(res)
      })
    },
    fail(err: any) {
      console.error('openScanASynWithCallback插件扫码失败：', err)
    },
  })
}

const iosChooseFile = async () => {
  try {
    const res = await AppPlugin.chooseFile()
    console.error(res)
  } catch (error) {
    console.error(error)
  }
}

const scanCode2 = () => {
  scanQrcode({
    navigateType: 'redirectTo',
  })
}

const checkPermissionSync = () => {
  wx.miniapp.loadNativePlugin({
    pluginId: 'wxbe1a61223a0aa4d7',
    success(plugin: any) {
      console.error('导入插件成功', plugin?.openAppPermissionSettingsSync)
      const res = plugin?.getPermissionStatusAsyncWithCallback(
        {
          permission: ['location', 'contacts', 'storage', 'camera', 'photo', 'bluetooth', 'microphone'],
        },
        (res: any) => {
          console.error('getPermissionStatusAsyncWithCallback', res)
        },
      )
      console.error('getPermissionStatusAsyncWithCallback2', res)
    },
    fail(err: any) {
      console.error('getPermissionStatusAsyncWithCallback error', err)
    },
  })
}

const getDeviceId = async () => {
  const res = await AppPlugin.getDeviceId()
  console.log('getDeviceId', res)
}

onBeforeUnmount(() => {
  clearWebUpload && clearWebUpload()
})
</script>
