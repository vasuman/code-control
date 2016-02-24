var canvas, ctx, logTable, nextButton, prevButton, playButton, pauseButton,
resetButton, playTime = 0,
state, seek = 0, dir, delT = 0, entities = {}, bgCanvas,
images = {}, prevTime, map, replay, dead = {},
replayArray, match1, match2;

const LOADING = 0, ERROR = 1, DONE = 2;

const MOVE_DELAY = 1000;
function setImmediate(f) {
    return setTimeout(function() {
        f.apply(this, Array.prototype.slice.call(arguments, 1));
    }, 0)
}

function downloadLink() {
    var a = document.getElementById('dload-link');
    a.href = 'data:application/json;charset=utf-8;base64,' + btoa(JSON.stringify(replay));
}

function initElements() {
   	canvas = document.getElementById('render-canvas');
    ctx = canvas.getContext('2d');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    prevButton = document.getElementById('prev-button');
    nextButton = document.getElementById('next-button');
    playButton = document.getElementById('play-button');
    pauseButton = document.getElementById('pause-button');
    resetButton = document.getElementById('reset-button');
	match1 = document.getElementById('match1');
	match2 = document.getElementById('match2');
    switch_attack_defend= document.getElementById('switch_attack_and_defend').innerHTML.trim();
    map = JSON.parse(document.getElementById('map-json').innerHTML);
    replayArray = JSON.parse(document.getElementById('replay-json').innerHTML);
    if(switch_attack_defend.trim()=="true")
        replay = replayArray[1];
    else 
        replay = replayArray[0];
    prevButton.onclick = prevFrame;
    nextButton.onclick = nextFrame;
    playButton.onclick = beginPlay;
    pauseButton.onclick = pausePlay;
    resetButton.onclick = resetPlay;
	match1.onclick = function() {
        window.scrollTo(0,document.body.scrollHeight);
		resetPlay();
        if(switch_attack_defend=="true")
            replay = replayArray[1];
		else 
            replay = replayArray[0];
		match1.style.backgroundColor = "rgb(225,225,225)";
		match2.style.backgroundColor = "white";
	};
	match2.onclick = function() {
        window.scrollTo(0,document.body.scrollHeight);
		resetPlay();
        if(switch_attack_defend=="true")
            replay = replayArray[0];
        else 
            replay = replayArray[1];
		match2.style.backgroundColor = "rgb(225,225,225)";
		match1.style.backgroundColor = "white";
	};

    downloadLink();
    setImmediate(render);
    pausePlay();
}

function doPlay() {
    nextFrame();
    if(seek > replay.length - 1) {
        pausePlay();
    }
}
function togglePlayState(v) {
    prevButton.disabled = nextButton.disabled = v;
    playButton.disabled = resetButton.disabled = v;
    pauseButton.disabled = !v;
}

var playInt = 200;
function beginPlay() {
    togglePlayState(true);
    playTime = setInterval(doPlay, playInt);
}
function pausePlay() {
    clearInterval(playTime);
    togglePlayState(false);
    resetButtons();
}
function resetPlay() {
    seek = 0;
    entities = {};
    dead = {};
}
function stripChar(x, ch, rp) {
    while(x.find(ch) != -1) {
        x = x.replace(ch, rp);
    }
    return x;
}

