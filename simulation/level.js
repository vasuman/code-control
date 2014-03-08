var fs = require('fs'),
util = require('util');
stuff = require('./stuff'),
run = require('./runner'),
baseEnt = require('./entities/base'),
Runner = run.Runner,
Controllable = baseEnt.Controllable,
ControlException = baseEnt.ControlException,
Grid = stuff.Grid,
Tile = stuff.Tile,
LinkList = stuff.LinkList,
Point = stuff.Point;

const MAX_TURNS = 100, MAX_ERR = 1;
function Player(idx) {
    this.idx = idx;
    this.ents = {};
    this.errCount = 0;
}

const P_A = 0, P_B = 1;

function randInt(a, b) {
    return a + Math.floor(Math.random() * (b - a));
}


function SwarmTraining(char, swarm, jsonPath, finishCb) {
    var self = this,
    pChar, spawned = [];

    AbstractLevel.call(this, [char, swarm], jsonPath, finishCb);

    function isFinished() {
        return self.turn > MAX_TURNS || pChar.dead;
    }
    this.isFinished = isFinished;

    function getScore() {
        var i, score;
        for(i = 0; i < spawned.length; i++) {
            if(spawned[i].dead) {
                score += 1;
            }
        }
        return score;
    }

    function gameOver() {
        setImmediate(finishCb, null, { score: getScore(), replay: self.replay })
    }
    this.gameOver = gameOver;

    function init() {
        pChar = new Controllable(P_A, self.getSpawn(), self, char.getHealth(), char.getAttack())
        new Controllable(P_B, self.getSpawn(), self, swarm.getHealth(), swarm.getAttack());
    }
    this.init = init;

    function nextIter() {
        if(self.turn % 5 == 0) {
            new Controllable(P_B, self.getSpawn(), self, swarm.getHealth(), swarm.getAttack());
        }
    }
    this.nextIter = nextIter;

    this.run();
}

util.inherits(SwarmTraining, AbstractLevel);

function BattleLevel(charA, charB, jsonPath, finishCb) {
    var self = this;

    AbstractLevel.call(this, [charA, charB], jsonPath, finishCb);

    function getNumEnt(x) {
        return Object.keys(self.players[x].ents).length;
    }

    function isFinished() {
        return self.turn > MAX_TURNS || getNumEnt(P_A) == 0 || getNumEnt(P_B) == 0;
    }
    this.isFinished = isFinished;

    function gameOver() {
        var numA = Object.keys(self.players[P_A]).length,
        numB = Object.keys(self.players[P_B]).length;
        if(numA > numB) {
            setImmediate(finishCb, null, { winner: charA.id, replay: self.replay });
        } else if(numB > numA) {
            setImmediate(finishCb, null, { winner: charB.id, replay: self.replay });
        } else {
            setImmediate(finishCb, null, { winner: null, replay: self.replay });
        }
    }
    this.gameOver = gameOver;

    function init() {
        new Controllable(0, self.getSpawn(), self, charA.getHealth(), charA.getAttack());
        new Controllable(1, self.getSpawn(), self, charB.getHealth(), charB.getAttack());
    }
    this.init = init;
    
    function nextIter() {}
    this.nextIter = nextIter;

    this.run();
}

util.inherits(BattleLevel, AbstractLevel);

/* CHAR IFACE */

/* getAttack()
 * getHealth()
 * code
 * id
 */

