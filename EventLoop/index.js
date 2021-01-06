//请写出输出内容
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}
async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(function () {
  console.log('setTimeout');
}, 0);

async1();

new Promise(function (resolve) {
  // 同步执行
  console.log('promise1');
  resolve();
}).then(function () {
  console.log('promise2');
});
console.log('script end');
/*
async 会污染执行环境
宏任务包括：script整体代码、setTimeout、setInterval、I/O、UI交互事件、MessageChannel等。
微任务：Promise.then、MutaionObserver、process.nextTick(Node.js环境下)等。
同步>微任务>宏任务
*/