function XSafe(x) {
    return stripChar(stripChar(x, '<', '&lt;'), '>', '&gt');
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

function drawBG() {
    bgCanvas = document.createElement('canvas');
    bgCanvas.width = map.width * map.tilewidth;
    bgCanvas.height = map.height * map.tileheight;
    var bgCtx = bgCanvas.getContext('2d'), i, j, d, tile;
    for(i = 0; i < map.height; i++) {
        for(j = 0; j < map.width; j++) {
            d = map.data[i * map.width + j];
            if(d != 0) {
                tile = map.tiledata[d];
                bgCtx.drawImage(images[tile.image],
                                tile.j * map.tilewidth, 
                                tile.i * map.tileheight,
                                map.tilewidth, map.tileheight,
                                j * map.tilewidth, i * map.tileheight,
                                map.tilewidth, map.tileheight);
            }
        }
    }
    for(i = 0; i <= map.height; i++) {
        bgCtx.beginPath();
        bgCtx.moveTo(0, i * map.tileheight);
        bgCtx.lineTo(bgCanvas.width, i * map.tileheight);
        bgCtx.stroke();
        bgCtx.closePath();
    }
    for(i = 0; i <= map.width; i++) {
        bgCtx.beginPath();
        bgCtx.moveTo(i * map.tilewidth, 0);
        bgCtx.lineTo(i * map.tilewidth, bgCanvas.height);
        bgCtx.stroke();
        bgCtx.closePath();
    }
    canvas.width = bgCanvas.width;
    canvas.height = bgCanvas.height;
    state = DONE;
    setImmediate(draw);
}

function render() {
    idx = 0;
    var imgList = [], i, img;
    for(i in map.tiledata) {
        if(map.tiledata.hasOwnProperty(i)) {
            img = map.tiledata[i].image;
            if(img && imgList.indexOf(img) == -1) {
                imgList.push(img);
            }
        }
    }
    loadImages(imgList, drawBG);
}

function clone(x) {
    return JSON.parse(JSON.stringify(x));
}

function addRow(logEv) {
    var row = logArea.insertRow(logArea.rows.length - 1),
    logLvl = row.insertCell(0),
    logTeam = row.insertCell(1),
    logIdx = row.insertCell(2),
    logMsg = row.insertCell(3);
    logLvl.innerHTML = logEv.type;
    logTeam.innerHTML = logEv.player;
    logIdx.innerHTML = logEv.idx;
    logMsg.innerHTML = XSafe(logEv.m);
}

function update() {
    disableButtons();
    if(dir != -1 && dir != 0) {
        throw new Error('invalid direction');
    }
    var curEv = replay[seek],
    f = (dir == 0) ? 1: -1,
    nextEv = replay[seek + dir];
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
    }
    seek += f;
    resetButtons();
}


function clearFlags() {
    var key;
    for(key in entities) {
        if(entities.hasOwnProperty(key)) {
            entities[key].flags = {};
        }
    }
}

const F_SIZE = 13;
function drawState() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgCanvas, 0, 0);
    var ent, img, drawX, drawY;
    for(key in entities) {
        if(entities.hasOwnProperty(key)) {
            ent = entities[key];
            img = ent.image;
            drawX = ent.pos.j * map.tilewidth;
            drawY = ent.pos.i * map.tileheight;
            ctx.drawImage(images[img.name], img.j * map.tilewidth, img.i * map.tileheight, 
                          map.tilewidth, map.tileheight, drawX, drawY, map.tilewidth, map.tileheight);
            ctx.font = F_SIZE + 'pt Serif';
            ctx.fillText('' + ent.health, drawX, drawY + map.tileheight / 2);
        }
    }
}

function disableButtons() {
    prevButton.disabled = nextButton.disabled = true;
}

function resetButtons() {
    if(seek > 0) {
        prevButton.disabled = false;
    }
    if(seek <= (replay.length - 1)){
        nextButton.disabled = false;
    }
}

function nextFrame() {
    if(seek > (replay.length - 1)) {
        return;
    }
    dir = 0;
    update();
}

function prevFrame() {
    if(seek <= 0) {
        return;
    }
    dir = -1;
    update();
}

function drawText(text, size) {
    ctx.fillText(text, canvas.width / 2 - (text.length * size) / 2, canvas.height / 2 - size / 2, size);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(state == LOADING) {
        drawText('Loading...', 32);
    } else if(state == ERROR) {
        
    } else if(state == DONE) {
        drawState();
    }
    requestAnimationFrame(draw);
}

/* DEBUG */
initElements();
window.addEventListener('load', initElements, false);
