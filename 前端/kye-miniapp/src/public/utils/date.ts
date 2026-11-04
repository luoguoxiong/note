import dayjs from 'dayjs'


/**
 * 转换日期到今天、明天、后天
 */
export const dateToWord = (date, formatString = 'YYYY-MM-DD') => {
    date = dayjs(date).format(formatString)
    const now = dayjs()
    if (date === now.format(formatString)) {
        date = '今天'
    } else if (date === now.add(1, 'day').format(formatString)) {
        date = '明天'
    } else if (date === now.add(2, 'day').format(formatString)) {
        date = '后天'
    }
    return date
}

/**
 * 转换今天、明天、后天到2023-10-10日期格式
 */
export const getDateFormat = (date, formatString = 'YYYY-MM-DD') => {
    const wordDateMap = {
        今天: 0,
        明天: 1,
        后天: 2,
    }
    if (Object.keys(wordDateMap).includes(date)) {
        date = dayjs().add(wordDateMap[date], 'day').format(formatString)
    }
    return date
}