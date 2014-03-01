var util = require('./util'),
Point = util.Point,
Tile = util.Tile,
Map = util.Map,
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

module.exports.Point = util.Point;
module.exports.Direction = Direction;
module.exports.Map = Map;
