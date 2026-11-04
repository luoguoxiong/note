# public request 请求说明
service作为axios唯一实例（主包，子包）共用；默认使用http方法请求；如需定制需配置http；

## 关于引用
主包 + 子包引用都需要使用@public引用request, 用于构建包;


## 获取HTTP方法
```js
import { http } from '@order-public-sub-public/utils/request'
```

## request 子包自定义http
> 自定义需要：需针对原http方法增加传参packageParams指定当前配置

* config配置：采用合并模式, 对象配置会与主包配置合并, 字符串/number配置会覆盖;

```js
import { http as httpNew } from '@order-public-sub-public/utils/request'
// 初始化子包request配置
const packageRequestConfig {
  packageName: 'packageOrder',
  headers: {
    'X-Gray': '20',
  }
}

// 自定义http方法: 配置参数packageParams: packageRequestConfig
const http = <T>(
  apiCode: string,
  data = {},
  options: HttpOptions = {
  retryCount: 0,
  timeout: TIME_OUT,
  unToken: false,
},
): Promise<HttpResponse<T>> => {
  return httpNew(apiCode, data, { ...options }, packageRequestConfig)

  // 接口调用
export const fetchXXAPI = (params) => {
  return http('web.test-testOrder', { ...params })
}
```



hook方法 | 说明
------- | -----
addRequestPackageConfig | 自定义request配置


字段 | 说明                 | 类型
--------|--------------------| ------
packageName | 分包name             | String
headers | 请求头                | Object
data | 发送数据               | Object
params | URL 参数             |  Object
timeout | 超时时间               | Number
interceptors | 拦截器对象              | Object
interceptors.requestInterceptor| request拦截器         | Function
interceptors.responseInterceptor| response拦截器        | Function
interceptors.requestInterceptorCatch| request catch拦截器   | Function
interceptors.responseInterceptorCatch| response catch-拦截器 | Function
...| ...                




## request 子包自定义request配置demo
config 配置皆非必填;
```js
const packageRequestConfig = {
  packageName: 'packageOrder',
  headers: {
    'X-Module-B': 'ModuleBHeaderValue',
    'X-Gray': '20',
  },
  params: {
    lang: 'en',
  },
  // 非必填
  interceptors: {
    // 请求拦截器-非必填
    requestInterceptor: (config: ReqConfig) => {
      // 添加header测试
      if (config.headers) {
        config.headers['X-order-addKey'] = 'addKeyValue'
      }

      /* 测试 - 添加自定义手动cancel 关闭指定接口 */
      // if (!config.cancelToken) {
      //   const CancelToken = axios.CancelToken
      //   const source = CancelToken.source()
      //   config.cancelToken = source.token
      //   source.cancel('web.test-testOrder')
      // }
      return config
    },
    /* 请求拦截器 response - 与主包逻辑共存不影响公共数据 TODO 带对齐*/
    responseInterceptor: (response: ResponseData) => {
      console.log('package responseInterceptor>>>', response)
    },
    // 请求拦截器 request catch-非必填 (优先级高)
    requestInterceptorCatch: (error) => {
      return Promise.reject(error)
    },
    // 请求拦截器response catch-非必填 (优先级高)
    responseInterceptorCatch: (error) => {
      console.log('package responseInterceptor catch>>>', error)
      return Promise.reject(error)
    },
  } as NetcRequestInterceptors
}
```



## 获取应用灰度头配置并写入子包配置

```ts
import { getGrayHeaderWithApplication } from '@order-public-sub-public/utils'
// 根据areaCode, menuCode 获取灰度头对象
const packageGrayHeader = getGrayHeaderWithApplication('A2009', 'M2089') || {}

// 子包-自定义header
const packageRequestConfig = {
  packageName: 'packageOrder',
  headers: {
  'X-Module-A': 'ModuleAHeaderValue',
  'X-Gray': '10',
  ...packageGrayHeader,
  },
}
```

## 自定义拦截器
```js
const packageRequestConfig = {
  packageName: 'packageOrder',
  interceptors: {
    requestInterceptor?: (config: NetcInternalAxiosRequestConfig) => NetcInternalAxiosRequestConfig
    requestInterceptorCatch?: (error: any) => any
    responseInterceptor?: (config: AxiosResponse) => AxiosResponse
    responseInterceptorCatch?: (error: any) => any
  }
}
```

