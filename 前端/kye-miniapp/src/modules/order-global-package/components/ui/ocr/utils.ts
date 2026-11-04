import Taro from '@tarojs/taro'
import { showDialog } from '@kye-netc/kye-miniui'
import { audioFailReport, audioReport, audioDialogResultReport } from '../../../report/index'
import { getCustomerShortInfo } from '../../../apis/address'
import { getEnvConfig } from '@/public/config'
import { isPROD, RequestBaseUrl } from '../../../types/env'
import { isWechat } from '../../../utils/device'
import { uuid } from '../../../types/uuid'
import { useAudio } from './components/audio/useAudio'
import { AudioStatus } from '../../../types/audio'
const { audioCountdown, setAudioCountdown, audioTimer, setAudioTimer, setShowAudio, resetAudio, audioStatus } = useAudio()

/** 运单号（由业务侧通过 setWaybillNumber 注入） */
let injectedWaybillNumber = ''

/** 注入运行时运单号（替代原 useStore 依赖） */
export const setWaybillNumber = (val: string) => {
  injectedWaybillNumber = val
}

let firstFrame = false //是否第一帧
let request_id = '' //每次链接的唯一id
let message = '' //最终识别的结果返回值，给后端用做记录分析
let addressTypeValue = ''

//开启链接识别通信
const startConnect = async () => {
  const token = Taro.getStorageSync('TOKEN') || ''  // 替代原 await getToken()
  try {
    Taro.closeSocket()
  } catch (e) {
    console.log(e)
  }
  const apiCode = isPROD
    ? 'wss://ai-speech-reg.kyslb.com/ws_ai/speech/iat'
    : 'wss://uat-star.kyslb.com/ws_ai/speech/iat'
  Taro.connectSocket({
    url: `${apiCode}?token=${token}&from=${getEnvConfig().xForm}&voice_format=mp3&client_id=kye-miniapp-order`,
    success: function () {
      console.log('connect success')
    },
    fail: function (e) {
      audioFailReport(e?.errMsg)
      Taro.showToast({
        title: '网络超时，请重试',
        icon: 'none',
      })
      console.log('connect fail', e)
    },
  })
  return new Promise((resolve, reject) => {
    Taro.onSocketError(function (res) {
      Taro.showToast({
        title: '网络超时，请重试',
        icon: 'none',
      })
      audioFailReport(res?.errMsg)
      reject(res)
      console.log('WebSocket连接打开失败，请检', res)
    })

    Taro.onSocketOpen(function (res) {
      resolve(res)
      console.log('链接已经打开', res)
    })
  })
}

export const getRecorderManager = async (callback: (text: string) => void, addressType?: string) => {
  const source = 'miniprogram'
  addressTypeValue = addressType || ''
  Taro.onSocketMessage(function (res) {
    const data = JSON.parse(res?.data)?.data
    callback(data?.final_text || '')
    if (data?.status === 2 || JSON.parse(res?.data)?.code !== 0) {
      stopRecording()
      if (!data?.final_text) {
        Taro.showToast({
          title: '识别失败，请重试',
          icon: 'none',
        })
      }
    }
    message = JSON.stringify(res?.data || '')
    console.log('服务器', message)
  })
  try {
    const { data } = await getCustomerShortInfo({
      source,
      alertType: 'appVoiceAiDiscern',
    })
    if (!data.status) {
      setShowAudio(true)
      return
    }
  } catch (e) {
    console.error(e)
  }

  await showDialog({
    zIndex: 1000,
    title: '语音识别说明',
    message:
      '<view class="audio_agr">本功能将为您提供便捷的语音输入服务，请注意： </view><view class="audio_agr"><view class="audio_disc"></view>语音识别结果可能因口音、语速及环境噪音等因素出现误差 </view><view class="audio_agr"><view class="audio_disc"></view><view><text>请您</text><text class="audio_agr_strong">务必仔细核对</text>自动填充的信息，确保姓名、电话、地址完全正确</view></view><view class="audio_agr"><view class="audio_disc"></view>若未及时核对或确认而导致的识别误差及相关后果，需由您本人承担，请谨慎确认！</view>',
    showCancelButton: false,
    confirmButtonText: '我知道了',
  })
  const waybillNumber = injectedWaybillNumber
  audioDialogResultReport({
    bizSource: 'appVoiceAiDiscern',
    channel: undefined, // 原 getChannel() 暂未迁移，需确认渠道
    source,
    bizData: {
      waybillInfos: [
        {
          waybillNumber,
        },
      ],
      buttonName: '我知道了',
    },
  })
  setShowAudio(true)
}

