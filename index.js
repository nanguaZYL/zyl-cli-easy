#!/usr/bin/env node
//找到要执行的核心文件
// 1 解析用户的参数
const program = require("commander");
const helpOptions = require("./lib/core/help");
const createCommands = require("./lib/core/create");
// 查看版本号
program.version(`该项目的版本号为${require("./package.json").version}`);

// 帮助可选信息
helpOptions();
// 创建自定义命令
createCommands();

program.parse(process.argv);
