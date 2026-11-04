<!--
  预存运费 - 他人代付页面
  生成付款二维码，支持保存图片和分享
-->
<template>
  <view class="container payment-qrcode" :class="{ 'is-share': isShare }" style="height: 100%; width: 100%">
    <view class="page-body">
      <!-- 这里作为整体的展示 -->
      <view class="qrcode-entity" id="qrcode-entity">
        <view class="qrcode-wrap pc-wrap" ref="tempRef">
          <view class="qrcode-card" :class="{ 'wrap-background': isWrapped }">
            <view class="payment-info">
              <view class="title" id="payment-title" ref="titleRef">
                <template v-if="isWrapped">
                  <view>以下二维码为:</view>
                  <view>【{{ result.customerShortName || '' }}】付款码</view>
                </template>
                <template v-else> 以下二维码为【{{ result.customerShortName || '' }}】付款码 </template>
              </view>
              <view class="money" :class="{ 'money-wrap': isWrapped }">
                <text class="money-symbol">￥</text><text>{{ formatPrice(money) }}</text>
              </view>
            </view>
            <view class="card-body">
              <view class="qrcode-box">
                <image class="qrcode-img" :src="result.qrCodeImgUrl" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="page-footer">
      <button class="footer-btn" @click="saveImage">保存图片</button>
      <button v-if="!isShare" class="footer-btn" open-type="share">分享好友</button>
    </view>

    <!-- Canvas for image generation -->
    <canvas
      type="2d"
      width="260"
      height="260"
      style="
        width: 260px;
        height: 260px;
        position: absolute;
        left: -99999;
        top: -99999;
        z-index: -10;
        left: -9999rpx;
        width: 1rpx;
        height: 1rpx;
      "
      id="myQrcode"
    ></canvas>
    <canvas
      ref="myBigCanvasRef"
      id="my-big-canvas"
      canvas-id="my-big-canvas"
      :style="{
        width: '100%',
        height: '73%',
        background: 'red',
        position: 'absolute',
        top: '-99999px',
        zIndex: '-10',
        left: '-9999rpx',
      }"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Taro from '@tarojs/taro'
import DepositFreightAPI from './apis'
// import auth from '@utils/auth'
import './index.scss'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'

defineOptions({ name: 'PaymentQrCode' })

// 声明全局变量
declare const process: any
declare const getCurrentPages: any

const env = process.env.TARO_APP_ENV || 'prod'

const { autoLoginHook } = useAutoLogin()

const shareImg = 'https://ic-img.ky-express.com/netc/20241204_7870395148_!!1733297080588_430_360.png'

// 响应式数据
const money = ref(0)
const result = ref<any>({ customerShortName: '', qrCodeImgUrl: '', amount: 0 })
const isWrapped = ref(false)
const pageLoading = ref(true)
const canvasImg = ref('')
const isShare = ref(false)
const sharePath = ref(shareImg)

// refs
const tempRef = ref(null)
const titleRef = ref(null)
const myBigCanvasRef = ref(null)

// 路由参数
const params = ref<any>({})

let timer: any = null

