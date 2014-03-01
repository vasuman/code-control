var browserify = require('watchify')

module.exports = createBundler

function createBundler(options) {
  var transforms = options.transforms || []
  var minify = options.minify
  var debug = options.debug
  var count = 0

  if (minify) {
    transforms.push('uglifyify')
  }

  var bundler = browserify({
    entries: [__dirname + '/src/index.js']
    , debug: debug
    , insertGlobals: debug
  })

  transforms.forEach(function(tr) {
    bundler.transform(tr)
  })

  return function() {
    var label = 'browserify build #' + count++
    console.time(label)

    return bundler.bundle().once('end', function() {
      console.timeEnd(label)
    })
  }
}
