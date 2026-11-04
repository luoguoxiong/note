import Taro from '@tarojs/taro'

const CANVAS_WIDTH = 420
const CANVAS_HEIGHT = 336
const BACKGROUND_IMG_MAP = {
  10: 'https://ic-img.ky-express.com/netc/20250225_89966301171_!!1740467122072_840_472.png',
  20: 'https://ic-img.ky-express.com/netc/20250225_69966301147_!!1740467122074_840_472.png',
  30: 'https://ic-img.ky-express.com/netc/20250225_54266301191_!!1740467122070_840_472.png',
}

const useCanvas = () => {
  let backgroundTargetImg

  // 计算文本是否超过最大字符长度，超长则添加省略号
  const truncateText = (text, maxLength, ctx) => {
    let truncatedText = text
    const width = ctx.measureText(text).width

    if (width > maxLength) {
      let low = 0,
        high = text.length
      while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        truncatedText = text.substring(0, mid) + '...'
        if (ctx.measureText(truncatedText).width <= maxLength) {
          low = mid + 1
        } else {
          high = mid - 1
        }
      }
      truncatedText = text.substring(0, high) + '...'
    }

    return truncatedText
  }

  // 绘制文本并应用省略号
  const drawTextWithEllipsis = (ctx, text, x, y, maxLength) => {
    const truncatedText = truncateText(text, maxLength, ctx)
    ctx.fillText(truncatedText, x, y)
  }

  // 创建画布上下文
  const createContext = () => {
    return new Promise((resolve) => {
      const query = Taro.createSelectorQuery()
      query
        .select('#idcardCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = Taro.getSystemInfoSync().pixelRatio
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          ctx.scale(dpr, dpr)
          resolve({ ctx, canvas, dpr, width: canvas.width, height: canvas.height })
        })
    })
  }

  // 获取图片信息
  const getImageInfo = (canvas, url) => {
    return new Promise((resolve) => {
      const img = canvas.createImage()
      img.src = url
      img.onload = () => resolve(img)
    })
  }

  // 计算宽度百分比
  const getWidthPercentDpr = (cur, canvasDesign, dpr) => (cur === 0 ? 0 : ((cur / CANVAS_WIDTH) * canvasDesign) / dpr)

  // 计算高度百分比
  const getHeightPercentDpr = (cur, canvasDesign, dpr) => (cur === 0 ? 0 : ((cur / CANVAS_HEIGHT) * canvasDesign) / dpr)

  // 绘制图片
  const drawImage = async (ctxInfo, imgUrl, x, y, w, h) => {
    return new Promise(async (resolve) => {
      const { ctx, canvas, dpr, width, height } = ctxInfo
      const img = await getImageInfo(canvas, imgUrl)
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        getWidthPercentDpr(x, width, dpr),
        getHeightPercentDpr(y, height, dpr),
        getWidthPercentDpr(w, width, dpr),
        getHeightPercentDpr(h, height, dpr),
      )
      resolve(true)
    })
  }

  // 绘制文本
  const drawText = (ctxInfo, textColor, font, text, x, y, measureText) => {
    const { ctx, dpr, width, height } = ctxInfo
    ctx.fillStyle = textColor || '#fff'
    ctx.font = `${font}px bold normal PingFangSC, PingFangSC-Medium `
    const metrics = ctx.measureText(measureText)
    drawTextWithEllipsis(
      ctx,
      text,
      getWidthPercentDpr(x, width, dpr),
      Number(font) + getHeightPercentDpr(y, height, dpr),
      metrics.width,
    )
    return metrics.width
  }

  // 创建最大长度字符串
  const createMaxLenStr = (len) => '最'.repeat(len)

  // 绘制居中文本
  const drawCenterText = (ctxInfo, textColor, font, text, measureText, y) => {
    const { ctx, width, height, dpr } = ctxInfo
    ctx.fillStyle = textColor || '#fff'
    ctx.font = `${font}px bold normal PingFangSC, PingFangSC-Medium `
    const textWidth = ctx.measureText(text).width
    const maxWidth = ctx.measureText(measureText).width
    const realWidth = Math.min(textWidth, maxWidth)
    const x = (width / dpr - realWidth) / 2
    const truncatedText = truncateText(text, realWidth, ctx)
    ctx.fillText(truncatedText, x, Number(font) + getHeightPercentDpr(y, height, dpr))
  }

  // 模式1
  const mode1 = async (targetObj) => {
    const ctxInfo = await createContext()
    const { canvas } = ctxInfo
    await drawImage(ctxInfo, backgroundTargetImg, 0, 0, CANVAS_WIDTH, 236)
    await drawImage(ctxInfo, targetObj.avatar, 268, 40, 120, 120)
    drawText(ctxInfo, '#fff', '20', targetObj.employeeName, 32, 39, createMaxLenStr(5))
    drawText(ctxInfo, '#fff', '12', targetObj.situation, 32, 99, createMaxLenStr(9))
    drawText(ctxInfo, '#fff', '9', targetObj.companyName, 32, 135, createMaxLenStr(13))
    await drawImage(
      ctxInfo,
      'https://ic-img.ky-express.com/netc/20250303_66970395121_!!1740969311150_212_40.png',
      32,
      177,
      106,
      20,
    )
    await drawImage(ctxInfo, targetObj.zaizhi, 142, 177, 36, 20)
    await drawImage(ctxInfo, targetObj.shiming, 188, 177, 51, 20)
    await drawImage(
      ctxInfo,
      'https://ic-img.ky-express.com/netc/20250225_84266301112_!!1740485748209_840_200.png',
      0,
      236,
      CANVAS_WIDTH,
      100,
    )
    await drawImage(
      ctxInfo,
      'https://ic-img.ky-express.com/netc/20250225_84266301112_!!1740485748209_840_200.png',
      0,
      236,
      CANVAS_WIDTH,
      100,
    )
    return canvas
  }

  // 模式2
  const mode2 = async (targetObj) => {
    const ctxInfo = await createContext()
    const { canvas, ctx, width, dpr, height } = ctxInfo
    await drawImage(ctxInfo, backgroundTargetImg, 0, 0, CANVAS_WIDTH, 236)
    ctx.save()
    const centerX = getWidthPercentDpr(32 + 60, width, dpr)
    const centerY = getHeightPercentDpr(58 + 60, height, dpr)
    const radius = getWidthPercentDpr(60, width, dpr)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.clip()
    await drawImage(ctxInfo, targetObj.avatar, 32, 58, 120, 120)
    ctx.restore()
    drawText(ctxInfo, '#fff', '20', targetObj.employeeName, 168, 40, createMaxLenStr(5))
    drawText(ctxInfo, '#fff', '12', targetObj.situation, 168, 100, createMaxLenStr(9))
    drawText(ctxInfo, '#fff', '9', targetObj.companyName, 168, 136, createMaxLenStr(12))
    await drawImage(
      ctxInfo,
      'https://ic-img.ky-express.com/netc/20250303_66970395121_!!1740969311150_212_40.png',
      168,
      177,
      106,
      20,
    )
    await drawImage(ctxInfo, targetObj.zaizhi, 278, 177, 36, 20)
    await drawImage(ctxInfo, targetObj.shiming, 322, 177, 51, 20)
    await drawImage(
      ctxInfo,
      'https://ic-img.ky-express.com/netc/20250225_84266301112_!!1740485748209_840_200.png',
      0,
      236,
      CANVAS_WIDTH,
      100,
    )
    await drawImage(
      ctxInfo,
      'https://ic-img.ky-express.com/netc/20250225_84266301112_!!1740485748209_840_200.png',
      0,
      236,
      CANVAS_WIDTH,
      100,
    )
    return canvas
  }

  // 模式3
  const mode3 = async (targetObj) => {
    const ctxInfo = await createContext()
    const { canvas } = ctxInfo
    await drawImage(ctxInfo, backgroundTargetImg, 0, 0, CANVAS_WIDTH, 236)
    drawCenterText(ctxInfo, '#fff', '20', targetObj.employeeName, createMaxLenStr(8), 39)
    drawCenterText(ctxInfo, '#fff', '12', targetObj.situation, createMaxLenStr(13), 99)
    drawCenterText(ctxInfo, '#fff', '9', targetObj.companyName, createMaxLenStr(19), 135)
    await drawImage(
      ctxInfo,
      'https://ic-img.ky-express.com/netc/20250303_66970395121_!!1740969311150_212_40.png',
      108,
      177,
      106,
      20,
    )
    await drawImage(ctxInfo, targetObj.zaizhi, 218, 177, 36, 20)
    await drawImage(ctxInfo, targetObj.shiming, 262, 177, 51, 20)
    await drawImage(
      ctxInfo,
      'https://ic-img.ky-express.com/netc/20250225_84266301112_!!1740485748209_840_200.png',
      0,
      236,
      CANVAS_WIDTH,
      100,
    )
    await drawImage(
      ctxInfo,
      'https://ic-img.ky-express.com/netc/20250225_84266301112_!!1740485748209_840_200.png',
      0,
      236,
      CANVAS_WIDTH,
      100,
    )
    return canvas
  }

  // 处理封面创建
  const handleCreateCover = async (targetObj, mode) => {
    switch (mode) {
      case 'mode10':
        return await mode1(targetObj)
      case 'mode20':
        return await mode2(targetObj)
      case 'mode30':
        return await mode3(targetObj)
      default:
        return await mode1(targetObj)
    }
  }

  // 获取图片
  const handleGetImg = async (info) => {
    return new Promise(async (resolve) => {
      const resultInfo = {
        ...info,
        renZhengIcon: 'https://ic-img.ky-express.com/netc/20250205_2166301128_!!1738724662437_68_68.png',
        shiming: 'https://ic-img.ky-express.com/netc/20250225_39266301152_!!1740467111953_102_40.png',
        zaizhi: 'https://ic-img.ky-express.com/netc/20250225_1066301195_!!1740467111956_74_40.png',
      }

      backgroundTargetImg = BACKGROUND_IMG_MAP[info.themeBackground] || BACKGROUND_IMG_MAP[10]

      const currentMode = `mode${info.themeBackground || 10}`

      const canvas = await handleCreateCover(resultInfo, currentMode)

      Taro.canvasToTempFilePath({
        canvas: canvas,
        x: 0,
        y: 0,
        success: (res) => resolve(res.tempFilePath),
      })
    })
  }

  return { handleGetImg }
}

export default useCanvas
