
var index = lunr(function () {
    this.field('body');
    this.ref('url');
});

var documentTitles = {};



documentTitles["intro.html#introduction"] = "Introduction";
index.add({
    url: "intro.html#introduction",
    title: "Introduction",
    body: "# Introduction  **Code Character** is a versus event. Your aim is to code a character and defeat the other player.  "
});

documentTitles["intro.html#objective"] = "Objective";
index.add({
    url: "intro.html#objective",
    title: "Objective",
    body: "## Objective  You create a *character* which is controlled by a **single** entry point, the `update` loop.      function update(params) {         // Do stuff here     }  The `update` loop is executed each turn for your character with some `params` that represent the current state of the game.  "
});

documentTitles["intro.html#scoring"] = "Scoring";
index.add({
    url: "intro.html#scoring",
    title: "Scoring",
    body: "## Scoring  Once you have coded your character and submitted it. You can challenge other players' characters. Then, a match is simulated between your two characters and the winner is awarded a certain number of points. The final winners are decided based on who has the *most* number of points.  "
});

documentTitles["intro.html#language"] = "Language";
index.add({
    url: "intro.html#language",
    title: "Language",
    body: "## Language  The chosen implementation language is [Javascript](https://developer.mozilla.org/en/docs/Web/JavaScript) chosen for it's specific ease of use. Also being an interpreted, scripting language with *no* static typing it offers several coding speed benefits.  "
});

documentTitles["intro.html#environment"] = "Environment";
index.add({
    url: "intro.html#environment",
    title: "Environment",
    body: "### Environment  All submitted code is executed in a sandboxed environment so, the standard browser `document` and `window` objects are *not* present. There are *no* module loaders like `require` either.  The standard language features like, * `Object` * `Array` * `Math`  etc. *are* accessible.  "
});

documentTitles["intro.html#linting"] = "Linting";
index.add({
    url: "intro.html#linting",
    title: "Linting",
    body: "### Linting For safety checking we employ some basic [code linting](http://en.wikipedia.org/wiki/Lint_%28software%29). Things to ensure,  + **No access of undeclared global variables**       var b;     function update(params) {         b = 2;  /* GUD */         a = 1;  /* BAD */     }   + **No modification of provided API objects**       function update(params) {         Point.x = 1;    /* NO */     }   + **No modification of `prototype` of inbuilt objects**       function update(params) {         Array.prototype.toString = function() {             return 'I am a 1337 h@xx0r'    /* NOPE */         }     } "
});



documentTitles["update.html#update"] = "Update";
index.add({
    url: "update.html#update",
    title: "Update",
    body: "# Update  The single entry point to all your code. This is the only function that is actually called by the simulation. Controls the `action` your character takes during that turn. Any **declared** global variables are accessible *persistantly*. The `update` function **must** be declared.  &gt; Additional functions -- that are called from `update` may also be declared.  "
});

documentTitles["update.html#return-value"] = "Return Value";
index.add({
    url: "update.html#return-value",
    title: "Return Value",
    body: "## Return Value  The `action` your character performs is determined by the `Object` that your function returns. The **compulsory** key that your return object must posses is the `action` key. This key can be any one of,  "
});

documentTitles["update.html#rest"] = "rest";
index.add({
    url: "update.html#rest",
    title: "rest",
    body: "### rest  Does *nothing* for that turn.      function update(params) {         return { action: 'rest' }         }  &gt; Any additional keys are ignored  "
});

documentTitles["update.html#move"] = "move";
index.add({
    url: "update.html#move",
    title: "move",
    body: "### move  Attempts to move in the particular [Direction](). If the new position is invalid -- out of bounds; or already occupied, the `move` *fails*. This action **requires** an additional `dir` key which specifies the [Direction]() to move in.      function update(params) {         return {             action: 'move',             dir: Direction.U         }     }  "
});

documentTitles["update.html#attack"] = "attack";
index.add({
    url: "update.html#attack",
    title: "attack",
    body: "### attack  If an entity is present *one* tile away in the [Direction]() `dir` from the current position. The other character is `damaged`.      function update(params) {         return {             action: 'attack',             dir: Direction.D         }     }   "
});

documentTitles["update.html#entity"] = "Entity";
index.add({
    url: "update.html#entity",
    title: "Entity",
    body: "## Entity  An entity is just a plain old Javascript `Object` that describes well, an *entity*. Its keys describe its state. Available keys,  * *idx*: A unique `id` that identifies each entity. * *team*: A number that identifies which team the entity belongs to. * *pos*: A [Point]() object that describes its position on the grid. * *health*: The remaining health of the entity.  "
});

