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

var images = {},
	canvas,
	bgCanvas;

const TILE_FLOOR = 0, TILE_WALL = 1;
const size_x = 34, size_y = 18, fillprob = 40, generations = 2;

var generation_params = function (r1_cutoff, r2_cutoff, reps) {
	this.r1_cutoff = r1_cutoff;
	this.r2_cutoff = r2_cutoff;
	this.reps = reps;
}

var params;
var grid, grid2;

function generation(index) {
	var yi,xi,ii,jj;

	for(yi=1; yi<size_y-1; yi++) {
    	for(xi=1; xi<size_x-1; xi++) {
        	var adjcount_r1 = 0,
            	adjcount_r2 = 0;
 
  	      	for(ii=-1; ii<=1; ii++) {
    	    	for(jj=-1; jj<=1; jj++) {
            		if(grid[yi+ii][xi+jj] != TILE_FLOOR)
                		adjcount_r1++;
        		}
			}

        	for(ii=yi-2; ii<=yi+2; ii++) {
        		for(jj=xi-2; jj<=xi+2; jj++) {
            		if(Math.abs(ii-yi)==2 && Math.abs(jj-xi)==2)
                		continue;
            		if(ii<0 || jj<0 || ii>=size_y || jj>=size_x)
                		continue;
            		if(grid[ii][jj] != TILE_FLOOR)
                		adjcount_r2++;
        		}
			}

        	if(adjcount_r1 >= params[index].r1_cutoff || adjcount_r2 <= params[index].r2_cutoff)
            	grid2[yi][xi] = TILE_WALL;
        	else
            	grid2[yi][xi] = TILE_FLOOR;
    	}
	}

    for(yi=1; yi<size_y-1; yi++) {
    	for(xi=1; xi<size_x-1; xi++) {
        	grid[yi][xi] = grid2[yi][xi];
		}
	}
}

function GenerateMap(cback) {
	var argc = 10;

	params = new Array(generations);
	params[0] = new generation_params(5,2,4);
	params[1] = new generation_params(5,-1,3);

	initMap();

	for (var i=0;i<generations;i++) {
		for (var j=0;j<params[i].reps;j++)
			generation(i);
	}

	var isMapValid = mapValidate();
	if (isMapValid)
		mapAssign(cback);
	else
		GenerateMap();
}

function mapValidate() {
	var floorCount = 0;
	var fi,fj;

	for (var i=0;i<size_y;i++) {
		for (var j=0;j<size_x;j++) {
			grid2[i][j] = grid[i][j];
			if (!grid[i][j]) {
				fi = i;
				fj = j;
				floorCount++;
			}
		}
	}

	var currentPool = countFloorInCurrentPool(fi, fj);
	if (currentPool != floorCount)
		return false;
	else
		return true;
}

function countFloorInCurrentPool(fi, fj) {
	if (fi < 0 || fi >= size_y || fj < 0 || fj >= size_x)
		return 0;
	if (grid2[fi][fj])
		return 0;
	grid2[fi][fj] = TILE_WALL;

	return 1 + countFloorInCurrentPool(fi-1,fj) +
		countFloorInCurrentPool(fi+1,fj) +
		countFloorInCurrentPool(fi,fj-1) +
		countFloorInCurrentPool(fi,fj+1);
}

function mapAssign(cback) {
	var map = (JSON.parse(JSON.stringify(mapTemplate)));

	for (var i=0;i<size_y;i++) {
		for (var j=0;j<size_x;j++) {
			map.data[i*map.width + j] = grid[i][j];
		}
	}

	setImmediate(cback, map);
}

function makeArray(element, index, array) {
	array[index] = new Array(size_x);
}

function randpick() {
	if (Math.random()*100 < fillprob)
		return TILE_WALL;
	else
		return TILE_FLOOR;
}

function initMap () {
	grid = new Array(size_y);
	//grid.forEach(makeArray);
	for (var i=0;i<size_y;i++) {
		grid[i] = new Array(size_x);
	}

	grid2 = new Array(size_y);
	//grid2.forEach(makeArray);
	for (var i=0;i<size_y;i++) {
		grid2[i] = new Array(size_x);
	}

	for (var i=1;i<size_y-1;i++) {
		for (var j=1;j<size_x-1;j++) {
			grid[i][j] = randpick();
		}
	}
	
	for (var i=0;i<size_y;i++) {
		for (var j=0;j<size_x;j++) {
			grid2[i][j] = TILE_WALL;
		}
	}

	for (var i=0;i<size_y;i++) {
		grid[i][0] = grid[i][size_x-1] = TILE_WALL;
	}
	for (var i=0;i<size_x;i++) {
		grid[0][i] = grid[size_y-1][i] = TILE_WALL;
	}
}

module.exports.GenerateMap = GenerateMap;
