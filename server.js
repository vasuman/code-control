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
verifyCookie = require('./auth/verify').verifyCookie,
markdown = require( "marked" );

app.set('port', process.env.PORT || 8000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));


app.use(express.static(path.join(__dirname, 'static')));
app.use(express.cookieParser());

/* DEBUG */
app.use(express.session({ secret: 'lfaskdjhflasjdkfskdfjhl' }));
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
        if(!isRested(ch)) {
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
const DEFAULT_ATTACK_CODE = 'function attack(params) {\n // TODO: insert attack code here\n}';
const DEFAULT_DEFEND_CODE = 'function defend(params) {\n // TODO: insert defend code here\n}';
const ALLOWED_CHARS = [ new SelectOption('Warrior', 'warrior') ];
const DEF_LVL = [ new SelectOption('Battle', 'battle') ];
const START_EXP = 10;
const START_LVL = 1;
const TRAIN_DEF = [ new SelectOption('Swarm', 'swarm') ];
const EXP_DIFF = 50;
const EXP_GAIN = 14;
const MIN_EXP_GAIN = 1;
const MAX_PLAYS = 40;
const DEF_MAP = [
    new SelectOption('Maze', 'maze.json'),
    new SelectOption('Simple', 'base.json'),
    new SelectOption('Blub', 'blub.json'),
    new SelectOption('Glob', 'glob.json'),
    new SelectOption('Jimk', 'jimk.json')
];

const REST_INTERVAL = 1000 * 120;

var swarmChar = {
    id: -1,
    code: '',
    getHealth: function() { return 30; },
    getAttack: function() { return 5; }
}

var ALLOWED_PIDS = {};

function loadPIDs() {
    function fRead(err, d) {
        if(err) {
            throw err;
        }
        ALLOWED_PIDS = JSON.parse(d);
        loadData();
    }
    fs.readFile('./pids.json', {encoding: 'utf8'}, fRead);
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

function isRested(char) {
    return (Date.now() - char.lastPlayed) > REST_INTERVAL
}
app.locals.isRested = isRested;

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

		//ASH : REMEMBER TO REMOVE
		//
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
        var m = new models.Match({
            contenders: [char],
            type: 'train',
            map: r.map,
            when: Date.now(),
            result: r.score,
            replay: r.replay
        });
        m.save(function(err) {
            if(err) {
                throw err;
            }
            char.matches.push(m._id);
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

function isPlaying(match, char) {
    if(match.type != 'versus' || match.result == null) {
        return false;
    }
    var i;
    for(i = 0; i < match.contenders.length; i++) {
        if(match.contenders[i].equals(char)) {
            return true;
        }
    }
    return false;
}

function playedAgainst(userA, userB) {
    var x = 0;
    userA.chars.forEach(function(charA) {
        userB.chars.forEach(function(charB) {
            x += getMatchesBetween(charA, charB);
        });
    });
    return x;
}

function getMatchesBetween(charA, charB) {
    var count = 0;
    charA.matches.forEach(function(match) {
        if(isPlaying(match, charB)) {
            count += 1;
        }
    });
    return count;
}

function challenge(req, res) {
    var charA, charB, jsonPath, payoff;
    function charFound(err, ch) {
        if(err) {
            throw err;
        }
        if(!ch) {
            return res.redirect('/404');
        }
        charA = ch;
        if(!(req.user)) {
            return res.redirect('/not_permit');
        }
        charB = req.user.chars[req.body.uchar];
        if(!charB) {
            return res.redirect('/not_permit');
        }
        if(Math.abs(charB.experience - charA.experience) > EXP_DIFF) {
            return res.redirect('/not_permit');
        }
        if(!isRested(charB)) {
            return res.redirect('/not_permit');
        }
        var map = DEF_MAP[~~(Math.random() * DEF_MAP.length)].value,
        numPlays = playedAgainst(req.user, charA.owner);
        payoff = Math.max(~~(EXP_GAIN * Math.pow(0.7, numPlays)), MIN_EXP_GAIN);
        if(numPlays > MAX_PLAYS) {
            payoff = 0;
        }
        jsonPath = path.join('./simulation', map);
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
        var m = new models.Match({
            contenders: [charA, charB],
            type: 'versus',
            map: r.map,
            when: Date.now(),
            result: r.winner,
            replay: r.replay,
            expr: payoff
        });
        if(r.winner) {
            if(r.winner.equals(charA._id)) {
                charA.experience += payoff;
            } else if(r.winner.equals(charB._id)) {
                charB.experience += payoff;
            }
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
                models.Character.findOne({ _id: charB._id }, function(err, char) {
                    if(err) {
                        throw err;
                    }
                    char.matches.push(m._id);
                    char.experience = charB.experience;
                    char.lastPlayed = Date.now();
                    char.save(function(err) {
                        if(err) {
                            throw err;
                        }
                        res.redirect('/m/' + m._id);
                    });
                });
            });
        });
    }
    function userPoped(err, user) {
        models.Character.findOne({ name: req.params.cname }).
            populate('owner').
            exec(charFound);
    }
    models.Character.populate(req.user, { path: 'chars.matches', model: 'Match' }, userPoped);
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

function docs(req, res) {
    var mdFiles = JSON.parse(
            fs.readFileSync( path.join( 'docs', 'manifest.json' ), 'utf8' ) )['files'] ,
    mdHTML = mdFiles.map( function( elem ) {
        var md = path.join( 'docs', elem ), text = fs.readFileSync( md, 'utf8');
        return markdown(text);
    });
    res.render('docs.ejs', {
            user: null, 
            intro: mdHTML[0], 
            update: mdHTML[1], 
            api: mdHTML[2], 
            examples: mdHTML[3]
    });
}

function unAuth(res, req) {
    res.render('unauth.ejs', { user: req.user });
    res.status(401);
}

function matchPage(req, res) {
    var match;
    function fileLoaded() {
        res.render('match', { map: match.map, user: req.user, match: match });
    }
    function foundMatch(err, m) {
        if(err) {
            throw err;
        }
        match = m;
        if(!match) {
            return res.redirect('/404');
        }
		setImmediate(fileLoaded);
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
        if(!(pid in ALLOWED_PIDS)) {
            return done(new Error('Not registered'));
        }
        var user = new models.User({
            pid: pid,
            points: 0,
            chars: []
        });
        user.save(ret(user));
    }
    models.User.findOne({ pid: pid }).
        populate('chars').
        populate('matches').
        populate('contenders').
        exec(init);
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
            return res.redirect('/404');
        }
        // console.log(req.user);
        // console.log("####################");
        // console.log(char);
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
            code: [ DEFAULT_DEFEND_CODE, DEFAULT_ATTACK_CODE ],
            lastPlayed: new Date(0),
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
        // errs = linter.process(req.body.code, require('./simulation/api'), ['update']);

		errs = linter.versusProcess(req.body.code, [require('./simulation/api'), require('./simulation/defend_api'), require('./simulation/attack_api')], ['defend', 'attack']);
		// console.log(linter.getFunctionCode(req.body.code, require('./simulation/api'), 'attack'));

        /* END DATA */
        char.code = linter.adCode;
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
app.get('/docs', docs);
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
    mongoose.connection.once('open', loadPIDs);
    mongoose.connection.on('error', logQuit);
}

/* DEBUG */
connMongo();
/* END DEBUG */
