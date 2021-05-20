module.exports = {
  devServer: {
    proxy: 'http://localhost:8080'
  },

  transpileDependencies: [
    'vuetify'
  ]
}
