const debundece = (callback) => {
  let timer;
  return function(...args) {
    const self = this;
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      callback.call(self, ...args);
    }, 2000);
  };
};
