import Taro from '@tarojs/taro'
import { isAndroid, isIphone } from '@order-public-sub-public/utils/device'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { $native } from '@order-public-sub-public/utils'

import { ReportTypeEnum } from '@order-public-sub-public/reportUmp/type/types'
interface reportType {
  message: string
  event: ReportTypeEnum
  eventCode: string
  eventCode2: string
}
const report = (params: reportType) => {
  if (params.message.includes('手机蓝牙未开启')) {
    window.$umpOtherReport(params.event, {
      eventCode: params.eventCode,
    })
  }
  if (params.message.includes('蓝牙权限未开启')) {
    window.$umpOtherReport(params.event, {
      eventCode: params.eventCode2,
    })
  }
}

export const goSettingDialog = (message: string) => {
  const isWxApplet = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
  report({
    message,
    event: 'EXP',
    eventCode: 'exp_print_button_v1',
    eventCode2: 'exp_print_bluetoothapply_v1',
  })
  if (isWxApplet) {
    showKyDialog({
      title: '跨越速运需要蓝牙',
      zIndex: 1000,
      message,
      confirmButtonText: '我知道了',
      showCancelButton: false,
      allowHtml: false,
    })
  } else {
    showKyDialog({
      zIndex: 1000,
      title: '跨越速运需要蓝牙',
      message,
      cancelButtonText: '取消',
      confirmButtonText: '去设置',
      showCancelButton: true,
      allowHtml: false,
    })
      .then(() => {
        $native.openBluetoothSet()
        report({
          message,
          event: 'CLK',
          eventCode: 'clk_print_button_set_v1',
          eventCode2: 'clk_print_bluetoothstate_set_v1',
        })
      })
      .catch((err) => {
        report({
          message,
          event: 'CLK',
          eventCode: 'clk_print_button_cancel_v1',
          eventCode2: 'clk_print_bluetoothstate_cancel_v1',
        })
        console.error(err)
      })
  }
}
// eslint-disable-next-line max-lines-per-function
export const printCheckBluetooth = async (msg?: string, bluetoothAuthStateObj?: any) => {
  const isWxApplet = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
  let flag = false
  try {
    if (isWxApplet) {
      if (bluetoothAuthStateObj) {
        switch (String(bluetoothAuthStateObj.state)) {
          case '1':
            goSettingDialog('连接打印机需开启手机蓝牙权限，请在设置页打开蓝牙')
            break
          case '2':
            goSettingDialog(
              '连接打印机需要获取蓝牙权限，小程序蓝牙权限未开启，请在点击右上角"...- 设置-蓝牙权限”进行设置',
            )
            break
          case '3':
            goSettingDialog(
              'APP蓝牙权限未开启，请在手机“设置-应用-微信-蓝牙权限进行设置。注意：前往设置后，小程序会重新启动，可在查件中发起面单打印。',
            )
            break
          default:
            break
        }
      }
      flag = true
    } else {
      const res: any = await $native.checkBluetoothAuth()
      // const res = { state: '0' } // 本地测试数据
      switch (String(res.state)) {
        case '0':
          flag = true
          break
        case '1':
          flag = false
          if (!isIphone) {
            goSettingDialog(msg || '连接打印机需开启手机蓝牙权限，请在设置页打开蓝牙')
          }
          break
        case '2':
          flag = false
          if (isAndroid) {
            goSettingDialog(
              'APP蓝牙权限未开启，请在手机“设置-应用-跨越速运-蓝牙权限”进行设置，注意：前往设置后，APP会重新启动，可在查件中发起面单打印。',
            )
          } else {
            goSettingDialog(
              'APP蓝牙权限未开启，请在手机“设置-应用-跨越速运-蓝牙权限”进行设置，注意：前往设置后，APP会重新启动，可在查件中发起面单打印。',
            )
          }

          break
        case '3':
          flag = false
          goSettingDialog(
            '手机定位未开启，请在设置页打开定位，注意：前往设置后，APP会重新启动，可在查件中发起面单打印。',
          )
          break
        case '4':
          flag = false
          goSettingDialog(
            'APP定位权限未开启，请在手机“设置-应用-跨越速运-定位权限”进行设置，注意：前往设置后，APP会重新启动，可在查件中发起面单打印。',
          )
      }
      // const res = { state: '0' } // 本地测试数据
      // if (String(res.state) === '1') {
      //   flag = false
      //   goSettingDialog(msg || '手机蓝牙未开启，请在设置页打开蓝牙')
      // } else if (String(res.state) === '2') {
      //   goSettingDialog('APP蓝牙权限未开启，请在手机“设置-应用-跨越速运-蓝牙权限”进行设置')
      //   flag = false
      // } else if (String(res.state) === '0') {
      //   flag = true
      // }
    }
  } catch (err) {
    flag = true
    console.error(err)
  }
  return flag
}
