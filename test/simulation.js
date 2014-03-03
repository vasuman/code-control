var fs = require('fs');
var BattleLevel = require('../simulation/level').BattleLevel;

function finished(result) {
    fs.writeFile('result.json', JSON.stringify(result), process.exit);
}

const t_code = "\
var messages = [];\
function update(x) {\
    return { action: 'move', dir: Direction.D };\
}";

const s_code = "\
function update(x) {\
    return { action: 'move', dir: Direction.R };\
}"

var lvl = new BattleLevel(t_code, s_code, "./simulation/base.json", finished);
