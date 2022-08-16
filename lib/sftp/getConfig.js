const path = require("path");
const fs = require("fs");

module.exports = function () {
  const pathName = path.join(process.cwd(), "./zyl.config.js");
  if (!fs.existsSync(pathName)) return false;
  return pathName;
};
