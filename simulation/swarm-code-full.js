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
