### 地图选址-网点版

> 提供手机端地图网点选择
> 该组件基于 js-sdk 中 ksui.http 方法封装，请在跨声环境下测试

#### Props

| 参数   | 说明                                                           | 类型    | 可选值 | 默认 |
| ------ | -------------------------------------------------------------- | ------- | ------ | ---- |
| lngLat | 地图初始化中心，也是当前位置中，一般调取 ks 获取定位接口得到的 | object  | -      | -    |
| isNet  | 是否显示网点选址                                               | boolean | false  | true |

#### Options lngLat

| 参数 | 说明 | 类型          | 必填 | 默认 |
| ---- | ---- | ------------- | ---- | ---- |
| lng  | 精度 | number/string | -    | -    |
| lat  | 纬度 | number/string | -    | -    |

> 注意：跨声上获取的定位为 BD09 坐标系的 需要转换成 GCJ02

#### Events

| 事件名称 | 说明           | 回调参数          |
| -------- | -------------- | ----------------- |
| select   | 选中网点时回调 | (poiInfo: object) |

#### Methods

| 方法名称  | 说明     | 参数 |
| --------- | -------- | ---- |
| resizeMap | 重绘地图 | -    |

#### poiInfo (选中网点时)

```
{
  "areaCode": "010",
  "address": "北京北京市朝阳区朝外街道朝外头条93号",
  "type": "net", // 网点type
  "id": "1206",
  "title": "东城点部",
  "type": "40",
  "location": {
    "lng": "116.436501",
    "lat": "39.916537"
  },
  "_distance": "3.0km",
  "infoVo": {
    "province": {
      "districtId": "XZ1-06",
      "adCode": "",
      "name": "北京"
    },
    "city": {
      "districtId": "XZ2-174",
      "adCode": "",
      "name": "北京市"
    },
    "district": {
      "districtId": "XZ3-1275",
      "adCode": "",
      "name": "朝阳区"
    },
    "street": {
      "districtId": "XZ4-037893",
      "adCode": "",
      "name": "朝外街道"
    }
  }
}
```

#### poiInfo (选中 POI 时)

```
{
  "areaCode": "010",
  "address": "北京市东城区东交民巷27号",
  "infoVo": {
    "province": {
      "districtId": "XZ1-06",
      "adCode": "110000",
      "name": "北京"
    },
    "town": {
      "districtId": "XZ4-040096",
      "adCode": "110101001000",
      "name": "东华门街道"
    },
    "city": {
      "districtId": "XZ2-174",
      "adCode": "110100",
      "name": "北京市"
    },
    "district": {
      "districtId": "XZ3-0538",
      "adCode": "110101",
      "name": "东城区"
    }
  },
  "title": "国家最高人民法院",
  "category": "机构团体:公检法机构",
  "location": {
    "lng": 116.405159,
    "lat": 39.90292
  },
  "_distance": "167m",
  "type": "poi"
}
```
