const inquirer = require('inquirer')

function remove(name) {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'confirm',
					message: `请确定是否删除改${name}文件夹`,
					name: 'key',
					default: true,
				},
			])
			.then((answer) => {
				// 用户输入的结果最终会在这里输出
				resolve(answer.key)
			})
			.catch(() => {})
	})
}

module.exports = {
	remove,
}
