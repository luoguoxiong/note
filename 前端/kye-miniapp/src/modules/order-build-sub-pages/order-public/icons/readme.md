### svg 预览

当然装一个看图软件也可以实现

## 本地 server

首先要安装 http-server 或者 VSCode 安装 live server 插件（一键启动），用于启动服务，避免加载本地 js 跨域

npm install -g http-server

## node 执行 getSvgName.js

执行 `node ./src/icons/getSvgNames.js` (如果没增加新图标可以不执行，执行之后重写 svgNames 文件)

它读取了 svg 目录并写入 svgNames.js
输出如下

已生成 svg 名称列表,svg 个数为: 202

## 启动 server

### http-server

不要用 powershell 终端！！！ 用 CMD 就可以
cd ./src/icons/

http-server

输出

Available on:
http://2.0.0.1:8081
http://10.32.50.183:8081
http://127.0.0.1:8081

浏览器打开 http://127.0.0.1:8081/index.html 就可以看到所有的 svg 了

### live server

点击 html 文件，VS Code 右下角点击 Go Live 即可启动 server，非常简单

## 额外功能

点击名称可以复制如下 svg 代码，直接使用

<SvgIcon name="freight-icon" />
