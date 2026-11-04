import { ChangeKeys, effectBubbleOtherParams, localCheckResult } from '@order-public-sub-public/types'
import {
  getFieldDomByKey,
  scrollIntoView,
  getParent,
  getCheckByComponentList,
  getAttributeRoot,
} from '@order-public-sub-public/validate/utils'
import { isElement } from 'lodash-es'

import Vrouter from '@order-public-sub-public/router'
import { capitalLize } from '@order-public-sub-public/utils/string'
import { tippyTheme } from '@order-public-sub-public/constants'
import { createApp } from 'vue'
import validatePopover from '@order-public-sub-public/components/business/limit-custom/popver/index.vue'
import { reportBubbleExp, reportPopoverClick, reportPopoverExp } from '@order-public-sub-public/validate/report'
import { judgeBubbleInMoreModule } from '@order-public-sub-root-pages/order-single/utils'
import { useValidate } from '@order-public-sub-public/hooks/useValidate'
import { useGlobalPopover } from '@order-global-package-order-sub/components/business/popover-effect/hooks/useUpdate'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { updateValidateKey, setErrorClassUpdate, clearErrorClassObj } = useValidate()
const { removeValidateSinge } = useGlobalPopover()
//气泡实例
let tippyInstance: any = null
//校验失败class名字
const errClass = 'validate-error'
//气泡timer
let timer: number | undefined

//手动关闭气泡的对象，waybillnumber为key
export const checkResultWaring: any = {}
//清楚错误及气泡
const { removeValidateKey } = useValidate()

//监听页面,销毁气泡和清楚样式
export const initEffectBubble = () => {
  const clearFun = (e: Event) => {
    closeTippy()
    if (!e) {
      return
    }
    const parentDom = getParent(<Element>e.target)
    if (parentDom) {
      closePopover(e, parentDom)
      if ('classList' in parentDom) {
        parentDom.classList?.remove(errClass)
      }
      // if ('getAttribute' in parentDom && parentDom.getAttribute('data-validate')) {
      //   closeTippy()
      // }
    }
  }
  document.addEventListener('input', (e) => {
    clearFun(e)
  })
  document.addEventListener(
    'click',
    (e) => {
      clearFun(e)
    },
    false,
  )
}
// 销毁气泡
export const closeTippy = () => {
  removeValidateSinge()
  if (!tippyInstance) {
    return
  }
  tippyInstance.hide()
  tippyInstance.destroy()
  tippyInstance = null
}
//设置错误样式
const setErrorClass = (list: localCheckResult[]) => {
  list.forEach((result) => {
    setErrorClassUpdate(result)
    const { key, bubbleConfig, needCompatible } = result
    let startDom
    if (bubbleConfig?.waybillNumber) {
      startDom = document.querySelector(`.${bubbleConfig?.waybillNumber}`)
    }

    const targetDom: Element | null = getFieldDomByKey(key, startDom, {
      needCompatible,
    })
    if (targetDom) {
      // targetDom.classList?.add(errClass)
    } else {
      console.warn(`表单项dom的id未找到：${key}`)
    }
  })
}
//清除错误样式
export const resetErrorClassByDom = (resultList: Array<localCheckResult>) => {
  if (!Array.isArray(resultList)) {
    return
  }
  try {
    const passResult = resultList.filter((i) => i.passed)
    passResult.forEach((i) => {
      const waybillNumber = i.bubbleConfig?.waybillNumber
      let startDom
      if (waybillNumber) {
        startDom = document.querySelector(`.${waybillNumber}`) as HTMLElement
      }
      // const dom = getFieldDomByKey(i.key, startDom)
      // if (!dom) {
      //   return
      // }
      removeValidateKey(i.key)
      // dom.classList?.remove(errClass)
      // const hasBubble = dom.parentNode.querySelector('[role="tooltip"]')
      // if (hasBubble) {
      //   closeTippy()
      // }
      // const domList = dom.querySelectorAll(`.${errClass}`)
      // if (!domList || !Array.isArray(domList)) {
      //   return
      // }
      // domList.forEach((d: Element) => {
      //   if (d && isElement(d)) {
      //     console.log("出发哒达拉",d)
      //     d?.classList?.remove(errClass)
      //   }
      // })
    })
  } catch (e) {
    console.warn(e)
  }
}
//移除对应data-validate上的errClass，非必要不使用
export const removeErrClassByDataValidate = (key?: ChangeKeys) => {
  if (!key) {
    return false
  }
  removeValidateKey(key)
  const dom = getFieldDomByKey(key)
  dom?.classList?.remove(errClass)
  return true
}

