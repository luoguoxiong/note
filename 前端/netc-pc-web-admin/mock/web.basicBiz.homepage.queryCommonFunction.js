const menus = [
  ['单票寄件', 'M3051'],
  ['批量寄件', 'M3052'],
  ['整车寄件', 'M3055'],
  ['运单查询', 'M3053'],
  ['下单审核', 'M3061'],
  ['运费时效查询', 'M3054'],
  ['网点查询', 'M3056'],
  ['违禁品查询', 'M3057'],
  ['支付开票', 'M3058'],
  ['账号权限', 'M3059'],
  ['地址簿', 'M3060'],
  ['偏好设置', 'M3063'],
].map(([menuName, menuCode]) => ({ menuName, menuCode }))

module.exports = {
  enable: true,
  data: { code: 0, msg: 'OK', data: { selectedMenuList: menus.slice(0, 6), allMenuList: menus }, success: true },
}
