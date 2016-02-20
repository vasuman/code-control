var mapTemplate = {
    "height":18,
    "data":[
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    ],
    "tileheight":32,
    "tilewidth":32,
    "width":34,
    "tiledata":{
        "1": {
            "type": "obstacle",
            "image": "/basic.png",
            "i": 0,
            "j": 0
        }
    },
    "linewidth": 2
};

const TILE_FLOOR = 0, TILE_WALL = 1;
const size_x = 34, size_y = 18, fillprob = 40, generations = 2;

var generation_params = function (r1_cutoff, r2_cutoff, reps) {
	this.r1_cutoff = r1_cutoff;
	this.r2_cutoff = r2_cutoff;
	this.reps = reps;
}

const params = [new generation_params(5,2,4), new generation_params(5,-1,3)];

function GenerateMap(cback) {
	var self = this;
	this.grid;
	this.grid2;
	this.map = (JSON.parse(JSON.stringify(mapTemplate)));

	function initMap () {
		self.grid = new Array(size_y);
		for (var i=0;i<size_y;i++) {
			self.grid[i] = new Array(size_x);
		}

		self.grid2 = new Array(size_y);
		for (var i=0;i<size_y;i++) {
			self.grid2[i] = new Array(size_x);
		}

		function randpick() {
			if (Math.random()*100 < fillprob)
				return TILE_WALL;
			else
				return TILE_FLOOR;
		}

		function generation(index) {
			var yi,xi,ii,jj;

			for(yi=1; yi<size_y-1; yi++) {
				for(xi=1; xi<size_x-1; xi++) {
					var adjcount_r1 = 0,
						adjcount_r2 = 0;

					for(ii=-1; ii<=1; ii++) {
						for(jj=-1; jj<=1; jj++) {
							if(self.grid[yi+ii][xi+jj] != TILE_FLOOR)
								adjcount_r1++;
						}
					}

					for(ii=yi-2; ii<=yi+2; ii++) {
						for(jj=xi-2; jj<=xi+2; jj++) {
							if(Math.abs(ii-yi)==2 && Math.abs(jj-xi)==2)
								continue;
							if(ii<0 || jj<0 || ii>=size_y || jj>=size_x)
								continue;
							if(self.grid[ii][jj] != TILE_FLOOR)
								adjcount_r2++;
						}
					}

					if(adjcount_r1 >= params[index].r1_cutoff || adjcount_r2 <= params[index].r2_cutoff)
						self.grid2[yi][xi] = TILE_WALL;
					else
						self.grid2[yi][xi] = TILE_FLOOR;
				}
			}

			for(yi=1; yi<size_y-1; yi++) {
				for(xi=1; xi<size_x-1; xi++) {
					self.grid[yi][xi] = self.grid2[yi][xi];
				}
			}
		}

		for (var i=1;i<size_y-1;i++) {
			for (var j=1;j<size_x-1;j++) {
				self.grid[i][j] = randpick();
			}
		}

		for (var i=0;i<size_y;i++) {
			for (var j=0;j<size_x;j++) {
				self.grid2[i][j] = TILE_WALL;
			}
		}

		for (var i=0;i<size_y;i++) {
			self.grid[i][0] = self.grid[i][size_x-1] = TILE_WALL;
		}
		for (var i=0;i<size_x;i++) {
			self.grid[0][i] = self.grid[size_y-1][i] = TILE_WALL;
		}

		for (var i=0;i<generations;i++) {
			for (var j=0;j<params[i].reps;j++)
				generation(i);
		}

		setImmediate(self.nextStep, self.mapValidate());
	}
	this.initMap = initMap;

	function mapValidate() {
		var floorCount = 0;
		var fi,fj;

		for (var i=0;i<size_y;i++) {
			for (var j=0;j<size_x;j++) {
				self.grid2[i][j] = self.grid[i][j];
				if (!self.grid[i][j]) {
					fi = i;
					fj = j;
					floorCount++;
				}
			}
		}

		var currentPool = self.countFloorInCurrentPool(fi, fj);
		if (currentPool != floorCount)
			return false;
		else
			return true;
	}
	this.mapValidate = mapValidate;

	function countFloorInCurrentPool(fi, fj) {
		if (fi < 0 || fi >= size_y || fj < 0 || fj >= size_x)
			return 0;
		if (self.grid2[fi][fj])
			return 0;
		self.grid2[fi][fj] = TILE_WALL;

		return 1 + countFloorInCurrentPool(fi-1,fj) +
			countFloorInCurrentPool(fi+1,fj) +
			countFloorInCurrentPool(fi,fj-1) +
			countFloorInCurrentPool(fi,fj+1);
	}
	this.countFloorInCurrentPool = countFloorInCurrentPool;

	function nextStep(isMapValid) {
		if (isMapValid)
			self.mapAssign();
		else
			return new GenerateMap(cback);
	}
	this.nextStep = nextStep;

	function mapAssign() {
		for (var i=0;i<size_y;i++) {
			for (var j=0;j<size_x;j++) {
				self.map.data[i*self.map.width + j] = self.grid[i][j];
			}
		}
		setImmediate(cback, self.map);
	}
	this.mapAssign = mapAssign;

	this.initMap();
}

module.exports.GenerateMap = GenerateMap;
