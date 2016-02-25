var canvasArray, ctxArray = [], mapArray = [], replayArray = [], overlayArray = [];
var matches;
var bgCanvas = document.createElement('canvas'), 
	bgCtx = bgCanvas.getContext('2d');
var playTime, state, seek = 0, dir, delT = 0, entities = {}, images = {}, prevTime, dead = {};
var scale = 4;
var currentHoverObject = -1;

var bombPositions = [];
const LOADING = 0, ERROR = 1, DONE = 2;
const MOVE_DELAY = 1000;
const F_SIZE = 13;
const playbackDelay = 30;

function setImmediate(f) {
    return setTimeout(function() {
        f.apply(this, Array.prototype.slice.call(arguments, 1));
    }, 0)
}

function setHoverFunction(i) {
	overlayArray[i].addEventListener('mouseenter',function() {
		if (currentHoverObject == -1) {
            currentHoverObject = i;
			setImmediate(onHoverIn);
		}
	});
	overlayArray[i].addEventListener('mouseleave',function() {
		if (currentHoverObject != -1) {
            bombPositions[currentHoverObject] = [];
            currentHoverObject = -1;
			setImmediate(onHoverOut);
		}
	});
}

function getIndexOfPointArray(arr, pos) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].i == pos.i && arr[i].j == pos.j)
            return i;
    }

    return -1;
}

function bombHandler(nextEv, f, dir) {
    var data = nextEv.bomb;
    var moveData = data.move;
    var thisEnt = entities[moveData.idx];
    // console.log(thisEnt);
    var nPos = moveData.nextPos;
    var oPos = moveData.pos;

    var delPos = {
        i: nPos.i - oPos.i,
        j: nPos.j - oPos.j
    };

    /*
        thisEnt.pos.i += f * ent.pos.i;
        thisEnt.pos.j += f * ent.pos.j;
    */
    
    thisEnt.pos.i += f * delPos.i;
    thisEnt.pos.j += f * delPos.j;

    if (dir == 0) {
        if (data.placed) {
            bombPositions[currentHoverObject].push(data.placedPos);
        }

        if (data.explode) {
            var index = getIndexOfPointArray(bombPositions[currentHoverObject], data.explodePos);
            bombPositions[currentHoverObject].splice(index, 1);

            /*
                var ent = entities[nextEv.damage.idx];
                ent.health -= f * nextEv.damage.amt;
                ent.flags.damaged = true;
            */

        }
    } else {
        if (data.placed) {
            var index = getIndexOfPointArray(bombPositions[currentHoverObject], data.placedPos);
            bombPositions[currentHoverObject].splice(index, 1);
        }

        if (data.explode) {
            bombPositions[currentHoverObject].push(data.explodePos);
        }
    }

    if (data.explode) {
        var damageData = data.damage;
        thisEnt = entities[damageData.idx];
        thisEnt.health -= f * damageData.amt;
        thisEnt.flags.damaged = true;
    }
    // console.log(data);
    // console.log(bombPositions);
}

function explosionHandler(nextEv, f, dir) {
    var data = nextEv.explosion;

    function handle() {
        var ents = data.ents,
            bombs = data.bombs;

        ents.forEach(function damage(ent) {
            var thisEnt = entities[ent.idx];
            if (!thisEnt)
                return;

            thisEnt.health -= f * ent.amt;
            thisEnt.flags.damaged = true;
        });

        bombs.forEach(function remove(pos) {
            if (dir == 0) {
                var index = getIndexOfPointArray(bombPositions[currentHoverObject], pos);
                bombPositions[currentHoverObject].splice(index, 1);
            } else {
                bombPositions[currentHoverObject].push(pos);
            }
        });
    }

    handle();
    
    // console.log(data);
    // console.log(bombPositions);
}


function initElements() {
	state = LOADING;
	overlayArray = document.getElementsByClassName('overlay');
    canvasArray = document.getElementsByTagName('canvas');
    matches = JSON.parse(document.getElementById('matches-json').innerHTML);
	if (matches.length == 0) return;
	for (var i=0;i<canvasArray.length;i++) {
		var ctx = canvasArray[i].getContext('2d');
		ctxArray.push(ctx);
		mapArray.push(JSON.parse(matches[parseInt(i/2)].map));
		replayArray.push(matches[parseInt(i/2)].replay[i%2]);
        bombPositions.push([]);
    	ctx.textAlign = 'center';
    	ctx.textBaseline = 'middle';
		setHoverFunction(i);
	}
    setImmediate(render);
}

function render() {
    idx = 0;
	var map = mapArray[0];
    var imgList = [], i, img;
    for(i in map.tiledata) {
        if(map.tiledata.hasOwnProperty(i)) {
            img = map.tiledata[i].image;
            if(img && imgList.indexOf(img) == -1) {
                imgList.push(img);
            }
        }
    }
    loadImages(imgList, drawAllBG);
}

