import { resetErrorClassByDom } from '@order-public-sub-public/validate/effect/effectBubble'

export const toClearNotificationTimeError = () => {
  try {
    resetErrorClassByDom([
      {
        key: 'addedService.deliveryExactTime',
        passed: true,
      },
      {
        key: 'addedService.deliverySegmentTime',
        passed: true,
      },
      {
        key: 'addedService.notificationTime',
        passed: true,
      },
    ])
  } catch (error) {
    console.log(error)
  }
}
