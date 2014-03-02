var util = require('./util'),
Point = util.Point,
Tile = util.Tile,
Direction = util.Direction;

function getAt(state, p) {
    return state.grid[p.i * state.width + p.j];
}
module.exports.Point = Point;
module.exports.Direction = Direction;
module.exports.log = console.log;
