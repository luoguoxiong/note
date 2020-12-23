const debounce = (fn: Function, time: number) => {
  let timer: any = null;
  return (...arguments: any) => {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, time);
  };
};

const throttle = (fn, time) => {
  let flag = true;
  return function (...arguments) {
    if (!flag) return;
    flag = false;
    setTimeout(() => {
      fn.apply(this, arguments);
      flag = true;
    }, time);
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
