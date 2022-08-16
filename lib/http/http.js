const { getPort } = require("./port");
const ora = require("ora");

const CreateWebServer = require("./creatServer");

/**
 *
 * @param {*} pathName 项目路径
 */
async function httpServer() {
  const loading = ora("获取端口...").start();
  let port = await getPort();
  loading.stop();
  new CreateWebServer({ port });
}

module.exports = httpServer;