function loadImages(imgList, callback) {
    function cbWrap(i) {
        return function() {
            if(i >= imgList.length) {
                setImmediate(callback);
                return;
            }
            img = new Image;
            img.onload = cbWrap(i + 1);
            images[imgList[i]] = img;
            img.src = imgList[i];
        }
    }
    setImmediate(cbWrap(0));
}

const imgName = "/basic.png";
function drawState() {
    ctxArray[currentHoverObject].clearRect(0, 0, canvasArray[currentHoverObject].width, canvasArray[currentHoverObject].height);
    ctxArray[currentHoverObject].drawImage(bgCanvas, 0, 0);
    var ent, img, drawX, drawY;
    var map = mapArray[currentHoverObject];

    for (var i = 0; i < bombPositions[currentHoverObject].length; i++) {
        drawX = bombPositions[currentHoverObject][i].j * mapArray[currentHoverObject].tilewidth / scale;
        drawY = bombPositions[currentHoverObject][i].i * mapArray[currentHoverObject].tileheight / scale;
        /*
            img.j = 3;
            img.i = 0;
            img.name = imgName;
            console.log(img.name);
            console.log(img.j);
            console.log(img.i);
            console.log('Goodbye');
        */
        ctxArray[currentHoverObject].drawImage(
            images[imgName], 
            3 * mapArray[currentHoverObject].tilewidth, 
            0 * mapArray[currentHoverObject].tileheight, 
            mapArray[currentHoverObject].tilewidth / scale,
            mapArray[currentHoverObject].tileheight / scale,
            drawX, drawY,
            mapArray[currentHoverObject].tilewidth / scale,
            mapArray[currentHoverObject].tileheight / scale
        );

    }

    for(key in entities) {
        if(entities.hasOwnProperty(key)) {
            ent = entities[key];
            img = ent.image;
            // console.log(img.name == imgName);
            drawX = ent.pos.j * mapArray[currentHoverObject].tilewidth / scale;
            drawY = ent.pos.i * mapArray[currentHoverObject].tileheight / scale;
            ctxArray[currentHoverObject].drawImage(
				images[img.name],
				img.j * mapArray[currentHoverObject].tilewidth,
				img.i * mapArray[currentHoverObject].tileheight,
				mapArray[currentHoverObject].tilewidth / scale,
				mapArray[currentHoverObject].tileheight / scale,
				drawX, drawY,
				mapArray[currentHoverObject].tilewidth / scale,
				mapArray[currentHoverObject].tileheight / scale);
            //ctx.font = F_SIZE + 'pt Serif';
            //ctx.fillText('' + ent.health, drawX, drawY + map.tileheight / 2);
        }
    }
}

function draw() {
	if (currentHoverObject != -1) {
    	if(state == LOADING) {
        	//drawText('Loading...', 32);
    	} else if(state == ERROR) {

    	} else if(state == DONE) {
    		//ctxArray[currentHoverObject].clearRect(0, 0, canvasArray[currentHoverObject].width, canvasArray[currentHoverObject].height);
        	drawState();
    	}
	}	
    requestAnimationFrame(draw);
}

function drawAllBG() {
	var i, j, d, tile;
	var index = 0;

	mapArray.forEach(function(map) {
    	bgCanvas.width = map.width * map.tilewidth / scale;
    	bgCanvas.height = map.height * map.tileheight / scale;
    	for(i = 0; i < map.height; i++) {
        	for(j = 0; j < map.width; j++) {
            	d = map.data[i * map.width + j];
            	if(d != 0) {
                	tile = map.tiledata[d];
                	bgCtx.drawImage(images[tile.image],
                    	            tile.j * map.tilewidth / scale,
                       		        tile.i * map.tileheight / scale,
                         	       	map.tilewidth / scale, map.tileheight / scale,
                                	j * map.tilewidth / scale, i * map.tileheight / scale,
                                	map.tilewidth / scale, map.tileheight / scale);
            	}
        	}
    	}

    	for(i = 0; i <= map.height; i++) {
        	bgCtx.beginPath();
        	bgCtx.moveTo(0, i * map.tileheight / scale);
        	bgCtx.lineTo(bgCanvas.width, i * map.tileheight / scale);
        	bgCtx.stroke();
        	bgCtx.closePath();
    	}
    	for(i = 0; i <= map.width; i++) {
        	bgCtx.beginPath();
        	bgCtx.moveTo(i * map.tilewidth / scale, 0);
        	bgCtx.lineTo(i * map.tilewidth / scale, bgCanvas.height);
        	bgCtx.stroke();
        	bgCtx.closePath();
    	}
		canvasArray[index].width = bgCanvas.width;
		canvasArray[index].height = bgCanvas.height;
		ctxArray[index].drawImage(bgCanvas,0,0);
    	//state = DONE;
		index++;
	});
	//state = DONE;
    setImmediate(draw);
}

