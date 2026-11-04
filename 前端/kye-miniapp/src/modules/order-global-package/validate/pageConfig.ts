import Taro from '@tarojs/taro'

export const getDialogRootClass = () => {
  let className = ''
  const pages = Taro.getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const path = currentPage?.$taroPath
  const pageMap = {
    'sender/page/address-page/index': 'dialog_root_sender',
    'receive/page/address-page/index': 'dialog_root_receive',
    'order-build/pages/order/index': 'dialog_root_order',
    'product-info-page/index': 'dialog_root_product',
    'product-info/page/product-info-page/index': 'dialog_root_product_product_info_page',
    'product-info/components/select-size/index': 'dialog_root_product_selectsize',
    'pages/order-back/index': 'dialog_root_back',
    'address-book/page/index': 'dialog_root_address_book_list',
    'added-service/components/receipt-resources/index': 'dialog_root_receipt_resources',
    'added-service/page/added-service-page/index': 'dialog_root_added_service',
    '/address-book/clear-addr/index': 'dialog_root_clear_addr',
    'address-book/sender/index': 'dialog_root_book_sender',
    'address-book/receive/index': 'dialog_root_book_receive',
    'dispatch-information/page/index': 'dialog_root_dispatch',
    'pickup-information/page/index': 'dialog_root_pickup',
    'pickup-information/page-waybill/index': 'dialog_root_pickup',
  }
  Object.keys(pageMap).forEach((key) => {
    if (path.indexOf(key) > -1) {
      {
        className = pageMap[key]
      }
    }
  })
  return className
}