//设置气泡
// eslint-disable-next-line max-lines-per-function
const createBubble = (option: localCheckResult, needFirstToast: boolean) => {
  const { key, bubbleConfig = {}, extraData, needCompatible } = option
  const { content = '' } = option
  const { offset = [0, 0], waybillNumber } = bubbleConfig
  let { placement = 'top-start' } = bubbleConfig
  let { appendTo } = bubbleConfig
  if (!appendTo) {
    appendTo = 'parent' || undefined
  }
  if (!key) {
    return
  }
  if (tippyInstance) {
    closeTippy()
  }
  if (waybillNumber) {
    appendTo = (document.querySelector(`.${waybillNumber}`) as HTMLElement) || appendTo
  }
  const targetDom = getFieldDomByKey(key, appendTo, { needCompatible })
  console.log('完犊子', option)
  /* eslint-disable */
  console.log('气泡参数', placement, offset)
  //处理气泡在顶部放不下的场景，控制影响范围，加寄件信息限制
  // const needJudgeTop = typeof placement === 'string' && key.indexOf('sender') > -1
  // if (needJudgeTop) {
  //   const { top = 0 } = getTop(targetDom)
  //   placement =
  //     top < effectBubbleConstants.气泡顶部最小距离 ? (placement.replace('top', 'bottom') as Placement) : placement
  // }
  // const { theme = '', newContent, tipKey } = getTippyThem(extraData?.type, option)
  let theme = extraData?.type || 'dark'
  if (theme === 'info') {
    theme = 'dark'
  }
  // if (theme) {
  //   targetDom?.classList?.remove(errClass)
  //   closePopoverByWaybillNumber(tipKey)
  // }
  // const onlyPlacement = placement.split('_')[0]
  // console.log('气泡的数据', option, placement, offset)
  option.bubbleConfig = {
    offset,
    placement,
    theme,
  }
  updateValidateKey(option)
  if (!targetDom) {
    console.warn(`表单项dom的id未找到：${key}`)
    // return showToast(content)
  }
  // const currentInstance: any = tippy(targetDom, {
  //   content: newContent,
  //   placement: placement,
  //   offset: offset,
  //   trigger: 'manual',
  //   zIndex: 100,
  //   appendTo,
  //   hideOnClick: false,
  //   allowHTML: true,
  //   animation: '',
  //   theme,
  //   popperOptions: {
  //     modifiers: [
  //       {
  //         name: 'flip',
  //         options: {
  //           fallbackPlacements: [onlyPlacement],
  //         },
  //       },
  //       {
  //         name: 'preventOverflow',
  //         options: {
  //           tether: false, // true by default
  //         },
  //       },
  //     ],
  //   },
  //   inertia: true,
  //   onHide(instance) {
  //     const tooltip = instance.popper.firstElementChild
  //     tooltip && tooltip.classList.remove('normal_bounce_in')
  //   },
  //   onMount(instance) {
  //     const tooltip = instance.popper.firstElementChild
  //     if (theme) {
  //       return
  //     }
  //     requestAnimationFrame(() => {
  //       tooltip && tooltip.classList.add('normal_bounce_in')
  //     })
  //   },
  // })
  // currentInstance.show()
  if (!theme) {
    // tippyInstance = currentInstance
    reportBubbleExp(content)
  } else {
    // setCheckResultWaring(tipKey, currentInstance, option)
    reportPopoverExp(key)
  }
  if (needFirstToast) {
    scrollIntoView(targetDom)
  }
}
//根据不同页面执行存在store里面模块副作用
export const clearEffectByPage = () => {
  if (timer) {
    clearTimeout(timer)
  }
  const effectList = piniaStore.extend.effectByPage()
  let currentRoute = Vrouter.currentRoute.value.name
  //兼容批量
  if (currentRoute === 'order-batch') {
    currentRoute = 'order'
  }
  if (typeof currentRoute !== 'string' || !Array.isArray(effectList)) {
    return
  }
  const effectListFilter = effectList?.filter((i) => i.pageName === currentRoute)
  const noCurrentPageEffect = effectList?.filter((i) => i.pageName !== currentRoute)
  const effectListByPage = effectListFilter?.map((i) => capitalLize(i.effect))
  const checkMapList: Array<() => Promise<localCheckResult>> = getCheckByComponentList(effectListByPage)
  Promise.all(checkMapList.map((i) => i())).then((res) => {
    res = res.flat()
    try {
      resetErrorClassByDom(res)
      if (Array.isArray(noCurrentPageEffect)) {
        piniaStore.extend.setEffectPage({
          data: noCurrentPageEffect,
        })
      }
    } catch (e) {
      console.warn(e)
    }
  })
}
export const effectBubble = (resultList: Array<localCheckResult>, otherParams?: effectBubbleOtherParams) => {
  const { needFirstToast = true, needCompatible } = otherParams || {}
  console.log('触发了气泡', resultList)
  if (!resultList) {
    return console.warn('校验数据为空')
  }
  try {
    //通过的key清楚副作用
    resetErrorClassByDom(resultList)
  } catch (e) {
    console.warn('resetErrorClassByDom', e)
  }
  return new Promise((resolve, reject) => {
    const noPassFilter = resultList.filter((i) => !i.passed)
    //第一个没通过的需要设置气泡
    const option = noPassFilter?.[0]
    if (!option) {
      return resolve(option)
    }
    option.needCompatible = needCompatible
    judgeBubbleInMoreModule(option.key)
    timer = setTimeout(() => {
      createBubble(option, needFirstToast)
    }, 100)
    setErrorClass(noPassFilter.filter((i) => !i.noNeedErrorColor))
    //有中断流程的
    const hasBlockedFlag = noPassFilter.find((i) => i.blockedFlag || !i.hasOwnProperty('blockedFlag'))
    if (hasBlockedFlag) {
      reject(option)
    }
    resolve(option)
  })
}

