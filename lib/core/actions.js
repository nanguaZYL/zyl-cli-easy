const { promisify } = require("util");
const download = promisify(require("download-git-repo"));
const { repoList } = require("../config/repo-config");
// const { commandSpawn } = require('../utils/terminal')
const axios = require("axios");
const { exec } = require("child_process");
const ora = require("ora");
const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const { removeDir, changeJsonName } = require("../utils/file");
const { remove } = require("../utils/inquirer");
const { ip } = require("../config/setting.json"); // 线上ip地址
const getfileByUrl = require("../vscode");
const { version } = require("commander");
const { downloadFile } = require("../download/index");

const createProjectAction = async (project) => {
  sendVersion();
  const getUrlInfo = ora("拉取模板列表中!").start();
  let template = null;
  try {
    const { data } = await axios.get(`http://${ip}/npm.config.json`);
    if (data.repoList) template = data.repoList;
  } catch {}
  getUrlInfo.stop();
  const { tag } = await inquirer.prompt({
    name: "tag", //获取选择后的结果
    type: "list",
    default: "vue",
    message: "请选择一个模板!",
    choices: Reflect.ownKeys(template ? template : repoList),
  });
  let href = template ? template[tag] : repoList[tag];
  if (!href) {
    console.log(chalk.green("暂时还未提供对应模板"));
    return;
  }
  // 判断是够有该目录
  let pathName = fs.existsSync(path.resolve(process.cwd(), `./${project}`));
  if (pathName) {
    const data = await inquirer.prompt({
      name: "key", //获取选择后的结果
      type: "list",
      message: "当前路径下已有该目录，是否覆盖?",
      choices: [{ name: "重写" }, { name: "取消" }],
    });
    if (data.key == "重写") {
      const loading = ora("删除目录中!").start();
      try {
        await removeDir(project);
      } catch (error) {
        loading.stop();
        console.log(chalk.red("删除失败,请重新尝试或者手动删除文件夹!"));
        return;
      }
      console.log("");
      console.log(chalk.green("删除完毕"));
      loading.stop();
    } else {
      console.log(chalk.red("创建已取消!"));
      return;
    }
  }
  // 加载动画
  const spinner = ora("加载项目中,请稍等...").start();
  // clone项目
  try {
    await download(href, project, {
      clone: true,
    });
  } catch (e) {
    spinner.stop();
    console.log(chalk.red("下载模板失败!"), chalk.red(`错误地址：${href}`));
    return;
  }
  // 修改package.json的name
  await changeJsonName(
    path.resolve(process.cwd(), `./${project}/package.json`),
    project
  );

  spinner.stop();
  console.log(chalk.green("项目搭建完毕!"));
  console.log("");
  console.log(chalk.green(`  cd ${project}`));
  console.log(chalk.green("  npm install"));
  console.log("");
};

const removeProjectAction = async (project) => {
  sendVersion();
  let pathName = fs.existsSync(path.resolve(process.cwd(), `./${project}`));
  if (pathName) {
    let flog = await remove(project);
    if (flog) {
      const loading = ora("删除目录中!").start();
      try {
        await removeDir(project);
      } catch (error) {
        loading.stop();
        console.log(chalk.red("删除失败,请重新尝试或者手动删除文件夹!"));
        return;
      }
      console.log("");
      console.log(chalk.green("删除完毕"));
      loading.stop();
    }
  } else {
    console.log(chalk.red("该目录文件夹不存在!"));
    console.log(
      chalk.red(`catalogue: ${path.resolve(process.cwd(), `./${project}`)}`)
    );
  }
};

// 下载vscode
const downVscode = async function (list) {
  let version;
  const val = "1.68.0";
  if (list.length) {
    version = list[0];
  } else {
    try {
      const { data } = await axios.get(`http://${ip}/npm.config.json`);
      if (data.vscodeVersion) version = data.vscodeVersion;
      else version = val;
    } catch {
      version = val;
    }
  }
  getfileByUrl(version);
};

const Hosts = function (list) {
  // 后续再考虑添加直接往hosts文件添加的功能
  // 现目前仅打开notepad
  const pathName = path.join("C:/Windows/system32/drivers/etc", "./hosts");
  if (fs.existsSync(pathName)) {
    exec(`notepad ${pathName}`);
  } else {
    console.log(chalk.red("未找到hosts!"));
  }
};
const transcribe = async function () {
  const exec_path = path.join(__dirname, "../resource/lupin/dist/zyl录屏.exe");
  if (fs.existsSync(exec_path)) {
    exec(exec_path);
    return;
  } else {
    const zip_path = path.join(__dirname, "../resource/lupin.zip");
    if (fs.existsSync(zip_path)) fs.unlinkSync(zip_path); //如果下载前本地已存在 则先删除本地文件
    if (!fs.existsSync(zip_path)) {
      const waitTing = ora(chalk.green("首次使用需要下载,请耐心等待......"));
      waitTing.start();
      let res = await downloadFile(
        `http://${ip}/download/lupin.zip`,
        fs.createWriteStream(zip_path)
      );
      waitTing.stop();
      if (!res) {
        console.log(chalk.red("发生异常,请重新尝试或者联系开发者!"));
        return;
      }
      console.log(chalk.green("下载成功"));
      const loading = ora(chalk.green("解压中......")).start();
      const { uncompress } = require("../zlip/index"); //解压本地文件
      const uncomress_path = path.join(__dirname, "../resource/lupin.zip");
      let data = await uncompress(
        uncomress_path,
        path.join(__dirname, "../resource/lupin")
      );
      loading.stop();
      if (data) {
        console.clear();
        console.log(chalk.red("发生异常,请重新尝试或者联系开发者!"));
      } else {
        console.log(chalk.green("解压成功,准备打开录屏!"));
        exec(exec_path);
      }
    }
  }
  // const { uncompress } = require("../zlip/index"); //解压本地文件
  // uncompress.
};

const sendVersion = async () => {
  try {
    await axios.get(
      `http://${ip}/npm/version?version=${
        require("../../package.json").version
      }`
    );
  } catch {}
};

module.exports = {
  createProjectAction,
  removeProjectAction,
  downVscode,
  Hosts,
  transcribe,
};
