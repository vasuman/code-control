var fs = require('fs'),
util = require('./util'),
run = require('./runner'),
baseEnt = require('./entities/base'),
Runner = run.Runner,
Controllable = baseEnt.Controllable,
ControlException = baseEnt.ControlException,
Grid = util.Grid,
Tile = util.Tile,
Point = util.Point;

const MAX_TURN = 200;
function Player(idx) {
    this.idx = idx;
    this.ents = [];
}

function Spawner() {
    
}
function BattleLevel(codeA, codeB, jsonPath, finishCb) {
    var entities = [],
    def, self = this, turn = 0,
    runner = new Runner(require('./api'), [codeA, codeB], errBack, 1000),
    playerA = {};
    this.grid = null;
    this.replay = {};
    this.tSet = {};

    function gameOver() {
        return true;
    }

    function errBack(e) {
        console.log(e);
        console.log('INV_CODE Error, must die..');
        process.exit(7);
    }

    function updateEntCallback(ent, i) {
        return function(x, dat) {
            if(!x) {
                console.log('[ERROR] in update of Player ' + ent.team + '\'s, entity: ' + ent.idx);
                console.log(dat.toString());
            } else {
                try {
                    ent.update(dat);
                } catch(e) {
                    console.log('[ERROR] in parsing update result of Player ' + ent.team + '\'s, entity: ' + ent.idx);
                    console.log(e.toString());
                }
            }
            setImmediate(act, i + 1);
        }
    }

    function getParams(ent) {
        return {
            log: function() {
                console.log(arguments);
            }
        }
    }

    function doDebug() {
        entities.push(new Controllable(0, 0, 0, self));
    }

    function fReadCback(err, d) {
        if(err) {
            throw err;
        }
        def = JSON.parse(d);
        self.grid = new Grid(def.height, def.width);
        // Building tilesets
        for(key in def.tiledata) {
            if(def.tiledata.hasOwnProperty(key)) {
                self.tSet[key] = new Tile(def.tiledata);
            }
        }
        self.grid.loadTilemap(def.data, def.tiledata);
        //DEBUG!?
        doDebug();
        start();
    }

    function act(i) {
        if(i >= entities.length) {
            // LOOP DONE
            // UPDATE REST!?
            // ADD HOOK for next
            if(gameOver()) {
                setImmediate(finishCb);
            } else {
                setImmediate(start);
            }
            return false;
        }
        var ent = entities[i];
        if(ent instanceof Controllable) {
            runner.runCode(ent.team, getParams(ent), updateEntCallback(ent, i), 'update', 2000);
        } else {
            console.log(entities);
            ent.update();
        }
        return true;
    }

    function start() {
        act(0);
    }

    function getGameState() {
        return util.copy(entities);
    }
    this.getGameState = getGameState;

    fs.readFile(jsonPath, { encoding: 'utf8' }, fReadCback);
}
module.exports.BattleLevel = BattleLevel;
