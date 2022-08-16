const fs = require("fs");
const WebSocket = require("./socket");

class Watcher {
  constructor(WebServer, path) {
    this.WebServer = new WebSocket(WebServer);
    this.timer;
    fs.watch(path, { recursive: true }, (eventType, filename) => {
      this.throttle();
    });
  }
  throttle() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.WebServer.reload();
    }, 300);
  }
}

module.exports = Watcher;
