var BattleLevel = require('../simulation/level').BattleLevel;

function finished(result) {
    console.log(JSON.stringify(result));
    process.exit(0);
}

const t_code = "\
var messages  [];\
function update(x) {\
    return {action: 'rest'};\
}";

const s_code = "\
function update(x) {\
    return { action: 'move', dir: Direction.R };\
}"

var lvl = new BattleLevel(t_code, s_code, "./simulation/base.json", finished);
