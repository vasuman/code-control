function update(params) {
    var enemyEntity;
    for(var key in params.entities) {
        if(params.entities.hasOwnProperty(key)) {
            enemyEntity = params.entities[key];
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
    return { action: 'rest' };
}
