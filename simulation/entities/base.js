var stuff = require('../stuff'),
Direction = stuff.Direction,
Point = stuff.Point;
var globalEntIdx = 0;

function ControlException(reason) {
    this.reason = reason;
}

ControlException.prototype.toString = function() {
    return "ControlException: {Invalid Return} " + this.reason;
}

function Controllable(team, p, level, health, attack_damage) {
    var self = this;
    this.type = 'warrior';
    this.health = health;
    this.team = team;
    this.dead = false;
    this.pos = new Point(p.i, p.j);
    if(!level.grid.isValid(self.pos)) {
        throw new Error('Spawn position is invalid');
    }
    if(level.grid.get(self.pos) != 0) {
        throw new Error('Spawn position is occupied');
    }
    this.idx = globalEntIdx++;
    level.grid.put(this.pos, self);
    level.players[this.team].ents[this.idx] = this;
    function warnLog(x) {
        level.logMessage('warn', this.idx, this.team, x);
    }
    function moveSafe(pos, result) {
        if(!('dir' in result)) {
            throw new ControlException('action must have a `dir`');
        }
        var nextPos = stuff.getMove(pos, result.dir);
        if(nextPos === null) {
            throw new ControlException(result.dir + ' is an invalid direction');
        }
        return nextPos;
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
            var nextPos = moveSafe(self.pos, result);
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
            level.moveEvent(self.idx, nextPos, self.pos);
            self.pos = nextPos;
        } else if(action == 'rest') {
            // PASS
        } else if(action == 'attack') {
            var attackPos = moveSafe(self.pos, result);
            if(!level.grid.isValid(attackPos)) {
                warnLog('empty attack');
                return;
            }
            var occ = level.grid.get(attackPos);
            if((occ == 0) || !(occ instanceof Controllable)) {
                warnLog('no entity @ - ', attackPos);
            }
            occ.damage(attack_damage);
        } else {
            throw new ControlException('`' + action + '` is not a valid action');
        }
    }
    this.update = update;

    function kill() {
        self.dead = true;
        level.grid.put(self.pos, 0);
        level.destroy(self);
        level.deathEvent(self.idx);
    }
    function damage(amt) {
        self.health -= amt;
        if(self.health < 1) {
            kill();
            return;
        }
        level.damageEvent(self.idx, Math.min(self.health, amt));
    }
    this.damage = damage;
    level.addEntity(this);
    var spawnObject = stuff.copy(self);
    spawnObject.image = getImage(this.type, this.team);
    level.spawnEvent(spawnObject);
}

function getImage(type, team) {
    var image = {
        name: "/basic.png",
        i: 0, j: 0
    }
    if(type == 'warrior') {
        if(team == 0) {
            image.j = 1;
        } else {
            image.j = 2;
        }
    }
    return image;
}

Controllable.prototype.toString = function() {
    return 'Controllable: E' + this.idx +  ' of P' + this.team;
}

module.exports.Controllable = Controllable;
module.exports.ControlException = ControlException;
