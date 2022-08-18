const inquirer = require("inquirer");

const getIpAddress = require("./utils/ip");
const OpenTCP = require("./utils/TCP");

const createNetServe = async function () {
  let port = await getPort();
  let address = await getAddress();
  console.clear()
  OpenTCP(port, address);
};

async function getPort() {
  console.clear();
  const data = await inquirer.prompt({
    name: "key", //获取选择后的结果
    type: "input",
    message: "请输入需要穿透的端口号:",
  });
  if (!data.key) {
    return getPort();
  } else {
    if (!isNaN(Number(data.key))) {
      return Number(data.key);
    }
    return getPort();
  }
}

async function getAddress() {
  let data = await inquirer.prompt({
    name: "key", //获取选择后的结果
    type: "input",
    message: "请输入穿透的局域网ip(默认为本机ip):",
    default: getIpAddress() || "127.0.0.1",
  });
  return data.key;
}

module.exports = createNetServe;
