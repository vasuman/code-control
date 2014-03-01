var ecstatic = require('ecstatic')(__dirname)
var http = require('http')
var URL = require('url')

var bundle = require('./build')({
    minify: false
  , debug: true
  , transforms: []
})

var rework = require('./rework')({
  debug: true
})

http.createServer(function(req, res) {
  var url = URL.parse(req.url).pathname

  if (url === '/bundle.js') return liveBundle(req, res)
  if (url === '/style.css') return liveStyles(req, res)

  ecstatic(req, res, function(err) {
    res.statusCode = 404
    res.end('404 not found :(')
  })
}).listen(9966, function() {
  console.log('listening on http://localhost:9966')
})

function liveBundle(req, res) {
  res.setHeader('Content-Type', 'application/javascript')
  bundle().pipe(res)
}

function liveStyles(req, res) {
  res.setHeader('Content-Type', 'text/css')
  rework().pipe(res)
}
