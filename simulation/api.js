var util = require('./util'),
Point = util.Point,
Tile = util.Tile,
Direction = util.Direction;

function isTile(x) {
    return (x instanceof Tile);
}

function isEntity(x) {
    return (x instanceof Controllable);
}

function getType(x) {
    if(isTile(x)) {
        return 'tile';
    } else if(isEntity(x)) {
        return 'entity';
    } else if(x == 0) {
        return 'empty';
    }
}

function getAt(state, p) {
    return state.grid[p.i * state.width + p.j];
}
module.exports.Point = Point;
module.exports.Direction = Direction;
module.exports.log = console.log;
