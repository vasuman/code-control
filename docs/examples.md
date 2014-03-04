# Examples

## Sleepy

    function update(params) {
        return { action: 'rest' };    
    }

## Jerky
    
    function update(params) {
        var dir = Math.floor(Math.random() * 4);  
        return { action: 'move', dir: dir };
    }

## Seek and Destroy

    function update(params) {
        var enemyEntity;
        for(var i = 0; i < params.entities.length; i++) {
            enemyEntity = params.entities[i];
            /* Check if entity is really an enemy */
            if(enemyEntity.team != params.self.team) {
                /* Check if it's close by */
                if(getDistance(enemyEntity.pos, params.self.pos) == 1) {
                    /* Attack it */
                    return {
                        action: 'attack',
                        dir: getDirection(enemyEntity.pos, params.self.pos)
                    };
                } else {
                    /* Move towards it */
                    return { 
                        action: 'move', 
                        dir: getDirection(enemyEntity.pos, params.self.pos)
                    };
                }
            }
        }
    }
