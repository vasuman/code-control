var Direction = {
    U: 0,
    D: 1,
    L: 2,
    R: 3,
}

function getMove(p, dir) {
    if(dir == Direction.U) {
        return new Point(p.i - 1, p.j);
    } else if(dir == Direction.D) {
        return new Point(p.i + 1, p.j);
    } else if(dir == Direction.L) {
        return new Point(p.i, p.j - 1);
    } else if(dir == Direction.R) {
        return new Point(p.i, p.j + 1);
    }
    return null;
}

function Point(i, j) {
    this.i = i;
    this.j = j;
    function clone() {
        return new Point(i, j);
    }
    this.clone = clone;
}

Point.prototype.toString = function() {
    return this.i + ':' + this.j;
}

function Tile(tData, idx) {
    this.type = 'tile';
    this.kind = tData.type;
    this.key = idx;
}

Tile.prototype.toString = function() {
    return '[' + this.kind + '] tile';
}

function Map(grid) {
    this.maxI = grid.maxI;
    this.maxJ = grid.maxJ;
    function at(p) {
        
    }
    function isValid(p) {
        return grid.isValid(p);
    }
    this.isValid = isValid;
    function getAdjacent(p) {
        var res = [];
        var dI, dJ, nP;
        for(dI = -1; dI <= 1; dI++) {
            for(dJ = -1; dJ <= 1; dJ++) {
                if(dI == 0 && dJ == 0) {
                    continue;
                }
                nP = new Point(p.i + dI, p.j + dJ);
                if(grid.isValid(nP)) {
                    res.push(nP);
                }
            }
        }
        return res;
    }
    this.getAdjacent = getAdjacent;
}

function Grid(row, col) {
    this.maxI = row;
    this.maxJ = col;
    var arr = new Array(row * col);

    function isValid(p) {
        return (p.i >= 0) && (p.i < row) && (p.j >= 0) && (p.j < col);
    }
    this.isValid = isValid;

    function get(p) {
        return arr[p.i * col + p.j];
    }
    this.get = get;

    function put(p, x) {
        if(!isValid(p)) {
            return;
        }
        arr[p.i * col + p.j] = x;
    }
    this.put = put;

    function move(oldPos, newPos) {
        var item = get(oldPos),
        dest = get(newPos);
        if(!isVaild(oldPos) || !isValid(newPos)) {
            console.log('Supplied, ' + oldPos + ', ' + newPos + ' invalid position');
        }
        if((item == 0) || (item instanceof Tile)) {
            console.log('Source position is empty');
            return;
        }
        if(dest != 0) {
            console.log('Destination is not empty');
            return;
        }
        put(oldPos, 0);
        put(newPos, item);
    }
    // this.move = move;

    function loadTilemap(data, tSet) {
        var i, j, idx, d;
        for(i = 0; i < row; i++) {
            for(j = 0; j < col; j++) {
                idx = i * col + j;
                d = data[idx];
                arr[idx] = (d) ? tSet[d] : 0;
            }
        }
    }
    this.loadTilemap = loadTilemap;
}

function copy(obj) {
    if(!(obj instanceof Object)) { 
        return obj;
    }
    var dst = [], i;
    if(obj instanceof Array) {
        for(i = 0; i < obj.length; i++) {
            dst[i] = copy(obj[i]);
        }
        return dst;
    }
    var res = {}, val;
    for(key in obj) {
        if(obj.hasOwnProperty(key)) {
            val = obj[key];
            if(val instanceof Function) {
                continue;
            }
            res[key] = copy(val);
        }
    }
    return res;
}

module.exports.copy = copy;
module.exports.Point = Point;
module.exports.Grid = Grid;
module.exports.Direction = Direction;
module.exports.Tile = Tile;
module.exports.getMove = getMove;