// 生命周期
onMounted(async () => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  params.value = currentPage.options || {}

  await autoLoginHook()

  Taro.getImageInfo({
    src: 'https://ic-img.ky-express.com/netc/20241204_7870395148_!!1733297080588_430_360.png',
    success(res) {
      sharePath.value = res.path
    },
  })

  if (params.value && params.value.isShare) {
    isShare.value = params.value.isShare === 'true'
  } else {
    isShare.value = false
  }

  let isUat = env !== 'prod' ? 'https://ic-h5-uat.kye-erp.com' : 'https://ic-h5.kye-erp.com'

  if (params.value && !params.value.uid) {
    if (params.value && +params.value.activityType === 40) {
      let url = encodeURIComponent(
        `${isUat}/netc-h5-marketing-optimize/deposit-freight-new/deposit-freight.html#/prestore-activity`,
      )
      Taro.redirectTo({
        url: `/packages/webview/openWebview?url=${url}&needLogin=true&menuCustomParam={"needOpenid":true}`,
      })
    } else {
      let url = encodeURIComponent(`${isUat}/netc-h5-marketing-optimize/deposit-freight-new/deposit-freight.html`)
      Taro.redirectTo({
        url: `/packages/webview/openWebview?url=${url}&needLogin=true&menuCustomParam={"needOpenid":true}`,
      })
    }
  } else {
    fetchQrCodePayResult(params.value.uid)
  }

  // 等待页面加载完成后执行检查换行
  Taro.nextTick(() => {
    console.log('渲染完之后再调用')
    checkWrap()
  })
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

// 监听器
watch(
  () => result.value.customerShortName,
  () => {
    const fkTEXT = `以下二维码为【${result.value.customerShortName || '-'}】付款码`
    if (fkTEXT && fkTEXT.length > 20) {
      isWrapped.value = true
    }
  },
)

// 检查标题是否换行
const checkWrap = () => {
  const query = Taro.createSelectorQuery()
  query
    .select('#payment-title')
    .boundingClientRect((res: any) => {
      if (res) {
        // 检查元素的实际高度是否超过单行高度
        // isWrapped.value = res.height > 30
      }
    })
    .exec()
}

// 获取二维码支付结果
const fetchQrCodePayResult = async (uid: string) => {
  try {
    const response = await DepositFreightAPI.getQrCodePayResult({ uid })
    const data: any = response.data || response
    console.log('🚀 ~ fetchQrCodePayResult ~ data:', data)
    result.value = {
      ...data,
    }

    money.value = data.amount || 0
    if (data && data.customerShortName) {
      let fkTEXT = `以下二维码为【${data.customerShortName}】付款码`
      if (fkTEXT && fkTEXT.length > 20) {
        isWrapped.value = true
      }
    }

    if (data.payStatus === 3) {
      let envUrl = env !== 'prod' ? 'https://ic-h5-uat.kye-erp.com' : 'https://ic-h5.kye-erp.com'
      let url = encodeURIComponent(
        `${envUrl}/netc-h5-marketing-optimize/deposit-freight-new/deposit-freight.html#/payment/success`,
      )
      Taro.redirectTo({
        url: `/packages/webview/openWebview?url=${url}&needLogin=true&menuCustomParam={"needOpenid":true}`,
      })
    }
  } catch (err) {
    pageLoading.value = false
  } finally {
    pageLoading.value = false
  }
}

// 格式化金额
const formatPrice = (str: string | number) => {
  if (isNaN(Number(str))) return str
  return Number(str).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// 轮询二维码支付结果
onMounted(() => {
  if (params.value && params.value.uid) {
    timer = setInterval(async () => {
      await fetchQrCodePayResult(params.value.uid)
    }, 2000)
  }
})

// 拿图片信息
const getImageInfoApi = (src: string) => {
  return new Promise((resolve, reject) => {
    Taro.getImageInfo({
      src,
      success(res: any) {
        console.log('🚀 ~ success ~ res:', res)
        resolve(res)
      },
      fail(error: any) {
        reject(error)
      },
    })
  })
}

// 绘制公司名称文本
function drawTextCenterWithWrap(
  text: string,
  fontSize: number,
  yPos: number,
  maxWidth: number,
  canvasW: number,
  ctx: any,
  isOutFront?: boolean,
) {
  ctx.setFontSize(fontSize)

  const textWidth = ctx.measureText(text).width
  if (textWidth <= maxWidth && !isOutFront) {
    const xPos = (canvasW - textWidth) / 2
    ctx.fillText(text, xPos, yPos)
  } else {
    let lines: string[] = []
    let currentLine = ''

    const words = text.split('')
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i]
      const testWidth = ctx.measureText(testLine).width

      if (testWidth > maxWidth) {
        lines.push(currentLine)
        currentLine = words[i]
      } else {
        currentLine = testLine
      }
    }

    lines.push(currentLine)

    const lineHeight = fontSize * 1.5
    let currentY = yPos
    lines.forEach((line) => {
      const textWidth1 = ctx.measureText(line).width
      const xPos = (canvasW - textWidth1) / 2
      ctx.fillText(line, xPos, currentY)
      currentY += lineHeight
    })
  }
}

