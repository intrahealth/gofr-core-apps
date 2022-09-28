module.exports = {
  runtimeCompiler: true,

  devServer: {
    proxy: {
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
  publicPath: '/gofrapp/app-name/',
  transpileDependencies: ['vuetify']
}
