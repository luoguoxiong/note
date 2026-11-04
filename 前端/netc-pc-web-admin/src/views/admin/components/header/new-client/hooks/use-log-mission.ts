import dayjs from 'dayjs'
import { getLogMission, getTencentSessionApi, updateLogMission } from '../api'
import { getMachineId, getUpdateLog, isElectronClientMode, isKuaShenClientMode } from '@/native/electron'

/**
 * 客户端日志任务: 定时轮询任务, 任务有效期内上传日志到腾讯云并回填任务状态
 */
export function useLogMission() {
  // 旧代码未在 data 中声明的实例属性
  let logMission: Record<string, any> | null = null

  /** 旧 @utils/updateCheck/applicationUpdateCheck.applicationEnvValidate: 生产域名(非uat/stg/dev)返回 true */
  const applicationEnvValidate = () => !/uat|stg|dev/.test(window.location.host)

  async function getLogMissionFn() {
    const { data } = await getLogMission({ type: 1 })
    if (!data) return
    const { taskStatus, taskStartTime, taskEndTime } = data
    if (String(taskStatus) !== '1' && String(taskStatus) !== '2') {
      return
    }
    if (dayjs().isBefore(dayjs(taskStartTime)) || dayjs().isAfter(dayjs(taskEndTime))) {
      return
    }
    logMission = data
    let { logStartTime, logEndTime } = data
    logStartTime = dayjs(logStartTime).format('YYYY-MM-DD')
    logEndTime = dayjs(logEndTime).format('YYYY-MM-DD')
    getTencentSession(logStartTime, logEndTime)
  }

  async function updateLogMissionHandle(url: string) {
    if (isElectronClientMode()) {
      url = 'https://' + url
    }
    const shellId = await getMachineId()
    const mission = logMission as Record<string, any>
    const params = {
      type: 1,
      reportType: 1,
      taskNo: mission.taskNo,
      taskStatus: 2,
      logZipUrl: url,
      reportSource: 'pc',
      logStartTime: mission.logStartTime,
      logEndTime: mission.logEndTime,
      shellId,
    }
    await updateLogMission(params)
  }

  async function getTencentSession(logStartTime: string, logEndTime: string) {
    const bucketName = applicationEnvValidate() ? 'ic-hongbao-1257092428' : 'hongbao-1257092428'
    const { data } = await getTencentSessionApi()
    const { tmpSecretId, tmpSecretKey, sessionToken } = data
    let param: Record<string, any> | string = {
      tmpSecretId,
      tmpSecretKey,
      sessionToken,
      logStartTime,
      logEndTime,
      bucketName,
    }
    if (isKuaShenClientMode()) {
      param = JSON.stringify(param)
    }
    let res = await getUpdateLog(param as any)
    if (isKuaShenClientMode()) {
      res = res.data?.url
      console.log('返回值', res)
    }
    updateLogMissionHandle(res)
  }

  return { getLogMissionFn }
}
