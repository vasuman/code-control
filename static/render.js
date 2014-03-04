var canvas, ctx, logArea, nextButton, prevButton,
state, seek = -1, dir, delT = 0, entities = {}, bgCanvas,
images = {}, prevTime, map, replay;

const LOADING = 0, ERROR = 1, DONE = 2, PLAY = 3;

const MOVE_DELAY = 1000;
function setImmediate(f) {
    return setTimeout(function() {
        f.apply(this, Array.prototype.slice.call(arguments, 1));
    }, 0)
}

function initElements() {
    canvas = document.getElementById('render-canvas');
    ctx = canvas.getContext('2d');
    logArea = document.getElementById('log-div');
    prevButton = document.getElementById('prev-button');
    nextButton = document.getElementById('next-button');
    prevButton.onclick = prevFrame;
    nextButton.onclick = nextFrame;
}

function stripChar(x, ch) {
    while(x.find(ch) != -1) {
        x = x.replace(ch, '');
    }
    return x;
}

function XSafe(x) {
    return stripChar(stripChar(x, '<'), '>');
}

function loadReplay(replayPath) {
    return function() {
        if(this.status != 200) {
            state = ERROR;
            return;
        }
        var replayXhr = new XMLHttpRequest;
        map = JSON.parse(this.responseText);
        replayXhr.onload = callRender;
        replayXhr.open('GET', replayPath, true);
        replayXhr.send();
    }
}

function callRender() {
    replay = JSON.parse(this.responseText).replay;
    setImmediate(render);
}

function startLoad(mapPath, replayPath) {
    var mapXhr = new XMLHttpRequest;
    mapXhr.onload = loadReplay(replayPath);
    mapXhr.open('GET', mapPath, true);
    mapXhr.send();
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
    cbWrap(0)();
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
                                map.tilewidth, map.tileheight
                               );
            }
        }
    }
    bgCtx.setLineWidth(map.linewidth);
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
    ctx.drawImage(bgCanvas, 0, 0);
    drawState();
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
    loadImages(imgList, drawBG)
}

function clone(x) {
    return JSON.parse(JSON.stringify(x));
}

function update() {
    var curEv = replay[seek],
    nextEv = replay[seek + dir];
    if(curEv && curEv.log) {
        logArea.innerHTML = '';
    }
    if(!nextEv) {
        throw new Error('undefined transition state!');
    }
    if('spawn' in nextEv) {
        if(dir == 1) {
            var entClone = clone(nextEv.spawn);
            entities[entClone.idx] = entClone;
        } else if(dir == -1) {
            delete entities[nextEv.spawn.idx];
        }
        return true;
    }
    if('log' in nextEv) {
        logArea.innerHTML = XSafe(nextEv.log)
        return true;
    }
    if('move' in nextEv) {
        var ent = nextEv.move,
        thisEnt = entities[ent.idx];
        if(delT >= MOVE_DELAY) {
            thisEnt.pos.i = ent.pos.i;
            thisEnt.pos.j = ent.pos.j;
            thisEnt.moveFlag = false;
            return true;
        }
        var frac = (delT / MOVE_DELAY);
        thisEnt.moveFlag = true;
        thisEnt.tI = (1 - frac) * thisEnt.pos.i + frac * ent.pos.i;
        thisEnt.tJ = (1 - frac) * thisEnt.pos.j + frac * ent.pos.j;
        return false;
    }
    if('attack' in nextEv) {
        throw new Error('Unimplemented');
    }
}

function drawState() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgCanvas, 0, 0);
    var ent, drawX, drawY, img;
    for(key in entities) {
        if(entities.hasOwnProperty(key)) {
            ent = entities[key];
            img = ent.image;
            if(ent.moveFlag) {
                drawY = ent.tI * map.tileheight;
                drawX = ent.tJ * map.tilewidth;
            } else {
                drawX = ent.pos.j * map.tilewidth;
                drawY = ent.pos.i * map.tileheight;
            }
            ctx.drawImage(images[img.name], img.j * map.tilewidth, img.i * map.tileheight, 
                          map.tilewidth, map.tileheight,
                          drawX, drawY, map.tilewidth, map.tileheight);
        }
    }
}

function resetButtons(state) {
    console.log('buttons reset');
}

function nextFrame() {
    dir = 1;
    startPlay();
}

function prevFrame() {
    dir = -1;
    startPlay();
}

function startPlay() {
    resetButtons(false);
    state = PLAY;
    prevDate = Date.now();
}

function drawText(text, size) {
    ctx.fillText(text, canvas.width / 2 - (text.length * size) / 2, canvas.height / 2 - size / 2, size);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(state == LOADING) {
        drawText('Loading...', 32);
    } else if(state == ERROR) {
        
    } else {
        if(state == PLAY) {
            var nowDate = Date.now();
            delT += (nowDate - prevDate);
            prevDate = nowDate;
            if(update()) {
                delT = 0;
                seek = seek + dir;
                state = DONE;
                resetButtons(true);
            }
        }
        drawState();
    }
    requestAnimationFrame(draw);
}

/* DEBUG */
initElements();
startLoad('base.json', 'result.json');
