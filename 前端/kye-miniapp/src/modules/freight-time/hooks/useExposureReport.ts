import { useExposureReport } from '@/public/hooks/useExposureReport'
import { getPageCode } from '@freight-time/report'
export default function(ids: string[], publicParam?: Record<string, any>) {
    useExposureReport(ids, Object.assign({
        page_code: getPageCode(),
        page_name: getPageCode()
    }, publicParam))
}