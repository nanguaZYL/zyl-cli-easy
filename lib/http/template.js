module.exports = {
  socket: `
  <script type="text/javascript">
  if ("WebSocket" in window) {
    (function () {
        var protocol = window.location.protocol === "http:" ? "ws://" : "wss://";
        var address =
            protocol + window.location.host;
        var socket = new WebSocket(address + '/socket-js/io');
        socket.onmessage = function (msg) {
            if (msg.data == "reload") window.location.reload();
        };
    })();
} else {
    console.error('hot reload is fail');
}
  </script>
  </body>
  `,
  empty: `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
  <script type="text/javascript">
  if ("WebSocket" in window) {
    (function () {
        var protocol = window.location.protocol === "http:" ? "ws://" : "wss://";
        var address =
            protocol + window.location.host;
        var socket = new WebSocket(address + '/socket-js/io');
        socket.onmessage = function (msg) {
            if (msg.data == "reload") window.location.reload();
        };
    })();
} else {
    console.error('hot reload is fail');
}
  </script>
  </body>
  </html>`,
};
