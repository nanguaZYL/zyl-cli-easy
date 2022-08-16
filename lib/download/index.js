const request = require("request");

function downloadFile(url, stream) {
  return new Promise((reslove) => {
    request(url)
      .pipe(stream)
      .on("close", function (err) {
        reslove(!err);
      });
  });
}

module.exports = {
  downloadFile,
};
