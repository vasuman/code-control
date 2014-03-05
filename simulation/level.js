var fs = require('fs'),
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

function BattleLevel(codeA, codeB, jsonPath, finishCb, idA, idB) {
    var entities = {},
    updateList = new LinkList, moveDel = [],
    def, self = this, turn = 0, replay = [], 
    msg = '',
    runner = new Runner('./api', [codeA, codeB], loadMap, errBack, 1000);
    this.players = [new Player(idA), new Player(idB)];
    this.grid = null;
    this.tSet = {};

    function getNumEnt(x) {
        return Object.keys(self.players[x].ents).length;
    }
    function isFinished() {
        return turn > MAX_TURNS || getNumEnt(P_A) == 0 || getNumEnt(P_B)== 0;
    }

    function gameOver() {
        var numA = Object.keys(self.players[P_A]).length,
        numB = Object.keys(self.players[P_B]).length;
        if(numA > numB) {
            setImmediate(finishCb, { winner: idA, replay: replay });
        } else if(numB > numA) {
            setImmediate(finishCb, { winner: idB, replay: replay });
        } else {
            setImmediate(finishCb, { winner: null, replay: replay });
        }
    }

    function spawnEvent(ent) {
        addEvent('spawn', ent);
    }
    this.spawnEvent = spawnEvent;

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
        replay.push(event);
    }

    function errBack(i, e) {
        console.log('INV_CODE Error, must die..');
        setImmediate(finishCb, { error: e.toString(), player: i });
    }

    function doSpawn() { }

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
                console.log(e.stack);
                logMessage('ERR', ent.idx, ent.team, e.toString());
                self.players[ent.team].errCount += 1;
                if(self.players[ent.team].errCount > MAX_ERR) {
                    setImmediate(finishCb, { 
                        error: e.toString(),
                        player: ent.team 
                    });
                }
            }
            setImmediate(act, updateList.getNext(ent));
        }
    }

    function getParams(ent) {
        return {
            entities: entities,
            grid: self.grid, 
            turn: turn,
            self: ent
        };
    }

    function loadMap() {
        if(++loadMap.count < 2) {
            return;
        }
        fs.readFile(jsonPath, { encoding: 'utf8' }, fReadCback);
    }
    loadMap.count = 0;

    function fReadCback(err, d) {
        if(err) {
            throw err;
        }
        def = JSON.parse(d);
        self.grid = new Grid(def.height, def.width);
        // Building tilesets
        for(key in def.tiledata) {
            if(def.tiledata.hasOwnProperty(key)) {
                self.tSet[key] = new Tile(def.tiledata[key], key);
            }
        }
        self.grid.loadTilemap(def.data, self.tSet);
        //DEBUG!?
        doDebug();
        act(null);
    }

    function doDebug() {
        addEntity(new Controllable(0, getSpawn(), self, 100));
        addEntity(new Controllable(1, getSpawn(), self, 100));
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
        if(updateList.isHead(ent)) {
            turn += 1;
            // LOOP DONE
            // UPDATE REST!?
            // ADD HOOK for next
            if(isFinished()) {
                gameOver();
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

    function randInt(a, b) {
        return a + Math.floor(Math.random() * (b - a));
    }
    function getSpawn() {
        var p = {};
        do {
            p.i = randInt(0, def.height);
            p.j = randInt(0, def.width);
        } while(self.grid.get(p) != 0);
        return p;
    }

    function addEntity(ent) {
        entities[ent.idx] = ent;
        updateList.append(ent);
    }

    function getGameState() {
        return entities;
    }
    this.getGameState = getGameState;
}

module.exports.BattleLevel = BattleLevel;
