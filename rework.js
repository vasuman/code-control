var autoprefixer = require('autoprefixer')
var rwnpm = require('rework-npm')
var clean = require('clean-css')
var through = require('through')
var rework = require('rework')
var path = require('path')
var noop = (function(){})
var fs = require('fs')

module.exports = createStyles

function createStyles(options) {
  var count = 0

  return function() {
    var label = 'stylus build #' + count++
    var main = __dirname + '/css/index.css'
    var out = through(noop)

    console.time(label)
    fs.readFile(main, 'utf8', function(err, data) {
      if (err) return out.emit('error', err)

      data = autoprefixer.compile(
        rework(data)
          .use(rwnpm(path.dirname(main)))
          .use(rework.colors())
          .use(rework.references())
          .toString()
      )

      if (!options.debug) data = (new clean).minify(data, {
          processImport: false
        , noRebase: true
      })

      out.queue(data)
      out.queue(null)
      console.timeEnd(label)
    })

    return out
  }
}
