class App {
  constructor() {
    this.middleares = [];
  }
  use(midd) {
    this.middleares.push(midd);
  }
  compose() {
    function createNext(mid, oldNext) {
      return async () => {
        await mid(oldNext);
      };
    }
    let next = () => {
      return Promise.resolve();
    };
    return async () => {
      for (let i = this.middleares.length - 1; i >= 0; i--) {
        next = createNext(this.middleares[i], next);
      }
      await next();
    };
  }
  run() {
    this.compose()();
  }
}
const app = new App();

app.use(async (next) => {
  console.log(1);
  await next();
  console.log(4);
});
app.use(async (next) => {
  console.log(2);
  await next();
  console.log(3);
});
app.run();
