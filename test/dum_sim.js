var BattleLevel = require('../simulation/level').BattleLevel;

function finished(result) {
    console.log(JSON.stringify(result));
    process.exit(0);
}
const test_code = "\
function update(x) {\
    var p = new Point(0, 0);\
    return { action: 'move', dir: Direction.R };\
}";
var lvl = new BattleLevel(test_code,test_code, "./simulation/base.json", finished);