//开始录音
export const startRecording = async () => {
  await startConnect()
  request_id = uuid()
  firstFrame = false
  message = ''
  startAudioTimer()
  const recorderManager = Taro.getRecorderManager()
  const options = {
    duration: 60000,
    sampleRate: 16000,
    numberOfChannels: 1,
    format: 'mp3',
    frameSize: 2,
  }
  recorderManager.start(options)
  return new Promise((resolve, reject) => {
    //发送数据
    recorderManager.onFrameRecorded((e) => {
      const { frameBuffer, isLastFrame } = e
      let dataStatus = firstFrame ? 1 : 0
      if (isLastFrame) {
        dataStatus = 2
      }
      const params = {
        request_id: request_id,
        request_src: 'internet_order',
        request_data: {
          data_status: dataStatus,
          data_format: 'mp3',
          data_content: Taro.arrayBufferToBase64(frameBuffer),
        },
      }
      console.log('请求的数据', params)
      Taro.sendSocketMessage({
        data: JSON.stringify(params),
      })
      firstFrame = true
    })
    recorderManager.onStop((res) => {
      const { tempFilePath } = res
      updateLog(tempFilePath)
      stopRecording()
    })

    recorderManager.onStart(() => {
      startAudioTimer()
      resolve(true)
    })
    recorderManager.onError((err) => {
      console.log('recorder error', err)
      const errMsg = err?.errMsg
      if (errMsg?.indexOf('permission') !== -1 || errMsg?.indexOf('auth') !== -1) {
        Taro.showModal({
          title: '温馨提示',
          content: '“跨越速运”想要访问您的麦克风，以使用语音识别功能',
          confirmText: '去授权',
          cancelText: '暂不',
          success: function (res) {
            if (res.confirm) {
              if (isWechat) {
                Taro.openSetting()
              } else {
                Taro.openAppAuthorizeSetting()
              }
            } else if (res.cancel) {
              audioFailReport('用户点击取消')
              console.log('用户点击取消')
            }
          },
        })
      }
      reject(err)
    })
  })
}
//开启倒计时
export const startAudioTimer = () => {
  if (audioTimer.value) {
    clearInterval(audioTimer.value)
  }
  setAudioCountdown(60)
  const timer = setInterval(() => {
    if (audioCountdown.value > 0) {
      setAudioCountdown(audioCountdown.value - 1)
    } else {
      stopRecording()
    }
  }, 1000)
  setAudioTimer(timer)
}
// 上传日志,用于分析准确性
export const updateLog = async (tempFilePath: string) => {
  const source = 'miniprogram'
  const waybillNumber = injectedWaybillNumber
  Taro.uploadFile({
    url: `${RequestBaseUrl}/router/upload`,
    filePath: tempFilePath,
    name: 'file',
    formData: {
      bizCode: 'WEB_ORDER_PERSONADDRESS_AI_VOICE',
      bizId: uuid(),
    },
    success(res) {
      const data = JSON.parse(res.data)
      const bizId = data.data[0]?.bizId
      audioReport({
        source,
        bizSource: 'appVoiceAiDiscern',
        bizData: {
          bizId,
          waybillNumber,
          operationSource: 10,
          addressType: addressTypeValue === 'SENDER_PAGE' || addressTypeValue === '10' ? 10 : 20,
          aiRes: message,
        },
      })
    },
  })
}
//关闭录音
export const stopRecording = () => {
  setShowAudio(false)
  if (audioStatus.value !== AudioStatus.录音中) {
    return
  }
  const recorderManager = Taro.getRecorderManager()
  recorderManager.stop()
  try {
    //延迟关闭，为了保证最后一帧的数据传输完成
    setTimeout(() => {
      Taro.closeSocket({
        code: 1000,
        reason: '正常关闭',
      })
    }, 200)
  } catch (e) {
    console.log(e)
  }
  resetAudio()
}

/** 剪贴板权限缓存 key */
const CLI_BOARD_KEY = 'clipboard-permission'

/**
 * 获取剪贴板权限及内容
 * @param parentClassName 弹窗挂载的父容器 class
 * @param hasCache 是否使用缓存（ocr 场景传 false）
 * @returns 剪贴板内容字符串
 */
export const getClipboardPermission = (parentClassName?: string, hasCache: boolean = true) =>
  new Promise<string>(async (resolve) => {
    if (isWechat && hasCache) {
      return resolve('')
    }
    const cliBoardValue = Taro.getStorageSync(CLI_BOARD_KEY)
    if (cliBoardValue === '') {
      showDialog({
        parentClassName: parentClassName || 'order-page-container',
        zIndex: 1000,
        title: '"跨越速运" 需要剪贴板权限',
        message: '需要获取您的剪贴板权限，用于智能填写寄件人、收件人、联系电话及地址信息，方便您快捷下单',
        confirmButtonText: '好',
        cancelButtonText: '不允许',
        showCancelButton: true,
      })
        .then(async () => {
          const content = (await Taro.getClipboardData())?.data || ''
          Taro.setStorage({ key: CLI_BOARD_KEY, data: true })
          resolve(content)
        })
        .catch(() => {
          Taro.setStorage({ key: CLI_BOARD_KEY, data: false })
          resolve('')
        })
      return
    }
    try {
      const content = (await Taro.getClipboardData())?.data || ''
      resolve(content)
    } catch (e) {
      if (e?.errMsg?.indexOf('empty content') > -1) {
        resolve('')
      }
    }
  })