function drawBG(callback) {
	bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    var i, j, d, tile;
	var map = mapArray[currentHoverObject];
    for(i = 0; i < map.height; i++) {
        for(j = 0; j < map.width; j++) {
            d = map.data[i * map.width + j];
            if(d != 0) {
                tile = map.tiledata[d];
                bgCtx.drawImage(images[tile.image],
                                tile.j * map.tilewidth / scale,
                                tile.i * map.tileheight / scale,
                                map.tilewidth / scale, map.tileheight / scale,
                                j * map.tilewidth / scale, i * map.tileheight / scale,
                                map.tilewidth / scale, map.tileheight / scale);
            }
        }
    }
    for(i = 0; i <= map.height; i++) {
        bgCtx.beginPath();
        bgCtx.moveTo(0, i * map.tileheight / scale);
        bgCtx.lineTo(bgCanvas.width, i * map.tileheight / scale);
        bgCtx.stroke();
        bgCtx.closePath();
    }
    for(i = 0; i <= map.width; i++) {
        bgCtx.beginPath();
        bgCtx.moveTo(i * map.tilewidth / scale, 0);
        bgCtx.lineTo(i * map.tilewidth / scale, bgCanvas.height);
        bgCtx.stroke();
        bgCtx.closePath();
	}
	state = DONE;
	setImmediate(callback);
}

function onHoverIn() {
	//currentHoverObject = index;
	drawBG(startInterval);
}

function startInterval() {
	playTime = setInterval(doPlay, playbackDelay);
}

function onHoverOut() {
	clearInterval(playTime);
	state = LOADING;
    seek = 0;
    entities = {};
    dead = {};
    // bombPositions[currentHoverObject] = [];
	// currentHoverObject = -1;
}

function doPlay() {
	nextFrame();
	if (seek > replayArray[currentHoverObject].length -1) {
		clearInterval(playTime);
	}
}

function nextFrame() {
    if(seek > (replayArray[currentHoverObject].length - 1)) {
        return;
    }
    dir = 0;
    update();
}

function clearFlags() {
    var key;
    for(key in entities) {
        if(entities.hasOwnProperty(key)) {
            entities[key].flags = {};
        }
    }
}

function clone(x) {
    return JSON.parse(JSON.stringify(x));
}

function update() {
    //disableButtons();
    if(dir != -1 && dir != 0) {
        throw new Error('invalid direction');
    }
    var curEv = replayArray[currentHoverObject][seek],
    	f = (dir == 0) ? 1: -1,
    	nextEv = replayArray[currentHoverObject][seek + dir];
    if(!nextEv) {
        throw new Error('undefined transition state!');
    }
    clearFlags();
    if('spawn' in nextEv) {
        if(dir == 0) {
            var entClone = clone(nextEv.spawn);
            entities[entClone.idx] = entClone;
        } else {
            delete entities[nextEv.spawn.idx];
        }
    } else if('move' in nextEv) {
        var ent = nextEv.move,
        thisEnt = entities[ent.idx];
        thisEnt.pos.i += f * ent.pos.i;
        thisEnt.pos.j += f * ent.pos.j;
    } else if('damage' in nextEv) {
        var ent = entities[nextEv.damage.idx];
        ent.health -= f * nextEv.damage.amt;
        ent.flags.damaged = true;
    } else if('death' in nextEv) {
        if(dir == 0) {
            dead[nextEv.death] = entities[nextEv.death];
            delete entities[nextEv.death];
        } else {
            entities[nextEv.death] = dead[nextEv.death];
            delete dead[nextEv.death];
        }
    } else if ('bombAdd' in nextEv) {

        var pos = nextEv.bombAdd;
        if (dir == 0) {
            bombPositions[currentHoverObject].push(pos);
        } else {
            var index = getIndexOfPointArray(bombPositions[currentHoverObject], pos);
            if (index == -1)
                console.log('MOM' + index);
            bombPositions[currentHoverObject].splice(index, 1);
        }

    } else if ('bombRemove' in nextEv) {

        console.log('in bomb remove');
        var pos = nextEv.bombRemove;
        if (dir == 0) {
            
            var index = getIndexOfPointArray(bombPositions[currentHoverObject], pos);
            if (index == -1)
                console.log('DAD' + index);
            bombPositions[currentHoverObject].splice(index, 1);

        } else {
            bombPositions[currentHoverObject].push(pos);
        }

    } else if ('bomb' in nextEv) {
        bombHandler(nextEv, f, dir);
    } else if ('explosion' in nextEv) {
        explosionHandler(nextEv, f, dir);
    }
    seek += f;
    //resetButtons();
}

window.onload = initElements;
