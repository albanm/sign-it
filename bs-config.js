module.exports = {
  ui: {
    port: 5603,
    weinre: {
      port: 5604
    }
  },
  files: ['public/bundles/*'],
  watchOptions: {},
  server: false,
  proxy: 'localhost:5601',
  port: 5602,
  startPath: '/'
}
