const arr = [1, 2, 3, 3, 2];

const se = new Set();
se.add(...arr);
const ar = Array.from(se);
console.log(ar);
