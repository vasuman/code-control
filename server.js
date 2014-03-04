var express = require('express'),
app = express(),
mongoose = require('mongoose'),
models = require('./models'),
passport = require('passport'),
http = require('http'),
path = require('path'),
PragyanStrategy = require('./auth/pragyan').PragyanStrategy,
verifyCookie = require('./auth/verify').verifyCookie;

const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/code';

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


function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

function notFound(req, res) {
    res.render('404.ejs', {});
    res.status(404);
}

function noLogin(req, res) {
    res.render('nologin.ejs', {});
    res.status(401);
}

function userPage(req, res, id) {
    function buildOther(err, user) {
        if(err) {
            throw err;
        }
        if(!user) {
            return notFound(req, res);
        }
        res.render('user', { user: req.user, other: user });
    }
    try {
        var id = parseInt(req.params.id);
    } catch(e) {
        return notFound(req, res);
    }
    models.User.findOne({ pid: id }).
        populate('chars').
        populate('matches').
        exec(buildOther);
}
passport.use(new PragyanStrategy(verifyCookie));
function renderPage(page) {
    return function(req, res) {
        res.render(page, { user: req.user });
    }
}

function getUserId(user, done) {
    if(!user || !user.pid) {
        return done(new Error('No PID'));
    }
    done(null, user.pid);
}

function initUserId(pid, done) {
    function ret(user) {
        return function(err) {
            if(err) {
                return done(err);
            }
            done(null, user);
        }
    }
    function init(err, res) {
        if(err) {
            return done(err);
        }
        if(res) {
            return done(null, res);
        }
        var user = new models.User({
            pid: pid,
            points: 0,
            chars: []
        });
        user.save(ret(user));
    }
    models.User.findOne({ pid: pid }, init)
}

passport.serializeUser(getUserId);
passport.deserializeUser(initUserId);

var authHandle = passport.authenticate('pragyan', {
    successRedirect: '/', 
    failureRedirect: '/exit'
});
app.get('/', renderPage('index'));
app.get('/auth', authHandle);
app.get('/match', renderPage('match'));
app.get('/u/:id', userPage);
app.get('*', notFound);

function startServer() {
    var server = http.createServer(app);
    server.listen(app.get('port'));
}

function logQuit(err) {
    console.error('MongoDB conn. error: ' + err);
    process.exit(3);
}

mongoose.connect(MONGO_URL);
mongoose.connection.once('open', startServer);
mongoose.connection.on('error', logQuit);
