# Utils.js

`Native.js` 互联网常用工具方法库

## 安装
```bash
yarn add @kye-netc/utils -S
```

## 设备判断

```ts
import {isWechat, isWxApplet, isAppBrowse, isAliPayClient, ...} from '@kye-netc/utils'
```

| 参数                   | 说明                |
|----------------------|-------------------|
| `isWechat`           | 是否在微信环境           |
| `isWxApplet`         | 是否在微信小程序环境        |
| `isWxApp`            | 是否在多端应用App环境      |
| `isAppBrowse`        | 是否为 App 内浏览       |
| `isAliPayClient`     | 是否在支付宝客户端         |
| `isIpad`             | 是否为 iPad 设备       |
| `isIphone`           | 是否为 iPhone 设备     |
| `isAndroid`          | 是否为 Android 设备    |
| `isAlipay`           | 是否为支付宝环境          |
| `isIpod`             | 是否为 iPod 设备       |
| `isAndroidPad`       | 是否为 Android 平板    |
| `isKuaSheng`         | 是否为跨声             |
| `isWxwork`           | 是否为企业微信           |
| `isAppiOS`           | 是否为 iOS App       |
| `isAppAndroid`       | 是否为 Android App   |
| `isWxAppletAndroid`  | 是否为 Android 微信小程序 |
| `isWxAppletI0S`      | 是否为 iOS 微信小程序     |
| `isOfflinePackage`   | 是否为离线包环境          |

## ResourceLoader
加载js、css静态资源
```ts
import { ResourceLoader } from '@kye-netc/utils'

const [isLoadCss,isLoadJs] = await ResourceLoader.load([
  { type: 'css', url: 'https://element-plus.org/assets/style.D5zC6Df_.css' },
  { type: 'js', url: 'https://ic-h5.kye-erp.com/netc-static/jweixin-1.6.0.js' },
])
```

## getQueryObject
获取url参数
```ts
import { getQueryObject } from '@kye-netc/utils'
console.log(getQueryObject('https://example.com?page=1&size=10'));
// 输出: { page: "1", size: "10" }

console.log(getQueryObject('https://example.com?id=1&id=2'));
// 输出: { id: ["1", "2"] }
```

## addUrlParams
添加url参数
```ts
import { addUrlParams } from '@kye-netc/utils'

console.log(addUrlParams('https://baidu.com', { a: 1, b: 2 }))
// 输出：https://baidu.com?a=1&b=2
```

## generateUUID
生成随机字符串uuid

```ts
import { generateUUID } from '@kye-netc/utils'
console.log(generateUUID())
// 输出：m8gt9cy45oes2mnofrh
```
