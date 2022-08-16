const fs = require('fs')
const path = require('path')
const util = require('util')
const stat = util.promisify(fs.stat)

const readdir = util.promisify(fs.readdir) //判断文件类型下面的文件
const rmdir = util.promisify(fs.rmdir) //删除目录
const unlink = util.promisify(fs.unlink) //删除文件

async function removeDir(p) {
	let statObj = await stat(p)
	if (statObj.isDirectory()) {
		let dirs = await readdir(p)
		dirs = dirs.map((dir) => path.join(p, dir))
		dirs = dirs.map((dir) => removeDir(dir))
		await Promise.all(dirs)
		await rmdir(p)
	} else {
		// 要等待文件删除后 才让promise执行完 所以需要await
		await unlink(p)
	}
}

async function changeJsonName(pathName, name) {
	return new Promise(async (resolve) => {
		let data = fs.readFileSync(pathName, 'utf-8')
		let obj = JSON.parse(data)
		obj.name = name
		let str = JSON.stringify(obj, '', '\t')
		fs.writeFile(pathName, str, 'utf-8', function (err) {
			resolve(!err)
		})
	})
}

module.exports = {
	removeDir,
	changeJsonName,
}
