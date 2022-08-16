const net = require('net')
let port = 5000
let max = 1000
let sub = 0

// 检测端口是否被占用
function portIsOccupied() {
  return new Promise((resolve) => {
    // 创建服务并监听该端口
    const server = net.createServer().listen(port, '0.0.0.0')
    server.on('listening', function () {
      // 执行这块代码说明端口未被占用
      server.close() // 关闭服务
      resolve(port)
    })
    server.on('error', function (err) {
      port++
      server.close()
      resolve()
    })
  })
}

async function getPort() {
  return new Promise(async (resolve) => {
    let flag = true
    while (flag) {
      let res = await portIsOccupied()
      if (res) flag = false
      sub++
      // 添加边界
      if (sub > max) {
        flag = false
        port = 0
      }
    }
    resolve(port)
  })
}

const portUsed = (port) => {
  return new Promise((resolve, reject) => {
    let server = net.createServer().listen(port)
    server.on('listening', function () {
      server.close()
      resolve(port)
    })
    server.on('error', function (err) {
      if (err.code == 'EADDRINUSE') {
        resolve(err)
      }
    })
  })
}

const tryUsePort = async function (port, portAvailableCallback) {
  let res = await portUsed(port)
  if (res instanceof Error) {
    console.log(`端口：${port}被占用`)
    port++
    tryUsePort(port, portAvailableCallback)
  } else {
    portAvailableCallback(port)
    return port
  }
}

const choosePort = ({ port }) => {
  return new Promise((resolve, reject) => {
    tryUsePort(port, function (port) {
      // do something ...
      console.log(`端口：${port}可用`)
      // net.createServer().listen(port);
      resolve(port)
    })
  })
}

module.exports = {
  getPort,
  choosePort,
}