function AbstractLevel(chars, jsonPath, finishCb) {
    var entities = {},
    updateList = new LinkList, moveDel = [],
    self = this,
    msg = '', runner;

    this.players = chars.map(function(x) {
        return new Player(x.id);
    });
    this.grid = null;
    this.tSet = {};
    this.turn = 0;
    this.replay = [];

    function run() {
        var code = chars.map(function(x) {
            return x.code;
        });
        runner = new Runner('./api', code, loadMap, errBack, 1000);
    }
    this.run = run;

    function spawnEvent(ent) {
        addEvent('spawn', ent);
    }
    this.spawnEvent = spawnEvent;

    function getSpawn() {
        var p = {};
        do {
            p.i = randInt(0, self.def.height);
            p.j = randInt(0, self.def.width);
        } while(self.grid.get(p) != 0);
        return p;
    }
    this.getSpawn = getSpawn;

    function damageEvent(idx, amt) {
        addEvent('damage', {
            idx: idx,
            amt: amt
        });
    }
    this.damageEvent = damageEvent;
    function moveEvent(idx, nPos, oPos) {
        var delPos = {
            i: nPos.i - oPos.i,
            j: nPos.j - oPos.j
        };
        addEvent('move', {
            idx: idx,
            pos: delPos
        });
    }
    this.moveEvent = moveEvent;

    function addEvent(type, data) {
        var event = {};
        event[type] = data;
        self.replay.push(event);
    }

    function errBack(i, e) {
        console.log('INV_CODE Error, must die..');
        setImmediate(finishCb, e, i);
    }

    function logMessage(type, i, t, m) {
        var logObj = { type: type, idx: i, player: t, m: m };
        addEvent('log', logObj);
    }
    this.logMessage = logMessage;

    function updateEntCallback(ent) {
        return function(x, dat) {
            try {
                if(!x) {
                    throw dat;
                }
                ent.update(dat);
                var logs = runner.flushStr(ent.team);
                if(logs != '') {
                    logMessage('MSG', ent.idx, ent.team, logs);
                }
            } catch(e) {
                console.log(e);
                logMessage('ERR', ent.idx, ent.team, e.toString());
                self.players[ent.team].errCount += 1;
                if(self.players[ent.team].errCount > MAX_ERR) {
                    return setImmediate(finishCb, e, ent.team);
                }
            }
            setImmediate(act, updateList.getNext(ent));
        }
    }

    function getParams(ent) {
        return {
            entities: entities,
            grid: self.grid, 
            turn: self.turn,
            self: ent
        };
    }

    function loadMap() {
        if(++loadMap.count < chars.length) {
            return;
        }
        fs.readFile(jsonPath, { encoding: 'utf8' }, fReadCback);
    }
    loadMap.count = 0;

    function fReadCback(err, d) {
        if(err) {
            return setImmediate(finishCb, err);
        }
        self.def = JSON.parse(d);
        self.grid = new Grid(self.def.height, self.def.width);
        // Building tilesets
        for(key in self.def.tiledata) {
            if(self.def.tiledata.hasOwnProperty(key)) {
                self.tSet[key] = new Tile(self.def.tiledata[key], key);
            }
        }
        self.grid.loadTilemap(self.def.data, self.tSet);
        self.init();
        act(null);
    }

    function destroy(e) {
        updateList.remove(e);
        delete entities[e.idx];
    }
    this.destroy = destroy;

    function deathEvent(e) {
        addEvent('death', e);
    }
    this.deathEvent = deathEvent;
    function act(ent) {
        if(ent == null) {
            ent = updateList.getHead();
        }
        if(updateList.isEnd(ent)) {
            self.turn += 1;
            self.nextIter();
            // LOOP DONE
            // UPDATE REST!?
            // ADD HOOK for next
            if(self.isFinished()) {
                self.gameOver();
                return false;
            }
        }
        if(ent instanceof Controllable) {
            runner.runCode(ent.team, getParams(ent), updateEntCallback(ent), 'update', 2000);
        } else {
            ent.update();
        }
        return true;
    }

    function addEntity(ent) {
        entities[ent.idx] = ent;
        updateList.append(ent);
    }
    this.addEntity = addEntity;

    function getGameState() {
        return entities;
    }
    this.getGameState = getGameState;
}

module.exports.BattleLevel = BattleLevel;
module.exports.SwarmTraining = SwarmTraining;
