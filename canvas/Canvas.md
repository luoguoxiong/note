# Canvas

1. 绘制矩形

```js
function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    ctx.fillRect(25, 25, 100, 100);
    ctx.clearRect(45, 45, 60, 60);
    ctx.strokeRect(50, 50, 50, 50);
  }
}
```

```js
fillRect(x, y, width, height)
绘制一个填充的矩形
strokeRect(x, y, width, height)
绘制一个矩形的边框
clearRect(x, y, width, height)
清除指定矩形区域，让清除部分完全透明。
```

2. 绘制路径

```js
function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext){
  var ctx = canvas.getContext('2d');

  // 填充三角形
  ctx.beginPath();
  ctx.moveTo(25, 25);
  ctx.lineTo(105, 25);
  ctx.lineTo(25, 105);
  ctx.fill();

  // 描边三角形
  ctx.beginPath();
  ctx.moveTo(125, 125);
  ctx.lineTo(125, 45);
  ctx.lineTo(45, 125);
  ctx.closePath();
  ctx.stroke();
  }
}
```

```js
beginPath() 声明起点，没有声明，则默认第一个绘画开始就是起点
新建一条路径，生成之后，图形绘制命令被指向到路径上生成路径。
closePath() 默认最后会执行
闭合路径之后图形绘制命令又重新指向到上下文中。
stroke()
通过线条来绘制图形轮廓。
fill()
通过填充路径的内容区域生成实心的图形。
moveTo(x, y)
将笔触移动到指定的坐标x以及y上，声明起点
lineTo(x, y)
绘制一条从当前位置到指定x以及y位置的直线。
```

3. 绘制圆弧

```js
 function draw() {
   var ctx = document.getElementById('canvas').getContext('2d');
   ctx.arc(100, 100, 50, 0, (90 * Math.PI) / 180);
   ctx.fillStyle = '#acc';
   ctx.fill();
 }
```

```shell
arc(x, y, radius, startAngle, endAngle, anticlockwise)
画一个以（x,y）为圆心的以radius为半径的圆弧（圆），从startAngle开始到endAngle结束，按照anticlockwise给定的方向（默认为顺时针）来生成。
arcTo(x1, y1, x2, y2, radius)
根据给定的控制点和半径画一段圆弧，再以直线连接两个控制点。
```

4.贝塞尔曲线

```shell
quadraticCurveTo(cp1x, cp1y, x, y)
绘制二次贝塞尔曲线，cp1x,cp1y为一个控制点，x,y为结束点。
bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)
绘制三次贝塞尔曲线，cp1x,cp1y为控制点一，cp2x,cp2y为控制点二，x,y为结束点。
```

5.设置图形颜色和图形轮廓颜色

```shell
fillStyle = color #设置图形的填充颜色。

strokeStyle = color #设置图形轮廓的颜色。

globalAlpha = transparencyValue #设置透明度
这个属性影响到 canvas 里所有图形的透明度，有效的值范围是 0.0 （完全透明）到 1.0（完全不透明），默认是 1.0。
```

