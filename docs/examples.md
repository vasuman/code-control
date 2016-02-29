# Examples
> Note that you must write code for both `attack` and `defend` function before submitting the code

## Sleepy

    function defend(params) {

        // Do nothing.
        return { action: 'rest' };    
    }

    function attack(params) {
        return { action: 'rest' };
    }

## Jerky

    function defend(params) {
        
        // We first get a random direction
        var dir = Math.floor(Math.random() * 4);
        
        // Move in that direction
        return {
            action: 'move',
            dir: 'dir'
        };
    }

    function attack(params) {
        var dir = Math.floor(Math.random() * 4);
        return {
            action: 'move',
            dir: 'dir'
        };
    }    

## Jerky with checks
    
    function defend(params) {
        var dir = Math.floor(Math.random() * 4);  

        // We get the result position
        var nextPos = getMove(params.self.pos, dir);

        // Check if nextPos is within the bounds of the map.
        if (!isValid(params, nextPos))
            return { action: 'rest' };

        // Get the object at that position
        var obj = getAt(params, nextPos);

        // Get the type of that object
        var type = getType(obj);

        // If the type is 'bomb', don't move. Else, move.
        if (type == 'bomb') {
            return {
                action: 'rest'
            };
        } else {
            return {
                action: 'move',
                dir: dir
            };
        }
    }

    // Similar stuff in attack
    function attack(params) {
        var dir = Math.floor(Math.random() * 4);

        var nextPos = getMove(params.self.pos, dir);
        if (!isValid(params, nextPos))
            return {
                action: 'rest'
            };

        var obj = getAt(params, nextPos);
        var type = getType(obj);

        // Better type handler.
        if (type == 'warrior') {
            return {
                action: 'attack',
                dir: dir
            };
        } else if (type == 'bomb') {
            return {
                action: 'rest'
            };
        }

        return {
            action: 'move', 
            dir: dir
        };
    }

## Move and Explode

    function attack(params) {
        var self = params.self;

        // Exit if can't cause explosion
        if (getExplosionsRemaining(self) <= 0)
            return {
                action: 'rest'
            };

        // 2 is the radius of the explosive attack
        var radius = 2;

        // This is the furthest point at the top-left that's affected by the explosion attack
        var topLeft = new Point(self.pos.i - radius, self.pos.j - radius);

        // We iterate through all points that are affected by the attack
        for (var i = 0; i <= 2 * radius; i++) {

            for (var j = 0; j <= 2 * radius; j++) {
                var point = new Point(i + topLeft.i, j + topLeft.j);
                if (!isValid(params, point))
                    continue;

                var obj = getAt(params, point);
                var type = getType(obj);

                // Check if the entity detected isn't us
                if (type == 'warrior' && obj.idx != self.idx) {

                    // Explode here
                    return {
                        action: 'explosive ring'
                    };
                }
            }
        }

        return {
            action: 'move',
            dir: Math.floor(Math.random() * 4)
        };
    }

    function defend(params) {
        return {
            action: 'move',
            dir: Math.floor(Math.random() * 4)
        };
    }

## Plant Bomb and Move

    function attack(params) {
        var self = params.self;
        // Check if can't place bombs anymore
        if (getBombsRemaining(self) <= 0)
            return {
                action: 'rest'
            };

        // Place Bomb, if not done already
        if (!hasPlacedBomb(self) && params.turn % 10 == 1)
            return {
                action: 'plant bomb'
            };

        var dir = Math.floor(Math.random() * 4);
        var nextPos = getMove(self.pos, dir);
        if (!isValid(params, nextPos))
            return {
                action: 'rest'
            };

        var obj = getAt(params, nextPos);
        var type = getType(obj);

        if (type == 'bomb')
            return {
                action: 'rest'
            };

        return {
            action: 'move',
            dir: dir
        };
    }
    
    function defend(params) {
        return {
            action: 'move',
            dir: Math.floor(Math.random() * 4)
        };
    }

## Search and Kill

    function attack(params) {
        var self = params.self;
        var entities = getEntArray(params);
        var enemy;

        // Utility function for getting direction
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
        
        entities.forEach(function(ent) {
            if (ent.idx == self.idx)
                return;

            enemy = ent;
        }); 
        
        if (!enemy)
            return {
                action: 'rest'
            };

        var dir = getDirection(enemy.pos, self.pos);
        if (dir == -1)
            return {
                action: 'move',
                dir: Math.floor(Math.random() * 4)
            };
        
        // Explode Code
        var radius = 2;
        var topLeft = new Point(self.pos.i - radius, self.pos.j - radius);
        for (var i = 0; i <= 2 * radius; i++) {

            for (var j = 0; j <= 2 * radius; j++) {
                var point = new Point(i + topLeft.i, j + topLeft.j);
                if (!isValid(params, point))
                    continue;
                
                var obj = getAt(params, point);
                var type = getType(obj);

                if (type == 'warrior' && obj.idx != self.idx && getExplosionsRemaining(self) > 0) {
                    return {
                        action: 'explosive ring'
                    };
                }
            }
        }
        
        // Check if we can attack instead
        var nextPos = getMove(self.pos, dir);
        if (!isValid(params, nextPos))
            return {
                action: 'rest'
            };

        var obj2 = getAt(params, nextPos);
        var type2 = getType(obj2);

        if (type2 == 'warrior')
            return {
                action: 'attack',
                dir: dir
            };

        // Move instead
        return {
            action: 'move',
            dir: dir
        };
    }

    function defend(params) {
        return {
            action: 'move',
            dir: Math.floor(Math.random() * 4)
        };
    }
