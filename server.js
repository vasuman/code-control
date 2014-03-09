var express = require('express'),
fs = require('fs'),
linter = require('./common/lint'),
app = express(),
mongoose = require('mongoose'),
models = require('./models'),
passport = require('passport'),
http = require('http'),
path = require('path'),
helpers = require('express-helpers')(app),
PragyanStrategy = require('./auth/pragyan').PragyanStrategy,
verifyCookie = require('./auth/verify').verifyCookie;

app.set('port', process.env.PORT || 8000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));


app.use(express.static(path.join(__dirname, 'static')));
app.use(express.cookieParser());

/* DEBUG */
app.use(express.session({ secret: 'salkfjhalskjdasdfjhakj' }));
/* END DEBUG */

app.use(express.urlencoded());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

app.locals.format_date_t = function(d) {
    return d.toDateString() + '    ' + d.toTimeString().split(' ')[0];
}
app.locals.valify = function(x, oc) {
    var res = [];
    x.forEach(function(ch, i) {
        if(Math.abs(oc.experience - ch.experience) > EXP_DIFF) {
            return;
        }
        res.push(new SelectOption(ch.name, i));
    });
    return res;
}
app.locals.find_char_id = function(id, chars) {
    var i;
    for(i = 0; i < chars.length; i++) {
        if(chars[i]._id.equals(id)) {
            return chars[i].name;
        }
    }
    return '_';
}
function SelectOption(text, value) {
    this.text = text;
    this.value = value;
}

app.use(express.errorHandler());

/* DATA REGION */
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/code';
const DEFAULT_CODE = 'function update(params) {\n // TODO: insert code here\n}';
const ALLOWED_CHARS = [ new SelectOption('Warrior', 'warrior') ];
const DEF_LVL = [
    new SelectOption('Battle', 'battle')
];
const START_EXP = 10;
const START_LVL = 1;
const TRAIN_DEF = [
    // new SelectOption('Simple', 'simple'),
    // new SelectOption('Boss', 'boss'),
    new SelectOption('Swarm', 'swarm')
];
const EXP_DIFF = 75;
const EXP_GAIN = 15;
const DEF_MAP = [
    new SelectOption('Simple', 'base.json'),
    new SelectOption('Maze', 'maze.json')
];

var swarmChar = {
    id: -1,
    code: '',
    getHealth: function() { return 30; },
    getAttack: function() { return 5; }
}

function loadData() {
    function doneFRead(file, val, key) {
        return function(err, d) {
            if(err) {
                throw err;
            }
            val.pop()[key.pop()] = d;
            if(file.length > 0) {
                fs.readFile(file.pop(), doneFRead(file, val, key));
            } else {
                setImmediate(startServer);
            }
        }
    }
    fs.readFile('./simulation/swarm-code.js', { encoding: 'utf8' }, doneFRead([], [swarmChar], ['code']))
}
/* END DATA */

function simErr(req, res) { }

function doLogout(req, res) {
    req.logout();
    return res.redirect('/');
}
function isValidMap(map) {
    var i;
    for(i = 0; i < DEF_MAP.length; i++) {
        if(map == DEF_MAP[i].value) {
            return true;
        }
    }
    return false;
}

function doTrain(req, res) {
    var char, jsonPath;
    function charFound(ch) {
        char = ch;
        if(!(req.user) || !(char.owner.equals(req.user._id))) {
            return res.redirect('/not_permit');
        }
        if(!isValidMap(req.body.map)) {
            return res.redirect('/404');
        }
        jsonPath = path.join('./simulation', req.body.map);
        if(req.body.level == 'swarm') {
            var SwarmLevel = require('./simulation/level').SwarmTraining;
            new SwarmLevel(char, swarmChar, jsonPath, simDoneCb);
        } else {
            return res.redirect('/404');
        }
    }
    function simDoneCb(err, r) {
        if(err) {
            console.log(err, r);
            return res.send(err);
        }
        console.log(r);
        var m = new models.Match({
            contenders: [char],
            type: 'train',
            map: jsonPath,
            when: Date.now(),
            result: r.score,
            replay: r.replay
        });
        m.save(function(err) {
            if(err) {
                throw err;
            }
            char.matches.push(m._id);
            char.experience += r.score;
            char.save(function(err) {
                if(err) {
                    throw err;
                }
                res.redirect('/m/' + m._id);
            });
        });
    }
    getChar(req.params.cname, charFound);
}

