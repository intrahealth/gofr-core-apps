module.exports = {
  runtimeCompiler: true,

  devServer: {
    proxy: {
      '^/dictionary': {
        target: 'http://localhost:4000/',
        logLevel: 'debug'
      },
      '^/auth': {
        target: 'http://localhost:4000/',
        logLevel: 'debug'
      },
      '^/config': {
        target: 'http://localhost:4000/',
        logLevel: 'debug'
      }
    }
  },
  publicPath: '/gofrapp/dictionary/',
  transpileDependencies: ['vuetify']
}
