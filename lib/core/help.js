const program = require('commander')
const helpOptions = () => {
	// 增加自己的options
	program.option(
		'-v --version',
		`该脚手架的版本号为${require('../../package.json').version}`
	)

	// 监听
	// program.on('--help', function () {
	// 	console.log('')
	// 	console.log('Others:')
	// 	console.log('  other options~')
	// })
	// program.on('create', () => {
	// 	console.log('准备创建项目中!')
	// })
}

module.exports = helpOptions
