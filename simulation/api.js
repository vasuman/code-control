var stuff = require('./stuff'),
Point = stuff.Point,
Tile = stuff.Tile,
Direction = stuff.Direction;

function getAt(state, p) {
    return state.grid[p.i * state.width + p.j];
}

function getDistance(pointA, pointB) {

}

function getDirection(pointA, pointB) {

}

function getEntIdx(params, idx) {

}

function getType(object) {

}

function getMove(point) {

}

module.exports.Point = Point;
module.exports.Direction = Direction;
module.exports.log = console.log;
