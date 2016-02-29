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
PragyanStrategy = require('passport-local').Strategy,
authVerify = require('./auth/verify'),
verifyCreds = authVerify.verifyCreds,
customUserPass = authVerify.customUserPass,
markdown = require('marked');

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
app.locals.find_not_char_id = function(id, chars) {
    var i;
    for(i = 0; i < chars.length; i++) {
        if(!chars[i]._id.equals(id)) {
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
const DEFAULT_ATTACK_CODE = "function attack(params) {\n\t// TODO: insert attack code here\n\treturn {\n\t\taction: 'rest'\n\t};\n}";
const DEFAULT_DEFEND_CODE = "function defend(params) {\n\t// TODO: insert defend code here\n\treturn {\n\t\taction: 'rest'\n\t};\n}";
const ALLOWED_CHARS = [ new SelectOption('Warrior', 'warrior') ];
const DEF_LVL = [ new SelectOption('Battle', 'battle') ];
const START_EXP = 10;
const START_LVL = 1;
const TRAIN_DEF = [ new SelectOption('Challenge Swarm', 'swarm'), new SelectOption('Challenge own chars', 'char') ];
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
const DEFEND = 0, ATTACK = 1;
const REST_INTERVAL = 1000 * 120;

var swarmChar = {
    id: -1,
    code: [DEFAULT_DEFEND_CODE, DEFAULT_ATTACK_CODE],
	codeChanged: false,
    getHealth: function() { return 100; },
    getAttack: function() { return 100; }
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
    fs.readFile('./simulation/swarm-code-full.js', { encoding: 'utf8' }, doneFRead([], [swarmChar], ['code']))
}
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
    var char, jsonPath, myMap, results = [], SwarmLevel;
    function charFound(ch) {
        char = ch;
        if(!(req.user) || !(char.owner.equals(req.user._id))) {
            return res.redirect('/not_permit');
        }
		var mapper = require("./simulation/map_gen").GenerateMap;
		new mapper(afterMapGen);
	}
	function afterMapGen(gen_map) {
		myMap = gen_map;
        if(req.body.level == 'swarm') {
            SwarmLevel = require('./simulation/level').SwarmTraining;


			if (!swarmChar.codeChanged) {
				var errs = linter.versusProcess(swarmChar.code, [require('./simulation/api'), require('./simulation/defend_api'), require('./simulation/attack_api')], ['defend', 'attack']);
				swarmChar.code = linter.adCode;
				swarmChar.codeChanged = true;
			}

            new SwarmLevel(char, swarmChar, myMap, DEFEND, sim1DoneCb);
        } else {
            return res.redirect('/404');
        }
    }
	function sim1DoneCb(err, r) {
		if(err) {
            return res.send(err);
		}
        results.push(r);
		new SwarmLevel(char, swarmChar, myMap, ATTACK, simDoneCb);
	}
    function simDoneCb(err, r) {
        if(err) {
            console.log(err, r);
            return res.send(err);
        }
		results.push(r);
        var m = new models.Match({
			initiator: char,
            contenders: [char],
            type: 'train',
            map: r.map,
            when: Date.now(),
            result: [results[0].score, results[1].score],
            replay: [results[0].replay, results[1].replay]
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
                return res.redirect('/m/' + m._id);
            });
        });
    }
    if (req.body.level === "swarm")
        getChar(req.params.cname, charFound);
    else{
        return res.redirect('/404'); 
    }
}