// 清除所有的errorClass
export const clearAllErrClass = () => {
  clearErrorClassObj()
  const domList = document.querySelectorAll(`.${errClass}`)
  domList.forEach((d: Element) => {
    d?.classList?.remove(errClass)
  })
}

const getTippyThem = (type: string, option: localCheckResult) => {
  const { content } = option || {}
  let theme = tippyTheme[type as keyof typeof tippyTheme]
  const { contentDom, tipKey } = getPopoverDom(option)
  return {
    theme,
    newContent: type ? contentDom : content,
    tipKey: type ? tipKey : '',
  }
}

//判断并关闭自定义的popover
export const closePopover = (e: Event, validateDom: Element) => {
  try {
    const targetDom = e.target as Element
    let tipKey = '' //气泡的唯一标识，`${orderPageType}_${waybillNumber}_${key}`
    let tippy: Element | null = getAttributeRoot(targetDom, 'data-tippy-root', '') as Element
    //是否点击的关闭按钮
    const isCloseClick = tippy?.getAttribute('data-tippy-root') === ''
    if (!isCloseClick) {
      tippy = null
    } else {
      tipKey = tippy.querySelector('.close')?.getAttribute('data-tip-key') || ''
      const key = tipKey.replace('_', '')
      reportPopoverClick(key)
    }
    //点击的挂载元素，就直接关闭
    if (validateDom && !tippy) {
      const tippyTarget = validateDom?.getAttribute('aria-describedby') || ''
      if (tippyTarget) {
        tipKey = document.querySelector(`#${tippyTarget}`)?.querySelector('.close')?.getAttribute('data-tip-key') || ''
      }
    }
    if (!tipKey) {
      return
    }
    const { closeCallback } = checkResultWaring[tipKey]?.option || {}
    typeof closeCallback === 'function' && closeCallback(isCloseClick)
    closePopoverByWaybillNumber(tipKey)
    e?.stopPropagation()
  } catch (e) {
    console.log(e)
  }
}

//关闭自定义气泡
export const closePopoverByWaybillNumber = (tipKey: string) => {
  if (!tipKey) {
    return
  }
  try {
    const popoverInstance = checkResultWaring[tipKey]?.popoverInstance
    if (!popoverInstance) {
      return
    }
    popoverInstance.hide()
    popoverInstance.destroy()
    delete checkResultWaring[tipKey]
  } catch (e) {
    console.error(e)
  }
}
//获取popover的dom，用于不同颜色气泡的提示
export const getPopoverDom = (option: localCheckResult) => {
  const { key, bubbleConfig = {}, content = '', extraData } = option || {}
  const { type } = extraData || {}
  const { waybillNumber = piniaStore.order.waybillNumber } = bubbleConfig || {}
  const parent = document.createElement('div')
  const orderPageType = piniaStore.globalData.orderPageType
  const tipKey = `${orderPageType}_${waybillNumber}_${key}`
  const app = createApp(validatePopover, {
    content,
    tipKey,
    type,
  })
  const dom = app.mount(parent)
  app.unmount()
  return {
    contentDom: dom?.$el?.innerHTML,
    tipKey,
  }
}
//设置自定义气泡的示例
const setCheckResultWaring = (tipKey: string, popoverInstance: any, option: localCheckResult) => {
  if (!tipKey) {
    return
  }
  checkResultWaring[tipKey] = {
    popoverInstance,
    option,
  }
}
