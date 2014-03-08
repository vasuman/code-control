var options = {
    undef: true,
    noarg: true,
    freeze: true,
    latedef: true
}

function makeMap(x) {
    var m = {}, i;
    for(i = 0; i < x.length; i++) {
        m[x[i].name] = false;
    }
    return m;
}

function truthize(x) {
    var key, res = {};
    for(key in x) {
        if(x.hasOwnProperty(key)) {
            res[key] = true;
        }
    }
    return res;
}

function process(code, globals, req_func) {
    var j = require('jshint').JSHINT, i,
    res = j(code, options, truthize(globals)), warn = [], errors, f;
    if(!res) {
        var errors = j.data().errors, e;
        for(i = 0; i < errors.length; i++) {
            e = errors[i];
            warn.push({ 
                row: e.line - 1, 
                text: e.reason, 
                raw: e.reason, 
                column: e.character,
                type: 'error'
            });
        }
    } else {
        if(req_func) {
            var f = makeMap(j.data().functions);
            for(i = 0; i < req_func.length; i++) {
                if(!(req_func[i] in f)) {
                    warn.push({ 
                        row: 0, 
                        text: 'Function ' + req_func[i] + ' is not defined',
                        column: 1,
                        type: 'warning',
                        raw: 'Required function not defined'
                    });
                }
            }
        }
    }
    return warn;
}
module.exports.process = process;
