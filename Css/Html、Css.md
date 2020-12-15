# Css

#### 1. IE盒模型、标准盒模型

> 1. 盒模型由padding、margin、border、conetnt。
> 2. IE盒模型宽度、高度由padding+border+content组成。
> 3. 标准盒模型:conetn。
> 4. 通过设置box-sizing:border-box/content-box设置盒模型。

#### 2.选择器

> 1. id选择器 #myId
> 2. class选择器 .class
> 3. 标签选择器 div
> 4. 后代选择器 ul li
> 5. 相邻后代选择器 ul>li
> 6. 兄弟选择器 li~a
> 7. 相邻兄弟选择器 li+a
> 8. 属性选择器 input[type="text"]
> 9. 伪类选择器
> 10. 伪元素选择器::before、::after
> 11. 通配符选择器

#### 3.可以继承的属性

```text
有继承性的属性：
（1）字体系列属性font、font-family、font-weight、font-size、font-style、font-variant、font-stretch、font-size-adjust
（2）文本系列属性text-indent、text-align、text-shadow、line-height、word-spacing、letter-spacing、text-transform、direction、color
（3）表格布局属性caption-sideborder-collapseempty-cells
（4）列表属性list-style-type、list-style-image、list-style-position、list-style
（5）光标属性cursor
（6）元素可见性visibility
（7）还有一些不常用的；speak，page，设置嵌套引用的引号类型quotes等属性注意：当一个属性不是继承属性时，可以使用inherit关键字指定一个属性应从父元素继承它的值，inherit关键字用于显式地指定继承性，可用于任何继承性/非继承性属性。
```

#### 4.选择器优先级

```text
1.选择器的特殊性值分为四个等级，如下：
（1）标签内选择符1
（2）class选择符/属性选择符/伪类选择符10
（3）ID选择符100
（4）元素和伪元素选择符1000
2.内联样式>外部样式，最后出现的样式优先级更高
```

#### 5.伪类 LVHA 的解释

```text
a标签有四种状态：链接访问前、链接访问后、鼠标滑过、激活，分别对应四种伪类:link、:visited、:hover、:active；

当链接未访问过时：
（1）当鼠标滑过a链接时，满足:link和:hover两种状态，要改变a标签的颜色，就必须将:hover伪类在:link伪类后面声明；
（2）当鼠标点击激活a链接时，同时满足:link、:hover、:active三种状态，要显示a标签激活时的样式（:active），必须将:active声明放到:link和:hover之后。因此得出LVHA这个顺序。
当链接访问过时，情况基本同上，只不过需要将:link换成:visited。这个顺序能不能变？可以，但也只有:link和:visited可以交换位置，因为一个链接要么访问过要么没访问过，不可能同时满足，也就不存在覆盖的问题。
```

#### 6.伪类有哪些

```text
（1）elem:nth-child(n)    选中父元素下的第n个子元素，并且这个子元素的标签名为elem，n可以接受具体的数值，也可以接受函数。
（2）elem:nth-last-child(n)    作用同上，不过是从后开始查找。
（3）elem:last-child    选中最后一个子元素。
（4）elem:only-child    如果elem是父元素下唯一的子元素，则选中之。
（5）elem:nth-of-type(n)    选中父元素下第n个elem类型元素，n可以接受具体的数值，也可以接受函数。
（6）elem:first-of-type    选中父元素下第一个elem类型元素。
（7）elem:last-of-type    选中父元素下最后一个elem类型元素。
（8）elem:only-of-type    如果父元素下的子元素只有一个elem类型元素，则选中该元素。
（9）elem:empty    选中不包含子元素和内容的elem类型元素。
（10）elem:target    选择当前活动的elem元素。
（11）:not(elem)    选择非elem元素的每个元素。
（12）:enabled    控制表单控件的禁用状态。
（13）:disabled    控制表单控件的禁用状态。
（14）:checked    单选框或复选框被选中。
```

#### 7.li 与 li 之间有看不见的空白间隔是什么原因引起的？有什么解决办法？

```text
浏览器会把inline元素间的空白字符（空格、换行、Tab等）渲染成一个空格。而为了美观。我们通常是一个<li>放在一行，这导致<li>换行后产生换行字符，它变成一个空格，占用了一个字符的宽度。

解决办法：
（1）为<li>设置float:left。不足：有些容器是不能设置浮动，如左右切换的焦点图等。
（2）将所有<li>写在同一行。不足：代码不美观。
（3）将<ul>内的字符尺寸直接设为0，即font-size:0。不足：<ul>中的其他字符尺寸也被设为0，需要额外重新设定其他字符尺寸，且在Safari浏览器依然会出现空白间隔。
（4）消除<ul>的字符间隔letter-spacing:-8px，不足：这也设置了<li>内的字符间隔，因此需要将<li>内的字符间隔设为默认letter-spacing:normal。
```

