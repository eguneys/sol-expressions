const babelJest = require('babel-jest').default

module.exports = babelJest.createTransformer({
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
  plugins: [
    [
      "babel-plugin-transform-rename-import",
      {
        replacements: [
          {
            original: "rxcore",
            replacement: __dirname + "/core"
          },
          {
            original: 'ex/soli2d',
            replacement: 'soli2d'
          }
        ]
      }
    ],
    ["babel-plugin-jsx-sol-expressions", { moduleName: "../../src/client" }]
  ]
})
