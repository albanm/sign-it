const config = require('config')
const express = require('express')
const path = require('path')

let app = module.exports = express()
if (process.env.NODE_ENV === 'development') app.set('json spaces', 2)

// Static routing
const oneWeek = 7 * 24 * 60 * 60
const staticOptions = {
  setHeaders: (res) => {
    // 'private' so that it doesn't get store in the reverse proxy's cache
    res.set('cache-control', 'private, max-age=' + oneWeek)
  }
}
app.use('/bundles', express.static(path.join(__dirname, '../public/bundles'), staticOptions))
// app.use('/assets', express.static(path.join(__dirname, '../public/assets'), staticOptions))

app.use('/*', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=600')
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

app.listen(config.port, (err) => {
  if (err) {
    console.error('Could not run server : ', err.stack)
    throw err
  }
  console.log('Listening on http://localhost:%s', config.port)
    // Emit this event for the test suite
  app.emit('listening')
})
