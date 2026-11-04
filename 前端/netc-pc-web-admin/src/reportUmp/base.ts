/* eslint-disable */
import {baseInstanceType, Indexable} from './type/types'
import {uuid} from "@/utils";
import {isObject} from "@/reportUmp/util";

const BaseReportData = (function () {
  let baseInstance: any
  return class umpBase {
    private baseParams: Indexable<any> = {}
    private storeParams: Indexable<string | null | number | boolean> = {}
    constructor(config: Indexable<any>) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const _this = this
      // 基础数据
      const { ref_page_name=document.referrer, ref_action, session_id,orderId } = config || {}
      const baseParams = {
        // work_id: {}, // 根据产品给定的事务编码，触发开始事件填入uuid，触发结束事件剔除该事件的uuid
        page_name: '', // 当前页面的pagecode
        ref_page_name, // 场景来源页面的page
        ref_action, //场景来源页面的动作
        pre_page_name:'', //上一个页面的page
        session_id, //同一个生命周期的session_id
        orderId, //初始化生成的唯一uuid
      }
      const storeParams = {
        encryptionString: '', //加密字段,字符串数组，
        encryptionKey: '', //加密公钥
        root: null, // 默认浏览器视窗
        threshold: 1, // 元素完全出现在浏览器视窗内才执行callback函数。
        time: 200, //出现在视图多长时间算曝光
        isAllowRepeait:false //是否不允许反复曝光
      }
      if (baseInstance) {
        return baseInstance
      }
      baseInstance = _this
      // 总数据
      this.baseParams = baseParams
      //存储数据
      this.storeParams = storeParams
    }
    // 新增基础数据
    add(key: string, value: string, type:baseInstanceType = 'baseParams') {
      if (typeof key !== 'string' || isObject(value)) {
        console.warn('类型不对',key,value)
        return
      }
      const keyValue = this[type][key]
      if(isObject(keyValue)){
        this[type][key][value] = uuid()
        return;
      }
      this[type][key] = value
    }
    // 删除公共数据
    del(key: string, value: string, type:baseInstanceType = 'baseParams') {
      const oldValue = this[type][key]
      if(isObject(oldValue)){
        delete this[type][key][value]
        return;
      }
      if (!oldValue) {
        return
      }
      this[type][key] = ''
    }
    //获取基础公共数据
    get(key?: string, type:baseInstanceType = 'baseParams') {
      return key ? this[type][key] : this[type]
    }
  }
})()

export default new BaseReportData({})

/* eslint-disable */
