const compressing = require("compressing");
const path = require("path");

/**
 * 压缩文件夹
 * @param {*} fileName 需要压缩的文件夹名
 * @param {*} zip 压缩后的文件夹名
 * @returns
 */
const compressDir = function (fileName, zip) {
  return new Promise((resolve) => {
    compressing.zip
      .compressDir(fileName, zip)
      .then((res) => {
        resolve();
      })
      .catch(resolve);
  });
};

/**
 * 解压文件夹
 * @param {*} unzipFile 需要解压的zip文件
 * @param {*} fileName 解压后的zip文件
 * @returns
 */
const uncompress = function (unzipFile, fileName) {
  return new Promise((resolve) => {
    compressing.zip
      .uncompress(unzipFile, fileName)
      .then((res) => {
        resolve();
      })
      .catch((err) => {
        resolve(err);
      });
  });
};
// 压缩文件
// compressing.zip
//   .compressFile("./test.js", "test.zip")
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

module.exports = {
  compressDir,
  uncompress,
};
