var stuff = require('./stuff'),
Point = stuff.Point,
Tile = stuff.Tile,
Direction = stuff.Direction;

function getAt(state, p) {
    return state.grid[p.i * state.width + p.j];
}

function getDistance(pointA, pointB) {
    return Math.abs(pointA.i - pointB.i) + Math.abs(pointA.j - pointB.j);
}

function signum(x) {
    return (x > 0) ? 1 : (x < 0) ? -1 : 0;
}

function getDirection(pointA, pointB) {
    var diffI = pointB.i - pointA.i,
    diffJ = pointB.j - pointA.j;
    if(Math.abs(diffJ) > Math.abs(diffI)) {
        if(diffJ > 0) {
            return Direction.L;
        } else if(diffJ < 0) {
            return Direction.R;
        }
    } else {
        if(diffI > 0) {
            return Direction.U;
        } else if(diffI < 0) {
            return Direction.D;
        }
    }
    return -1;
}

function getEntArray(params) {
    var res = [], key;
    for(key in params.entities) {
        if(params.entities.hasOwnProperty(key)) {
            res.push(params.entities[key]);
        }
    }
    return res;
}

function getType(object) {
    if(object == 0) {
        return 'empty';
    }
    return (object.type || 'none')
}

function log(x) {
    if(x.length > 100) {
        
    }
}
module.exports.Point = Point;
module.exports.getMove = stuff.getMove;
module.exports.Direction = Direction;
module.exports.log = console.log;
module.exports.getDistance = getDistance;
module.exports.getDirection = getDirection;
