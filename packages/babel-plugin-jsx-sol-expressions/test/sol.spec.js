const path = require('path')
const pluginTester = require('babel-plugin-tester').default
const plugin = require('../index')

pluginTester({
  plugin,
  pluginOptions: {
    moduleName: 'r-sol'
  },
  title: 'Convert JSX',
  fixtures: path.join(__dirname, '__sol_fixtures__'),
  snapshot: true
})
