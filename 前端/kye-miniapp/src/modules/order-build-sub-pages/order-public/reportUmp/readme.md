# 埋点

## 使用方式 
#### 初始化

```js
import ReportUmp from './reportUmp/index'
app
  .use(ReportUmp, config)
  .mount('#app')
```

### config

``` json
{
    baseConfig: {
      sdkSrc: '', //必填
      appKey: '',  //必填
      rhost: '',  //必填
      DEBUG: false,
      aplusAutotrack: false,
    },
    vueRouter: router,
    exposureConfig: {
      threshold: 1, // 在视窗中暴露比例,默认1
      isAllowRepeait: false, // 是否不允许反复曝光，默认false
      root: null, // 默认浏览器视窗
    },
    commonConfig: {
      ref_page_name:'' //页面来源场景值，兜底document.referrer,
      ref_action:'' //上个页面的动作,
      orderId: '' //初始化后唯一uuid,
      session_id:'' //整个程序生命周期唯一值,
    },
    encryption: {
      encryptionKey: '', //RSA加密的公钥，
      encryptionString: '', //需要加密的字段，例'sender_name,sender_iPhone',
        
    },
    asyncConfig: async () => {
      const res = await getConfig()
      const { customerCode, encryptPhone, userId, xcxOpenId } = res || {}
      return {
        //需要设置的id
        ids: {
          _user_id: userId,
          _dev_id: xcxOpenId,
          _anony_id: userId,
        },
        //全局属性
        globalproperty: {
          env_server,
          userid: userId,
          customer_code: customerCode,
          mobile_number: encryptPhone,
          customer_code_mobile: `${customerCode}+${encryptPhone}`,
        },
        //用户属性
        userProfile: {
          env_server,
          userid: userId,
          customer_code: customerCode,
          mobile_number: encryptPhone,
          customer_code_mobile: `${customerCode}+${encryptPhone}`,
          wx_openid: xcxOpenId,
        },
      }
    },
  }
```

#### click
``` json
 v-click-report="{
  eventCode: 'clk_express_single_sendinfo_v1',
  otherParams: () => {
    return {
      trust_number: mobile,
    }
  },
}"
```

### exposure
``` json
 v-exposure-report="{
    eventCode: 'exp_express_cost_detail_v1',
}"

```

### 自定义
``` json
import umpOtherReport from './reportUmp/sceneReport/umpotherReport'
window.$umpOtherReport = umpOtherReport

window.$umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_express_payment_collection_v1',
    },
    {
      value: collectionAmountLabel.value,
    }
)
```

