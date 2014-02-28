var Direction = {
    U: 0,
    D: 1,
    L: 2,
    R: 3,
}

function Point(i, j) {
    this.i = i;
    this.j = j;
    function getMove(dir) {
        if(dir == Direction.U) {
            return new Point(i - 1, j);
        } else if(dir == Direction.D) {
            return new Point(i + 1, j);
        } else if(dir == Direction.L) {
            return new Point(i, j - 1);
        } else if(dir == Direction.R) {
            return new Point(i, j + 1);
        }
        return null;
    }
    this.getMove = getMove;
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
        if(!isValid(i, j)) {
            return;
        }
        arr[p.i * col + p.j] = x;
    }
    this.put = put;

    function getNeighbours(p) {
        var res = [];
        var dI, dJ, nP;
        for(dI = -1; dI <= 1; dI++) {
            for(dJ = -1; dJ <= 1; dJ++) {
                nP = new Point(p.i + dI, p.j + dJ);
                if(isValid(nP)) {
                    res.push(nP);
                }
            }
        }
        return res;
    }
    this.getNeighbours = getNeighbours;

    function loadTilemap(data, tSet) {
        var i, j, idx;
        for(i = 0; i < row; i++) {
            for(j = 0; j < col; j++) {
                idx = i * col + j;
                arr[idx] = tSet[data[idx]];
            }
        }
    }
    this.loadTilemap = loadTilemap;
}

function copy(obj) {
    if(!(obj instanceof Object) || (obj instanceof Function)) { 
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
            res[key] = copy(val);
        }
    }
    return res;
}

module.exports.copy = copy;
module.exports.Point = Point;
module.exports.Grid = Grid;
module.exports.Direction = Direction;