function challenge(req, res) {
    var charA, charB, jsonPath;
    function charFound(ch) {
        charA = ch;
        if(!(req.user)) {
            return res.redirect('/not_permit');
        }
        charB = req.user.chars[req.body.uchar];
        if(!charB) {
            return res.redirect('/not_permit');
        }
        if(!isValidMap(req.body.map)) {
            return res.redirect('/404');
        }
        if(Math.abs(charA.experience - charB.experience) > EXP_DIFF) {
            return res.redirect('/not_permit');
        }
        jsonPath = path.join('./simulation', req.body.map);
        if(req.body.level == 'battle') {
            var BattleLevel = require('./simulation/level').BattleLevel;
            new BattleLevel(charA, charB, jsonPath, simDoneCb);
        } else {
            return res.redirect('/404');
        }
    }
    function simDoneCb(err, r) {
        if(err) {
            console.log(err, r);
            var reason = ''
            if(r == 1) {
                reason = 'Error in your code - ';
            } else {
                reason = 'Error in other character code - ';
            }
            return res.send(reason + err);
        }
        console.log(r);
        var m = new models.Match({
            contenders: [charA, charB],
            type: 'versus',
            map: jsonPath,
            when: Date.now(),
            result: r.winner,
            replay: r.replay
        });
        if(r.winner == charA._id) {
            charA.experience += EXP_GAIN;
        } else if(r.winner = charB._id) {
            charB.experience += EXP_GAIN;
        }
        m.save(function(err) {
            if(err) {
                throw err;
            }
            charA.matches.push(m._id);
            charA.save(function(err) {
                if(err) {
                    throw err;
                }
                charB.matches.push(m._id);
                charB.save(function(err) {
                    if(err) {
                        throw err;
                    }
                    res.redirect('/m/' + m._id);
                });
            });
        });
    }
    getChar(req.params.cname, charFound);
}

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
    res.render('404.ejs', { user: req.user });
    res.status(404);
}

function noLogin(req, res) {
    if(req.user) {
        return res.redirect('/');
    }
    res.render('nologin.ejs', { user: null });
}

function unAuth(res, req) {
    res.render('unauth.ejs', { user: req.user });
    res.status(401);
}

function matchPage(req, res) {
    var match;
    function fileLoaded(err, d) {
        if(err) {
            throw err;
        }
        res.render('match', { map: d, user: req.user, match: match });
    }
    function foundMatch(err, m) {
        if(err) {
            throw err;
        }
        match = m;
        if(!match) {
            return res.redirect('/404');
        }
        fs.readFile(match.map, fileLoaded);
    }
    models.Match.findById(req.params.mid).
        populate('contenders').
        exec(foundMatch);
}
function userPage(req, res) {
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
        var id = parseInt(req.params.pid);
        if(isNaN(id)) {
            throw new Error('NaN');
        }
    } catch(e) {
        return notFound(req, res);
    }
    models.User.findOne({ pid: id }).
        populate('chars').
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
    models.User.findOne({ pid: pid }).populate('chars').exec(init);
}

passport.serializeUser(getUserId);
passport.deserializeUser(initUserId);

var authHandle = passport.authenticate('pragyan', {
    successRedirect: '/', 
    failureRedirect: '/login_failed'
});

function charPage(req, res) {
    function charFindCb(err, char) {
        if(err) {
            throw err;
        }
        if(!char) {
            res.redirect('/404');
        }
        res.render('info_char', { user: req.user, char: char, allowed_maps: DEF_MAP, train_level: TRAIN_DEF, vs_level: DEF_LVL });
    }
    models.Character.findOne({ name: req.params.cname }).
        populate('owner').
        populate('matches').
        exec(charFindCb);
}

