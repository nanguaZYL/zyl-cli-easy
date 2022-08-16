# 该脚手架主要是一个快速构建命令行应用程序的工具箱-它包括:

```
1.快速创建项目模板
2.创建简易web服务器 实现热更新
3.下载vscode并安装
4.修改hosts文件
5.sftp自动化部署
6.录制屏幕
```

首先使用npm install -g zyl-cli-easy 全局安装该脚手架

---

### 一 快速创建项目模板

通过vuecli创建的vue模板通常还需要自己下载很多常用插件，当想要快速创建一个项目或准备写个demo时，还要手动安装axios,vuex,vuerouter,dayjs,less...等常用的插件，并进行配置或者封装，或者从旧项目复制过去，个人觉得很麻烦，因此本着好奇(因为没有写过脚手架)和便捷的想法，写了这个脚手架。

首先第一个命令是--help 

```
zyl --help
```

因为使用的commander插件 所以这个命令其实是自带的 通过zyl --help可以查看其他命令详情和描述

然后是快捷创建模板的命令： zyl  create 项目名

```
zyl create projectName
```

![1655216883139(1)](http://110.40.226.129/img/default/01.png)

然后暂时写了这四种模板 后续可能会添加更多的模板或者用户可添加自定义模板

因为使用了download-git-repo这个库 所以实质上是去拿模板对应的git仓库 因此如果本地没有安装git的话会拉取不到模板

同时也可以通过用户个人的git仓库地址来添加自定义模板 不仅限于脚手架提供的几种

### 二 创建简易web服务器 实现热更新

通过zyl  serve命令 以当前命令行所在文件夹为根目录 建立web服务器

```
zyl serve
```

![1655216883139(1)](http://110.40.226.129/img/default/03.png)

作用等同于vscode的插件Live Server 灵感也是来源于此 主要是通过监听当前命令行所在文件夹内的文件变化 对web进行简单的热更新

三  下载vscode并安装

```
zyl  vs  [版本号]   // 版本号为可选项
zyl  vs            // 不填版本号则默认新版本下载安装
zyl  vs  1.68.0    // 指定1.68.0版本下载并安装
zyl  vs  1.67.1    // 指定1.67.1版本下载并安装
```

这一命令主要是由于在vscode官方上下载特别缓慢 （原因就不说了）因此添加这项功能  方便以后快速下载vscode

![5ed8729d401aca8316c6edb3d06ee8c](http://110.40.226.129/img/default/02.png)

先查看系统是Mac,Windows还是Linux，再确定需要下载的vscode版本

然后通过vscode的国内镜像源下载对应系统的安装包 在下载完成时打开安装文件

### 四 修改Hosts文件

可通过zyl hosts命令以notepad打开hosts文件 

```
zyl hosts
```

### 五  sftp自动化部署

需要在项目的根目录下创建zyl.config.js文件  格式如下：

```zyl.config.js
module.exports = {
  //比如这是测试环境
  dev: {
    host: "xxx.xx.xx.xx", // 服务器的IP地址
    port: "22", // 服务器端口， 一般为 22
    username: "", // 用户名
    password: "", // 密码
    path: "/www/wwwroot/test", // 项目部署的服务器目标位置 默认为当前目录 /
    uploadPath: "dist", // 需要上传的文件夹名 同样需要在项目根目录下 默认为dist
  },
  //这是生产环境
  prod: {
    host: "xxx.xx.xx.xx", // 服务器的IP地址
    port: "22", // 服务器端口， 一般为 22
    username: "", // 用户名
    password: "", // 密码
    path: "/www/wwwroot/test", // 项目部署的服务器目标位置 默认为当前目录 /
    uploadPath: "dist" // 需要上传的文件夹名 同样需要在项目根目录下 默认为dist
  },
};
```

然后通过zyl sftp 环境名上传  如果

```
zyl sftp dev       指定使用zyl.config.js中的dev环境
zyl sftp prop      指定使用zyl.config.js中的prop环境
名字自定义 zyl sftp 自定义名字即可
```

![5ba57a4acc78a06beac567c2a3af038](http://110.40.226.129/img/default/04.jpg)
![5ba57a4acc78a06beac567c2a3af038](http://110.40.226.129/img/default/05.jpg)

可在vue打包完成之后自动部署服务器 如打包命令可以这么写

```
"script":{
    "build":"vue-cli-service build && zyl sftp dist"   
    // &&代表前面打包命令执行完毕之后再执行后面的命令
    // &代表前后两个命令同时执行
}
```

### 六 屏幕录制

```
zyl lp 
```

通过zyl lp命令打开录屏

原本是准备本地起个服务器 使用web端录屏 因为localhost或者https协议都可以调用getUserMedia  不过发现在处理音频的时候 浏览器会弹对话框 用户允许之后才能获取到音频

所以后面改成了使用exe文件来录屏 录频的exe文件是用elctron+vue写的 electron 基于 Chromium 和 Node.js 不过electron要自由一些 所以本质上跟web端录屏差不多 相对来说我对这两者比较熟悉   而且因为它使用的是Chromium浏览器 相比较第一个方案 还不需要去兼容其他浏览器   

不过由于还是web端录屏 因此MediaRecorder录制的视频流没有时间的缺陷还是没办法解决 尝试过用一些库来解决时间问题 但是效果不好

也不是没想过用ffmpeg不过一方面也对视频处理这块感兴趣 一方面也是想自己造轮子 所以才选择了electron

以后看情况考虑用ffmpeg

```ffmpeg
1.1.7版本已使用ffmpeg 解决视频的时间进度条问题
```

---

```
zyl -v  // 查看版本号
该项目的版本号为1.1.7
```

暂时就写到这 后续再考虑是否添加什么功能
