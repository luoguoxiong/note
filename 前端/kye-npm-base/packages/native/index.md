# Native.js

`Native.js` 通用 H5 与原生交互的能力，支持与微信小程序、支付宝小程序、App 等原生功能进行交互。

## 安装

1. 安装 `@kye-netc/native` 依赖：

```bash
yarn add @kye-netc/native -S
```

2. 创建文件夹，在项目中创建 `native.ts` 文件并引入 `Native`：

```ts
// native.ts
import { Native } from '@kye-netc/native'
export const native = new Native({ env: 'uat'})
```

3. 在入口文件中引入 `native.ts`，在 `main.ts` 或者你的 Vue 项目入口文件中，实例化 `Native` 类：

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import './native'
createApp(App).mount('#app')
```

## 1. chooseImage

选择图片，并转为 Base64 格式。

```ts
await native.chooseImage({ count: 1, sizeType: ['original'], sourceType: ['album'] })
```

**Parameters**

| 参数         | 类型                         | 说明                           |
| ------------ | ---------------------------- | ------------------------------ |
| `count`      | `number`                     | 最大选择图片数量，默认为 1     |
| `sizeType`   | `['original', 'compressed']` | 图片尺寸类型，支持原图或压缩图 |
| `sourceType` | `['album', 'camera']`        | 图片来源类型，支持相册或相机   |

**Response**

| 参数      | 类型                | 说明               |
| --------- | ------------------- | ------------------ |
| `imgList` | `ChooseImageFile[]` | 选中的图片文件列表 |

---

## 2. scanQRCode

扫码功能。

```ts
await native.scanQRCode({ needResult: 1, scanType: ['qrCode'] })
```

**Parameters**

| 参数         | 类型                    | 说明                         |
| ------------ | ----------------------- | ---------------------------- |
| `needResult` | `0 | 1`                 | 是否需要返回扫码结果         |
| `scanType`   | `['qrCode', 'barCode']` | 扫描类型，支持二维码或条形码 |

**Response**

| 参数         | 类型     | 说明     |
| ------------ | -------- | -------- |
| `scanResult` | `string` | 扫码结果 |


## 3. navigateTo

跳转至其他原生路由。

```ts
await native.navigateTo({ url: '/path/to/page', params: { id: 1 } })
```

**Parameters**

| 参数     | 类型                              | 说明                        |
| -------- | --------------------------------- | --------------------------- |
| `url`    | `string`                          | 小程序路由或 App 的页面地址 |
| `params` | `Record<string, string \| number>` | 跳转时附带的参数            |

---

## 4. navigateBack

返回到上一级页面。

```ts
await native.navigateBack({ delta: 1 })
```

**Parameters**

| 参数    | 类型     | 说明           |
| ------- | -------- | -------------- |
| `delta` | `number` | 要返回的页面数 |

---

## 5. share

分享内容。

```ts
await native.share({ title: '分享标题', imgUrl: '分享图片', contentType: 'miniprogram' })
```

**Parameters**

| 参数              | 类型                              | 说明                                            |
| ----------------- | --------------------------------- | ----------------------------------------------- |
| `programPath`     | `string`                          | 微信路径                                        |
| `imageUrl`        | `string`                          | 微信或支付宝分享图片                            |
| `title`           | `string`                          | 分享标题                                        |
| `path`            | `string`                          | 支付宝分享路径                                  |
| `searchTip`       | `string`                          | 支付宝分享时的搜索提示                          |
| `content`         | `string`                          | 支付宝分享的自定义口令                          |
| `bgImgUrl`        | `string`                          | 支付宝分享封面                                  |
| `contentType`     | `'miniprogram' \| 'image' \| 'url'` | 分享内容类型（小程序、图片或链接）              |
| `imgUrl`          | `string`                          | app 分享的图片                                  |
| `platform`        | `'weixin' \| 'weixin_timeline'`    | 分享平台（微信或朋友圈）                        |
| `desc`            | `string`                          | 分享描述                                        |
| `link`            | `string`                          | 以 URL 形式分享时的链接                         |
| `programUserName` | `string`                          | 小程序的原始用户名                              |
| `programType`     | `number`                          | 小程序版本类型，0: 正式版, 1: 测试版, 2: 体验版 |

---

## 6. previewImage

预览图片。

```ts
await native.previewImage({
  urls: [
    "https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png",
    "https://ic-img.ky-express.com/netc/20250308_66270395148_!!1741419273649_112_112.png",
  ],
  current:
    "https://ic-img.ky-express.com/netc/20250308_66270395148_!!1741419273649_112_112.png",
});
```

**Parameters**

| 参数      | 类型              | 说明               |
| --------- | ----------------- | ------------------ |
| `current` | `number | string` | 当前预览的图片索引 |
| `urls`    | `string[]`        | 图片链接数组       |

---

## 7. login

登录功能。

```ts
await native.login()
```

**Response**

无返回。

---

## 8. postMessage

原生通信。

```ts
await native.postMessage({ plateform: 'wx', method: 'post', taskKey: 'key', data: { key: 'value' } })
```

**Parameters**

| 参数        | 类型                      | 说明                |
| ----------- | ------------------------- | ------------------- |
| `plateform` | `'alipay' | 'wx' | 'app'` | 平台类型            |
| `method`    | `string`                  | 请求方法（如 post） |
| `taskKey`   | `string`                  | 任务键              |
| `data`      | `Record<string, any>`     | 要传输的数据        |

**Response**

无返回。

---

## 9. getLocation

获取当前位置信息。

```ts
await native.getLocation({ type: 'wgs84' })
```

**Parameters**

| 参数   | 类型                | 说明                         |
| ------ | ------------------- | ---------------------------- |
| `type` | `'wgs84' | 'gcj02'` | 坐标系类型（wgs84 或 gcj02） |

**Response**

| 参数        | 类型     | 说明 |
| ----------- | -------- | ---- |
| `latitude`  | `string` | 纬度 |
| `longitude` | `string` | 经度 |

---

## 10. openLocation

打开地图定位。

```ts
await native.openLocation({ latitude: 39.9042, longitude: 116.4074, name: '地点', address: '地址' })
```

**Parameters**

| 参数        | 类型     | 说明         |
| ----------- | -------- | ------------ |
| `latitude`  | `number` | 纬度         |
| `longitude` | `number` | 经度         |
| `name`      | `string` | 地点名称     |
| `address`   | `string` | 地点地址     |
| `scale`     | `number` | 地图缩放级别 |

---

## 11. openWebview

打开 Webview 页面。

```ts
await native.openWebview({ url: 'https://example.com' })
```

**Parameters**

| 参数        | 类型      | 说明                 |
| ----------- | --------- | -------------------- |
| `needLogin` | `boolean` | 是否需要登录（可选） |
| `url`       | `string`  | 要打开的网页 URL     |

---

## 12. openPreloadCacheWebView

预加载缓存 WebView 页面。

```ts
await native.openPreloadCacheWebView({ page: 'pageName' })
```

**Parameters**

| 参数   | 类型     | 说明               |
| ------ | -------- | ------------------ |
| `page` | `string` | 要预加载的页面名称 |

---

## 13. chooseFile

选择文件。

```ts
await native.chooseFile({ fileType: ['xls', 'xlsx'] })
```

**Parameters**

| 参数       | 类型       | 说明                                 |
| ---------- | ---------- | ------------------------------------ |
| `fileType` | `string[]` | 支持的文件类型，如 `['xls', 'xlsx']` |

**Response**

| 参数       | 类型     | 说明               |
| ---------- | -------- | ------------------ |
| `base64`   | `string` | 文件的 Base64 编码 |
| `fileName` | `string` | 文件名             |
| `fileSize` | `number` | 文件大小           |

---

## 14. checkApi

检查原生方法是否存在。

```ts
await native.checkApi({ api: 'chooseImage' })
```

**Parameters**

| 参数  | 类型     | 说明   |
| ----- | -------- | ------ |
| `api` | `string` | 方法名 |

**Response**

| 参数     | 类型        | 说明             |
| -------- | ----------- | ---------------- |
| `result` | `'1' \| '0'` | 1 存在，0 不存在 |

---

## 15. getClipboardData

获取剪切板数据。

```ts
await native.getClipboardData({ necessary: true })
```

**Parameters**

| 参数        | 类型      | 说明                   |
| ----------- | --------- | ---------------------- |
| `necessary` | `boolean` | 是否必须获取剪切板内容 |

**Response**

| 参数        | 类型     | 说明       |
| ----------- | -------- | ---------- |
| `clipboard` | `string` | 剪切板内容 |

---

## 16. setNavigationBar

App 设置导航栏展示

```ts
await native.setNavigationBar({ isHidden: true })
```

**Parameters**

| 参数        | 类型      | 说明                   |
| ----------- | --------- | ---------------------- |
| `isHidden` | `boolean` | 是否隐藏导航栏 |

---

## 17. openMiniProgram

获取剪切板数据。

```ts
await native.openMiniProgram({
  appid: "wxb3c0dc14850a5358", // 无效appid
  userName: "gh_8446123ed7a1",
  miniprogramType: 0,
  miniProgramName: "跨越个人介绍",
});
```

**Response**

| 参数        | 类型     | 说明       |
| ----------- | -------- | ---------- |
| `clipboard` | `string` | 剪切板内容 |

---


## 18. checkBluetoothAuth

App 校验蓝牙状态。

```ts
const {state} = await native.checkBluetoothAuth()
```
**Response**

state 参数说明：

* 0：已开启
* 1：手机蓝牙未开启，请在设置页打开蓝牙
* 2：APP蓝牙权限未开启，请在手机“设置-应用-跨越速运-蓝牙权限”进行设置，注意：前往设置后，APP会重新启动，可在查件中发起面单打印。
* 3：手机定位未开启，请在设置页打开定位，注意：前往设置后，APP会重新启动，可在查件中发起面单打印。
* 4：APP定位权限未开启，请在手机“设置-应用-跨越速运-定位权限”进行设置，注意：前往设置后，APP会重新启动，可在查件中发起面单打印。

---

## 19. getBluetoothDevice

App 获取当前连接的打印机的方法 

```ts
await native.getBluetoothDevice()
```

**Response**

| 参数        | 类型     | 说明       |
| ----------- | -------- | ---------- |
| `address` | `string` | - |
| `state` | `number` | - |
| `deviceNo` | `string` | 设备号 |
| `name` | `string` | - |
| `printerType` | `string` | - |
| `uuid` | `string` | 设备标识 |

---

## 20. sendBluetoothData

App 向打印机发送数据的方法。

```ts
await native.sendBluetoothData(data)
```

---

## 21. jumpBluetoothDeviceList

App 跳转打印机列表页

```ts
await native.jumpBluetoothDeviceList();
```

---

## 22. jumpPrintPage

App 跳转打印机

```ts
await native.jumpPrintPage();
```

---

## 23. openBluetoothSet

App 未开启蓝牙时，打开手机蓝牙设置

```ts
await native.openBluetoothSet();
```

---

## 24. downloadImage

App/支付宝小程序下载图片

```ts
await native.downloadImage({
  imageData: "https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png",
});
```

---

## 25. downloadFile

App/支付宝小程序下载文件

```ts
await native.downloadFile({
  url: "https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png",
});
```

---

## 26. openFile

App 下载并打开文件

```ts
await native.openFile({
  url: "https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png",
});
```

---

## 27. toast

App 弹窗信息

```ts
await native.toast({
    message: "弹窗提示",
});
```

---

## 27. logout

App 退出登录

```ts
await native.logout();
```

---

## 28. disableOnBack

App 禁止滑动返回

```ts
await native.disableOnBack();
```

---

## 29. openCamera

 App 打开相机

```ts
await native.openCamera();
```

---

## 30. selectPhotosFromSD

 App 选择相册

```ts
await native.selectPhotosFromSD({ count: 2 });
```

---

## 31. closeWindow

App 关闭webview窗口

```ts
await native.closeWindow();
```

---

## 32. jumpToNativePage

App 跳转至原生路由Code

```ts
await native.jumpToNativePage({ pageCode: 5 });
```

---

## 33. hasPrivacyAuth

App 判断是否同意隐私协议

```ts
await native.hasPrivacyAuth();
```
---

## 34. recallPrivacyAuth

App 撤销同意隐私协议;撤回后会关闭App

```ts
await native.recallPrivacyAuth();
```

---

## 35. aliPay
app - 支付宝支付 (仅限多端app使用)

```ts
await native.aliPay({
  orderString: '', // 订单信息
  out_trade_no: '' // 交易编码(非必填)
})
```
**Parameters**

| 参数         | 类型                        | 说明                           |
| ------------ | --------------------------- | ------------------------------ |
| `orderString`      | `String`                    | 订单信息  |
| `out_trade_no`   | `String` | 交易编码(非必填) |

---

## 37. wechatPay
app - 微信支付 (仅限多端app使用)

```ts
await native.wechatPay(params)
```

**Parameters**

| 参数         | 类型       | 说明                                                                                  |
| ------------ |----------|-------------------------------------------------------------------------------------|
| `mchId`   | `String` | 请填写商户号mchid对应的值(partnerId)。示例值：1900000109    |
| `prepayId` | `String` | 图微信返回的支付交易会话ID，该值有效期为2小时。示例值： WX1217752501201407033233368018                        |
| `package`      | `String` | 暂填写固定值Sign=WXPay示例值：Sign=WXPay                                                      |
| `nonceStr`   | `String` | 随机字符串，不长于32位。推荐随机数生成算法。示例值： 5K8264ILTKCH16CQ2502SI8ZNMTM67VS9                       |
| `timeStamp` | `Number` | 时间戳，标准北京时间，时区为东八区，自1970年1月1日 0点0分0秒以来的秒数。注意：部分系统取到的值为毫秒级，需要转换成秒(10位数字)。示例 值：1412000000 |
| `sign` | `String` | 签名，使用字段appId、timeStamp、nonceStr、prepayid计算得出的签名值 注意：取值RSA格式                         |

sign 示例值：oR9d8PuhnIc+YZ8cBHFCwfgpaK9gd7vaRvkYD7rthRAZ/X+QBhcCYL21N7cHCTUxbQ+EAt6Uy+lwSN22f5YZvI45MLko8P
fso0jm46v5hqcVwrk6uddkGuT+Cdvu4WBqDzaDjnNa5UK3GfE1Wfl2gHxIIY5lLdUgWFts17D4WuolLLkiFZV+JSHMvH7e
aLdT9N5GBovBwu5yYKUR7skR8Fu+LozcSqQixnlEZUfyE55feLOQTUYzLmR9pNtPbPsu6WVhbNHMS3Ss2+A
ehHvz+n64GDmXxbX++IOBvm2olHu3PsOUGRwhudhVf7UcGcunXt8cqNjKNqZLhLw4jq/xDg==


---

## 38. unifyPay
app - 银联支付 (仅限多端app使用)

**Parameters**

| 参数        | 类型       | 说明                                                                                                        |
|-----------|----------|-----------------------------------------------------------------------------------------------------------|
| `channel` | `Number` | 1:CHANNEL_WEIXIN 微信支付, 2:CHANNEL_ALIPAY 支付宝支付  3: CHANNEL_ALIMINIPAY 支付宝小程序 4: CHANNEL_WEIXINMINI 微信小程序支付 |
| `data`    | `Object` | 银联data配置        

| data参数      | 类型       | 说明                                                                                                        |
|-------------|----------|-----------------------------------------------------------------------------------------------------------|
| `channel`   | `Number` | 1:CHANNEL_WEIXIN 微信支付, 2:CHANNEL_ALIPAY 支付宝支付  3: CHANNEL_ALIMINIPAY 支付宝小程序 4: CHANNEL_WEIXINMINI 微信小程序支付 |
| `minipath`  | `String` | 银联跳转支付链接（支付宝银联小程序链接）                                                                                      |
| `miniuser`  | `String` | 银联用户                                                                                                      |
| `msgType`   | `String` | 银联消息类型                                                                                                    |
| `noncestr`  | `String` | 银联用户                                                                                                      |
| `package`   | `String` | 暂填写固定值 Sign=ALI                                                                                           |
| `prepayid`  | `String` | 银联支付交易会话ID                                                                                                  |
| `sign`      | `String` | 银联签名                                                                                                    |
| `timestamp` | `Number` |  时间戳，标准北京时间，时区为东八区                                                                                           |


```ts
await native.unifyPay({
  channel: 3,
  data: {
    appScheme: 'iOS:kuayuesuyunpay;Android:kuayuesuyunpay',
    minipath: 'pages/appPay/index/index',
    miniuser: 2019010762862511,
    msgType: 'trade.appPreOrder',
    noncestr: 'YcMzppUxHyyGYLBQnXYnovQhVVtvuhKl',
    package: 'Sign=ALI',
    prepayid: 'ori=39FG2025082314491350000014499767',
    sign: 'HEoFEuiqGuaUPOXqqbbJQsKmhGbwJBfjpsvqTckvwdHYafVMmScjcjvSycsHpeqP',
    timestamp: 20250823144914,
  }
})
```
---

## 错误信息
统一封装了公共的错误信息响应
```ts
const chooseImage = async () => {
  try {
    const result = await native.chooseImage({ count: 2 });
  } catch (error) {
    // 错误信息
    console.error("error", error);
  }
};
```

### `error.code` 返回状态码

| 状态码              | 值    | 说明                                  |
| ----------------- | ---- | --------------------------------- |
| `ERROR`          | `'-1'` | 请求失败                            |
| `CANCEL`         | `'-2'` | 用户取消操作                        |
| `NOAUTH`         | `'-3'` | 未授权                          |
| `WXAPISDKERROR`  | `'-4'` | 微信 API SDK 错误                   |
| `JSSDKFAIL`      | `'-5'` | JSSDK 引入失败                 |
| `WXCONFIGERROR`  | `'-6'` | 微信 JSSDK 配置错误                 |
| `NOSUPPORT`      | `'-7'` | 当前环境不支持该功能                |

