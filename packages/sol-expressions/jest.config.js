module.exports = {
  projects: [{
    displayName: "browser",
    testMatch: ["<rootDir>/test/sol/*.spec.js(x)?"],
    transform: {
      "^.+\\.[t|j]sx?$": require.resolve("./test/transform-sol")
    }
  }
  ]
}
