var util = require('../util'),
Direction = util.Direction,
Point = util.Point;
var globalEntIdx = 0;

function ControlException(reason) {
    this.reason = reason;
}

ControlException.prototype.toString = function() {
    return "ControlException: {Invalid Return} " + this.reason;
}

function Controllable(team, i, j, level, health) {
    var self = this;
    this.type = 'warrior';
    this.health = health;
    this.team = team;
    this.pos = new Point(i, j);
    if(!level.grid.isValid(self.pos)) {
        throw new Error('Spawn position is invalid');
    }
    if(level.grid.get(self.pos) != 0) {
        throw new Error('Spawn position is occupied');
    }
    level.grid.put(this.pos, self);
    this.idx = globalEntIdx++;
    function warnLog(x) {
        level.logMessage('[WARN] ENT-' + self.idx + ', ' + x);
    }
    function update(result) {
        if(!(result instanceof Object)) {
            throw new ControlException('Must return an object!');
        }
        if(!('action' in result)) {
            throw new ControlException('No "action" key in result');
        }
        var action = result.action;
        if(action == 'move') {
            if(!('dir' in result)) {
                throw new ControlException('Move action must have a `dir`');
            }
            var nextPos = self.pos.getMove(result.dir);
            if(nextPos === null) {
                throw new ControlException(result.dir + ' is an invalid direction');
            }
            if(!level.grid.isValid(nextPos)) {
                warnLog('attempting to move to invalid position');
                return;
            }
            var occ = level.grid.get(nextPos);
            if(occ) {
                warnLog('position - ' + nextPos + ' already occupied by, ' + occ);
                return;
            }
            level.grid.put(self.pos, 0);
            level.grid.put(nextPos, self);
            level.moveEvent(self.idx, nextPos);
            self.pos = nextPos;
        } else if(action == 'rest') {
            // PASS
        } else if(action == 'attack') {
            // TODO: implement
            throw new Error('Unimplemented');
        } else {
            throw new ControlException('`' + action + '` is not a valid action');
        }
    }
    this.update = update;

    function kill() {
        level.grid.put(self.pos, 0);
        level.destroy(self.idx);
    }
    function damage(amt) {
        self.health -= amt;
        if(self.health < 0) {
            kill();
        }
    }
    this.damage = damage;
    var spawnObject = util.copy(self);
    spawnObject.image = {
        name: "image.png",
        i: 0, j: 0
    };
    level.spawnEvent(spawnObject);
}

Controllable.prototype.toString = function() {
    return 'Controllable: E' + this.idx +  ' of P' + this.team;
}

module.exports.Controllable = Controllable;
module.exports.ControlException = ControlException;
