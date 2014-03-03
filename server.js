var express = require('express'),
app = express(),
passport = require('passport'),
http = require('http'),
path = require('path'),
PragyanStrategy = require('./strategy/pragyan').PragyanStrategy;

app.set('port', process.env.PORT || 8000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));
/* DEBUG */
app.use(express.logger('dev'));
/* END DEBUG */
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.cookieParser());
/* DEBUG */
app.use(express.session({ secret: 'this shit sucks balls' }));
/* END DEBUG */
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
/* DEBUG */
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
/* END DEBUG */
function verify(sessionID, done) {
    done(null, {name: 'hi'});
}
passport.use(new PragyanStrategy(verify));
function matchPage(req, res) {
    res.render('match.ejs', {user: {name: 'haha'}});
}
function getIndex(req, res) {
    res.render('index.ejs', {user: {name: 'haha'}});
}
var authHandle = passport.authenticate('pragyan', {
    successRedirect: '/', 
    failureRedirect: '/exit'
});
app.get('/', getIndex);
app.get('/login', authHandle);
app.get('/match', matchPage);

var server = http.createServer(app);
server.listen(app.get('port'));
