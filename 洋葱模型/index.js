// 把一个函数组成嵌套成上一个函数的参数
class App {
  constructor() {
    this.middleares = [];
  }
  use(midd) {
    this.middleares.push(midd);
  }

  async run() {
    function createNext(mid, oldNext) {
      return async () => {
        await mid(oldNext);
      };
    }
    let next = () => {
      return Promise.resolve();
    };

    for (let i = this.middleares.length - 1; i >= 0; i--) {
      next = createNext(this.middleares[i], next);
    }
    await next();
  }
}
const app = new App();

app.use(async (next) => {
  console.log(1);
  await next();
  console.log(4);
});
// app.use(async (next) => {
//   console.log(2);
//   await next();
//   console.log(3);
// });
app.run();

function a(next) {
  console.log('a');
  next();
  console.log('a1');
}

function b(next) {
  console.log('b');
  next();
  console.log('b1');
}
function c(next) {
  console.log('c');
  next();
  console.log('c1');
}

a(() => {
  b(() => {
    c(() => {});
  });
});