// 绘画图片
const handleGenerateImage = async () => {
  const systemInfo = Taro.getSystemInfoSync()
  const canvasW = systemInfo.windowWidth || systemInfo.screenWidth
  const ctx = Taro.createCanvasContext('my-big-canvas')

  const x1Img = 'https://ic-img.ky-express.com/netc/20241111_86766301133_!!1731313608525_1500_2012.png'
  const x2Img = 'https://ic-img.ky-express.com/netc/20241108_10666301124_!!1731058165045_1500_2112.png'
  const currentImg = isWrapped.value ? x2Img : x1Img
  const resBgImg: any = await getImageInfoApi(currentImg)

  const bgWidth = resBgImg.width
  const bgHeight = resBgImg.height
  const aspectRatio = bgHeight / bgWidth
  const canvasH = canvasW * aspectRatio

  const allBigBgImgs: any = await getImageInfoApi(
    'https://ic-img.ky-express.com/netc/20241111_5666301159_!!1731313642656_1500_2930.png',
  )
  const imgW = allBigBgImgs.width
  const imgH = allBigBgImgs.height
  const imgRatio = imgW / imgH

  let targetW = canvasW
  let targetH = canvasW / imgRatio

  if (targetH < canvasH) {
    targetH = canvasH
    targetW = canvasH * imgRatio
  }

  ctx.drawImage(allBigBgImgs.path, 0, 0, imgW, imgH, 0, 0, targetW, targetH)
  ctx.drawImage(resBgImg.path, 0, 20, canvasW, canvasH)

  const backgroundImage: any = await getImageInfoApi(result.value.qrCodeImgUrl)
  const qrWidth = 240
  const qrHeight = 240
  const qrX = (canvasW - qrWidth) / 2
  const qrY = (canvasH - qrHeight) / 2 + 18
  ctx.drawImage(backgroundImage.path, qrX, qrY, qrWidth, qrHeight)

  ctx.setFillStyle('#000')
  const maxTextWidth = canvasW - 80

  // 标题字体大小：界面 28px，按比例计算约为 14px（与金额字体比例一致）
  const titleFontSize = 14
  ctx.setFontSize(titleFontSize)

  const measureText1 = `以下二维码为【${result.value.customerShortName || '-'}】付款码`
  const textWidth = ctx.measureText(measureText1).width
  console.log('🚀 ~ handleGenerateImage ~ textWidth:', textWidth)

  // 判断是否需要换行：根据文本长度（与界面逻辑一致）或文本宽度
  const needWrap = measureText1.length > 20 || textWidth >= maxTextWidth

  if (needWrap) {
    // 需要换行时，分成两行绘制（与界面显示一致）
    // 界面 line-height: 32px, font-size: 28px，比例约 1.14
    // Canvas 字体 14px，行间距应为 14 * 1.14 ≈ 16px
    const lineHeight = titleFontSize * 1.14
    drawTextCenterWithWrap('以下二维码为:', titleFontSize, 70, maxTextWidth, canvasW, ctx)
    drawTextCenterWithWrap(
      `【${result.value.customerShortName || '-'}】付款码`,
      titleFontSize,
      70 + lineHeight,
      maxTextWidth,
      canvasW,
      ctx,
      true,
    )
  } else {
    // 不需要换行时，一行显示
    const text = `以下二维码为【${result.value.customerShortName || '-'}】付款码`
    drawTextCenterWithWrap(text, titleFontSize, 70, maxTextWidth, canvasW, ctx)
  }

  ctx.setFillStyle('#fe7121')

  // 分别绘制 ¥ 符号和金额数字，使用不同的字体大小以匹配界面样式
  // 界面金额 64px，标题 28px，比例 64/28 ≈ 2.29
  // Canvas 标题 14px，金额应为 14 * 2.29 ≈ 32px
  const amountText = String(formatPrice(result.value.amount))
  const symbolFontSize = 17 // ¥ 符号字体大小（对应界面 42px，42/28*14 ≈ 21，但实际显示效果调整为17）
  const amountFontSize = 32 // 金额数字字体大小（对应界面 64px，64/28*14 = 32）

  // 先测量金额文本宽度
  ctx.setFontSize(amountFontSize)
  const amountTextWidth = ctx.measureText(amountText).width

  // 测量 ¥ 符号宽度
  ctx.setFontSize(symbolFontSize)
  const symbolTextWidth = ctx.measureText('¥').width

  // 计算总宽度和起始位置（居中对齐）
  const totalWidth = symbolTextWidth + amountTextWidth
  const startX = (canvasW - totalWidth) / 2

  // 绘制 ¥ 符号
  ctx.setFontSize(symbolFontSize)
  ctx.fillText('¥', startX, 130)

  // 绘制金额数字
  ctx.setFontSize(amountFontSize)
  ctx.fillText(amountText, startX + symbolTextWidth, 130)

  ctx.draw(false, () => {
    console.log('结束绘制')
  })
}

const saveImage = async () => {
  await handleGenerateImage()

  Taro.createSelectorQuery()
    .select('#my-big-canvas')
    .node()
    .exec((res: any) => {
      const canvas = res[0].node
      Taro.canvasToTempFilePath({
        canvasId: 'my-big-canvas',
        canvas: canvas,
        x: 0,
        y: 0,
        success: function (res1: any) {
          Taro.saveImageToPhotosAlbum({
            filePath: res1.tempFilePath,
            success: function (savephoneRes: any) {
              console.log('savephoneRes >>> ', savephoneRes)
              console.log('保存成功 >>> ', res1.tempFilePath)
              canvasImg.value = res1.tempFilePath
              Taro.showToast({
                title: '保存成功，请查看相册',
                icon: 'none',
                duration: 2000,
              })
            },
            fail: function (savePhoneErr: any) {
              console.log('savePhoneErr >>>> ', savePhoneErr)
              Taro.showToast({
                title: '获取相册权限失败，请在右上角"..."-"设置"中开启',
                icon: 'none',
                duration: 2000,
              })
            },
          })
        },
      })
    })
}

// 分享功能
const onShareAppMessage = () => {
  return {
    title: `${result.value.customerShortName || '-'}向您发起付款申请`, // 分享标题
    imageUrl: sharePath.value, // 分享的图片
    path: `packages/other/depositFreight/qrcode?uid=${params.value.uid}&isShare=true&activityType=${params.value.activityType}`, // 分享的路径，可以携带参数
  }
}

defineExpose({
  onShareAppMessage,
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