#### 8. width:auto 和 width:100%的区别

```text
width:100%会使元素box的宽度等于父元素的contentbox的宽度。
width:auto会使元素撑满整个父元素，margin、border、padding、content区域会自动分配水平空间。
```

#### 9.深入理解BFC

```TEXT
我们常说的文档流其实分为定位流、浮动流和普通流三种。而普通流其实就是指BFC中的FC。FC是formatting context的首字母缩写，直译过来是格式化上下文，它是页面中的一块渲染区域，有一套渲染规则，决定了其子元素如何布局，以及和其他元素之间的关系和作用。常见的FC有BFC、IFC，还有GFC和FFC。BFC是block formatting context，也就是块级格式化上下文，是用于布局块级盒子的一块渲染区域

1.触发条件
	float为 left|right
  overflow为 hidden|auto|scroll
  display为 table-cell|table-caption|inline-block|inline-flex|flex
  position为 absolute|fixed
  根元素 html
  
2.布局规则
	内部的Box会在垂直方向，一个接一个地放置(即块级元素独占一行)。
  BFC的区域不会与float box重叠(利用这点可以实现自适应两栏布局)。
  内部的Box垂直方向的距离由margin决定。属于同一个BFC的两个相邻Box的margin会发生重叠(margin重叠三个条件:同属于一个BFC;相邻;块级元素)。
  计算BFC的高度时，浮动元素也参与计算。（清除浮动 haslayout）
  BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。
```

#### 10.Css优化和提高性能方法

```text
加载性能：
（1）css压缩：将写好的css进行打包压缩，可以减少很多的体积。
（2）css单一样式：当需要下边距和左边距的时候，很多时候选择:margin:top0bottom0;但margin-bottom:bottom;margin-left:left;执行的效率更高。
（3）减少使用@import,而建议使用link，因为后者在页面加载时一起加载，前者是等待页面加载完成之后再进行加载。选择器性能：（1）关键选择器（keyselector）。选择器的最后面的部分为关键选择器（即用来匹配目标元素的部分）。CSS选择符是从右到左进行匹配的。当使用后代选择器的时候，浏览器会遍历所有子元素来确定是否是指定的元素等等；（2）如果规则拥有ID选择器作为其关键选择器，则不要为规则增加标签。过滤掉无关的规则（这样样式系统就不会浪费时间去匹配它们了）。（3）避免使用通配规则，如*{}计算次数惊人！只对需要用到的元素进行选择。
（4）尽量少的去对标签进行选择，而是用class。
（5）尽量少的去使用后代选择器，降低选择器的权重值。后代选择器的开销是最高的，尽量将选择器的深度降到最低，最高不要超过三层，更多的使用类来关联每一个标签元素。
（6）了解哪些属性是可以通过继承而来的，然后避免对这些属性重复指定规则。

渲染性能：
（1）慎重使用高性能属性：浮动、定位。
（2）尽量减少页面重排、重绘。
（3）去除空规则：｛｝。空规则的产生原因一般来说是为了预留样式。去除这些空规则无疑能减少css文档体积。
（4）属性值为0时，不加单位。
（5）属性值为浮动小数0.**，可以省略小数点之前的0。
（6）标准化各种浏览器前缀：带浏览器前缀的在前。标准属性在后。
（7）不使用@import前缀，它会影响css的加载速度。
（8）选择器优化嵌套，尽量避免层级过深。
（9）css雪碧图，同一页面相近部分的小图标，方便使用，减少页面的请求次数，但是同时图片本身会变大，使用时，优劣考虑清楚，再使用。
（10）正确使用display的属性，由于display的作用，某些样式组合会无效，徒增样式体积的同时也影响解析性能。
（11）不滥用web字体。对于中文网站来说WebFonts可能很陌生，国外却很流行。webfonts通常体积庞大，而且一些浏览器在下载webfonts时会阻塞页面渲染损伤性能。

可维护性、健壮性：
（1）将具有相同属性的样式抽离出来，整合并通过class在页面中进行使用，提高css的可维护性。
（2）样式与内容分离：将css代码定义到外部css中。
```

