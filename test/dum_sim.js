var BattleLevel = require('../simulation/level').BattleLevel;

function finished() {
    console.log("Finished");
    process.exit(0);
}
const test_code = "\
function update(x) {\
    var r = 1;\
}";
var lvl = new BattleLevel(test_code,test_code, "./base.json", finished);
