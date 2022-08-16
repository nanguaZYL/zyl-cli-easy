// 引入scp2
var client = require("scp2");
// 下面三个插件是部署的时候控制台美化所用 可有可无
const ora = require("ora");
const chalk = require("chalk");
const inquirer = require("inquirer");
const getConfig = require("./getConfig");
const path = require("path");
const fs = require("fs");

let start;

//服务器链接信息
// const server_list = {
//   //比如这是测试环境
//   dev: {
//     host: "110.40.226.129", // 服务器的IP地址
//     port: "22", // 服务器端口， 一般为 22
//     username: "test", // 用户名
//     password: "123456", // 密码
//     path: "/", // 项目部署的服务器目标位置
//     uploadPath: "dist", // 本地目录下的文件夹
//   },
//   //这是生产环境
//   prod: {
//     host: "", // 服务器的IP地址
//     port: "22", // 服务器端口， 一般为 22
//     username: "", // 用户名
//     password: "", // 密码
//     path: "/www/wwwroot/test",
//     // 项目部署的服务器目标位置
//   },
// };

function verify(data) {
  const map = {
    host: "服务器ip地址",
    username: "用户名",
    password: "密码",
  };
  let info = [];
  Reflect.ownKeys(map).forEach((name) => {
    if (!data[name]) info.push(map[name]);
  });
  if (info.length) {
    return info[0] + "为空";
  }
}

/**
 *
 * @param {*} config 配置文件
 * @param {*} name 指定环境名
 * @returns
 */
function Answers(config, name) {
  if (!name) {
    console.log(chalk.red("未指定上传环境!"));
    return;
  }
  if (!config[name]) {
    console.log("没有从配置文件中找到对应环境!");
    return;
  }
  let message = verify(config[name]);
  if (message) {
    console.log(chalk.red(message));
    return;
  }
  const spinner = ora(chalk.green("正在发布到服务器中..."));
  spinner.start();
  let send_server = config[name];
  let uploadPath = path.join(process.cwd(), send_server.uploadPath || "dist");
  if (!fs.existsSync(uploadPath)) {
    spinner.stop();
    console.log();
    console.log(
      chalk.bgRed("  Fail  "),
      "上传文件夹不存在,请检查配置或者打包是否成功!"
    );
    console.log("path:", uploadPath);
    console.log();
    return;
  }
  delete send_server.uploadPath;
  client.scp(uploadPath, send_server, (err) => {
    spinner.stop();
    if (!err) {
      console.log();
      console.log(
        chalk.bgGreen("  successful  "),
        `    ${new Date() - start} ms`
      );
      console.log(chalk.green("项目发布完毕!"));
      console.log();
    } else {
      console.log(chalk.red("上传失败:"), err);
    }
  });
}

module.exports = function (args) {
  start = new Date();
  let name = args[0];
  let configPath = getConfig();
  if (!configPath) {
    console.log(chalk.red("项目根目录下缺少zyl.config.js文件"));
  } else {
    const config = require(configPath);
    if (!Reflect.ownKeys(config).length) {
      console.log(chalk.red("zyl.config.js文件为空!"));
    } else {
      Answers(config, name);
    }
  }
};
