class MyPromise {
  constructor(handle) {
    // 1 padding 2 resolve 3 reject
    this.status = 1;
    this.paddingList = [];
    this.rejectList = [];
    this._value = null;
  }
  _resolve(value) {
    const doFn = (val) => {
      while (this.paddingList > 0) {
        const res = this.paddingList.unshift();
        res(val);
      }
    };
    const doRej = (val) => {
      while (this.rejectList.length > 0) {
        const res = this.rejectList.unshift();
        res(val);
      }
    };
    if (value instanceof MyPromise) {
      value.then(
        (val) => {
          doFn(val);
          this._value = val;
          this.status = 2;
        },
        (val) => {
          doRej(val);
          this._value = val;
          this.status = 3;
        },
      );
    } else {
      this._value = value;
      this.status = 2;
      doFn(value);
    }
  }
  _reject(value) {
    this.value = value;
    this.status = REJECT;
    let cb;
    while ((cb = this.rejectList.shift())) {
      cb(value);
    }
  }
  then(resDo, rejDo) {
    return MyPromise((res, rej) => {
      const resFn = (value) => {
        const re = resDo(value);
        if (re instanceof MyPromise) {
          re.then(res);
        } else {
          res(re);
        }
      };
      const rejFn = (value) => {
        const rj = rejDo(value);
        if (rj instanceof MyPromise) {
          rj.then(res);
        } else {
          rej(rj);
        }
      };
      if (this.status === 1) {
        this.paddingList.push(resFn);
        this.rejectList.push(rejFn);
        return;
      }
      if (this.status === 2) {
        rejFn(this._value);
        return;
      }
      if (this.status === 3) {
        rejFn(this._value);
        return;
      }
    });
  }
}

const fn = () => {
  return new Promise((res, rej) => {});
};
