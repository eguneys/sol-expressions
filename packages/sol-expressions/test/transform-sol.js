const babelJest = require('babel-jest').default

module.exports = babelJest.createTransformer({
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
  plugins: [
    [
      "babel-plugin-transform-rename-import",
      {
        original: "rxcore",
        replacement: __dirname + "/core"
      }
    ],
    ["babel-plugin-jsx-sol-expressions", { moduleName: "../../src/client" }]
  ]
})
