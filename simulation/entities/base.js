var stuff = require('../stuff'),
	Direction = stuff.Direction,
	Side = stuff.Side,
	Point = stuff.Point,
    Bomb = stuff.Bomb;
var globalEntIdx = 0;

const ATTACK_MODES = {
    constant: 1,
    linear: 2
}

function ControlException(reason) {
    this.reason = reason;
}

ControlException.prototype.toString = function() {
    return "ControlException: {Invalid Return} " + this.reason;
}

function Controllable(team, p, level, health, attack_damage, round, params) {
    var self = this;
    this.type = 'warrior';
    this.health = health;
    this.team = team;
    this.round = round;
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

	this.bombData = params.bomb;
	this.side = round;
    
	this.itemsAtPos = {
		arr: [],
		type: 'items'
	};

    this.bombAtPos = false;

    this.explosionData = params.explosion;
    	
	/*
        function explosion(center, radius, damage) {
            var obj = level.grid.get(center);
            if (obj instanceof Controllable)
                obj.damage(damage);

            var topLeft = new Point(center.i - 1, center.j - 1);
            var diameter = 2 * radius;
            var pointInConsideration = new Point(0, 0);

            for (var i = 0; i < diameter; i++) {
                for (var j = 0; j < diameter; j++) {
                    pointInConsideration = new Point(i + topLeft.i, j + topLeft.j);
                    if (!level.grid.isValid(pointInConsideration))
                        continue;

                    obj = level.grid.get(pointInConsideration);
                    if (obj instanceof Controllable)
                        obj.damage(damage);

                        if (obj instanceof Bomb) {
                            level.removeBombEvent(obj.pos, obj);
                        }
                }
            }
        }
	*/

    function updateMove(result) {
        var nextPos = moveSafe(self.pos, result);
        if(!level.grid.isValid(nextPos)) {
            warnLog('attempting to move to invalid position');
            return;
        }
        var occ = level.grid.get(nextPos);
        /*
            if(occ) {
                warnLog('position - ' + nextPos + ' already occupied by, ' + occ);
                return;
            }
        */

        if (occ.type == 'tile') {
            warnLog("Running into a frickin' wall");
            return;
        }

        if (occ.type == 'warrior') {
            return;
        }

        var didPlaceBomb = self.bombAtPos;
        var bomb;

        if (self.bombAtPos) {
            bomb = new Bomb(self.side, self.bombData.damage, -1, 0, self.pos);
            level.grid.put(self.pos, bomb);
            self.bombAtPos = false;
            // Bomb add event
            // level.addBombEvent(self.pos, bomb);
            // Different Event end here

        } else {
            level.grid.put(self.pos, 0);

        }

        /*
            How do we handle this?
            Two bools:
                BombPlaced
                BombExploded

            and related data
                BombPlaced
                    placedPos
                    placedBomb

                BombExploded
                    explodePos
                    explodeBomb
        */

        var eventData = { };
        eventData.placed = didPlaceBomb;
        if (didPlaceBomb) {
            eventData.placedPos = self.pos;
            eventData.placedBomb = bomb;
        }
        var didExplode = false;

        if (occ.type == 'Player Item' && occ.kind == 'bomb') {
            // If bombs don't attack everyone, add shit here.
            
            // self.damage(occ.damage);
            // explosion(self.pos, occ.radius, occ.damage);
            // Bomb remove event
            // level.removeBombEvent(occ.pos, occ);
            didExplode = true;
            // damage(occ.damage);
            // Different Event end here
        }

        eventData.explode = didExplode;
        var isKilled = false;
        if (didExplode) {
            eventData.explodePos = nextPos;
            eventData.explodeBomb = occ;

            eventData.damage = {};

            self.health -= occ.damage;
            if (self.health < 1) {
                isKilled = true;
            }
            eventData.damage.amt = Math.min(occ.damage, self.health);
            eventData.damage.idx = self.idx;
        }

        /*
            self.health -= amt;
            if(self.health < 1) {
                kill();
                return;
            }
            level.damageEvent(self.idx, Math.min(self.health, amt));
        */

        eventData.move = {};
        eventData.move.idx = self.idx;
        eventData.move.nextPos = nextPos;
        eventData.move.pos = self.pos;

        level.bombEvent(eventData);
        if (isKilled)
            kill();

        level.grid.put(nextPos, self);
        self.pos = nextPos;

        /*
            if (didPlaceBomb) {

            } else {
                    level.grid.put(nextPos, self);
                    level.moveEvent(self.idx, nextPos, self.pos);
                    self.pos = nextPos;
            }

            level.grid.put(nextPos, self);
            level.moveEvent(self.idx, nextPos, self.pos);
            self.pos = nextPos;
        */
    }

    /*
        Data = {
            center,
            radius,
            damage,
            type,
            killTrap
        }

    */
    function updateExplosiveRing(result, data) {
        var center = data.center,
            radius = data.radius,
            ourSide = data.side,
            type = data.type,
            killTrap = data.killTrap,
            toDamage = [],
            toKill = [],
            toRemove = [];

        var eventData = { };

        function constant() {
            eventData.type = 'constant';

            var topLeft = new Point(center.i - radius, center.j - radius),
                damageEnt = { },
                diameter = 2 * radius,
                damage = data.damage,
                pointInConsideration;

            for (var i = 0; i <= diameter; i++) {
                for (var j = 0; j <= diameter; j++) {
                    pointInConsideration = new Point(i + topLeft.i, j + topLeft.j);
                    analysePoint(pointInConsideration, damage);      
                }
            }

            
        }

        function analysePoint(point, damage) {
            if (!level.grid.isValid(point)) {
                return;
            }

            var damageEnt = { };
            var obj = level.grid.get(point);
            if (obj instanceof Controllable) {
                if (obj.side == ourSide) {
                    point.j++;
                    return;
                }

                obj.health -= damage;
                if (obj.health < 1) 
                    toKill.push(obj);

                damageEnt.idx = obj.idx;
                damageEnt.amt = Math.min(obj.health, damage);
                toDamage.push(damageEnt);
            }

            if (!killTrap) {
                return;
            }

            if (obj.type == 'Player Item' && obj.kind == 'bomb') {
                toRemove.push(obj.pos);
                level.grid.put(obj.pos, 0);
            }
        }

        function linear() {
            var iRadius = 1,
                minDamage = data.minDamage,
                maxDamage = data.maxDamage;

            while (iRadius <= radius) {
                var topLeft = new Point(center.i - iRadius, center.j - iRadius);
                var topRight = new Point(center.i + iRadius, center.j - iRadius);
                var bottomLeft = new Point(center.i - iRadius, center.j + iRadius);
                var bottomRight = new Point(center.i + iRadius, center.j + iRadius);

                var point = topLeft;
                var damageCurr = maxDamage - (maxDamage - minDamage) * ((iRadius - 1) / (radius - 1));
                while (point.i != topRight.i) {
                    analysePoint(point, damageCurr);
                    point.i++;
                }

                while (point.j != bottomRight.j) {
                    analysePoint(point, damageCurr);
                    point.j++;
                }

                while (point.i != bottomLeft.i) {
                    analysePoint(point, damageCurr);
                    point.i--;
                }

                while (point.j != topLeft.j) {
                    analysePoint(point, damageCurr);
                    point.j++;
                }

                iRadius++;
            }
        }

        if (type == 'constant') {
            constant();
        } else if (type == 'linear') {
            linear();
        }

        eventData.ents = toDamage;
        eventData.bombs = toRemove;

        level.explosionEvent(eventData);
        
        // TODO: Merge kill event and explosion event
        toKill.forEach(function (obj) {
            eventData.type = 'constant';
            obj.kill();
        });
    }

    function getRadialDistance(pos, center) {
        var distance = Math.max(Math.abs(pos.i - center.i), Math.abs(pos.j - center.j));
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
            updateMove(result);

        } else if(action == 'rest') {
            // PASS
        } else if(action == 'attack') {
			if (self.round == Side.Defend) {
				warnLog('Defender cannot attack!');
				return;
			}

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
        } else if (action == 'plant bomb') {
            if (self.bombData.capacity <= 0)
                return;

            if (self.side == Side.Defend)
                return;

            if (self.bombAtPos)
                return;

            self.bombData.capacity -= 1;
            self.bombAtPos = true;

        } else if (action == 'explosive ring') {
            if (self.side == Side.Defend)
                return;

			/*
				if(!('type' in result)) {
					throw new ControlException('No "type" key in result in "explosive ring"');
					return;
                }
			*/

            if (self.explosionData.capacity <= 0)
                return;

            self.explosionData.capacity--;

            var center = self.pos;
			/*
				if ('pos' in result) {
					var distance = getRadialDistance(result.pos, center);
					if (distance <= self.explosionData.throwDistance)
						center = result.pos;
				}
			*/

            var explosiveData = {
                center: center,
                radius: self.explosionData.radius,
                side: self.side,
                type: 'constant',
                killTrap: true
            };

			explosiveData.damage = self.explosionData.damage;
            updateExplosiveRing(result, explosiveData);

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
    this.kill = kill;

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
