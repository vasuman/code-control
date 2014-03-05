var fs = require('fs');
var BattleLevel = require('../simulation/level').BattleLevel;

function finished(result) {
    fs.writeFile('result.json', JSON.stringify(result), process.exit);
}

var codeA, codeB;
fs.readFile('test/p-a.js', {encoding: 'utf8'}, function(e, d) {
    if(e) throw e;
    codeA = d;
    fs.readFile('test/p-b.js', {encoding: 'utf8'}, function(e, d) {
        if(e) throw e;
        codeB = d;
        new BattleLevel(codeA, codeB, "./simulation/base.json", finished, 103107, 109123);
    });
})