function createCharPage(req, res) {
    if(!req.user) {
        return res.redirect('/login?redirect=create');
    }
    res.render('create_char', { 
        user: req.user, 
        allowed_types: ALLOWED_CHARS, 
        err: req.query.err
    });
}

function createChar(req, res) {
    function saveChar(err, char) {
        function appendUser(err) {
            if(err) {
                throw err;
            }
            res.redirect('/c/' + char.name);
        }
        if(err) {
            throw err;
        }
        req.user.chars.push(char._id);
        req.user.save(appendUser);
    }
    function sameName(err, char) {
        if(err) {
            throw err;
        }
        if(char) {
            res.redirect('/char/create?err=2');
            return;
        }
        var c = new models.Character({
            owner: req.user._id,
            type: params.type,
            name: params.name,
            creation: Date.now(),
            edited: Date.now(),
            passed: false,
            experience: START_EXP,
            level: 1,
            code: DEFAULT_CODE,
            matches: []
        });
        c.save(saveChar);
    }
    if(!req.user) {
        return res.redirect('/login_failed');
    }
    var params = req.body;
    if(!('name' in params) || !('type' in params)) {
        return res.redirect('/404');
    }
    if(!params.name.match(/^[a-z0-9]{5,15}$/)) {
        return res.redirect('/char/create?err=1');
    }
    models.Character.findOne({ name: params.name }, sameName);
}

function getChar(name, cb, res) {
    function findChar(err, char) {
        if(err) {
            throw err;
        }
        if(!char) {
            res.redirect('/404');
        }
        cb(char);
    }
    models.Character.findOne({ name: name }, findChar);
}
function saveChar(req, res) {
    var errs;
    function doneSave(err) {
        if(err) {
            throw err;
        }
        if(errs.length > 0) {
            return res.json({ status: 2, errors: errs });
        }
        return res.json({ status: 0 });
    }
    function doSave(char) {
        if(!req.user || !char.owner.equals(req.user._id)) {
            return res.redirect('/login_failed');
        }
        /* DATA REGION */
        errs = linter.process(req.body.code, require('./simulation/api'), ['update']);
        /* END DATA */
        char.code = req.body.code;
        char.passed = (errs.length == 0);
        char.save(doneSave);
    }
    if(!req.body.code) {
        return res.json({ status: 1 });
    }
    getChar(req.params.cname, doSave, res);
}

function codePage(req, res) {
    function renderCode(char) {
        if(!req.user || !char.owner.equals(req.user._id)) {
            return res.redirect('/login_failed');
        }
        res.render('edit_char', { user: req.user, char: char });
    }
    getChar(req.params.cname, renderCode, res);
}

function leaderboard(req, res) {
    var start = parseInt(req.query.from) || 0;
    function qCback(err, chars) {
        if(err) {
            throw err;
        }
        res.render('leaderboard', { user: req.user, topChars: chars, from: start });
    }
    models.Character.find().sort({ experience: -1 }).skip(start).limit(100).exec(qCback);
}

function notPermit(req, res) {
    return res.send('Not permitted!');
}
app.get('/', renderPage('index'));
app.get('/login', authHandle);
app.get('/logout', doLogout);
app.get('/m/:mid', matchPage);
app.get('/u/:pid', userPage);
app.get('/c/:cname', charPage);
app.get('/c/:cname/edit', codePage);
app.get('/char/create', createCharPage);
app.get('/login_failed', noLogin);
app.get('/not_permit', notPermit);
app.get('/leaderboard', leaderboard);
app.post('/char/params', createChar);
app.post('/c/:cname/train', doTrain);
app.post('/c/:cname/challenge', challenge);
app.post('/c/:cname/save', saveChar);
app.get('*', notFound);

function startServer() {
    var server = http.createServer(app);
    server.listen(app.get('port'));
}

function logQuit(err) {
    console.error('MongoDB conn. error: ' + err);
    process.exit(3);
}

function connMongo() {
    mongoose.connect(MONGO_URL);
    mongoose.connection.once('open', loadData);
    mongoose.connection.on('error', logQuit);
}

/* DEBUG */
connMongo();
/* END DEBUG */
