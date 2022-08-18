const program = require("commander");
const {
  createProjectAction,
  removeProjectAction,
  downVscode,
  Hosts,
  transcribe,
} = require("./actions");
const sftpUpload = require("../sftp");
const createNetServe = require("../net/index");
// const chalk = require("chalk");
const httpServer = require("../http/http.js"); //运行服务器

const createCommands = () => {
  program
    .command("create <project> [others...]")
    .description("clone repository || 创建项目")
    .action(createProjectAction);
  program
    .command("remove <project> [others...]")
    .description("remove repository || 删除项目")
    .action(removeProjectAction);

  program
    .command("serve")
    .description("start Http Server || 启动本地服务器")
    .action(httpServer);

  program
    .command("vs [others...]")
    .description("下载vscode")
    .action(downVscode);

  program
    .command("hosts [others...]")
    .description("快捷打开hosts文件")
    .action(Hosts);

  program
    .command("sftp [others...]")
    .description("上传到sftp文件夹指定位置")
    .action(sftpUpload);

  program.command("lp").description("打开录屏").action(transcribe);

  program.command("net").description("开启内网穿透").action(createNetServe);

  // program
  // 	.command('v')
  // 	.description('view version || 查看版本号')
  // 	.action(() => {
  // 		console.log(
  // 			chalk.red(
  // 				`该项目的版本号为${require('../../package.json').version}`
  // 			)
  // 		)
  // 	})
};

module.exports = createCommands;
