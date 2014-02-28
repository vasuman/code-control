var fs = require('fs'),
util = require('./util'),
Grid = util.Grid,
Point = util.Point;

function BattleLevel(codeA, codeB, jsonPath) {
    var entities = [],
    def, self = this;
    this.grid = null;
    this.tSet = {};
    function fReadCback(err, d) {
        if(err) {
            throw err;
        }
        def = JSON.parse(d);
        self.grid = new Grid(def.height, def.width);
        var 
    }
    fs.readFile(jsonPath, { encoding: 'utf8' }, fReadCback);
    function act() {

    }
    this.act = act;
    function getGameState() {
        return util.copy(entities);
    }
    this.getGameState = getGameState;
}
module.exports.BattleLevel = BattleLevel;
