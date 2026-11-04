export const exp_express_print_v1 = (text: string) => {
  return {
    eventCode: 'exp_express_print_v1',
    otherParams: () => {
      return { button_name: text }
    },
  }
}
