const PADDING = 'Padding';
const RESOLVE = 'Resolve';
const REJECT = 'Reject';
class MyPromise {
  constructor(handle) {
    this.value = null;
    this.status = PADDING;
    this.resolveList = [];
    this.rejectList = [];
    handle(this._resolve.bind(this), this._reject.bind(this));
  }
  _resolve(value) {
    const run = () => {
      const handRes = (val) => {
        let cb;
        while ((cb = this.resolveList.shift())) {
          cb(val);
        }
      };
      const handRej = (val) => {
        let cb;
        while ((cb = this.rejectList.shift())) {
          cb(val);
        }
      };
      if (value instanceof MyPromise) {
        value.then(
          (val) => {
            this.value = val;
            this.status = RESOLVE;
            handRes(val);
          },
          (err) => {
            this.value = err;
            this.status = REJECT;
            handRej(err);
          },
        );
      } else {
        this.value = value;
        this.status = RESOLVE;
        handRes(value);
      }
    };
    setTimeout(run, 0);
  }

  _reject(value) {
    const run = () => {
      this.value = value;
      this.status = REJECT;
      let cb;
      while ((cb = this.rejectList.shift())) {
        cb(value);
      }
    };
    setTimeout(run, 0);
  }

  then(resNext, rejNext) {
    return new MyPromise((resDo, rejDo) => {
      const handleRes = (value) => {
        try {
          const res = resNext(value);
          if (res instanceof MyPromise) {
            res.then(resDo, rejDo);
          } else {
            resDo(res);
          }
        } catch (error) {
          rejDo(error);
        }
      };
      const handleRej = (value) => {
        try {
          const res = rejNext(value);
          if (res instanceof MyPromise) {
            res.then(resDo, rejDo);
          } else {
            resDo(res);
          }
        } catch (error) {
          rejDo(error);
        }
      };
      if (this.status === PADDING) {
        this.resolveList.push(handleRes);
        this.rejectList.push(handleRej);
        return;
      }
      if (this.status === RESOLVE) {
        handleRes(this.value);
        return;
      }
      if (this.status === REJECT) {
        handleRej(this.value);
        return;
      }
    });
  }

  static resolve(value) {
    return new MyPromise((res) => res(value));
  }

  static reject(value) {
    return new MyPromise((_, rej) => rej(value));
  }

  static all(promiseList) {
    return new MyPromise((res, rej) => {
      for (let value in promiseList) {
        let values = [];
        let count = 0;
        this.resolve(value).then(
          (val) => {
            values[i] = val;
            count++;
            if (count === list.length) res(values);
          },
          (err) => {
            rej(err);
          },
        );
      }
    });
  }
  static race(promiseList) {
    return new MyPromise((res, rej) => {
      for (let value in promiseList) {
        this.resolve(value).then(
          (val) => {
            res(val);
          },
          (err) => {
            rej(err);
          },
        );
      }
    });
  }
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
  finally(cb) {
    return this.then(
      (value) => MyPromise.resolve(cb()).then(() => value),
      (reason) =>
        MyPromise.resolve(cb()).then(() => {
          throw reason;
        }),
    );
  }
}

new MyPromise((res, rej) => {
  setTimeout(() => {
    res(123);
  }, 1000);
})
  .then(
    (value) => {
      console.log(value);
      return 2;
    },
    (err) => {
      console.log('err', err);
    },
  )
  .then((res) => {
    console.log(res);
  });
