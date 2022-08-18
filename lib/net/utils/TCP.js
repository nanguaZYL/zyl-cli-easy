const net = require("net");
const crypto = require("crypto");
const os = require("os");

/**
 * 获取当前机器的ip地址
 */
function getIpAddress() {
  var ifaces = os.networkInterfaces();
  for (var dev in ifaces) {
    let iface = ifaces[dev];
    for (let i = 0; i < iface.length; i++) {
      let { family, address, internal } = iface[i];
      if (family === "IPv4" && address !== "127.0.0.1" && !internal) {
        return address;
      }
    }
  }
}

const Address = getIpAddress() || "127.0.0.1";

const publicKey =
  "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCWAX9+7stLFV8sW2zA470M8b/5\nHt1FgkpGIVHfHvjIxh3k/APVfWlXpoN6lKIDQ/z4LZc+m03faeR/qjgl562W0sHQ\nDezv/cd84Uc2hDh/vTifL6RfNA7mrW3aqiVxT4gzvp327nzck/J/mzfVFyEgFb+z\nWsvr0xMkg+NNXMww8wIDAQAB\n-----END PUBLIC KEY-----\n";

// RSA 公钥加密
function publicEncrypt(pubKey, message) {
  return crypto.publicEncrypt(pubKey, Buffer.from(message, "utf8"));
}

class NatClient {
  constructor(ip, port, usedCallBack) {
    this.ip = ip;
    this.port = port;
    this.usedCallBack = usedCallBack;
  }
  run(ip, port, natAddress, passwords, rate) {
    let startNatRead;
    let interval;
    this.socket = net
      .createConnection(port, ip)
      .on("connect", () => {
        // console.log(this.index + "--connect--");
        this.socket.write(
          publicEncrypt(publicKey, natAddress + "-" + passwords)
        );
        interval = setInterval(() => {
          let array = new Uint8Array(1);
          array[0] = 1;
          this.socket.write(array);
        }, rate);
      })
      .on("data", (data) => {
        if (startNatRead) {
          this.onRelData(data);
        } else {
          if (data.indexOf(2) != -1) {
            console.log("config error or port used");
            process.exit(0);
          }
          let dataIndex = data.indexOf(1);
          if (dataIndex == -1) {
            // console.log(`mockDataLength2: ${data.length}`);
          } else {
            startNatRead = true;
            if (this.usedCallBack) {
              this.usedCallBack();
              delete this.usedCallBack;
            }
            clearInterval(interval);
            let array = new Uint8Array(1);
            array[0] = 0;
            this.socket.write(array);
            let relData = data.subarray(dataIndex + 1);
            if (relData.length) {
              this.onRelData(relData);
            } else {
              // console.log(`relData is empty`);
              //尽快建立连接
              this.onRelData(relData);
            }
          }
        }
      })
      .on("error", (err) => {
        console.log("NatClient error " + err);
        this.stop(err);
      })
      .on("end", this.stop.bind(this));
    return this;
  }
  onRelData(relData) {
    // console.log(`relData: ${relData}`);
    if (!this.portForwardSocket) {
      this.paddingData = relData;
      this.portForwardSocket = net
        .createConnection(this.port, this.ip)
        .on("connect", () => {
          // console.log(this.index + "--connect2--");
          if (this.paddingData.length) {
            this.portForwardSocket.write(this.paddingData);
          }
          this.portForwardSocket.pipe(this.socket);
          delete this.paddingData;
        })
        .on("error", (err) => {
          console.log("portForwardSocket error " + err);
          this.stop2(err);
        })
        .on("end", this.stop2.bind(this));
    } else {
      if (this.paddingData) {
        if (this.paddingData.length) {
          //todo 需要防止内存溢出???
          Buffer.concat(this.paddingData, relData);
        } else {
          this.paddingData = relData;
        }
      } else {
        this.portForwardSocket.write(relData);
      }
    }
  }
  stop(error) {
    if (this.usedCallBack) {
      this.usedCallBack(error);
      delete this.usedCallBack;
    }
    if (this.portForwardSocket) {
      this.portForwardSocket.destroy();
    }
  }
  stop2(error) {
    this.socket.destroy();
  }
}
let errorCounts = {};

function startNat(port, address, index) {
  //需要转发的address(客户端可以访问的任意地址)
  new NatClient(address, port, (error) => {
    if (!error) {
      errorCounts[index] = 0;
      process.nextTick(() => {
        startNat(port, address, index);
      });
    } else {
      errorCounts[index] = errorCounts[index] + 1;
      //   console.log(`${errorCounts[index]}--------------- ${error}`);
      console.log(error);
      setTimeout(() => {
        startNat(port, address, index);
      }, errorCounts[index] * 1000);
    }
    //服务器提供服务的address,请求服务器映射的address,密码,心跳间隔
  }).run("110.40.226.129", 8080, ":9901", "yzh", 3000).index = index;
}

async function OpenTCP(port, address = Address) {
  for (let i = 0; i < 10; i++) {
    errorCounts[i] = 0;
    startNat(port, address, i);
  }
  console.log("外网地址:  http://110.40.226.129:9901");
}

module.exports = OpenTCP;
