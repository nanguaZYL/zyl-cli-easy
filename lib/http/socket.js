const crypto = require("crypto");

class WebSocket {
  constructor(server) {
    this.WebServer = server;
    this.index = 0;
    this.socketList = [];
    this.init();
  }
  init() {
    this.WebServer.on("upgrade", (req, socket, upgradeHead) => {
      let socketCase = new Socket({ req, socket, upgradeHead }, ++this.index);
      this.socketList.push(socketCase);
      const removeSocket = () => {
        let id = socketCase.id;
        this.socketList = this.socketList.filter((v) => v.id != id);
      };
      // 将异常socket实例移除
      socketCase.on("error", removeSocket);
      socketCase.on("end", removeSocket);
      // connection
      socketCase.send("connection");
    });
  }
  reload() {
    this.socketList.forEach((socket) => {
      socket.send("reload");
    });
  }
}

class Socket {
  constructor({ req, socket, upgradeHead }, id) {
    socket.id = id;
    const head = Buffer.alloc(upgradeHead.length);
    upgradeHead.copy(head);
    let key = req.headers["sec-websocket-key"];
    let shasum = crypto.createHash("sha1");
    const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"; //协议中规定的校验用GUID,这是算法中要用到的固定字符串
    key = shasum.update(`${key}${GUID}`).digest("base64");
    let headers = [
      "HTTP/1.1 101 Web Socket Protocol Handshake",
      "Upgrade: websocket",
      "Connection: Upgrade",
      "Sec-Websocket-Accept: " + key,
    ];
    socket.setNoDelay(true);
    socket.write(headers.concat("", "").join("\r\n"));
    socket.send = function (message) {
      message = String(message);
      var length = Buffer.byteLength(message);
      // 数据的起始位置，如果数据长度16位也无法描述，则用64位，即8字节，如果16位能描述则用2字节，否则用第二个字节描述
      var index = 2 + (length > 65535 ? 8 : length > 125 ? 2 : 0);
      // 定义buffer，长度为描述字节长度 + message长度
      var buffer = Buffer.alloc(index + length);
      // 第一个字节，fin位为1，opcode为1
      buffer[0] = 129;
      // 因为是由服务端发至客户端，所以无需masked掩码
      if (length > 65535) {
        buffer[1] = 127;
        // 长度超过65535的则由8个字节表示，因为4个字节能表达的长度为4294967295，已经完全够用，因此直接将前面4个字节置0
        buffer.writeUInt32BE(0, 2);
        buffer.writeUInt32BE(length, 6);
      } else if (length > 125) {
        buffer[1] = 126;
        // 长度超过125的话就由2个字节表示
        buffer.writeUInt16BE(length, 2);
      } else {
        buffer[1] = length;
      }
      // 写入正文
      buffer.write(message, index);
      socket.write(buffer);
    };
    return socket;
  }
}

module.exports = WebSocket;