documentTitles["update.html#parameters"] = "Parameters";
index.add({
    url: "update.html#parameters",
    title: "Parameters",
    body: "## Parameters  Your `update` function is supplied with a bunch of parameters that specify the current game state. All of these parameters are encapsualted into a single `params` object. All parameters are accesible via the *keys* of this object.  "
});

documentTitles["update.html#paramsself"] = "params.self";
index.add({
    url: "update.html#paramsself",
    title: "params.self",
    body: "### params.self  An `entity` object that describes the **character that is being updated**.  "
});

documentTitles["update.html#paramsmap"] = "params.map";
index.add({
    url: "update.html#paramsmap",
    title: "params.map",
    body: "### params.map  A one dimensional `Array` that represents the entire *game grid* at the current instant. The API provides a utility [getAt]() function to help seeking using traditional `i`, `j` indexing.  &gt; Modifying these parameters *doesn't* change the game state. You can *only* affect the state by *returning* an `action` and update your character.  "
});

documentTitles["update.html#paramsentities"] = "params.entities";
index.add({
    url: "update.html#paramsentities",
    title: "params.entities",
    body: "### params.entities  An `Array` of all the *entities* currently present on the map. "
});



documentTitles["api.html#api"] = "API";
index.add({
    url: "api.html#api",
    title: "API",
    body: "# API  "
});

documentTitles["api.html#direction"] = "Direction";
index.add({
    url: "api.html#direction",
    title: "Direction",
    body: "## Direction  An object containing constants representing the directions,       const Direction = {         U: 0,         D: 1,         L: 2,         R: 3     }   "
});

documentTitles["api.html#getatparams-point"] = "getAt(params, point)";
index.add({
    url: "api.html#getatparams-point",
    title: "getAt(params, point)",
    body: "## getAt(params, point)  "
});

documentTitles["api.html#getdistancepointa-pointb"] = "getDistance(pointA, pointB)";
index.add({
    url: "api.html#getdistancepointa-pointb",
    title: "getDistance(pointA, pointB)",
    body: "## getDistance(pointA, pointB)  "
});

documentTitles["api.html#getdirectionpointa-pointb"] = "getDirection(pointA, pointB)";
index.add({
    url: "api.html#getdirectionpointa-pointb",
    title: "getDirection(pointA, pointB)",
    body: "## getDirection(pointA, pointB)  "
});

documentTitles["api.html#getentidxparams-idx"] = "getEntIdx(params, idx)";
index.add({
    url: "api.html#getentidxparams-idx",
    title: "getEntIdx(params, idx)",
    body: "## getEntIdx(params, idx)  "
});

documentTitles["api.html#gettypeobject"] = "getType(object)";
index.add({
    url: "api.html#gettypeobject",
    title: "getType(object)",
    body: "## getType(object)  "
});

documentTitles["api.html#getmovepoint-dir"] = "getMove(point, dir)";
index.add({
    url: "api.html#getmovepoint-dir",
    title: "getMove(point, dir)",
    body: "## getMove(point, dir)  "
});



documentTitles["examples.html#examples"] = "Examples";
index.add({
    url: "examples.html#examples",
    title: "Examples",
    body: "# Examples  "
});

documentTitles["examples.html#sleepy"] = "Sleepy";
index.add({
    url: "examples.html#sleepy",
    title: "Sleepy",
    body: "## Sleepy      function update(params) {         return { action: 'rest' };         }  "
});

documentTitles["examples.html#jerky"] = "Jerky";
index.add({
    url: "examples.html#jerky",
    title: "Jerky",
    body: "## Jerky          function update(params) {         var dir = Math.floor(Math.random() * 4);           return { action: 'move', dir: dir };     }  "
});

documentTitles["examples.html#seek-and-destroy"] = "Seek and Destroy";
index.add({
    url: "examples.html#seek-and-destroy",
    title: "Seek and Destroy",
    body: "## Seek and Destroy      function update(params) {         var enemyEntity;         for(var i = 0; i &lt; params.entities.length; i++) {             enemyEntity = params.entities[i];             /* Check if entity is really an enemy */             if(enemyEntity.team != params.self.team) {                 /* Check if it's close by */                 if(getDistance(enemyEntity.pos, params.self.pos) == 1) {                     /* Attack it */                     return {                         action: 'attack',                         dir: getDirection(enemyEntity.pos, params.self.pos)                     };                 } else {                     /* Move towards it */                     return {                          action: 'move',                          dir: getDirection(enemyEntity.pos, params.self.pos)                     };                 }             }         }     } "
});


