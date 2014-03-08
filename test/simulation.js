var fs = require('fs');
var BattleLevel = require('../simulation/level').BattleLevel;

function finished(err, result) {
    if(err) {
        console.log('Failed because of ' + result);
        throw err;
    }
    fs.writeFile('result.json', JSON.stringify(result), process.exit);
}

var codeA, codeB;
function Char(id, code) {
    this.getHealth = function() {
        return 100;
    }
    this.getAttack = function() {
        return 5;
    }
    this.id = id;
    this.code = code;
}
fs.readFile('test/p-a.js', {encoding: 'utf8'}, function(e, d) {
    if(e) throw e;
    codeA = d;
    fs.readFile('test/p-b.js', {encoding: 'utf8'}, function(e, d) {
        if(e) throw e;
        codeB = d;
        new BattleLevel( new Char(0, codeA), new Char(1, codeB), "./simulation/base.json", finished);
    });
})
