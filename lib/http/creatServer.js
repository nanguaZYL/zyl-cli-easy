const http = require("http");
const path = require("path");
const fs = require("fs");
const ora = require("ora");
const logSymbols = require("log-symbols");
const chalk = require("chalk");
const Watcher = require("./watcher");
const template = require("./template");
var { exec } = require("child_process");
const getIpAddress = require("./ip");
let template404 = "";

fs.readFile(
  path.join(__dirname, "./template/404.html"),
  "utf8",
  function (err, data) {
    if (!err) {
      template404 = data;
    }
  }
);

class CreateWebServer {
  constructor({ port, open = true }) {
    // 创建 HTTP 服务器
    this.loading = ora("创建服务器...").start();
    this.port = port;
    this.open = open;
    // this.public = path.join(process.cwd(), "./public");
    this.public = path.join(process.cwd());
    this.server = this.create();
    // 现在该服务器正在运行
    this.listen();
  }
  create() {
    const server = http.createServer(this.core());
    server.on("error", () => {
      this.loading.stop();
      console.log(chalk.red("本地服务器出错"));
      console.log(this.port);
    });
    server.on("close", () => {
      this.loading.stop();
      console.log(chalk.red("本地服务器已关闭"));
    });
    return server;
  }
  listen() {
    this.server.listen(this.port, "0.0.0.0", () => {
      const ip = (this.ip = getIpAddress());
      this.loading.stop();
      console.log(logSymbols.success, chalk.green("服务启动完成!"));
      console.log(
        "localhost:",
        chalk.green(`http://localhost:${this.server.address().port}`)
      );
      console.log(
        "network:",
        chalk.green(`http://${ip}:${this.server.address().port}`)
      );
      if (this.open)
        setTimeout(() => {
          exec("start http://localhost:" + this.server.address().port);
        }, 500);

      new Watcher(this.server, this.public);
    });
  }
  /**
   * 处理http.createServer的回调函数
   * @param {*} req
   * @param {*} res
   */
  core() {
    let that = this;
    return function (req, res) {
      if (req.url == "/") req.url = "/index.html";
      let extname = path.extname(req.url) ? path.extname(req.url).slice(1) : "";
      let pathName = path.join(that.public, req.url);
      let isFile = fs.existsSync(pathName);
      try {
        if (isFile) {
          // 处理图片
          if (["jpg", "jpeg", "png", "gif", "svg", "ico"].includes(extname)) {
            let stream = fs.createReadStream(pathName);
            let responseData = [];
            stream.on("data", function (chunk) {
              responseData.push(chunk);
            });
            stream.on("end", function () {
              res.writeHead(200, {
                "Content-Type": getImgContentType(extname),
              });
              let finalData = Buffer.concat(responseData);
              res.write(finalData);
              res.end();
            });
            return;
          }
          fs.readFile(pathName, "utf8", function (err, dataStr) {
            if (err) {
              res.writeHead(200, {
                "Content-Type": "text/html",
              });
              res.write("404");
              res.end();
              return;
            }
            if (["html", "js", "txt", "json", "md"].includes(extname))
              res.writeHead(200, {
                "Content-Type": "text/" + extname + ";charset=UTF8",
              });
            if (extname == "html") dataStr = AddSocket(dataStr);
            res.write(dataStr);
            res.end();
          });
          return;
        } else if (
          ["jpg", "jpeg", "png", "gif", "svg", "ico"].includes(extname)
        ) {
          res.writeHead(404, {
            "Content-Type": getImgContentType(extname),
          });
          res.write(Buffer.concat([]));
          res.end();
          return;
        } else {
          res.writeHead(200, {
            "Content-Type": "text/html;charset=UTF8",
          });
          let data =
            template404.replace("${ path }", pathName) || "<body>404</body>";
          data = AddSocket(data);
          res.write(data);
          res.end();
        }
      } catch {
        res.writeHead(200, {
          "Content-Type": "text/html;charset=UTF8",
        });
        let data =
          template404.replace("${ path }", pathName) || "<body>404</body>";
        data = AddSocket(data);
        res.write(data);
        res.end();
      }
    };
  }
}

/**
 * 添加socket
 * @param {*} data
 */
function AddSocket(data) {
  if (!data.trim()) {
    // 如果没有参数 意味着该文件可能为空文件 可能是刚创建 此时需要 自定义一个模板 目前使用模板字符串固定写死
    return `${getHttpState("empty")}`;
  }
  if (data.indexOf("</body>")) {
    return data.replace("</body>", getHttpState("socket"));
  }
  // 考虑到没有Body的情况
  return data.replace("</html>", `<body>${getHttpState("socket")}</html>`);
}

/**
 * 判断图片类型返回mini类型
 * @param {*} name
 * @returns
 */
function getImgContentType(name) {
  switch (name) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "svg":
      return "image/svg+xml";
    case "html":
      return "text/html";
    case "ico":
      return "image/ico";
    default:
      return "text/plain";
  }
}

/**
 * 返回js代码
 * @param {*} name
 */
function getHttpState(name) {
  return template[name];
}

module.exports = CreateWebServer;