function isPlaying(match, char) {
    if(match.type == 'train' || match.result == null) {
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
    var charA, charB, jsonPath, payoff, results = [], BattleLevel, myMap;
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
        if(charB.name == req.params.cname){
            return res.redirect('/not_permit');
        }
        if (req.body.level === "battle" ){
            if(Math.abs(charB.experience - charA.experience) > EXP_DIFF) {
                return res.redirect('/not_permit');
            }
        }
        if(!isRested(charB)) {
            return res.redirect('/not_permit');
        }
        var map = DEF_MAP[~~(Math.random() * DEF_MAP.length)].value,
        numPlays = playedAgainst(req.user, charA.owner);
        payoff = Math.max(~~(EXP_GAIN * Math.pow(0.7, numPlays/2)), MIN_EXP_GAIN);
        if(numPlays > MAX_PLAYS) {
            payoff = 0;
        }
        jsonPath = path.join('./simulation', map);
		
		var mapper = require("./simulation/map_gen").GenerateMap;
		new mapper(afterMapGen);
	}
	function afterMapGen(gen_map) {	
		if (req.body.level == 'char') {
			var temp = charA;
			charA = charB;
			charB = temp;
		}
		// NOW charB is challenger always

		myMap = gen_map;
        if(req.body.level == 'battle' || req.body.level == 'char') {
            BattleLevel = require('./simulation/level').BattleLevel;
            new BattleLevel(charB, charA, myMap, DEFEND, sim1DoneCb);
        } else {
            return res.redirect('/404');
        }
    }
	function sim1DoneCb(err, r) {
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
		results.push(r);
        new BattleLevel(charB, charA, myMap, ATTACK, simDoneCb);
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
		results.push(r);
		var m;
		// RESET
		if (req.body.level == 'char') {

			m = new models.Match({
				initiator: charB,
				contenders: [charB, charA],
				type: 'selfversus',
				map: r.map,
				when: Date.now(),
				result: [results[0].winner, results[1].winner],
				replay: [results[0].replay, results[1].replay],
				expr: payoff
			});

			var temp = charA;
			charA = charB;
			charB = temp;
		} else {
			m = new models.Match({
				initiator: charB,
				contenders: [charB, charA],
				type: 'versus',
				map: r.map,
				when: Date.now(),
				result: [results[0].winner, results[1].winner],
				replay: [results[0].replay, results[1].replay],
				expr: payoff
			});
		}
		if (charA.owner._id.toString() != charB.owner.toString()) {
			if(results[0].winner.equals(charA._id) && results[1].winner.equals(charA._id)) {
				charA.experience += payoff;
				charB.experience -= (EXP_GAIN - payoff);
			} else if(results[0].winner.equals(charB._id) && results[1].winner.equals(charB._id)) {
				charB.experience += payoff;	
				charA.experience -= (EXP_GAIN - payoff);
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
                        return res.redirect('/m/' + m._id);
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
    
    
    if (req.body.level === "char" || req.body.level === "battle" ){
        models.Character.populate(req.user, { path: 'chars.matches', model: 'Match' }, userPoped);
    }else{
        return res.redirect('/404');
    }
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

function loginPage(req, res) {
	if (req.user) {
		return res.redirect('/');
	}
	res.render('login.ejs', { user: req.user });
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
            user: req.user,
            intro: mdHTML[0], 
            api: mdHTML[1],  
            examples: mdHTML[2],
            snapshot: mdHTML[3]
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

passport.use(new PragyanStrategy(customUserPass, verifyCreds));

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
//        if(!(pid in ALLOWED_PIDS)) {
//            return done(new Error('Not registered'));
//        }
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

var authHandle = passport.authenticate('local', {
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
        var charNameList = [], _i = 0 ;
       
		if (req.user) {
			req.user.chars.forEach(function(data){
				if (data.name != req.params.cname ) // avoids challenging self
				charNameList.push( new SelectOption( data.name, _i ) );
			_i++;
			});
		}
        res.render('info_char', { user: req.user, char: char, charNameList: charNameList, train_level: TRAIN_DEF, vs_level: DEF_LVL });
    }
    models.Character.findOne({ name: req.params.cname }).
        populate('owner').
        populate('matches').
        exec(charFindCb);
}

function createCharPage(req, res) {
    if(!req.user) {
        return res.redirect('/');
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
            return res.redirect('/c/' + char.name);
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
            return res.redirect('/char/create?err=2');
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
            return res.redirect('/404');
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
        errs = linter.versusProcess(req.body.code, [require('./simulation/api'), require('./simulation/defend_api'), require('./simulation/attack_api')], ['defend', 'attack']);
		char.code = linter.adCode;
        char.passed = (errs.length == 0);
		if (char.passed)
        	char.save(doneSave);
		else
			return res.json({ status: 2, errors: errs });
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
		models.Match.find().count(function(cerr, count) {
        	res.render('leaderboard', { user: req.user, topChars: chars, from: start, count: count });
		});
    }
    models.Character.find().sort({ experience: -1 }).skip(start).limit(100).exec(qCback);
}

function notPermit(req, res) {
    return res.send('Not permitted!');
}

function verifyCode(req, res){
    models.Character.findOne({ name: req.user.chars[req.body.char_name].name}, function verifyCb(err, char){
        if (err){
            console.log(err);
            res.send(false);
        }
        res.send(char.passed);
    });
}
app.get('/docs', docs);
app.get('/', renderPage('index'));
app.get('/login', loginPage);
app.get('/logout', doLogout);
app.get('/m/:mid', matchPage);
app.get('/u/:pid', userPage);
app.get('/c/:cname', charPage);
app.get('/c/:cname/edit', codePage);
app.get('/char/create', createCharPage);
app.get('/login_failed', noLogin);
app.get('/not_permit', notPermit);
app.get('/leaderboard', leaderboard);
app.post('/login', authHandle);
app.post('/char/params', createChar);
app.post('/c/:cname/train', doTrain);
app.post('/c/:cname/challenge', challenge);
app.post('/c/:cname/save', saveChar);
app.post('/c/verifyCode', verifyCode);
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
