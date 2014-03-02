var fs = require('fs'),
lint = require('../lint');

function doTest(err, d) {
    console.log(lint.process(d, ['MY_GLOBAL']));
}

fs.readFile(process.argv[2], { encoding: 'utf8' }, doTest);
