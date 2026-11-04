const HTTP_URL = process.env.TARO_APP_HTTP_URL

const loadAddressMap = {
  loadAddressOld: `${HTTP_URL}/h5-offline/netc-h5-order-offline/`,
  loadAddressOrderConfig: `${HTTP_URL}/order-config/`,
}
const order_application_list = {
  areaCode: 'A2003',
  areaName: '下单查件（菜单顺序不能挪动）',
  lightApplicationInfos: [
    {
      menuName: '单票',
      menuCode: 'M2008',
      applicationCode: 'H5_ORDER',
      routePath: '#/single-order',
      loadAddress: loadAddressMap.loadAddressOld,
      menuIcon:
        'https://hongbao-1257092428.cos.ap-guangzhou.myqcloud.com/light_app_icon/9830e15f2e5d4352abb831e525c4fb3d.png',
    },
    {
      menuName: '批量',
      menuCode: 'M2009',
      applicationCode: 'H5_ORDER',
      routePath: '#/batch-order',
      loadAddress: loadAddressMap.loadAddressOld,
      menuIcon:
        'https://hongbao-1257092428.cos.ap-guangzhou.myqcloud.com/light_app_icon/94a60f2d19f64cb191589cfcf71b3d20.png',
    },
    {
      menuName: '查件',
      menuCode: 'M2010',
      applicationCode: 'H5_ORDER',
      routePath: '/index.html#/waybill-search',
      loadAddress: loadAddressMap.loadAddressOld,
    },
    {
      menuName: '下单配置H5',
      menuCode: 'M0037',
      applicationCode: 'H5_ORDER_CONFIG',
      routePath: '#/order',
      loadAddress: loadAddressMap.loadAddressOrderConfig,
    },
    {
      menuName: '下单配置H5-批量寄',
      menuCode: 'M0045',
      applicationCode: 'H5_ORDER_CONFIG',
      routePath: '#/order-batch',
      loadAddress: loadAddressMap.loadAddressOrderConfig,
      menuIcon:
        'https://hongbao-1257092428.cos.ap-guangzhou.myqcloud.com/light_app_icon/5c508b229de7493291f9e1d826ca1e15.png',
    },
    {
      menuName: '批量-H5下单配置',
      menuCode: 'M2059',
      applicationCode: 'H5_ORDER_CONFIG_BATCH_NEW',
      routePath: '#/order-batch',
      loadAddress: loadAddressMap.loadAddressOrderConfig,
      menuIcon:
        'https://hongbao-1257092428.cos.ap-guangzhou.myqcloud.com/light_app_icon/caddfccc209341cf9e020afed229d54f.png',
    },
    {
      menuName: '单票-H5下单配置',
      menuCode: 'M2050',
      applicationCode: 'H5_ORDER_CONFIG',
      routePath: '#/order',
      loadAddress: loadAddressMap.loadAddressOrderConfig,
      menuIcon:
        'https://hongbao-1257092428.cos.ap-guangzhou.myqcloud.com/light_app_icon/805ee8f9b4a04862ad96f7d3ad28e1f8.png',
    },
    {
      menuName: '单票-新',
      menuCode: 'M2048',
      applicationCode: 'H5_ORDER_CONFIG',
      routePath: '#/order',
      loadAddress: loadAddressMap.loadAddressOrderConfig,
      menuIcon:
        'https://hongbao-1257092428.cos.ap-guangzhou.myqcloud.com/light_app_icon/147976896fc74d3f84475dc0fd0bbf1f.png',
    },
    {
      menuName: '批量-新',
      menuCode: 'M2058',
      applicationCode: 'H5_ORDER_CONFIG_BATCH_NEW',
      routePath: '#/order-batch',
      loadAddress: loadAddressMap.loadAddressOrderConfig,
      menuIcon:
        'https://hongbao-1257092428.cos.ap-guangzhou.myqcloud.com/light_app_icon/41a25ab79c714c4fa1039e01a2add309.png',
    },
  ],
}

export default order_application_list
