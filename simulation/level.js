var fs = require('fs'),
util = require('./util'),
Grid = util.Grid,
Point = util.Point;

function Level() {
    var robots = [],
    turn = 0,
    data, grid, tSet;
    function load(jsonPath) {
        fs.readFile(jsonPath, { encoding: 'utf8' }, fReadCback);
    }
    function fReadCback(err, d) {
        if(err) {
            throw err;
        }
        data = JSON.parse(d);

    }
    function getGameState() {
        return {
            robots: util.copy(robots),
            turn: turn
        };
    }
    function drawBG(ctx) {
        
    }
}
module.exports.Level = Level;
