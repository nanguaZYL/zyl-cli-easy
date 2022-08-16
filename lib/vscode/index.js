//引入相关资源包
const fs = require("fs");
const path = require("path");
const request = require("request");
const ora = require("ora");
const chalk = require("chalk");
const { platform } = require("os");

const versionMap = {
  darwin: "Mac",
  linux: "Linux",
  win32: "Windows",
};
const URL = {
  Mac: "https://update.code.visualstudio.com/versions/darwin/stable",
  Linux: "https://update.code.visualstudio.com/versions/linux-rpm-x64/stable",
  Windows: "https://update.code.visualstudio.com/versions/win32-x64/stable",
};
const loading = ora("正在下载vscode,请稍等......");
const install = ora("开始安装vscode....");
let start;
/**
 *
 * @param {*} url  网络文件url地址
 * @param {*} fileName 	文件名
 * @param {*} dir 下载到的目录
 */
function getfileByUrl(version) {
  start = new Date();
  const system = versionMap[platform] || "未知系统版本";
  console.log(chalk.green(`系统版本: ${system}`));
  console.log(chalk.green(`vscode版本: ${version}`));
  if (!system) {
    console.log(chalk.red("当前系统不是Windows,Mac,Linux其中一个版本"));
    return;
  }
  fileName = system + version + ".exe";
  loading.start();
  const download_path = path.join(__dirname, fileName);
  if (fs.existsSync(download_path)) fs.unlinkSync(download_path); //如果下载前本地已存在 则先删除本地文件
  let stream = fs.createWriteStream(download_path);
  const url = URL[system].replace("versions", version);
  request(url)
    .pipe(stream)
    .on("close", function (err) {
      loading.stop();
      if (err) {
        console.log("下载失败!");
        return;
      }
      if (fs.existsSync(path.join(__dirname, fileName))) executor(fileName);
      else console.log(chalk.red("下载失败!"));
    });
}

function executor(fileName) {
  var exec = require("child_process").exec,
    child;
  // exec_path 写入需要执行的命令
  var exec_path = path.join(__dirname, fileName);
  // 执行函数
  install.start();
  child = exec(exec_path, function (error, stdout, stderr) {
    install.stop();
    // console.clear();
    if (error) {
      console.log("------------------------------\n");
      console.log(
        chalk.bgRed("  安装失败  "),
        chalk.green(`      ${new Date() - start} ms`)
      );
    } else {
      console.log(
        chalk.bgGreen("安装成功"),
        chalk.green(`      ${new Date() - start} ms`)
      );
    }
    // 如果本地有下载的文件则删除该文件
    if (fs.existsSync(path.join(__dirname, fileName)))
      fs.unlinkSync(path.join(__dirname, fileName)); //删除文件
  });
}

module.exports = getfileByUrl;
