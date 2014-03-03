const INTERVAL = 1000;
var canvas, ctx,
state, seek, dir, delT = 0, entities = {}, bgCanvas,
images = {}, prevTime, map, replay;

const LOADING = 0, ERROR = 1, DONE = 2, PLAY = 3;

function setImmediate(f) {
    return setTimeout(function() {
        f.apply(this, Array.prototype.slice.call(arguments, 1));
    }, 0)
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
    replay = JSON.parse(this.responseText);
    setImmediate(render);
}

function startLoad(mapPath, replayPath) {
    canvas = document.getElementById('render-canvas');
    ctx = canvas.getContext('2d');
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
function transition() {
    var nextEv = replayJSON[seek + dir];
    if(!nextEv) {
        throw new Error('undefined transition state!');
    }
    if('spawn' in nextEv) {
        if(dir == 1) {
            var entClone = clone(nextEv[spawn]);
        } else if(dir == -1) {
            
        }
    }
}

function changeState() {
    
}

function drawState() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgCanvas, 0, 0);
    var ent;
    for(ent in entities) {
    }
}

function draw() {
    if(state == LOADING) {
        
    } else if(state == ERROR) {
        
    } else if(state == PLAY) {
        var nowDate = Date.now();
        delT += (nowDate - prevDate);
        prevDate = nowDate;
        if(delT > INTERVAL) {
            delT = 0;
            shift();
            state = DONE;
        } else {
            transition();
        }
        drawState();
    }
}

/* DEBUG */
startLoad('base.json', 'result.json');
