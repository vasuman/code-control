var express = require('express'),
app = express(),
http = require('http'),
path = require('path');

app.set('port', process.env.PORT || 8000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
function matchPage(req, res) {
    res.render('match.ejs', {});
}
function getIndex(req, res) {
    res.render('index.ejs', {});
}
app.get('/', getIndex);
app.get('/match', matchPage);

var server = http.createServer(app);
server.listen(app.get('port'));
