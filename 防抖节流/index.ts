const debounce = (fn: Function, time: number) => {
  let timer: any = null;
  return (...arguments: any) => {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, time);
  };
};

const thread = (fn: Function, time: number, thredTime: number) => {
  let timer: any = null;
  return (...arguments: any) => {
    const now = new Date().getTime();
    timer && clearTimeout(timer);
    if (new Date().getTime() > now + thredTime) {
      fn.apply(this, arguments);
    } else {
      timer = setTimeout(() => {
        fn.apply(this, arguments);
      }, time);
    }
  };
};

const refThread = (fn: Function) => {
  let lock = false;
  return (...arguments: any) => {
    if (!lock) {
      requestAnimationFrame(() => {
        fn.apply(this, arguments);
        lock = true;
      });
    }
  };
};
